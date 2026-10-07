"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { toast } from "@/components/ui/Toast";
import { addToCart } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { isOnRequest, priceRequestHref, priceText, publicRef } from "@/lib/format";
import type { ProductCardData } from "@/lib/types";

/** Drawing widths of the design (REL): kit duo 80 %, support 70 %, coils 62 %. */
const ART_WIDTH: Record<string, string> = { duo: "80%", support: "70%", coilS: "62%", coilL: "62%" };

/**
 * Mini product card of "Matériel d'installation" (design: Service.dc.html): name, "Réf. X", art,
 * price and "Ajouter au panier" (green "Ajouté au panier ✓" for 1.8 s, toast). Adds the family's
 * first variant (supplies are single-variant products).
 */
export function SupplyCard({ product }: { product: ProductCardData }) {
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const sku = product.sku ?? product.options?.[0]?.sku ?? null;

  function onAdd() {
    if (!sku) return;
    addToCart(sku, 1);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
    toast(`${product.name} ajouté au panier`);
  }

  return (
    <article className="rounded-24 ease-design hover:shadow-card-hover box-border flex flex-col gap-3 bg-white p-5 transition-[box-shadow,transform] duration-350 hover:-translate-y-1">
      <h3 className="text-ink m-0 min-h-[47px] text-lg leading-[1.3] font-medium">{product.name}</h3>
      {publicRef(sku) && <span className="text-muted text-[15px]">Réf. {sku}</span>}
      <div className="flex h-[140px] items-center justify-center">
        <ProductVisual
          image={product.image}
          art={product.art}
          dark={product.dark}
          alt={product.imageAlt ?? product.name}
          width={ART_WIDTH[product.art ?? ""] ?? "70%"}
        />
      </div>
      <span className="text-[26px] font-extrabold tracking-[-0.02em]">{priceText(product.price)}</span>
      {isOnRequest(product.price) ? (
        <Link
          href={priceRequestHref(sku)}
          className="rounded-12 border-line-strong text-ink hover:border-ink hover:bg-ink mt-auto flex h-[54px] items-center justify-center border-[1.5px] bg-white text-[17px] font-bold transition-colors hover:text-white"
        >
          Demander un prix
        </Link>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          disabled={!sku || product.inStock === false}
          className={cn(
            "rounded-12 mt-auto h-[54px] border-[1.5px] text-[17px] font-bold transition-colors disabled:opacity-50",
            added ? "border-success bg-success text-white" : "border-line-strong text-ink hover:border-ink hover:bg-ink bg-white hover:text-white",
          )}
        >
          {added ? "Ajouté au panier ✓" : "Ajouter au panier"}
        </button>
      )}
    </article>
  );
}
