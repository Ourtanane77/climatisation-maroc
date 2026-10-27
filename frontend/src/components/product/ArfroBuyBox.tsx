"use client";

import Link from "next/link";
import { useState } from "react";
import { surfaceRow } from "@/components/arfro/pdp/data";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { setTechnicalVisit } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { dh, isOnRequest, priceRequestHref, priceText, publicRef } from "@/lib/format";
import { waProductLink } from "@/lib/whatsapp";
import { useAddSelected } from "./ProductBuyBox";
import { useProduct } from "./ProductContext";
import { StockAlertForm } from "./StockAlertForm";

const PROMISES = [
  { text: "Livraison gratuite au Maroc", d: "M1 3h15v13H1zM16 8h4l3 3v5h-7z M5.5 16.5a2 2 0 1 0 0 4a2 2 0 1 0 0-4 M18.5 16.5a2 2 0 1 0 0 4a2 2 0 1 0 0-4" },
  { text: "Paiement à la livraison", d: "M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z M12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5" },
];

const STOCK_TONE = { en_stock: "bg-success", sur_commande: "bg-arfro-blue", rupture: "bg-promo" } as const;

/**
 * Arfro buy column: manufacturer (logo, « Distributeur officiel »), H1 family name, short
 * description and reference, capacity selector (radio rows with the recommended surface and the
 * price), Soft Ice purchase panel (server price, struck regular price, availability, technical
 * visit, quantity, add to cart, WhatsApp, quote for « Prix sur demande »), promises. Same
 * behaviours as ProductBuyBox: prices are those of the API (pro price for a signed-in reseller).
 */
