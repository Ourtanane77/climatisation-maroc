"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { toast } from "@/components/ui/Toast";
import { addToCart } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { dh, plural } from "@/lib/format";
import type { CompareData } from "@/lib/product/types";

const EMPTY = "—";

/** Rows to show: all, or only those where the products differ (the design's switch). */
export function visibleRows(rows: CompareData["rows"], onlyDiff: boolean): CompareData["rows"] {
  return onlyDiff ? rows.filter((r) => r.differs) : rows;
}

/**
 * Title row with the "Afficher uniquement les différences" switch, and the comparison grid
 * (design: Comparer). Removing a product rewrites `?p=`; the dashed slot links to the category.
 */
export function CompareTable({ data, addHref }: { data: CompareData; addHref: string }) {
  const router = useRouter();
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const products = data.products;
  const n = products.length;
  const slot = n < data.max;
  const cols = n + (slot ? 1 : 0);
  const rows = visibleRows(data.rows, onlyDiff);

  function remove(sku: string) {
    const rest = products.filter((p) => p.sku !== sku).map((p) => p.sku);
    router.replace(rest.length ? `/comparer?p=${rest.map(encodeURIComponent).join(",")}` : "/comparer", { scroll: false });
  }

  function add(sku: string, name: string) {
    addToCart(sku, 1);
    toast(`${name} ajouté au panier`);
    setAdded(sku);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(null), 1800);
  }

  const gridStyle = {
    "--cols-m": `112px repeat(${cols}, 200px)`,
    "--cols-t": `200px repeat(${cols}, 230px)`,
    "--cols-d": `200px repeat(${cols}, minmax(0, 1fr))`,
    "--min-m": `${112 + 200 * cols}px`,
    "--min-t": `${200 + 230 * cols}px`,
  } as React.CSSProperties;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-6">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-[34px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px] xl:text-[56px]">Comparer</h1>
          <span className="text-ink-2 text-[17px]">{plural(n, "produit")} · jusqu&apos;à 3 produits</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={onlyDiff}
          onClick={() => setOnlyDiff((v) => !v)}
          className="text-ink flex min-h-12 items-center gap-3 text-base font-bold"
        >
          <span className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200", onlyDiff ? "bg-brand" : "bg-check")}>
            <span
              className={cn(
                "absolute top-[3px] size-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-[left] duration-200",
                onlyDiff ? "left-[23px]" : "left-[3px]",
              )}
            />
          </span>
          Afficher uniquement les différences
        </button>
      </div>

      <section className="pt-7">
        <div className="rounded-24 [scrollbar-width:thin] overflow-x-auto bg-white">
          <div
            role="table"
            aria-label="Comparaison des produits"
            style={gridStyle}
            className="grid min-w-(--min-m) grid-cols-(--cols-m) md:min-w-(--min-t) md:grid-cols-(--cols-t) xl:min-w-0 xl:grid-cols-(--cols-d)"
          >
            <div role="row" className="contents">
              <div
                role="columnheader"
                className="border-divider text-muted sticky left-0 z-2 flex items-end border-r bg-white px-3 py-5 text-sm font-bold md:px-6"
              >
                <span className="hidden md:inline">Produits</span>
              </div>
              {products.map((p) => (
                <div role="columnheader" key={p.sku} className="border-divider relative flex flex-col gap-2.5 border-r p-5">
                  <button
                    type="button"
                    onClick={() => remove(p.sku)}
                    aria-label={`Retirer ${p.name}`}
                    className="bg-bg hover:bg-tint-orange absolute top-3 right-3 z-1 flex size-10 items-center justify-center rounded-full"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3C4043" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                      <path d="M6 6l12 12 M18 6L6 18" />
                    </svg>
                  </button>
                  <Link href={p.href} tabIndex={-1} aria-hidden className="flex h-[100px] items-center justify-center px-6 pt-2 md:h-[150px]">
                    <ProductVisual image={p.image} art={p.art ?? "mural"} dark={p.dark} alt={p.name} shadow={false} />
                  </Link>
                  <Link href={p.href} className="text-ink hover:text-brand min-h-[46px] text-[15px] leading-[1.3] font-semibold md:text-lg">
                    {p.name}
                  </Link>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-[22px] font-extrabold tracking-[-0.02em] md:text-[26px]">{dh(p.price)}</span>
                    {p.regularPrice != null && p.regularPrice > p.price && <span className="text-muted-2 text-sm line-through">{dh(p.regularPrice)}</span>}
                  </div>
                  <button
                    type="button"
                    disabled={!p.orderable}
                    onClick={() => add(p.sku, p.name)}
                    className={cn(
                      "rounded-12 h-12 border-[1.5px] text-[15px] font-bold transition-colors disabled:opacity-50",
                      added === p.sku
                        ? "border-success bg-success text-white"
                        : "border-line-strong text-ink hover:border-ink hover:bg-ink bg-white hover:text-white",
                    )}
                  >
                    {!p.orderable ? "Rupture de stock" : added === p.sku ? "Ajouté ✓" : "Ajouter au panier"}
                  </button>
                </div>
              ))}
              {slot && (
                <div role="columnheader" className="flex p-5">
                  <Link
                    href={addHref}
                    className="rounded-18 border-check text-ink-2 hover:border-brand hover:text-brand flex min-h-60 flex-1 flex-col items-center justify-center gap-2.5 border-2 border-dashed"
                  >
                    <span aria-hidden className="bg-tint-blue text-brand flex size-[52px] items-center justify-center rounded-full text-[28px]">
                      +
                    </span>
                    <span className="text-base font-bold">Ajouter un produit</span>
                  </Link>
                </div>
              )}
            </div>

            {n > 0 &&
              rows.map((r, i) => {
                const bg = i % 2 ? "bg-white" : "bg-zebra-2";
                return (
                  <div role="row" key={r.label} className="contents">
                    <div
                      role="rowheader"
                      className={cn("border-divider text-ink-2 sticky left-0 z-2 border-t border-r px-3 py-4 text-[15px] font-bold md:px-6", bg)}
                    >
                      {r.label}
                    </div>
                    {r.values.map((v, j) => (
                      <div
                        role="cell"
                        key={j}
                        className={cn(
                          "border-divider border-t border-r px-5 py-4 text-[16px]",
                          bg,
                          v === EMPTY ? "text-line-strong" : "text-ink",
                          r.differs && v !== EMPTY && "font-bold",
                        )}
                      >
                        {v}
                      </div>
                    ))}
                    {slot && <div aria-hidden className={cn("border-divider border-t", bg)} />}
                  </div>
                );
              })}
          </div>
        </div>
        <p className="text-muted m-0 mt-4 text-sm">
          Un tiret indique une caractéristique non renseignée dans notre catalogue. Demandez-nous la fiche technique.
        </p>
      </section>
    </>
  );
}
