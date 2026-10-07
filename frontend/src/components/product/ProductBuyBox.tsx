"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PriceBlock } from "@/components/ui/Price";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { toast } from "@/components/ui/Toast";
import { addToCart } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { isOnRequest, priceRequestHref, priceText, publicRef } from "@/lib/format";
import { waProductLink } from "@/lib/whatsapp";
import { useProduct } from "./ProductContext";
import { StockAlertForm } from "./StockAlertForm";

/** Adds the selected variant: label switches to "Ajouté au panier" for 1.8 s, plus the toast. */
export function useAddSelected() {
  const { variant } = useProduct();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return {
    added,
    add(qty = 1) {
      addToCart(variant.sku, qty);
      toast(`${variant.name} ajouté au panier`);
      setAdded(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setAdded(false), 1800);
    },
  };
}

/** Right column of the product hero (design: BuyBox). */
export function ProductBuyBox() {
  const { product, variant, selectVariant } = useProduct();
  const [qty, setQty] = useState(1);
  const { added, add } = useAddSelected();
  const multi = product.variants.length > 1;

  return (
    <div className="flex flex-col gap-[18px]">
      {product.brand && (
        <div className="flex items-center gap-3">
          <Link href={product.brand.href} aria-label={`Marque ${product.brand.name}`} className="flex items-center">
            {product.brand.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.brand.logo}
                alt={product.brand.name}
                width={Math.round(32 * (product.brand.logoAspect ?? 2))}
                height={32}
                // Low priority: React would otherwise preload it next to the gallery's LCP image.
                fetchPriority="low"
                decoding="async"
                className="block h-8 w-auto object-contain"
              />
            ) : (
              <span className="text-ink text-xl font-extrabold tracking-[-0.03em]">{product.brand.name}</span>
            )}
          </Link>
          {product.brand.official && <span className="rounded-8 bg-tint-blue text-brand px-2.5 py-1 text-[13px] font-bold">Distributeur officiel</span>}
        </div>
      )}

      <h1 className="m-0 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] md:text-[44px] xl:text-[56px]">{variant.name}</h1>
      {publicRef(variant.sku) && <span className="text-muted text-[15px]">Réf. {variant.sku}</span>}

      {multi && (
        <div>
          <div className="mb-2.5 text-[15px] font-bold" id="variant-label">
            {product.selectorLabel}
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4" role="group" aria-labelledby="variant-label">
            {product.variants.map((v) => {
              const on = v.sku === variant.sku;
              return (
                <button
                  key={v.sku}
                  type="button"
                  aria-pressed={on}
                  onClick={() => selectVariant(v.sku)}
                  className={cn(
                    "rounded-16 text-ink flex min-h-16 flex-col items-center justify-center gap-0.5 border-2 px-2 py-1.5",
                    on ? "border-brand bg-tint-blue" : "border-border hover:border-line-strong bg-white",
                  )}
                >
                  <span className="text-base font-bold">{v.label ?? v.sku}</span>
                  <span className="text-muted text-sm">{priceText(v.price)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <PriceBlock price={variant.price} regularPrice={variant.regularPrice} size="pdp" className="gap-1" />

      {isOnRequest(variant.price) ? (
        // « Prix sur demande »: never added to the basket, the quote form gets the reference.
        <Link
          href={priceRequestHref(variant.sku)}
          className="bg-brand flex h-14 items-center justify-center rounded-full px-6 text-base font-bold text-white hover:text-white hover:brightness-[0.94]"
        >
          Demander un prix
        </Link>
      ) : variant.orderable ? (
        <>
          <span className={cn("flex items-center gap-2 text-[15px] font-bold", variant.stock === "en_stock" ? "text-success" : "text-brand")}>
            <span className={cn("size-2.5 rounded-full", variant.stock === "en_stock" ? "bg-success" : "bg-brand")} />
            {variant.stockLabel}
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            <QtyStepper value={qty} onChange={setQty} size={56} />
            <button
              type="button"
              onClick={() => add(qty)}
              className="bg-brand h-14 min-w-[200px] flex-1 rounded-full px-6 text-base font-bold text-white hover:brightness-[0.94]"
            >
              {added ? "Ajouté au panier" : "Ajouter au panier"}
            </button>
          </div>
        </>
      ) : (
        <StockAlertForm key={variant.sku} sku={variant.sku} unit={multi && product.selectorLabel === "Puissance" ? "puissance" : "référence"} />
      )}

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        <a
          href={waProductLink(variant.name, variant.sku)}
          target="_blank"
          rel="noopener"
          className="bg-whatsapp flex h-14 items-center justify-center rounded-full text-base font-bold text-white hover:text-white hover:brightness-95"
        >
          Commander par WhatsApp
        </a>
        <Link
          href="/demander-un-devis"
          className="border-ink text-ink hover:bg-ink flex h-14 items-center justify-center rounded-full border-[1.5px] text-base font-bold hover:text-white"
        >
          Demander un devis
        </Link>
      </div>
      <p className="text-ink-2 m-0 text-sm">Livraison gratuite partout au Maroc · Paiement à la livraison · Pose par nos techniciens sur devis</p>
    </div>
  );
}
