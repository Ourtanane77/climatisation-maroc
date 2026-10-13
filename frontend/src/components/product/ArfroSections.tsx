"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductArt } from "@/components/catalog/ProductArt";
import { toast } from "@/components/ui/Toast";
import { addToCart } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { priceText, publicRef } from "@/lib/format";
import type { AccessoryData } from "@/lib/product/types";
import { iconPaths } from "./Highlights";
import { useProduct } from "./ProductContext";
import { specRows } from "./SpecTable";

/**
 * Arfro product page sections (Produit.dc.html): section tab bar, highlight tiles, two-column
 * spec list and the « Pour l'installation » accessory rows. Client components (selected variant).
 */

/** Shared H2 of the Arfro product sections (30/800). */
const ARFRO_H2 = "m-0 mb-5 text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em] md:text-[30px]";

/**
 * Tab bar anchoring to the sections; the tab of the section in view is marked current.
 */
export function SectionTabs({ tabs }: { tabs: { id: string; label: string }[] }) {
  const [current, setCurrent] = useState(tabs[0]?.id);

  useEffect(() => {
    const targets = tabs.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => !!el);
    if (!targets.length || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [tabs]);

  if (tabs.length < 2) return null;
  return (
    <nav
      aria-label="Sections du produit"
      className="border-border -mx-4 mt-14 [scrollbar-width:none] overflow-x-auto border-b px-4 md:mx-0 md:mt-[72px] md:px-0"
    >
      <ul className="m-0 flex list-none gap-6 p-0 md:gap-8">
        {tabs.map((t) => (
          <li key={t.id}>
            <a
              href={`#${t.id}`}
              aria-current={current === t.id ? "true" : undefined}
              onClick={() => setCurrent(t.id)}
              className={cn(
                "flex min-h-11 items-center py-4 text-[15px] font-bold whitespace-nowrap md:text-base",
                current === t.id ? "text-ink hover:text-ink shadow-[inset_0_-3px_0_var(--color-ink)]" : "text-muted hover:text-ink",
              )}
            >
              {t.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Highlights as grey tiles with a blue round icon, then the description. */
export function ArfroHighlights({ id, items, description }: { id: string; items: { title: string; icon: string }[]; description: string | null }) {
  if (!items.length && !description) return null;
  return (
    <section id={id} aria-label="Présentation" className="flex scroll-mt-24 flex-col gap-8 pt-10 md:pt-14">
      {items.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3 md:gap-4 xl:grid-cols-5">
          {items.map((item) => {
            const [a, b] = iconPaths(item.icon);
            return (
              <li key={item.title} className="rounded-18 bg-bg flex min-h-[150px] flex-col gap-4 px-5 py-6 md:px-[22px] md:py-7">
                <span className="bg-brand flex size-11 shrink-0 items-center justify-center rounded-full">
                  <svg
                    aria-hidden
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={a} />
                    <path d={b} />
                  </svg>
                </span>
                <h3 className="m-0 text-base leading-[1.25] font-extrabold md:text-[17px]">{item.title}</h3>
              </li>
            );
          })}
        </ul>
      )}
      {description && <p className="text-ink-2 m-0 max-w-[860px] text-base leading-[1.7] whitespace-pre-line md:text-lg">{description}</p>}
    </section>
  );
}

/** « Caractéristiques »: two-column dl with hairlines, rows of the selected variant. */
export function ArfroSpecs({ id }: { id: string }) {
  const { product, variant } = useProduct();
  const rows = specRows(product, variant);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="min-w-0 flex-[1_1_520px] scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id={`${id}-title`} className={cn(ARFRO_H2, "mb-0")}>
          Caractéristiques
        </h2>
        {product.datasheet && (
          <a
            href={product.datasheet}
            target="_blank"
            rel="noopener"
            className="border-ink text-ink hover:bg-ink flex h-11 items-center rounded-full border-[1.5px] px-5 text-sm font-bold hover:text-white"
          >
            Télécharger la fiche technique
          </a>
        )}
      </div>
      <dl className="border-border m-0 grid grid-cols-2 border-t">
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <dt className="border-border text-muted border-b py-4 pr-4 text-[15px]">{r.label}</dt>
            <dd className="border-border m-0 border-b py-4 text-[15px] font-bold">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** « Pour l'installation »: accessory rows, each with its own + button (adds one to the basket). */
export function ArfroInstall({ id, accessories }: { id: string; accessories: AccessoryData[] }) {
  const [added, setAdded] = useState<string | null>(null);
  if (!accessories.length) return null;

  function add(a: AccessoryData) {
    addToCart(a.sku, 1);
    toast(`${a.name} ajouté au panier`);
    setAdded(a.sku);
  }

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="min-w-0 flex-[1_1_420px] scroll-mt-24">
      <h2 id={`${id}-title`} className={ARFRO_H2}>
        Pour l&apos;installation
      </h2>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {accessories.map((a) => (
          <li key={a.sku} className="rounded-20 border-border flex items-center gap-4 border p-3.5">
            <span className="rounded-14 bg-bg flex size-[76px] shrink-0 items-center justify-center p-2">
              {a.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.image} alt="" loading="lazy" className="block max-h-full max-w-full object-contain mix-blend-multiply" />
              ) : (
                <ProductArt art={a.art} className="h-auto w-full" />
              )}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <Link href={a.href} className="text-ink hover:text-brand font-extrabold">
                {a.name}
              </Link>
              {publicRef(a.sku) && <span className="text-muted text-[13px]">Réf. {a.sku}</span>}
              <span className="text-[15px] font-bold">{priceText(a.price)}</span>
            </span>
            {a.orderable ? (
              <button
                type="button"
                onClick={() => add(a)}
                aria-label={`Ajouter ${a.name} au panier`}
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] text-xl font-extrabold",
                  added === a.sku ? "border-brand bg-brand text-white" : "border-brand text-brand hover:bg-tint-blue bg-white",
                )}
              >
                {added === a.sku ? "✓" : "+"}
              </button>
            ) : (
              <span className="text-promo shrink-0 text-[13px] font-bold">Indisponible</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
