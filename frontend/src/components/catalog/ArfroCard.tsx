"use client";

import Link from "next/link";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { COMPARE_MAX, toggleCompare, useCompare } from "@/lib/compare";
import { ON_REQUEST, dh } from "@/lib/format";
import type { ProductCardData } from "@/lib/types";
import { ProductVisual } from "./ProductVisual";

/** Badge pill colours on the image well (Arfro mockups: promo and « Nouveau » / brand). */
const BADGE = {
  promo: "bg-[#FDEEE7] text-[#B8441A]",
  brand: "bg-[#E3EEFA] text-[#0B5CAD]",
} as const;

const PILL = "flex h-11 items-center justify-center rounded-full text-sm font-bold transition-colors";
const PRIMARY = cn(PILL, "flex-1 px-4 text-white hover:text-white");
const BLUE = cn(PRIMARY, "bg-brand hover:bg-brand-hover");

/**
 * « Comparer » pill of the Arfro card (design: Categorie.dc.html), the same compare selection as
 * the category page checkbox (lib/compare.ts, 3 products at most).
 */
function ArfroCompare({ sku, name }: { sku: string; name: string }) {
  const items = useCompare();
  const on = items.some((i) => i.sku === sku);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-label={`Comparer ${name}`}
      onClick={() => {
        if (!toggleCompare({ sku, name })) toast(`${COMPARE_MAX} produits au maximum dans le comparateur`);
      }}
      className={cn(PILL, "text-ink hover:border-ink shrink-0 gap-2 border-[1.5px] bg-white px-3.5", on ? "border-brand" : "border-[#C9D0DB]")}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-[18px] items-center justify-center rounded-[5px] border-[1.5px] text-[11px] text-white",
          on ? "border-brand bg-brand" : "border-[#8A94A6] bg-white",
        )}
      >
        {on ? "✓" : ""}
      </span>
      Comparer
    </button>
  );
}

/**
 * Arfro product card (Main.dc.html « Nos sélections », Categorie.dc.html grid): grey square image
 * well with the badge pill, brand in small caps, name, reference or variant chips, « dès » price
 * and struck regular price, « Acheter » and « Comparer ». State lives in ProductCard.
 * Narrow cards (under 240 px, the two-column mobile home grid) keep image, brand, name and price,
 * as in Mobile.dc.html.
 */
export function ArfroCard({
  product,
  action,
  headingLevel,
  picked,
  multi,
  onPick,
  showFrom,
  price,
  regular,
  refText,
  image,
  imageSrcSet,
  dark,
  badge,
  onRequest,
  requestHref,
  added,
  onAdd,
}: {
  product: ProductCardData;
  action: "view" | "add";
  headingLevel: "h2" | "h3";
  picked: number | null;
  multi: boolean;
  onPick: (index: number) => void;
  showFrom: boolean;
  price: number;
  regular: number | null | undefined;
  refText: string | null | undefined;
  image: string | null | undefined;
  imageSrcSet: string | null | undefined;
  dark: boolean | undefined;
  badge: ProductCardData["badge"];
  onRequest: boolean;
  requestHref: string;
  added: boolean;
  onAdd: () => void;
}) {
  const Heading = headingLevel;
  const options = product.options ?? [];
  const compareSku = product.sku ?? options[0]?.sku;
  const priceOnRequest = price <= 0;
  const discounted = !showFrom && regular != null && regular > price;
  // Listings pass the brand as a badge (withBrandBadge); the Arfro card already shows the brand.
  const pill = badge && !(badge.tone === "brand" && badge.text === product.brand) ? badge : null;

  return (
    <article className="@container flex h-full flex-col gap-3.5">
      <div className="relative">
        <Link
          href={product.href}
          tabIndex={-1}
          aria-hidden
          className="flex aspect-square items-center justify-center overflow-hidden rounded-[24px] bg-[#F2F4F7] @max-[239px]:rounded-[18px]"
        >
          <div className="size-[78%]">
            <ProductVisual image={image} srcSet={imageSrcSet} art={product.art} dark={dark} alt={product.imageAlt ?? product.name} shadow={false} />
          </div>
        </Link>
        {pill && (
          <span
            className={cn(
              "absolute top-4 left-4 flex h-7 items-center rounded-full px-3 text-xs font-extrabold @max-[239px]:top-2.5 @max-[239px]:left-2.5 @max-[239px]:h-6 @max-[239px]:px-[9px] @max-[239px]:text-[11px]",
              BADGE[pill.tone],
            )}
          >
            {pill.text}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 px-1 @max-[239px]:gap-1 @max-[239px]:px-0">
        {product.brand && <span className="text-muted text-xs font-extrabold tracking-[0.08em] uppercase @max-[239px]:text-[11px]">{product.brand}</span>}
        <Heading className="m-0 text-lg leading-[1.25] font-extrabold tracking-[-0.01em] @max-[239px]:text-[15px]">
          <Link href={product.href} className="text-ink hover:text-brand line-clamp-2">
            {product.name}
          </Link>
        </Heading>
        {multi ? (
          <div className="flex flex-wrap gap-1.5 pt-0.5 @max-[239px]:hidden" role="group" aria-label="Choisir une variante">
            {options.map((o, i) => {
              const on = picked === i;
              return (
                <button
                  key={o.sku}
                  type="button"
                  title={o.fullLabel}
                  aria-pressed={on}
                  onClick={() => onPick(i)}
                  className={cn(
                    "hover:border-ink flex h-8 min-w-11 shrink-0 items-center justify-center rounded-full border px-2.5 text-xs font-bold whitespace-nowrap",
                    on ? "border-ink bg-ink text-white" : "text-ink border-[#C9D0DB] bg-white",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        ) : refText ? (
          <span className="text-muted text-sm @max-[239px]:hidden">{refText}</span>
        ) : null}
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 pt-1 @max-[239px]:pt-0">
          {priceOnRequest ? (
            <span className="text-lg font-extrabold @max-[239px]:text-[15px]">{ON_REQUEST}</span>
          ) : (
            <>
              {showFrom && <span className="text-muted text-sm">dès</span>}
              <span className="text-[22px] leading-[1.1] font-extrabold tracking-[-0.01em] @max-[239px]:text-[17px]">{dh(price)}</span>
              {discounted && (
                <s className="text-muted text-sm">
                  <span className="sr-only">au lieu de </span>
                  {dh(regular)}
                </s>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-auto flex gap-2 px-1 @max-[239px]:hidden">
        {action === "view" ? (
          <Link href={product.href} className={BLUE}>
            {priceOnRequest ? "Voir le produit" : "Acheter"}
          </Link>
        ) : onRequest ? (
          <Link href={requestHref} className={BLUE}>
            Demander un prix
          </Link>
        ) : (
          <button type="button" onClick={onAdd} className={added ? cn(PRIMARY, "bg-success") : BLUE}>
            {added ? "Ajouté ✓" : "Acheter"}
          </button>
        )}
        {compareSku && <ArfroCompare sku={compareSku} name={product.name} />}
      </div>
    </article>
  );
}
