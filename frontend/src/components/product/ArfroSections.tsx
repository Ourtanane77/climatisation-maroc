"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { groupSpecs, keyFacts } from "@/components/arfro/pdp/data";
import { ARFRO_PDP_H2, PDP_SPLIT, PdpEyebrow } from "@/components/arfro/pdp/styles";
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
 * Arfro product page sections: section tab bar, advantages, key figures, grouped specifications
 * with the documentation, « Pour l'installation » accessory rows. Client components (they follow
 * the selected variant). Everything comes from the product's data; a section without data is left out.
 */

/**
 * Tab bar anchoring to the sections (sticky under the header on wide screens); the tab of the
 * section in view is marked current.
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
    <nav aria-label="Sections du produit" className="border-arfro-line -mx-4 mt-14 scrollbar-none overflow-x-auto border-b px-4 md:mx-0 md:mt-20 md:px-0">
      <ul className="m-0 flex list-none gap-7 p-0 md:gap-10">
        {tabs.map((t) => (
          <li key={t.id}>
            <a
              href={`#${t.id}`}
              aria-current={current === t.id ? "true" : undefined}
              onClick={() => setCurrent(t.id)}
              className={cn(
                "flex min-h-12 items-center py-4 text-[15px] font-bold whitespace-nowrap transition-colors duration-300",
                current === t.id
                  ? "text-arfro-graphite hover:text-arfro-graphite shadow-[inset_0_-2px_0_var(--color-arfro-blue)]"
                  : "text-arfro-muted hover:text-arfro-graphite",
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

/** « Points forts »: the product's highlights as a hairline grid, then its description. */
export function ArfroHighlights({ id, items, description }: { id: string; items: { title: string; icon: string }[]; description: string | null }) {
  if (!items.length && !description) return null;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn(PDP_SPLIT, "scroll-mt-28 pt-14 md:pt-20")}>
      <div className="flex flex-col gap-5">
        <div>
          <PdpEyebrow>Présentation</PdpEyebrow>
          <h2 id={`${id}-title`} className={ARFRO_PDP_H2}>
            Points forts
          </h2>
        </div>
        {description && <p className="text-arfro-graphite/80 m-0 max-w-[60ch] text-[17px] leading-[1.7] whitespace-pre-line">{description}</p>}
      </div>
      {items.length > 0 && (
        <ul className="border-arfro-line m-0 grid list-none grid-cols-1 border-t p-0 sm:grid-cols-2">
          {items.map((item) => {
            const [a, b] = iconPaths(item.icon);
            return (
              <li key={item.title} className="border-arfro-line flex items-center gap-4 border-b py-5 sm:odd:pr-6 sm:even:border-l sm:even:pl-6">
                <svg
                  aria-hidden
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-arfro-blue)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <path d={a} />
                  <path d={b} stroke="var(--color-arfro-electric)" />
                </svg>
                <h3 className="m-0 text-[17px] leading-[1.3] font-bold">{item.title}</h3>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/**
 * « En bref »: the selected variant's headline figures (power, surface, technology, fluid…) read
 * from its spec rows, on a Deep Navy band. Left out when the product has fewer than two.
 */
export function ArfroKeyFacts({ id }: { id: string }) {
  const { product, variant } = useProduct();
  const facts = keyFacts(specRows(product, variant));
  if (facts.length < 2) return null;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="bleed bg-arfro-navy mt-14 scroll-mt-28 text-white md:mt-20">
      <div className="site-gutter py-12 md:py-16">
        <PdpEyebrow onDark>En bref</PdpEyebrow>
        <h2 id={`${id}-title`} className={cn(ARFRO_PDP_H2, "mb-8 md:mb-10")}>
          {variant.name}
        </h2>
        <dl className="border-arfro-line-dark m-0 grid grid-cols-2 border-t md:grid-cols-4">
          {facts.map((f) => (
            <div
              key={f.label}
              className="border-arfro-line-dark flex flex-col-reverse gap-2 border-b py-6 pr-4 md:border-r md:border-b-0 md:px-6 md:first:pl-0 md:last:border-r-0"
            >
              <dt className="text-arfro-on-navy text-[13px] font-semibold tracking-[0.06em] uppercase">{f.label}</dt>
              <dd className="font-arfro m-0 text-[clamp(20px,2.2vw,30px)] leading-[1.15] font-extrabold tracking-[-0.02em]">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** « Caractéristiques »: rows of the selected variant in groups, and the datasheet when there is one. */
export function ArfroSpecs({ id }: { id: string }) {
  const { product, variant } = useProduct();
  const groups = groupSpecs(specRows(product, variant));
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn(PDP_SPLIT, "scroll-mt-28 pt-14 md:pt-20")}>
      <div className="flex flex-col gap-6">
        <div>
          <PdpEyebrow>Fiche technique</PdpEyebrow>
          <h2 id={`${id}-title`} className={ARFRO_PDP_H2}>
            Caractéristiques
          </h2>
        </div>
        {product.variants.length > 1 && <p className="text-arfro-muted m-0 text-[15px]">Valeurs pour {variant.label ?? variant.sku}.</p>}
        {product.datasheet && (
          <a
            href={product.datasheet}
            target="_blank"
            rel="noopener"
            className="rounded-arfro-md border-arfro-line hover:border-arfro-blue group flex max-w-[420px] items-center gap-4 border p-4 transition-colors duration-300"
          >
            <span aria-hidden className="bg-arfro-ice text-arfro-blue rounded-arfro-sm flex size-12 shrink-0 items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M12 11v6 M9 14l3 3 3-3" />
              </svg>
            </span>
            <span className="flex flex-col">
              <span className="text-arfro-graphite text-[15px] font-bold">Télécharger la fiche technique</span>
              <span className="text-arfro-muted text-[13px]">Documentation du fabricant</span>
            </span>
          </a>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-8">
        {groups.map((g) => (
          <div key={g.title}>
            <h3 className="text-arfro-muted m-0 mb-2 text-[13px] font-bold tracking-[0.14em] uppercase">{g.title}</h3>
            <dl className="border-arfro-line m-0 border-t">
              {g.rows.map((r) => (
                <div key={r.label} className="border-arfro-line grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4 border-b py-4">
                  <dt className="text-arfro-muted text-[15px]">{r.label}</dt>
                  <dd className="m-0 text-[15px] font-semibold">{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

/** « Pour l'installation »: accessory rows, each with its own + button (adds one to the basket). */
export function ArfroInstall({ accessories }: { accessories: AccessoryData[] }) {
  const [added, setAdded] = useState<string | null>(null);
  if (!accessories.length) return null;

  function add(a: AccessoryData) {
    addToCart(a.sku, 1);
    toast(`${a.name} ajouté au panier`);
    setAdded(a.sku);
  }

  return (
    <ul className="border-arfro-line m-0 flex list-none flex-col border-t p-0">
      {accessories.map((a) => (
        <li key={a.sku} className="border-arfro-line flex items-center gap-4 border-b py-4">
          <span className="rounded-arfro-sm flex size-[72px] shrink-0 items-center justify-center bg-white p-2">
            {a.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.image}
                alt=""
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className="block max-h-full max-w-full object-contain mix-blend-multiply"
              />
            ) : (
              <ProductArt art={a.art} className="h-auto w-full" />
            )}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Link href={a.href} className="text-arfro-graphite hover:text-arfro-blue font-bold">
              {a.name}
            </Link>
            {publicRef(a.sku) && <span className="text-arfro-muted text-[13px]">Réf. {a.sku}</span>}
            <span className="text-[15px] font-semibold">{priceText(a.price)}</span>
          </span>
          {a.orderable ? (
            <button
              type="button"
              onClick={() => add(a)}
              aria-label={`Ajouter ${a.name} au panier`}
              className={cn(
                "rounded-arfro-sm flex size-11 shrink-0 items-center justify-center border text-xl font-bold transition-colors duration-300",
                added === a.sku
                  ? "border-arfro-blue bg-arfro-blue text-white"
                  : "border-arfro-blue text-arfro-blue hover:bg-arfro-blue bg-white hover:text-white",
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
  );
}
