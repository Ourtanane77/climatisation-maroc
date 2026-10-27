"use client";

import Link from "next/link";
import { useProduct } from "@/components/product/ProductContext";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { COMPARE_MAX, compareHref, toggleCompare, useCompare } from "@/lib/compare";

/**
 * Adds the selected variant to the shared compare selection (lib/compare.ts, the same as the
 * category pages and cards, 3 products at most) and links to /comparer once two are picked.
 */
export function ArfroCompareToggle({ addHref }: { addHref: string }) {
  const { variant } = useProduct();
  const items = useCompare();
  const on = items.some((i) => i.sku === variant.sku);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={on}
        onClick={() => {
          if (!toggleCompare({ sku: variant.sku, name: variant.name })) toast(`${COMPARE_MAX} produits au maximum dans le comparateur`);
        }}
        className={cn(
          "rounded-arfro-sm inline-flex h-12 items-center gap-2.5 border px-5 text-[15px] font-bold transition-colors duration-300",
          on ? "border-arfro-blue text-arfro-blue bg-arfro-ice" : "border-arfro-graphite/30 text-arfro-graphite hover:border-arfro-graphite bg-white",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "rounded-arfro-xs flex size-4 items-center justify-center border",
            on ? "border-arfro-blue bg-arfro-blue text-white" : "border-arfro-graphite/40 bg-white",
          )}
        >
          {on && (
            <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 6.2 5 8.5l4.5-5" />
            </svg>
          )}
        </span>
        Comparer ce produit
      </button>
      {items.length > 1 ? (
        <Link
          href={compareHref(items)}
          className="text-arfro-blue hover:text-arfro-blue-hover inline-flex min-h-6 items-center text-[15px] font-bold underline underline-offset-4"
        >
          Voir la comparaison ({items.length})
        </Link>
      ) : (
        <Link
          href={addHref}
          className="text-arfro-muted hover:text-arfro-graphite inline-flex min-h-6 items-center text-[15px] font-semibold underline underline-offset-4"
        >
          Choisir d&apos;autres produits à comparer
        </Link>
      )}
    </div>
  );
}
