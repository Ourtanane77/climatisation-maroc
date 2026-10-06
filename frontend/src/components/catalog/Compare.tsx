"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { clearCompare, compareHref, COMPARE_MAX, removeCompare, toggleCompare, useCompare, type CompareItem } from "@/lib/compare";

/**
 * Compare checkbox (bottom right of category cards) and the black compare tray
 * (design: Categorie Climatiseurs muraux.dc.html, `?comparer=1` state).
 */
export function CompareCheckbox({ item }: { item: CompareItem }) {
  const items = useCompare();
  const on = items.some((i) => i.sku === item.sku);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-label={`Comparer ${item.name}`}
      onClick={() => toggleCompare(item)}
      className="text-ink-2 flex min-h-11 shrink-0 items-center gap-2 text-[15px] font-semibold"
    >
      <span
        aria-hidden
        className={cn(
          "rounded-6 flex size-[22px] items-center justify-center border-[1.5px] text-[13px] text-white",
          on ? "border-brand bg-brand" : "border-check bg-white",
        )}
      >
        {on ? "✓" : ""}
      </span>
      Comparer
    </button>
  );
}

export function CompareTray() {
  const items = useCompare();
  if (!items.length) return null;
  return (
    <section
      aria-label="Comparateur"
      className="bg-ink animate-rise fixed bottom-3 left-1/2 z-35 flex w-[calc(100%-24px)] max-w-[980px] -translate-x-1/2 items-center gap-3 rounded-[20px] py-2.5 pr-2.5 pl-4 text-white shadow-[0_24px_50px_-20px_rgba(0,0,0,0.5)] md:bottom-6 md:w-[calc(100%-48px)] md:rounded-full md:pl-6"
    >
      <strong className="shrink-0 text-[15px]">
        {items.length} produit{items.length > 1 ? "s" : ""} · {COMPARE_MAX} max
      </strong>
      <ul className="m-0 hidden min-w-0 flex-1 list-none gap-2 overflow-hidden p-0 md:flex">
        {items.map((i) => (
          <li key={i.sku} className="flex h-11 min-w-0 items-center gap-1.5 rounded-full bg-white/12 pr-1.5 pl-3.5 text-sm font-semibold">
            <span className="truncate">{i.name}</span>
            <button
              type="button"
              onClick={() => removeCompare(i.sku)}
              aria-label={`Retirer ${i.name}`}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/16 text-sm"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <span className="flex-1 md:hidden" />
      <button type="button" onClick={clearCompare} className="shrink-0 text-[15px] font-semibold underline">
        Effacer
      </button>
      <Link
        href={compareHref(items)}
        className="bg-accent hover:bg-accent-hover flex h-12 shrink-0 items-center rounded-full px-5 text-base font-bold text-white hover:text-white"
      >
        Comparer
      </Link>
    </section>
  );
}
