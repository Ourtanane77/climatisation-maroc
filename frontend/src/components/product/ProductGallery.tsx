"use client";

import { useState } from "react";
import { ProductArt } from "@/components/catalog/ProductArt";
import { cn } from "@/lib/cn";
import { discountBadge } from "@/lib/format";
import { useProduct } from "./ProductContext";

/**
 * Catalogue photos have white backgrounds, so they are multiply-blended instead of getting the
 * design's drop-shadow (meant for cut-outs), which would draw a box around them.
 *
 * Gallery (design: 4:3 white frame with discount tag, 4 square thumbnails). Views are the product
 * photos, then the line drawing ("Schéma"). Picking a variant shows its photo.
 */
export function ProductGallery() {
  const { product, variant } = useProduct();
  const photos = product.images.filter((i) => i.src).map((i) => ({ kind: "photo" as const, ...i }));
  // The drawing ("Schéma") completes the row of 4 thumbnails, or stands in when there is no photo.
  const views = [...photos, ...(product.art && photos.length < 4 ? [{ kind: "art" as const, src: null, thumb: null, alt: `${product.name}, schéma` }] : [])];
  // A thumbnail pick holds until another variant is chosen, which shows that variant's photo.
  const [pick, setPick] = useState<{ sku: string; index: number } | null>(null);
  const index = pick?.sku === variant.sku ? pick.index : (variant.image ?? 0);
  const setIndex = (i: number) => setPick({ sku: variant.sku, index: i });

  const current = views[Math.min(index, views.length - 1)];
  const discounted = variant.regularPrice != null && variant.regularPrice > variant.price;

  const render = (view: (typeof views)[number] | undefined, thumb = false) =>
    !view || view.kind === "art" ? (
      <ProductArt art={product.art ?? "mural"} dark={variant.dark} className="h-auto w-full" title={thumb ? undefined : `${product.name}, schéma`} />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={(thumb ? view.thumb : view.src) ?? undefined}
        alt={thumb ? "" : view.alt}
        loading={thumb ? "lazy" : "eager"}
        fetchPriority={thumb ? undefined : "high"}
        decoding="async"
        className="block max-h-full max-w-full object-contain mix-blend-multiply"
      />
    );

  return (
    <div className="flex flex-col gap-3 xl:sticky xl:top-24">
      <div className="rounded-24 relative aspect-[4/3] overflow-hidden bg-white">
        <div className="absolute inset-8 flex items-center justify-center">{render(current)}</div>
        {discounted && (
          <span className="rounded-8 border-promo text-promo absolute top-4 left-4 border-[1.5px] bg-white px-2.5 py-1 text-sm font-bold">
            {discountBadge(variant.regularPrice!, variant.price)}
          </span>
        )}
      </div>
      {views.length > 1 && (
        <div className="grid grid-cols-4 gap-2.5">
          {views.map((view, i) => (
            <button
              key={i}
              type="button"
              aria-label={view.kind === "art" ? "Schéma" : `Vue ${i + 1}`}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "rounded-16 flex aspect-square items-center justify-center overflow-hidden border-2 bg-white p-2",
                i === index ? "border-brand" : "border-border-2",
              )}
            >
              {render(view, true)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
