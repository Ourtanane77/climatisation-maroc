"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { ArfroProductCard } from "@/components/arfro/product/ArfroProductCard";
import { cn } from "@/lib/cn";
import type { ProductCardData } from "@/lib/types";

export interface ProductCollection {
  label: string;
  href: string | null;
  products: ProductCardData[];
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-[18px]", className)}
    >
      <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />
    </svg>
  );
}

/** Closing tile of a collection: typographic, links to the whole range. */
function EndTile({ collection, className }: { collection: ProductCollection; className?: string }) {
  if (!collection.href) return null;
  return (
    <Link
      href={collection.href}
      className={cn(
        "group/end border-arfro-line text-arfro-graphite hover:text-arfro-graphite rounded-arfro-md hover:border-arfro-graphite flex min-h-[260px] flex-col justify-between border p-7 transition-colors duration-300",
        className,
      )}
    >
      <span className="text-arfro-muted text-[11px] font-bold tracking-[0.18em] uppercase">{collection.label}</span>
      <span className="font-arfro flex items-end justify-between gap-4 text-[clamp(24px,2.2vw,32px)] leading-[1.1] font-extrabold tracking-[-0.02em]">
        Voir toute la collection
        <Arrow className="mb-1 size-6 shrink-0 transition-transform duration-300 ease-[var(--ease-arfro)] group-hover/end:translate-x-1 motion-reduce:transition-none" />
      </span>
    </Link>
  );
}

/**
 * One list for every width. Phones and tablets: horizontal snap rail bleeding to the screen edge,
 * ending on the « Voir toute la collection » tile. Desktop: five or more products → one large
 * featured card beside a 2×2 grid (the rest stays in the rail only); fewer → a row of four closed
 * by the tile.
 */
function CollectionList({ collection }: { collection: ProductCollection }) {
  const list = collection.products;
  const featured = list.length >= 5;
  const left = featured ? 0 : 4 - list.length;
  return (
    <ul
      aria-label={collection.label}
      className="-mx-[var(--site-gutter)] flex snap-x snap-mandatory scroll-px-[var(--site-gutter)] [scrollbar-width:none] list-none gap-5 overflow-x-auto px-[var(--site-gutter)] pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-x-8 lg:gap-y-14 lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {list.map((p, i) => (
        <li
          key={p.href}
          className={cn(
            "flex w-[78%] min-w-0 shrink-0 snap-start sm:w-[44%] lg:w-auto",
            featured && i === 0 && "lg:col-span-2 lg:row-span-2",
            featured && i > 4 && "lg:hidden",
          )}
        >
          <ArfroProductCard product={p} feature={featured && i === 0} />
        </li>
      ))}
      {collection.href && (
        <li
          className={cn(
            "flex w-[60%] shrink-0 snap-start sm:w-[36%] lg:w-auto",
            left <= 0 ? "lg:hidden" : left === 3 ? "lg:col-span-3" : left === 2 ? "lg:col-span-2" : "lg:col-span-1",
          )}
        >
          <EndTile collection={collection} className="w-full" />
        </li>
      )}
    </ul>
  );
}

/**
 * Collections of the « produits » section as an accessible tablist (arrows, Home, End; automatic
 * activation). Every panel is in the server HTML (inactive ones `hidden`) so the product links stay
 * crawlable; a panel never shown holds only a plain list of its links (cards mount on first
 * activation), which keeps the home DOM light. Phones and tablets: horizontal snap rail ending on
 * « Voir toute la collection »; desktop: the editorial grid above.
 */
export function ProductTabs({ collections, idBase }: { collections: ProductCollection[]; idBase: string }) {
  const [active, setActiveState] = useState(0);
  const [shown, setShown] = useState<ReadonlySet<number>>(() => new Set([0]));
  const setActive = (i: number) => {
    setActiveState(i);
    setShown((s) => (s.has(i) ? s : new Set(s).add(i)));
  };
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs = collections.length > 1;

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const last = collections.length - 1;
    const next =
      e.key === "ArrowRight"
        ? active === last
          ? 0
          : active + 1
        : e.key === "ArrowLeft"
          ? active === 0
            ? last
            : active - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next == null) return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  }

  return (
    <div className="mt-12 md:mt-16">
      <div className="border-arfro-line flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b">
        {tabs ? (
          <div
            role="tablist"
            aria-label="Collections"
            onKeyDown={onKey}
            className="-mb-px flex max-w-full [scrollbar-width:none] gap-8 overflow-x-auto md:gap-10"
          >
            {collections.map((c, i) => {
              const on = i === active;
              return (
                <button
                  key={c.label}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${idBase}-tab-${i}`}
                  aria-selected={on}
                  aria-controls={`${idBase}-panel-${i}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative flex min-h-12 shrink-0 items-start gap-1.5 pb-4 text-[16px] font-bold whitespace-nowrap transition-colors duration-300 md:text-[17px]",
                    "after:bg-arfro-blue after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:transition-transform after:duration-500 after:ease-[var(--ease-arfro)] motion-reduce:after:transition-none",
                    on ? "text-arfro-graphite after:scale-x-100" : "text-arfro-muted hover:text-arfro-graphite after:scale-x-0",
                  )}
                >
                  {c.label}
                  <span aria-hidden className="text-arfro-muted pt-0.5 text-[11px] leading-none font-semibold tabular-nums">
                    {String(c.products.length).padStart(2, "0")}
                  </span>
                  <span className="sr-only">{` (${c.products.length} produit${c.products.length > 1 ? "s" : ""})`}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-arfro-graphite m-0 pb-4 text-[17px] font-bold">{collections[0]?.label}</p>
        )}
      </div>

      {collections.map((c, i) => (
        <div
          key={c.label}
          id={`${idBase}-panel-${i}`}
          role={tabs ? "tabpanel" : undefined}
          aria-labelledby={tabs ? `${idBase}-tab-${i}` : undefined}
          hidden={i !== active}
          tabIndex={tabs ? 0 : undefined}
          className="pt-10 focus-visible:outline-none md:pt-14"
        >
          {!shown.has(i) ? (
            <ul className="m-0 list-none p-0">
              {c.products.map((p) => (
                <li key={p.href}>
                  <Link href={p.href}>{p.name}</Link>
                </li>
              ))}
              {c.href && (
                <li>
                  <Link href={c.href}>Voir toute la collection {c.label}</Link>
                </li>
              )}
            </ul>
          ) : (
            <>
              {c.href && (
                <div className="mb-8 flex justify-end lg:mb-10">
                  <Link
                    href={c.href}
                    className="text-arfro-blue hover:text-arfro-blue-hover group/all inline-flex min-h-11 items-center gap-2 text-[15px] font-bold"
                  >
                    Voir toute la collection
                    <span className="sr-only"> {c.label}</span>
                    <Arrow className="transition-transform duration-300 ease-[var(--ease-arfro)] group-hover/all:translate-x-1 motion-reduce:transition-none" />
                  </Link>
                </div>
              )}
              <CollectionList collection={c} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
