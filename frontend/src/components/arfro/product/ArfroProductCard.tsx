"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { toast } from "@/components/ui/Toast";
import { addToCart } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { COMPARE_MAX, compareHref, toggleCompare, useCompare } from "@/lib/compare";
import { ON_REQUEST, dh, isOnRequest, priceRequestHref } from "@/lib/format";
import type { ProductCardData, ProductOption } from "@/lib/types";

/**
 * Premium Arfro product card (owner's brief §5, docs/arfro-creative-brief.md): the product photo
 * is the visual priority on a clean ice well, then manufacturer, model, the main specs as one
 * refined line (« 9 000 · 12 000 · 18 000 BTU »), the price in Dhs (« dès » for a family, regular
 * price struck during a promotion), availability, at most one discreet badge, then one primary
 * action and « Comparer » (the shared compare selection of lib/compare.ts, 3 products max).
 * Primary action, same cart logic as ProductCard: « Acheter » adds the picked power to the cart
 * (lib/cart/store addToCart; a family without a pick adds its first priced variant);
 * « Demander un prix » for an item on request; « Découvrir » (product page) when out of stock.
 * A multi-power family shows its powers as compact chips in place of the specs line: picking one
 * updates the price and photo. Fixed image ratio: no layout shift. `feature` is the large first
 * card of an editorial grid.
 */

/**
 * Rendered width of the photo, which fills 76 % of the card (inset 12 %): rail of 78 % / 44 % on
 * phones and tablets, then the home grid of four columns (two for the featured card) in a 1440 px
 * container. A ~240 px slot then takes the 320w rendition, not the 640w one.
 */
const CARD_SIZES = "(max-width: 639px) 60vw, (max-width: 1023px) 34vw, min(18vw, 260px)";
const FEATURE_SIZES = "(max-width: 639px) 60vw, (max-width: 1023px) 34vw, min(36vw, 520px)";

/** Specs line from the variants: BTU powers condensed under one unit, other labels joined. */
export function specLine(options: ProductOption[] | undefined, max = 5): string | null {
  if (!options || options.length < 1) return null;
  const btu = options.every((o) => /\sBTU$/.test(o.fullLabel));
  const labels = options.map((o) => (btu ? o.fullLabel.replace(/\sBTU$/, "") : o.label || o.fullLabel));
  const shown = labels.slice(0, max).join(" · ");
  const more = labels.length > max ? ` · +${labels.length - max}` : "";
  return `${shown}${btu ? " BTU" : ""}${more}`;
}

/** Regular price to strike: the product's, or for a « dès » family the one of its cheapest variant. */
function regularOf(product: ProductCardData): number | null {
  const own = product.regularPrice;
  if (own != null && own > product.price) return own;
  if (!product.fromPrice) return null;
  const cheapest = product.options?.find((o) => o.price === product.price);
  return cheapest?.regularPrice != null && cheapest.regularPrice > cheapest.price ? cheapest.regularPrice : null;
}

function CompareToggle({ sku, name }: { sku: string; name: string }) {
  const items = useCompare();
  const on = items.some((i) => i.sku === sku);
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        role="checkbox"
        aria-checked={on}
        aria-label={`Comparer ${name}`}
        onClick={() => {
          if (!toggleCompare({ sku, name })) toast(`${COMPARE_MAX} produits au maximum dans le comparateur`);
        }}
        className="group/cmp text-arfro-graphite/80 hover:text-arfro-graphite inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold"
      >
        <span
          aria-hidden
          className={cn(
            "rounded-arfro-xs flex size-4 items-center justify-center border transition-colors duration-200",
            on ? "border-arfro-blue bg-arfro-blue text-white" : "border-arfro-graphite/40 group-hover/cmp:border-arfro-graphite bg-white",
          )}
        >
          {on && (
            <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 6.2 5 8.5l4.5-5" />
            </svg>
          )}
        </span>
        Comparer
      </button>
      {on && items.length > 1 && (
        <Link href={compareHref(items)} className="text-arfro-blue hover:text-arfro-blue-hover text-[13px] font-semibold underline underline-offset-4">
          Voir ({items.length})
        </Link>
      )}
    </div>
  );
}

