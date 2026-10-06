"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { cn } from "@/lib/cn";
import type { ProductCardData } from "@/lib/types";
import { RailSection } from "./Rail";
import { SLOT } from "./slot";

/**
 * "Promotions" (design/Accueil.dc.html `#promotions`): brand filter chips, "Voir toutes les
 * promotions", and the first four discounted families of the chosen brand.
 */
export function PromotionsRail({ brands, products }: { brands: string[]; products: ProductCardData[] }) {
  const [brand, setBrand] = useState<string | null>(null);
  const shown = products.filter((p) => !brand || p.brand === brand).slice(0, 4);
  const chips: { label: string; value: string | null }[] = [{ label: "Toutes", value: null }, ...brands.map((b) => ({ label: b, value: b }))];

  return (
    <RailSection
      id="promotions"
      headingId="h-pro"
      title="Promotions"
      align="center"
      className="scroll-mt-[140px]"
      actions={
        <div
          className="flex max-w-full [scrollbar-width:none] flex-nowrap items-center gap-1.5 overflow-x-auto md:flex-wrap"
          role="group"
          aria-label="Filtrer par marque"
        >
          {chips.map((c) => {
            const on = brand === c.value;
            return (
              <button
                key={c.label}
                type="button"
                aria-pressed={on}
                onClick={() => setBrand(c.value)}
                className={cn(
                  "hover:border-ink h-11 shrink-0 cursor-pointer rounded-full border-[1.5px] px-4 text-[15px] font-semibold",
                  on ? "border-ink bg-ink text-white" : "border-border text-ink bg-white",
                )}
              >
                {c.label}
              </button>
            );
          })}
          <Link href="/promotions" className="flex h-[42px] shrink-0 items-center px-1.5 text-[15px] font-bold whitespace-nowrap underline">
            Voir toutes les promotions
          </Link>
        </div>
      }
    >
      {shown.map((p) => (
        <div key={p.href} className={cn(SLOT, "flex *:w-full")}>
          <ProductCard product={p} imageHeight={180} />
        </div>
      ))}
    </RailSection>
  );
}
