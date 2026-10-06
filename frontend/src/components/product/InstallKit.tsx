"use client";

import { useState } from "react";
import { ProductArt } from "@/components/catalog/ProductArt";
import { toast } from "@/components/ui/Toast";
import { addToCart } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { dh } from "@/lib/format";
import type { AccessoryData } from "@/lib/product/types";
import { Section } from "./Section";

/**
 * Cookie read by the checkout to pre-tick the "Visite technique" option (the basket itself only
 * holds SKUs). Set when the visit row is ticked and the kit is added.
 */
export const VISIT_COOKIE = "cm_visit";

/** Accessories checked by default, the visit unchecked (design). */
export function kitTotal(accessories: { price: number; orderable: boolean }[], checked: boolean[], visitPrice: number, visit: boolean): number {
  return accessories.reduce((sum, a, i) => sum + (checked[i] && a.orderable ? a.price : 0), 0) + (visit ? visitPrice : 0);
}

/** "Pour l'installation" (design: orange box, toggle rows, live total, "Tout ajouter au panier"). */
export function InstallKit({ accessories, visitPrice }: { accessories: AccessoryData[]; visitPrice: number }) {
  const [checked, setChecked] = useState(() => accessories.map((a) => a.orderable));
  const [visit, setVisit] = useState(false);
  if (!accessories.length) return null;

  const rows = [
    ...accessories.map((a, i) => ({
      key: a.sku,
      title: a.name,
      sub: `Réf. ${a.sku}`,
      price: a.price,
      on: checked[i],
      disabled: !a.orderable,
      toggle: () => setChecked((c) => c.map((v, j) => (j === i ? !v : v))),
      thumb: a.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.image} alt="" loading="lazy" className="block max-h-full max-w-full object-contain mix-blend-multiply" />
      ) : (
        <ProductArt art={a.art ?? "support"} className="h-auto w-full" />
      ),
    })),
    {
      key: "visite",
      title: "Visite technique",
      sub: "Un technicien mesure et conseille",
      price: visitPrice,
      on: visit,
      disabled: false,
      toggle: () => setVisit((v) => !v),
      thumb: <span className="text-brand text-xs font-bold">Visite</span>,
    },
  ];

  function addAll() {
    accessories.forEach((a, i) => {
      if (checked[i] && a.orderable) addToCart(a.sku, 1);
    });
    if (visit) document.cookie = `${VISIT_COOKIE}=1; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    toast("Kit d’installation ajouté au panier");
  }

  const total = kitTotal(accessories, checked, visitPrice, visit);

  return (
    <Section id="installation" title="Pour l'installation">
      <div className="rounded-24 bg-tint-orange-2 flex flex-col gap-3 p-6 md:p-12">
        {rows.map((r) => (
          <button
            key={r.key}
            type="button"
            role="checkbox"
            aria-checked={r.on}
            disabled={r.disabled}
            onClick={r.toggle}
            className="rounded-18 text-ink flex w-full items-center gap-4 bg-white px-[18px] py-3.5 text-left disabled:opacity-50"
          >
            <span
              aria-hidden
              className={cn(
                "rounded-7 flex size-6 shrink-0 items-center justify-center border-[1.5px] text-sm text-white",
                r.on ? "border-brand bg-brand" : "border-check bg-white",
              )}
            >
              {r.on ? "✓" : ""}
            </span>
            <span className="rounded-12 bg-tint-thumb box-border flex h-[52px] w-16 shrink-0 items-center justify-center p-1.5">{r.thumb}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-bold">{r.title}</span>
              <span className="text-muted text-sm">{r.sub}</span>
            </span>
            <span className="text-lg font-extrabold whitespace-nowrap">{dh(r.price)}</span>
          </button>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <span className="text-[17px]" aria-live="polite">
            Total sélection : <strong className="text-2xl">{dh(total)}</strong>
          </span>
          <button
            type="button"
            onClick={addAll}
            disabled={total === 0}
            className="bg-accent h-14 rounded-full px-6 text-base font-bold text-white hover:brightness-[0.94] disabled:opacity-50"
          >
            Tout ajouter au panier
          </button>
        </div>
      </div>
    </Section>
  );
}
