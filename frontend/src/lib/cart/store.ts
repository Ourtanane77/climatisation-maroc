"use client";

/**
 * Basket kept in the `cm_cart` cookie as [{sku, qty}] (no prices: prices are always quoted by the
 * server, see docs/plan.md §6). The cookie lets server components render the header count.
 */
import { useSyncExternalStore } from "react";
import { CART_COOKIE, MAX_QTY, VISIT_COOKIE, parseCart, serializeCart, type CartLine } from "./cookie";

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: { raw: string; lines: CartLine[] } | null = null;

function readCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${CART_COOKIE}=`));
  return match ? match.slice(CART_COOKIE.length + 1) : "";
}

export function getCart(): CartLine[] {
  const raw = readCookie();
  if (!cache || cache.raw !== raw) cache = { raw, lines: parseCart(raw) };
  return cache.lines;
}

function write(lines: CartLine[]) {
  const value = serializeCart(lines);
  const maxAge = 60 * 60 * 24 * 30;
  document.cookie = `${CART_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  listeners.forEach((l) => l());
}

export function addToCart(sku: string, qty = 1) {
  const lines = getCart();
  const exists = lines.some((l) => l.sku === sku);
  write(
    exists
      ? lines.map((l) => (l.sku === sku ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
      : [...lines, { sku, qty: Math.min(MAX_QTY, Math.max(1, qty)) }],
  );
}

export function setQty(sku: string, qty: number) {
  write(getCart().map((l) => (l.sku === sku ? { ...l, qty: Math.min(MAX_QTY, Math.max(1, qty)) } : l)));
}

export function removeFromCart(sku: string) {
  write(getCart().filter((l) => l.sku !== sku));
}

export function clearCart() {
  write([]);
  setTechnicalVisit(false);
}

/** Remembers the technical visit option (`cm_visit`) between the product page and the checkout. */
export function setTechnicalVisit(on: boolean) {
  document.cookie = on ? `${VISIT_COOKIE}=1; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax` : `${VISIT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const EMPTY: CartLine[] = [];

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, getCart, () => EMPTY);
}

/** Basket lines, or null during server rendering and hydration (the caller supplies its own). */
export function useCartLines(): CartLine[] | null {
  return useSyncExternalStore(subscribe, getCart, () => null);
}

export function useCartCount(initial = 0): number {
  const lines = useSyncExternalStore(subscribe, getCart, () => null);
  return lines === null ? initial : lines.reduce((n, l) => n + l.qty, 0);
}