export function ArfroBuyBox() {
  const { product, variant, selectVariant } = useProduct();
  const [qty, setQty] = useState(1);
  const [visit, setVisit] = useState(false);
  const { added, add } = useAddSelected();
  const multi = product.variants.length > 1;
  const onRequest = isOnRequest(variant.price);
  const discounted = !onRequest && variant.regularPrice != null && variant.regularPrice > variant.price;
  // The technical visit is offered where the default page offers it (products with an install kit).
  const offersVisit = product.accessories.length > 0 && product.technicalVisitPrice > 0;

  function addSelected() {
    if (visit) setTechnicalVisit(true);
    add(qty);
  }

  return (
    <div className="text-arfro-graphite flex min-w-0 flex-col gap-7">
      <div className="flex flex-col gap-4">
        {product.brand && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href={product.brand.href} aria-label={`Marque ${product.brand.name}`} className="flex min-h-11 items-center">
              {product.brand.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.brand.logo}
                  alt={product.brand.name}
                  width={Math.round(28 * (product.brand.logoAspect ?? 2))}
                  height={28}
                  fetchPriority="low"
                  decoding="async"
                  className="block h-7 w-auto object-contain"
                />
              ) : (
                <span className="text-lg font-extrabold tracking-[-0.01em]">{product.brand.name}</span>
              )}
            </Link>
            {product.brand.official && (
              <span className="text-arfro-blue border-arfro-line border-l pl-4 text-[12px] font-bold tracking-[0.14em] uppercase">Distributeur officiel</span>
            )}
          </div>
        )}

        <h1 className="font-arfro m-0 text-[clamp(32px,4vw,52px)] leading-[1.04] font-extrabold tracking-[-0.03em] text-balance">{product.name}</h1>
        {product.shortDescription && <p className="text-arfro-muted m-0 max-w-[52ch] text-[17px] leading-[1.55]">{product.shortDescription}</p>}
        {publicRef(variant.sku) && (
          <p className="text-arfro-muted m-0 text-sm">
            Modèle <span className="text-arfro-graphite font-semibold">{variant.sku}</span>
          </p>
        )}
      </div>

      {multi && (
        <fieldset className="m-0 flex min-w-0 flex-col border-0 p-0">
          <legend className="p-0 pb-3 text-[13px] font-bold tracking-[0.14em] uppercase">{product.selectorLabel}</legend>
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
            {product.variants.map((v) => {
              const on = v.sku === variant.sku;
              const surface = surfaceRow(v.specs);
              return (
                <label
                  key={v.sku}
                  className={cn(
                    "rounded-arfro-sm flex min-h-[60px] cursor-pointer items-center gap-3 border px-4 py-3 transition-colors duration-300 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-arfro-blue)]",
                    on
                      ? "border-arfro-blue bg-arfro-ice shadow-[inset_0_0_0_1px_var(--color-arfro-blue)]"
                      : "border-arfro-line hover:border-arfro-graphite/40 bg-white",
                  )}
                >
                  <input
                    type="radio"
                    name="variante"
                    value={v.sku}
                    checked={on}
                    onChange={() => selectVariant(v.sku)}
                    className="accent-arfro-blue m-0 size-[18px] shrink-0 focus-visible:outline-none"
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[15px] font-extrabold">{v.label ?? v.sku}</span>
                    {surface && <span className="text-arfro-muted text-[13px]">{surface}</span>}
                  </span>
                  <span className="text-[14px] font-bold whitespace-nowrap">{priceText(v.price)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="rounded-arfro-md bg-arfro-ice flex flex-col gap-5 p-5 md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className={cn("font-arfro leading-none font-extrabold tracking-[-0.03em]", onRequest ? "text-[28px]" : "text-[36px] md:text-[42px]")}>
              {priceText(variant.price)}
            </span>
            {discounted && <s className="text-arfro-muted text-[17px]">{dh(variant.regularPrice!)}</s>}
          </div>
          {!onRequest && (
            <span className="flex items-center gap-2 text-sm font-bold">
              <span aria-hidden className={cn("size-2 rounded-full", STOCK_TONE[variant.stock] ?? "bg-arfro-blue")} />
              {variant.stockLabel}
            </span>
          )}
        </div>

        {onRequest ? (
          // « Prix sur demande »: never added to the basket, the quote form gets the reference.
          <Link
            href={priceRequestHref(variant.sku)}
            className="bg-arfro-blue hover:bg-arfro-blue-hover rounded-arfro-sm flex h-[54px] items-center justify-center px-6 text-base font-bold text-white transition-colors duration-300 hover:text-white"
          >
            Demander un prix
          </Link>
        ) : variant.orderable ? (
          <>
            {offersVisit && (
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] font-semibold">
                <input type="checkbox" checked={visit} onChange={(e) => setVisit(e.target.checked)} className="accent-arfro-blue m-0 size-5 shrink-0" />
                Visite technique avant installation ({dh(product.technicalVisitPrice)})
              </label>
            )}
            <div className="flex flex-wrap gap-2.5">
              <QtyStepper value={qty} onChange={setQty} size={56} />
              <button
                type="button"
                onClick={addSelected}
                className="bg-arfro-blue hover:bg-arfro-blue-hover rounded-arfro-sm h-14 flex-[1_1_160px] px-4 text-[15px] font-bold whitespace-nowrap text-white transition-colors duration-300 sm:px-6 sm:text-base"
              >
                {added ? "Ajouté au panier" : "Ajouter au panier"}
              </button>
            </div>
          </>
        ) : (
          <StockAlertForm key={variant.sku} sku={variant.sku} unit={multi && product.selectorLabel === "Puissance" ? "puissance" : "référence"} />
        )}

        <a
          href={waProductLink(variant.name, variant.sku)}
          target="_blank"
          rel="noopener"
          className="border-arfro-graphite/30 text-arfro-graphite hover:border-arfro-graphite rounded-arfro-sm flex h-[50px] items-center justify-center gap-2 border bg-white text-[15px] font-bold transition-colors duration-300"
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
            <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z" />
          </svg>
          Commander sur WhatsApp
        </a>
      </div>

      <ul className="border-arfro-line m-0 grid list-none grid-cols-1 gap-3 border-t p-0 pt-5 text-sm font-semibold min-[400px]:grid-cols-2">
        {PROMISES.map((p) => (
          <li key={p.text} className="flex items-center gap-2.5">
            <svg
              aria-hidden
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-arfro-blue)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={p.d} />
            </svg>
            {p.text}
          </li>
        ))}
      </ul>
      <p className="text-arfro-muted m-0 -mt-3 text-sm">
        Pose par nos techniciens sur devis :{" "}
        <Link href="/demander-un-devis" className="text-arfro-blue font-bold underline underline-offset-2">
          demander un devis
        </Link>
      </p>
    </div>
  );
}
