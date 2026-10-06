"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { PriceBlock } from "@/components/ui/Price";
import { toast } from "@/components/ui/Toast";
import { addToCart } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { discountBadge } from "@/lib/format";
import type { ProductCardData } from "@/lib/types";
import { ProductVisual } from "./ProductVisual";

/**
 * Product card from the design (Accueil, Catégorie, Promotions, Recherche, Marque).
 * - Families with several variants show chips; until one is picked the card shows
 *   "À partir de" the lowest price and `refText` (e.g. "4 puissances").
 * - `action="view"` → "Voir le produit" link; `action="add"` → "Ajouter au panier" with the
 *   2-second green confirmation (adding a family without a pick adds its first variant).
 */
export function ProductCard({
  product,
  action = "view",
  imageHeight = 150,
  compareSlot,
  headingLevel = "h3",
}: {
  product: ProductCardData;
  action?: "view" | "add";
  imageHeight?: number;
  compareSlot?: React.ReactNode;
  headingLevel?: "h2" | "h3";
}) {
  const options = product.options ?? [];
  const multi = options.length > 1;
  const [picked, setPicked] = useState<number | null>(multi ? null : options.length ? 0 : null);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const option = picked != null ? options[picked] : null;
  const showFrom = multi && picked == null ? true : !!product.fromPrice && !option;
  const price = option ? option.price : product.price;
  const regular = option ? option.regularPrice : showFrom ? null : product.regularPrice;
  const ref = option ? option.sku : (product.refText ?? product.sku);
  const image = option?.image ?? product.image;
  const dark = option?.dark ?? product.dark;

  let badge = product.badge;
  if (option?.regularPrice && option.regularPrice > option.price) {
    badge = { text: discountBadge(option.regularPrice, option.price), tone: "promo" };
  }

  const Heading = headingLevel;

  function onAdd() {
    const index = picked ?? 0;
    const target = options[index];
    const sku = target?.sku ?? product.sku;
    if (!sku) return;
    if (picked == null && multi) setPicked(index);
    addToCart(sku, 1);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
    toast(`${target ? `${product.name} ${target.fullLabel}` : product.name} ajouté au panier`);
  }

  return (
    <article className="group rounded-24 ease-design hover:shadow-card-hover flex flex-col gap-3 bg-white p-5 transition-[box-shadow,transform] duration-350 hover:-translate-y-1">
      {badge ? <Badge tone={badge.tone}>{badge.text}</Badge> : <span className="h-[29px]" aria-hidden />}
      <Heading className="m-0 text-[21px] leading-[1.3] font-medium tracking-[-0.01em]">
        <Link href={product.href} className="text-ink hover:text-brand line-clamp-2 min-h-[54px]">
          {product.name}
        </Link>
      </Heading>
      {ref ? <span className="text-muted text-[15px]">{ref}</span> : null}
      <Link
        href={product.href}
        tabIndex={-1}
        aria-hidden
        className="flex shrink-0 items-center justify-center overflow-hidden p-1"
        style={{ height: imageHeight }}
      >
        <ProductVisual image={image} art={product.art} dark={dark} alt={product.imageAlt ?? product.name} />
      </Link>
      {options.length > 0 && (
        <div className="flex h-[34px] flex-nowrap gap-1.5 overflow-hidden" role="group" aria-label="Choisir une variante">
          {options.map((o, i) => {
            const on = picked === i || (!multi && i === 0);
            return (
              <button
                key={o.sku}
                type="button"
                title={o.fullLabel}
                aria-pressed={on}
                onClick={() => setPicked(i)}
                className={cn(
                  "rounded-8 hover:border-ink h-[34px] min-w-0 shrink overflow-hidden border-[1.5px] bg-white px-2.5 text-sm font-bold text-ellipsis whitespace-nowrap md:text-[13px]",
                  on ? "border-ink text-ink shadow-[0_1px_4px_rgba(14,40,70,0.18)]" : "border-control text-muted",
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}
      <PriceBlock price={price} regularPrice={regular} from={showFrom} />
      <div className="mt-auto flex items-end gap-2">
        {action === "view" ? (
          <Link
            href={product.href}
            className="rounded-12 border-line-strong text-ink hover:border-ink hover:bg-ink flex h-[54px] flex-1 items-center justify-center border-[1.5px] bg-white text-[17px] font-bold transition-colors hover:text-white"
          >
            Voir le produit
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className={cn(
              "rounded-12 flex h-[54px] flex-1 items-center justify-center gap-2 border-[1.5px] text-[17px] font-bold transition-colors",
              added ? "border-success bg-success text-white" : "border-line-strong text-ink hover:border-ink hover:bg-ink bg-white hover:text-white",
            )}
          >
            {added ? "Ajouté au panier ✓" : "Ajouter au panier"}
          </button>
        )}
        {compareSlot}
      </div>
    </article>
  );
}
