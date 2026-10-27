"use client";

import { useState } from "react";
import { ProductArt } from "@/components/catalog/ProductArt";
import { useProduct } from "@/components/product/ProductContext";
import { cn } from "@/lib/cn";
import { discountBadge } from "@/lib/format";

/**
 * Arfro product gallery: a large Soft Ice frame (fixed ratio, no layout shift) with the photo
 * multiply-blended (catalogue photos have white backgrounds), previous/next arrows, a « 1 / 4 »
 * counter and a thumbnail strip. Same rules as ProductGallery: product photos only, the line
 * drawing only when there is no photo, picking a variant shows its photo.
 */
export function ArfroGallery() {
  const { product, variant } = useProduct();
  const photos = product.images.filter((i) => i.src).map((i) => ({ kind: "photo" as const, ...i }));
  const views = photos.length ? photos : [{ kind: "art" as const, src: null, thumb: null, srcSet: null, alt: product.name }];
  // A thumbnail pick holds until another variant is chosen, which shows that variant's photo.
  const [pick, setPick] = useState<{ sku: string; index: number } | null>(null);
  const index = Math.min(pick?.sku === variant.sku ? pick.index : (variant.image ?? 0), views.length - 1);
  const setIndex = (i: number) => setPick({ sku: variant.sku, index: (i + views.length) % views.length });

  const current = views[index];
  const discounted = variant.regularPrice != null && variant.regularPrice > variant.price && variant.price > 0;
  const many = views.length > 1;

  const render = (view: (typeof views)[number], thumb = false) =>
    view.kind === "art" ? (
      <ProductArt
        art={product.art}
        dark={variant.dark}
        className={cn("h-auto w-full", !product.art && "max-w-[38%]")}
        title={thumb ? undefined : product.name}
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP renditions (srcSet)
      <img
        src={(thumb ? view.thumb : view.src) ?? undefined}
        srcSet={!thumb && view.srcSet ? view.srcSet : undefined}
        sizes={!thumb && view.srcSet ? "(max-width: 999px) 92vw, 680px" : undefined}
        alt={thumb ? "" : view.alt}
        // Catalogue renditions are square (640 px): sized boxes, no unsized-image shift.
        width={thumb ? 80 : 640}
        height={thumb ? 80 : 640}
        loading={thumb ? "lazy" : "eager"}
        fetchPriority={thumb ? undefined : "high"}
        decoding="async"
        className="block max-h-full max-w-full object-contain mix-blend-multiply"
      />
    );

  return (
    <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-28">
      <div
        role="group"
        aria-roledescription="galerie"
        aria-label={`Photos de ${product.name}`}
        className="rounded-arfro-md bg-arfro-ice relative aspect-[1.1] overflow-hidden"
      >
        <div className="absolute inset-[10%] flex items-center justify-center">{render(current)}</div>
        {discounted && (
          <span className="bg-promo rounded-arfro-sm absolute top-4 left-4 px-2.5 py-1 text-[13px] font-bold text-white md:top-6 md:left-6">
            {discountBadge(variant.regularPrice!, variant.price)}
          </span>
        )}
        {many && (
          <>
            <span className="text-arfro-muted absolute right-4 bottom-4 text-[13px] font-semibold tabular-nums md:right-6 md:bottom-6" aria-hidden>
              {index + 1} / {views.length}
            </span>
            <div className="absolute bottom-3 left-3 flex gap-2 md:bottom-5 md:left-5">
              {(
                [
                  ["Photo précédente", -1, "M15 6l-6 6 6 6"],
                  ["Photo suivante", 1, "M9 6l6 6-6 6"],
                ] as const
              ).map(([label, step, d]) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  onClick={() => setIndex(index + step)}
                  className="rounded-arfro-sm text-arfro-graphite hover:bg-arfro-graphite flex size-11 items-center justify-center bg-white transition-colors duration-300 hover:text-white"
                >
                  <svg
                    aria-hidden
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={d} />
                  </svg>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      {many && (
        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {views.map((view, i) => (
            <button
              key={i}
              type="button"
              aria-label={view.kind === "art" ? "Schéma" : `Vue ${i + 1}`}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "rounded-arfro-sm bg-arfro-ice flex aspect-square items-center justify-center overflow-hidden border p-[14%] transition-colors duration-300",
                i === index ? "border-arfro-blue" : "hover:border-arfro-line border-transparent",
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
