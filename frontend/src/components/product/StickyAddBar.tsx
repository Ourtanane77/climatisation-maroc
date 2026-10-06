"use client";

import { useEffect, useState } from "react";
import { ProductArt } from "@/components/catalog/ProductArt";
import { dh } from "@/lib/format";
import { useAddSelected } from "./ProductBuyBox";
import { useProduct } from "./ProductContext";

/** Bottom add-to-cart bar, shown past 140 px of scroll when the selected variant can be ordered. */
export function StickyAddBar() {
  const { product, variant } = useProduct();
  const { added, add } = useAddSelected();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 140);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!scrolled || !variant.orderable) return null;
  const image = variant.image != null ? product.images[variant.image] : product.images[0];

  return (
    <div className="shadow-bottom-bar fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 bg-white px-4 py-3 md:px-10">
      <span aria-hidden className="hidden h-11 w-16 shrink-0 items-center justify-center md:flex">
        {image?.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.thumb} alt="" className="block h-11 w-16 object-contain" />
        ) : (
          <ProductArt art={product.art ?? "mural"} dark={variant.dark} className="h-auto w-full" />
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
