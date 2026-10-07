"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDownIcon, SearchIcon } from "@/components/ui/icons";
import { toast } from "@/components/ui/Toast";
import { addToCart, useCart } from "@/lib/cart/store";
import type { DenseItem } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { dh, isOnRequest, plural, priceRequestHref, priceText, publicRef } from "@/lib/format";
import { DenseRow, DenseRowHeader } from "./DenseRow";
import { ProductArt } from "./ProductArt";

const SORTS = [
  { value: "pertinence", label: "Pertinence" },
  { value: "prix-croissant", label: "Prix croissant" },
  { value: "prix-decroissant", label: "Prix décroissant" },
  { value: "nom", label: "Nom" },
] as const;

type Sort = (typeof SORTS)[number]["value"];

/** Accent- and case-insensitive text for the live filter. */
function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function filterDense(items: DenseItem[], query: string, sort: Sort): DenseItem[] {
  const q = fold(query.trim());
  const matched = q ? items.filter((i) => fold(`${i.name} ${i.sku}`).includes(q)) : items;
  const sorted = [...matched];
  // Items « Prix sur demande » (price 0) go last in both price orders.
  const sortPrice = (p: number) => (isOnRequest(p) ? Number.POSITIVE_INFINITY : p);
  if (sort === "prix-croissant") sorted.sort((a, b) => sortPrice(a.price) - sortPrice(b.price));
  if (sort === "prix-decroissant") sorted.sort((a, b) => Number(isOnRequest(a.price)) - Number(isOnRequest(b.price)) || b.price - a.price);
  if (sort === "nom") sorted.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return sorted;
}

/**
 * Quick-order list (design: Cuivre et gaz.dc.html): sub-category pills, live filter, sort,
 * list/grid view, rows with quantity steppers, and "Votre sélection" (the basket lines of this
 * list) as a sticky sidebar on desktop or a bottom bar below 1100px.
 */
