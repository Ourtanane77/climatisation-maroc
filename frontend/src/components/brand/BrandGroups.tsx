"use client";

import { useState } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { cn } from "@/lib/cn";
import { brandCard } from "@/lib/product/cards";
import type { BrandGroup } from "@/lib/product/types";

/**
 * Range pills (sticky) and one product grid per category (design: Marque LG). A pill shows only its
 * group; "Tous" shows them all.
 */
export function BrandGroups({ groups }: { groups: BrandGroup[] }) {
  const [active, setActive] = useState<string | null>(null);
  const pills = [{ key: null, label: "Tous" }, ...groups.map((g) => ({ key: g.key, label: g.label }))];
  const shown = active ? groups.filter((g) => g.key === active) : groups;

  return (
    <>
      {groups.length > 1 && (
        <div className="bg-bg sticky top-0 z-5 -mb-3 pt-8 pb-3">
          <div className="flex [scrollbar-width:none] gap-2 overflow-x-auto px-0 py-0.5" role="group" aria-label="Filtrer par gamme">
            {pills.map((p) => {
              const on = p.key === active;
              return (
                <button
                  key={p.key ?? "tous"}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(p.key)}
                  className={cn(
                    "h-11 shrink-0 rounded-full border-[1.5px] px-[18px] text-[15px] font-bold whitespace-nowrap",
                    on ? "border-ink bg-ink text-white" : "border-border text-ink hover:border-ink bg-white",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {shown.map((g) => (
        <section key={g.key} id={g.key} className="scroll-mt-[140px] pt-8 md:pt-12">
          <div className="mb-5 flex items-baseline gap-3">
            <h2 className="m-0 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] md:text-[44px]">{g.label}</h2>
            <span className="text-muted text-[16px]">{g.count > 1 ? `${g.count} gammes` : "1 gamme"}</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {g.products.map((card) => (
              <ProductCard key={card.href} product={brandCard(card)} headingLevel="h3" />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
