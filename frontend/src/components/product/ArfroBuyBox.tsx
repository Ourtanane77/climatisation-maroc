"use client";

import Link from "next/link";
import { useState } from "react";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { setTechnicalVisit } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { dh, isOnRequest, priceRequestHref, priceText, publicRef } from "@/lib/format";
import { waProductLink } from "@/lib/whatsapp";
import { useAddSelected } from "./ProductBuyBox";
import { useProduct } from "./ProductContext";
import { StockAlertForm } from "./StockAlertForm";

/** "jusqu'à 15 m²" from the variant's « Surface conseillée » row, when it has one. */
function surfaceOf(specs: { label: string; value: string }[]): string | null {
  return specs.find((s) => /^surface/i.test(s.label))?.value ?? null;
}

const PROMISES = [
  { text: "Livraison gratuite au Maroc", d: "M1 3h15v13H1zM16 8h4l3 3v5h-7z M5.5 16.5a2 2 0 1 0 0 4a2 2 0 1 0 0-4 M18.5 16.5a2 2 0 1 0 0 4a2 2 0 1 0 0-4" },
  { text: "Paiement à la livraison", d: "M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z M12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5" },
];

/**
 * Arfro buy column (Produit.dc.html): brand logo and « Distributeur officiel » pill, H1 44/800,
 * short description, variant cards (radios), grey buy panel (price, stock, technical visit,
 * quantity, add to cart, WhatsApp), promise rows. Same behaviours as ProductBuyBox.
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
    <div className="flex min-w-0 flex-col gap-[22px]">
      {product.brand && (
        <div className="flex items-center gap-3">
          <Link href={product.brand.href} aria-label={`Marque ${product.brand.name}`} className="flex min-h-11 items-center">
            {product.brand.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.brand.logo}
                alt={product.brand.name}
                width={Math.round(30 * (product.brand.logoAspect ?? 2))}
                height={30}
                fetchPriority="low"
                decoding="async"
                className="block h-[30px] w-auto object-contain"
              />
            ) : (
              <span className="text-ink text-xl font-extrabold tracking-[-0.02em]">{product.brand.name}</span>
            )}
          </Link>
          {product.brand.official && (
            <span className="bg-tint-blue text-brand flex h-7 items-center rounded-full px-3 text-xs font-extrabold">Distributeur officiel</span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <h1 className="m-0 text-[34px] leading-[1.05] font-extrabold tracking-[-0.025em] md:text-[44px]">{product.name}</h1>
        {product.shortDescription && <p className="text-muted m-0 text-base md:text-[17px]">{product.shortDescription}</p>}
        {publicRef(variant.sku) && <span className="text-muted text-sm">Réf. {variant.sku}</span>}
      </div>

      {multi && (
        <fieldset className="m-0 flex min-w-0 flex-col border-0 p-0">
          <legend className="p-0 pb-3 text-[15px] font-extrabold">{product.selectorLabel}</legend>
          <div className="grid grid-cols-2 gap-2.5">
            {product.variants.map((v) => {
              const on = v.sku === variant.sku;
              const surface = surfaceOf(v.specs);
              return (
                <label
                  key={v.sku}
                  className={cn(
                    "rounded-18 flex min-h-11 cursor-pointer items-start gap-2.5 px-3.5 py-3.5 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-brand)] sm:items-center sm:gap-3 sm:px-4 lg:items-start xl:items-center",
                    on ? "border-brand bg-tint-select border-2" : "border-border hover:border-control border-[1.5px] bg-white",
                  )}
                >
                  <input
                    type="radio"
                    name="variante"
                    value={v.sku}
                    checked={on}
                    onChange={() => selectVariant(v.sku)}
                    className="accent-brand m-0 mt-0.5 size-5 shrink-0 focus-visible:outline-none sm:mt-0 lg:mt-0.5 xl:mt-0"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-base font-extrabold">{v.label ?? v.sku}</span>
                    {surface && <span className="text-muted text-[13px]">{surface}</span>}
                    <span className="pt-1 text-[15px] font-extrabold whitespace-nowrap sm:hidden lg:inline xl:hidden">{priceText(v.price)}</span>
                  </span>
                  <span className="hidden text-[15px] font-extrabold whitespace-nowrap sm:inline lg:hidden xl:inline">{priceText(v.price)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="rounded-18 bg-bg flex flex-col gap-4 p-5 md:p-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className={cn("leading-[1.1] font-extrabold tracking-[-0.02em]", onRequest ? "text-[28px]" : "text-[34px] md:text-[38px]")}>
            {priceText(variant.price)}
          </span>
          {discounted && <s className="text-muted text-[17px]">{dh(variant.regularPrice!)}</s>}
          {!onRequest && variant.orderable && (
            <span className={cn("ml-auto flex items-center gap-1.5 text-sm font-extrabold", variant.stock === "en_stock" ? "text-success" : "text-brand")}>
              <svg
                aria-hidden
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 12 5 5L20 7" />
              </svg>
              {variant.stockLabel}
            </span>
          )}
        </div>

        {onRequest ? (
          // « Prix sur demande »: never added to the basket, the quote form gets the reference.
          <Link
            href={priceRequestHref(variant.sku)}
            className="bg-brand flex h-[54px] items-center justify-center rounded-full px-6 text-base font-extrabold text-white hover:text-white hover:brightness-[0.94]"
          >
            Demander un prix
          </Link>
        ) : variant.orderable ? (
          <>
            {offersVisit && (
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] font-semibold">
                <input type="checkbox" checked={visit} onChange={(e) => setVisit(e.target.checked)} className="accent-brand m-0 size-5 shrink-0" />
                Visite technique avant installation ({dh(product.technicalVisitPrice)})
              </label>
            )}
            <div className="flex flex-wrap gap-2.5">
              <QtyStepper value={qty} onChange={setQty} size={56} />
              <button
                type="button"
                onClick={addSelected}
                className="bg-brand hover:bg-brand-hover h-[54px] flex-[1_1_160px] rounded-full px-4 text-[15px] font-extrabold whitespace-nowrap text-white sm:px-6 sm:text-base"
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
          className="border-ink text-ink hover:bg-ink box-border flex h-[50px] items-center justify-center gap-2 rounded-full border-[1.5px] text-[15px] font-bold hover:text-white"
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

      <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 text-sm font-bold min-[400px]:grid-cols-2">
        {PROMISES.map((p) => (
          <li key={p.text} className="flex items-center gap-2.5">
            <svg
              aria-hidden
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={p.d} />
            </svg>
            {p.text}
          </li>
        ))}
      </ul>
      <p className="text-ink-2 m-0 -mt-2 text-sm">
        Pose par nos techniciens sur devis :{" "}
        <Link href="/demander-un-devis" className="text-brand font-bold underline">
          demander un devis
        </Link>
      </p>
    </div>
  );
}