export function DenseList({ items, pills }: { items: DenseItem[]; pills: { label: string; href: string; active: boolean }[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("pertinence");
  const [view, setView] = useState<"liste" | "grille">("liste");
  const cart = useCart();

  const shown = useMemo(() => filterDense(items, query, sort), [items, query, sort]);
  const bySku = useMemo(() => new Map(items.map((i) => [i.sku, i])), [items]);
  const selection = cart.flatMap((line) => {
    const item = bySku.get(line.sku);
    // Items « Prix sur demande » are never part of a selection (not orderable).
    return item && !isOnRequest(item.price) ? [{ item, qty: line.qty }] : [];
  });
  const inSelection = new Set(selection.map((s) => s.item.sku));
  const total = selection.reduce((sum, s) => sum + s.item.price * s.qty, 0);
  const articles = selection.reduce((n, s) => n + s.qty, 0);

  function addGrid(item: DenseItem) {
    addToCart(item.sku, 1);
    toast(`${item.name} ajouté au panier`);
  }

  return (
    <section className="grid grid-cols-1 gap-6 pt-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-4">
        {pills.length > 1 && (
          <nav aria-label="Sous-catégories" className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
            {pills.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                scroll={false}
                aria-current={p.active ? "page" : undefined}
                className={cn(
                  "flex h-11 shrink-0 items-center rounded-full border-[1.5px] px-[18px] text-[15px] font-bold whitespace-nowrap",
                  p.active ? "border-ink bg-ink text-white hover:text-white" : "border-border text-ink hover:border-ink hover:text-ink bg-white",
                )}
              >
                {p.label}
              </Link>
            ))}
          </nav>
        )}

        {/* One product: nothing to filter, sort or rearrange. */}
        {items.length > 1 && (
          <div className="flex flex-wrap gap-2.5">
            <label className="border-input text-muted flex h-12 min-w-0 flex-[1_1_260px] items-center gap-2.5 rounded-full border-[1.5px] bg-white px-[18px]">
              <SearchIcon size={18} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrer : nom ou référence"
                aria-label="Filtrer la liste"
                className="text-ink min-w-0 flex-1 border-0 bg-transparent text-base outline-none"
              />
            </label>
            <span className="relative flex">
              <select
                aria-label="Trier"
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="border-input h-12 cursor-pointer appearance-none rounded-full border-[1.5px] bg-white pr-11 pl-[18px] text-[15px] font-bold"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon size={14} aria-hidden className="pointer-events-none absolute top-1/2 right-[18px] -translate-y-1/2" />
            </span>
            <div role="radiogroup" aria-label="Affichage" className="flex rounded-full bg-white p-[3px] shadow-[inset_0_0_0_1.5px_var(--color-input)]">
              {(["liste", "grille"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={view === v}
                  onClick={() => setView(v)}
                  className={cn("h-[42px] rounded-full px-[18px] text-[15px] font-bold", view === v ? "bg-ink text-white" : "text-ink")}
                >
                  {v === "liste" ? "Liste" : "Grille"}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="m-0 text-[15px] font-bold" aria-live="polite">
          {plural(shown.length, "produit")}
        </p>

        {view === "liste" ? (
          <div className="rounded-24 bg-white px-4 py-1 md:px-6 md:py-4">
            <DenseRowHeader />
            {shown.map((item) => (
              <DenseRow key={item.sku} item={{ ...item, art: item.art ?? undefined }} inSelection={inSelection.has(item.sku)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {shown.map((item) => (
              <article key={item.sku} className="rounded-20 flex flex-col gap-2.5 bg-white p-4">
                {/* Out of stock: only the picture is faded (design fades the card; text kept at AA contrast). */}
                <Link href={item.href} tabIndex={-1} aria-hidden className={cn("flex h-[110px] items-center justify-center", !item.inStock && "opacity-60")}>
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" loading="lazy" />
                  ) : (
                    <ProductArt art={item.art} className="h-auto max-h-full w-[70%]" />
                  )}
                </Link>
                <Link href={item.href} className="text-ink hover:text-brand min-h-10 text-[15px] leading-[1.3] font-bold">
                  {item.name}
                </Link>
                <span className="text-muted text-[13px]">{publicRef(item.sku)}</span>
                <span className={cn("font-extrabold", isOnRequest(item.price) ? "text-base" : "text-xl")}>{priceText(item.price)}</span>
                {isOnRequest(item.price) ? (
                  <Link
                    href={priceRequestHref(item.sku)}
                    className="rounded-12 border-line-strong text-ink hover:border-ink hover:bg-ink mt-auto flex h-11 items-center justify-center border-[1.5px] bg-white text-[15px] font-bold transition-colors hover:text-white"
                  >
                    Demander un prix
                  </Link>
                ) : item.inStock ? (
                  <button
                    type="button"
                    onClick={() => addGrid(item)}
                    className={cn(
                      "rounded-12 mt-auto h-11 border-[1.5px] text-[15px] font-bold transition-colors",
                      inSelection.has(item.sku)
                        ? "border-success bg-success text-white"
                        : "border-line-strong hover:border-ink hover:bg-ink bg-white hover:text-white",
                    )}
                  >
                    {inSelection.has(item.sku) ? "Ajouté ✓" : "Ajouter"}
                  </button>
                ) : (
                  <span className="text-promo mt-auto text-sm font-bold">Rupture de stock</span>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <aside className="rounded-24 sticky top-[88px] hidden flex-col gap-3.5 self-start bg-white p-6 xl:flex" aria-labelledby="selection-title">
        <h2 id="selection-title" className="m-0 text-[22px] font-bold">
          Votre sélection
        </h2>
        {selection.length ? (
          <ul className="m-0 flex list-none flex-col p-0">
            {selection.map(({ item, qty }) => (
              <li key={item.sku} className="border-divider flex items-start justify-between gap-3 border-b py-2.5">
                <span className="flex min-w-0 flex-col">
                  <span className="text-[15px] font-semibold">{item.name}</span>
                  <span className="text-muted text-[13px]">
                    Qté {qty} · {dh(item.price)} / unité
                  </span>
                </span>
                <span className="shrink-0 text-[15px] font-extrabold">{dh(item.price * qty)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted m-0 text-[15px]">Ajoutez des articles depuis la liste.</p>
        )}
        <div className="flex items-baseline justify-between">
          <span className="text-ink-2 text-base">Total</span>
          <strong className="text-[28px] font-extrabold">{dh(total)}</strong>
        </div>
        <Link
          href="/panier"
          className="bg-accent hover:bg-accent-hover flex h-14 items-center justify-center rounded-full text-base font-bold text-white hover:text-white"
        >
          Voir le panier
        </Link>
        <p className="text-ink-2 m-0 text-center text-sm">Livraison gratuite · Paiement à la livraison</p>
      </aside>

      {/* Below 1100px the selection becomes a bottom bar; the page keeps room for it. */}
      <style>{"@media (max-width: 1099px) { body { padding-bottom: 80px; } }"}</style>
      <div className="shadow-bottom-bar site-gutter fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 bg-white py-3 xl:hidden">
        <div className="flex flex-col">
          <span className="text-ink-2 text-[13px]">{plural(articles, "article")} dans votre sélection</span>
          <strong className="text-[22px] font-extrabold">{dh(total)}</strong>
        </div>
        <Link
          href="/panier"
          className="bg-accent hover:bg-accent-hover flex h-12 items-center rounded-full px-5 text-base font-bold text-white hover:text-white"
        >
          Voir le panier
        </Link>
      </div>
    </section>
  );
}
