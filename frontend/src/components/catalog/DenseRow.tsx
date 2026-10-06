"use client";

import Link from "next/link";
import { useState } from "react";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { toast } from "@/components/ui/Toast";
import { addToCart } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { dh } from "@/lib/format";
import type { DenseRowData } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import { ProductArt } from "./ProductArt";

/**
 * Dense row of the "Liste rapide" (design/Cuivre et gaz.dc.html):
 * desktop  "img name ref price qty act" on 64px · 1fr · 110px · 110px · 132px · 110px,
 * mobile   two lines "img name price" / "img qty act".
 */
export function DenseRowHeader() {
  return (
    <div className="border-divider text-muted hidden grid-cols-[64px_minmax(0,1fr)_110px_110px_132px_110px] gap-x-4 border-b pb-3 text-[13px] font-bold tracking-[0.02em] xl:grid">
      <span />
      <span>Produit</span>
      <span>Référence</span>
      <span className="text-right">Prix</span>
      <span>Quantité</span>
      <span />
    </div>
  );
}

export function DenseRow({ item, inSelection = false, onAdded }: { item: DenseRowData; inSelection?: boolean; onAdded?: (qty: number) => void }) {
  const [qty, setQty] = useState(1);
  const oos = !item.inStock;

  function add() {
    addToCart(item.sku, qty);
    onAdded?.(qty);
    toast(`${item.name} ajouté au panier`);
    setQty(1);
  }

  return (
    <div
      className={cn(
        "border-divider grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b py-3.5 last:border-b-0 md:grid-cols-[64px_minmax(0,1fr)_110px_110px_132px_110px] md:py-3",
        "[grid-template-areas:'img_name_price'_'img_qty_act'] md:[grid-template-areas:'img_name_ref_price_qty_act']",
        oos && "opacity-60",
      )}
    >
      <div className="rounded-12 bg-tint-thumb flex size-14 items-center justify-center p-1.5 [grid-area:img] md:size-16">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" loading="lazy" />
        ) : (
          <ProductArt art={item.art ?? "coilL"} className="h-auto w-full" />
        )}
      </div>
      <div className="min-w-0 [grid-area:name]">
        {item.href ? (
          <Link href={item.href} className="text-ink hover:text-brand text-base font-bold">
            {item.name}
          </Link>
        ) : (
          <span className="text-base font-bold">{item.name}</span>
        )}
        <span className="text-muted block text-[13px] md:hidden">{item.sku}</span>
        {oos && <span className="text-promo block text-[13px] font-bold">Rupture de stock</span>}
      </div>
      <span className="text-ink-2 hidden text-sm tabular-nums [grid-area:ref] md:block">{item.sku}</span>
      <span className="text-right text-lg font-extrabold [grid-area:price]">{dh(item.price)}</span>
      <div className="[grid-area:qty]">{!oos && <QtyStepper value={qty} onChange={setQty} size={40} label={`Quantité pour ${item.name}`} />}</div>
      <div className="justify-self-end [grid-area:act]">
        {oos ? (
          <a
            href={waLink(`Bonjour, prévenez-moi quand ${item.name} (${item.sku}) sera disponible.`)}
            target="_blank"
            rel="noopener"
            className="border-control text-ink hover:border-ink hover:text-ink inline-flex h-10 min-w-24 items-center justify-center rounded-full border-[1.5px] px-3 text-sm font-bold md:min-w-[100px]"
          >
            Me prévenir
          </a>
        ) : (
          <button
            type="button"
            onClick={add}
            className={cn(
              "h-10 min-w-24 rounded-full border-[1.5px] px-3 text-sm font-bold transition-colors md:min-w-[100px]",
              inSelection ? "border-success bg-success text-white" : "border-line-strong hover:border-ink hover:bg-ink bg-white hover:text-white",
            )}
          >
            {inSelection ? "Ajouté ✓" : "Ajouter"}
          </button>
        )}
      </div>
    </div>
  );
}
