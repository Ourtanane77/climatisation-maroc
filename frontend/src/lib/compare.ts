"use client";

/**
 * Compare selection (category page tray → /comparer?p=SKU1,SKU2,SKU3): at most 3 products, kept
 * in localStorage so it survives navigation between listings. A 4th pick is ignored, as in the design.
 */
import { useSyncExternalStore } from "react";

export const COMPARE_KEY = "cm_compare";
export const COMPARE_MAX = 3;

export interface CompareItem {
  sku: string;
  name: string;
}

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: { raw: string | null; items: CompareItem[] } | null = null;
const EMPTY: CompareItem[] = [];

function read(): string | null {
  try {
    return window.localStorage.getItem(COMPARE_KEY);
  } catch {
    return null;
  }
}

export function parseCompare(raw: string | null): CompareItem[] {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return EMPTY;
    return value.filter((i): i is CompareItem => !!i && typeof i.sku === "string" && typeof i.name === "string").slice(0, COMPARE_MAX);
  } catch {
    return EMPTY;
  }
}

export function getCompare(): CompareItem[] {
  const raw = read();
  if (!cache || cache.raw !== raw) cache = { raw, items: parseCompare(raw) };
  return cache.items;
}

function write(items: CompareItem[]) {
  try {
    window.localStorage.setItem(COMPARE_KEY, JSON.stringify(items));
  } catch {
    // Private mode: the selection lives until reload only.
    cache = { raw: JSON.stringify(items), items };
  }
  listeners.forEach((l) => l());
}

/** Adds or removes a product; returns false when the selection is full. */
export function toggleCompare(item: CompareItem): boolean {
  const items = getCompare();
  if (items.some((i) => i.sku === item.sku)) {
    write(items.filter((i) => i.sku !== item.sku));
    return true;
  }
  if (items.length >= COMPARE_MAX) return false;
  write([...items, item]);
  return true;
}

/**
 * Replaces the selection, e.g. from /comparer after the visitor removes a product there
 * (the page knows the names; the URL `?p=` only carries SKUs). Keeps the first 3.
 */
export function setCompare(items: CompareItem[]) {
  write(items.slice(0, COMPARE_MAX));
}

export function removeCompare(sku: string) {
  write(getCompare().filter((i) => i.sku !== sku));
}

export function clearCompare() {
  write([]);
}

export function compareHref(items: CompareItem[]): string {
  return `/comparer?p=${items.map((i) => encodeURIComponent(i.sku)).join(",")}`;
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === COMPARE_KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCompare(): CompareItem[] {
  return useSyncExternalStore(subscribe, getCompare, () => EMPTY);
}
