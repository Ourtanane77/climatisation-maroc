"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { cn } from "@/lib/cn";
import type { Link as LinkData, ProductCardData } from "@/lib/types";
import { Reveal } from "./motion";

export interface SelectionTab {
  id: string;
  label: string;
  products: ProductCardData[];
  more?: LinkData;
}

/**
 * « Nos sélections » (Main.dc.html): a tablist switching between the home's product lists
 * (promotions, new products, a range…), up to eight Arfro cards per list (two rows on desktop),
 * then the list's « Voir tout » pill. Keyboard: arrows, Home and End move between tabs (automatic
 * activation). The cards rise in when the section scrolls into view and again on a tab switch.
 */
export function Selections({ tabs }: { tabs: SelectionTab[] }) {
  // Opens on the first list that fills a row of four (owner's request, 2026-10-27: the home looked
  // empty with a short promotions list), else on the first tab.
  const [active, setActive] = useState(() =>
    Math.max(
      0,
      tabs.findIndex((t) => t.products.length >= 4),
    ),
  );
  // The switch animation only plays after a tab change, not on the first render.
  const [switched, setSwitched] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const tab = tabs[active];

  // On phones the tab row scrolls sideways: keep the active tab in view (without scrolling the page).
  useEffect(() => {
    const el = refs.current[active];
    const row = el?.parentElement;
    if (!el || !row || row.scrollWidth <= row.clientWidth) return;
    row.scrollLeft = Math.max(0, el.offsetLeft - row.offsetLeft - 8);
  }, [active]);

  function select(i: number) {
    if (i !== active) setSwitched(true);
    setActive(i);
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const last = tabs.length - 1;
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
    select(next);
    refs.current[next]?.focus();
  }

  return (
    <Reveal group>
      <section id="selections" aria-labelledby="h-sel" className="scroll-mt-24 pt-11 md:pt-[88px]">
        <div className="am-fade mb-[18px] flex flex-wrap items-end justify-between gap-x-6 gap-y-3.5 md:mb-7">
          <h2 id="h-sel" className="m-0 text-2xl font-extrabold tracking-[-0.02em] md:text-[34px]">
            Nos sélections
          </h2>
          {tabs.length > 1 && (
            <div
              role="tablist"
              aria-label="Sélections"
              onKeyDown={onKey}
              className="flex w-full scrollbar-none gap-1 overflow-x-auto rounded-full bg-[#F2F4F7] p-1 md:w-auto md:gap-1.5 md:p-[5px]"
            >
              {tabs.map((t, i) => {
                const on = i === active;
                return (
                  <button
                    key={t.id}
                    ref={(el) => {
                      refs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`sel-tab-${t.id}`}
                    aria-selected={on}
                    aria-controls={`sel-panel-${t.id}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => select(i)}
                    className={cn(
                      "h-11 flex-1 shrink-0 cursor-pointer rounded-full border-0 px-3 text-sm font-bold whitespace-nowrap transition-colors md:h-10 md:flex-none md:px-5",
                      on ? "bg-ink text-white" : "text-ink bg-transparent hover:bg-white",
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div id={`sel-panel-${tab.id}`} role={tabs.length > 1 ? "tabpanel" : undefined} aria-labelledby={tabs.length > 1 ? `sel-tab-${tab.id}` : undefined}>
          <ul
            key={tab.id}
            className={cn("am-cards am-stagger m-0 grid list-none grid-cols-2 gap-x-3 gap-y-[22px] p-0 md:gap-5 xl:grid-cols-4", switched && "am-tab-in")}
          >
            {tab.products.slice(0, 8).map((p) => (
              <li key={p.href} className="flex *:w-full">
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
          {tab.more && (
            <div className="flex justify-center pt-7 md:pt-9">
              <Link
                href={tab.more.href}
                className="am-btn border-ink text-ink hover:bg-ink flex h-[50px] items-center rounded-full border-[1.5px] px-7 text-[15px] font-bold transition-colors hover:text-white"
              >
                {tab.more.label}
              </Link>
            </div>
          )}
        </div>
      </section>
    </Reveal>
  );
}