export function ArfroProductCard({
  product,
  priority = false,
  feature = false,
  headingLevel = "h3",
  sizes,
}: {
  product: ProductCardData;
  priority?: boolean;
  /** Large first card of an editorial grid (taller image, larger name). */
  feature?: boolean;
  headingLevel?: "h2" | "h3";
  /** `sizes` of the photo; defaults to the home grid (rail on phones, 4 columns on desktop). */
  sizes?: string;
}) {
  const Heading = headingLevel;
  const options = product.options ?? [];
  const multi = options.length > 1;
  const [picked, setPicked] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const option = picked != null ? options[picked] : null;
  const price = option ? option.price : product.price;
  const onRequest = isOnRequest(price);
  const optionRegular = option?.regularPrice != null && option.regularPrice > option.price ? option.regularPrice : null;
  const regular = onRequest ? null : option ? optionRegular : regularOf(product);
  const image = option?.image ?? product.image;
  const imageSrcSet = option?.image ? option.imageSrcSet : product.imageSrcSet;
  const dark = option?.dark ?? product.dark;
  const specs = multi ? null : specLine(options);
  const compareSku = product.sku ?? options[0]?.sku ?? null;
  // One badge at most, and none that only repeats the brand.
  const badge = product.badge && !(product.badge.tone === "brand" && product.badge.text === product.brand) ? product.badge : null;
  const showFrom = !onRequest && !option && (!!product.fromPrice || multi);

  // Same rule as ProductCard: without a pick, « Acheter » takes the first variant with a price.
  const firstPriced = options.findIndex((o) => !isOnRequest(o.price));
  const addIndex = picked ?? (firstPriced >= 0 ? firstPriced : 0);
  const addTarget = options[addIndex];
  const addSku = addTarget?.sku ?? product.sku ?? null;
  const buyOnRequest = addTarget ? isOnRequest(addTarget.price) : isOnRequest(product.price);
  const outOfStock = product.inStock === false;

  function onAdd() {
    if (!addSku) return;
    if (picked == null && multi) setPicked(addIndex);
    addToCart(addSku, 1);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
    toast(`${addTarget && multi ? `${product.name} ${addTarget.fullLabel}` : product.name} ajouté au panier`);
  }

  const primary =
    "rounded-arfro-sm inline-flex h-11 max-w-[280px] min-w-[128px] flex-1 items-center justify-center gap-2 px-5 text-[15px] font-bold transition-colors duration-300 ease-[var(--ease-arfro)]";

  return (
    <article className="group relative flex h-full w-full min-w-0 flex-col">
      <Link
        href={product.href}
        tabIndex={-1}
        aria-hidden
        className={cn(
          "bg-arfro-ice rounded-arfro-md relative block overflow-hidden",
          feature ? "aspect-[4/5] lg:aspect-auto lg:min-h-[420px] lg:flex-1" : "aspect-[4/5]",
        )}
      >
        <span className="absolute inset-[12%] block transition-transform duration-[900ms] ease-[var(--ease-arfro)] group-focus-within:scale-[1.04] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-focus-within:scale-100 motion-reduce:group-hover:scale-100">
          <ProductVisual
            image={image}
            srcSet={imageSrcSet}
            sizes={sizes ?? (feature ? FEATURE_SIZES : CARD_SIZES)}
            art={product.art}
            dark={dark}
            alt={product.imageAlt ?? product.name}
            shadow={false}
            priority={priority}
          />
        </span>
        {badge && (
          <span
            className={cn(
              "rounded-arfro-xs absolute top-4 left-4 bg-white px-2 py-1 text-[11px] font-bold tracking-[0.12em] uppercase",
              badge.tone === "promo" ? "text-[#B8441A]" : "text-arfro-blue",
            )}
          >
            {badge.text}
          </span>
        )}
      </Link>

      <div className={cn("flex flex-col pt-5 pb-5", feature && "lg:pt-7")}>
        {product.brand && <p className="text-arfro-muted m-0 text-[11px] font-bold tracking-[0.18em] uppercase">{product.brand}</p>}
        <Heading
          className={cn(
            "font-arfro text-arfro-graphite m-0 mt-2 font-extrabold tracking-[-0.015em] text-balance",
            "text-[19px] leading-[1.25]",
            feature && "lg:text-[30px] lg:leading-[1.2]",
          )}
        >
          <Link href={product.href} className="text-arfro-graphite hover:text-arfro-blue line-clamp-2 focus-visible:underline">
            {product.name}
          </Link>
        </Heading>
        {multi ? (
          // Powers as chips; many variants scroll sideways rather than shrink below a tap size.
          <div
            role="group"
            aria-label={`Choisir une puissance : ${product.name}`}
            className="-mx-0.5 mt-3 flex w-0 min-w-[calc(100%+4px)] scrollbar-none gap-1.5 overflow-x-auto px-0.5 py-0.5"
          >
            {options.map((o, i) => {
              const on = picked === i;
              return (
                <button
                  key={o.sku}
                  type="button"
                  title={o.fullLabel}
                  aria-label={o.fullLabel}
                  aria-pressed={on}
                  onClick={() => setPicked(on ? null : i)}
                  className={cn(
                    "rounded-arfro-xs h-8 min-w-11 shrink-0 border px-2.5 text-[13px] font-bold whitespace-nowrap transition-colors duration-200",
                    on ? "border-arfro-graphite bg-arfro-graphite text-white" : "border-arfro-line text-arfro-graphite/80 hover:border-arfro-graphite bg-white",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        ) : specs ? (
          <p className="text-arfro-muted m-0 mt-2 text-[14px] leading-[1.5]" title={options.map((o) => o.fullLabel).join(", ")}>
            {specs}
          </p>
        ) : product.refText ? (
          <p className="text-arfro-muted m-0 mt-2 text-[14px] leading-[1.5]">{product.refText}</p>
        ) : null}
      </div>

      <div className="border-arfro-line mt-auto border-t pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-arfro-graphite m-0 flex flex-wrap items-baseline gap-x-2">
            {onRequest ? (
              <span className="text-[17px] font-extrabold">{ON_REQUEST}</span>
            ) : (
              <>
                {showFrom && <span className="text-arfro-muted text-[13px]">dès</span>}
                <span className={cn("leading-none font-extrabold tracking-[-0.02em]", "text-[22px]", feature && "lg:text-[26px]")}>{dh(price)}</span>
                {regular != null && (
                  <s className="text-arfro-muted text-[14px]">
                    <span className="sr-only">au lieu de </span>
                    {dh(regular)}
                  </s>
                )}
              </>
            )}
          </p>
          {product.inStock != null && (
            <p className={cn("m-0 inline-flex items-center gap-1.5 text-[13px] font-semibold", product.inStock ? "text-[#1F7A4D]" : "text-[#B8441A]")}>
              <span aria-hidden className="size-1.5 rounded-full bg-current" />
              {product.inStock ? "En stock" : "Rupture de stock"}
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {outOfStock || !addSku ? (
            <Link
              href={product.href}
              aria-label={`Découvrir ${product.name}`}
              className={cn(primary, "border-arfro-graphite/30 text-arfro-graphite hover:border-arfro-graphite hover:text-arfro-graphite border")}
            >
              Découvrir
            </Link>
          ) : buyOnRequest ? (
            <Link
              href={priceRequestHref(addSku)}
              aria-label={`Demander un prix : ${product.name}`}
              className={cn(primary, "bg-arfro-blue hover:bg-arfro-blue-hover text-white hover:text-white")}
            >
              Demander un prix
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Acheter ${product.name}${option ? ` ${option.fullLabel}` : ""}`}
              className={cn(primary, added ? "bg-[#1F7A4D] text-white" : "bg-arfro-blue hover:bg-arfro-blue-hover text-white")}
            >
              {added ? "Ajouté ✓" : "Acheter"}
            </button>
          )}
          {compareSku && <CompareToggle sku={compareSku} name={product.name} />}
        </div>
      </div>
    </article>
  );
}
