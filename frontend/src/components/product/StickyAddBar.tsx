"use client";

import { useEffect, useState } from "react";
import { ProductArt } from "@/components/catalog/ProductArt";
import { dh, isOnRequest } from "@/lib/format";
import { useIsArfro } from "@/lib/site-context";
import { useAddSelected } from "./ProductBuyBox";
import { useProduct } from "./ProductContext";

/**
 * Bottom add-to-cart bar, shown past 140 px of scroll when the selected variant can be ordered.
 * `data-bottom-bar` lifts the floating WhatsApp button above it (layout/FloatingWhatsApp).
 */
export function StickyAddBar() {
  const { product, variant } = useProduct();
  const { added, add } = useAddSelected();
  const arfro = useIsArfro();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 140);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Not for « Prix sur demande » variants (price 0): they are never added to the basket.
  if (!scrolled || !variant.orderable || isOnRequest(variant.price)) return null;
  const image = variant.image != null ? product.images[variant.image] : product.images[0];

  if (arfro) {
    // Arfro: white bar with a hairline, grey thumbnail well, ink price and the blue pill.
    return (
      <div data-bottom-bar className="site-gutter border-border fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t bg-white/95 py-3 backdrop-blur md:gap-4">
        <span aria-hidden className="rounded-12 bg-bg hidden size-12 shrink-0 items-center justify-center p-1.5 md:flex">
          {image?.thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.thumb} alt="" className="block max-h-full max-w-full object-contain mix-blend-multiply" />
          ) : (
            <ProductArt art={product.art} dark={variant.dark} className="h-auto w-full" />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px] font-extrabold md:text-base">{variant.name}</span>
        <span className="text-lg font-extrabold tracking-[-0.01em] whitespace-nowrap md:text-[22px]">{dh(variant.price)}</span>
        <button
          type="button"
          onClick={() => add(1)}
          className="bg-brand hover:bg-brand-hover h-12 shrink-0 rounded-full px-5 text-[15px] font-extrabold text-white md:px-7 md:text-base"
        >
          {added ? "Ajouté au panier" : "Ajouter au panier"}
        </button>
      </div>
    );
  }

  return (
    <div data-bottom-bar className="shadow-bottom-bar site-gutter fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 bg-white py-3">
      <span aria-hidden className="hidden h-11 w-16 shrink-0 items-center justify-center md:flex">
        {image?.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.thumb} alt="" className="block h-11 w-16 object-contain" />
        ) : (
          <ProductArt art={product.art} dark={variant.dark} className="h-auto w-full" />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-base font-bold">{variant.name}</span>
      <span className="text-[22px] font-extrabold whitespace-nowrap">{dh(variant.price)}</span>
      <button type="button" onClick={() => add(1)} className="bg-brand h-12 shrink-0 rounded-full px-6 text-base font-bold text-white hover:brightness-[0.94]">
        {added ? "Ajouté au panier" : "Ajouter au panier"}
      </button>
    </div>
  );
}
