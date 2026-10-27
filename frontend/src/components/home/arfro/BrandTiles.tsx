import Link from "next/link";
import type { CSSProperties } from "react";
import type { BrandLogo } from "@/lib/home/types";
import { Reveal } from "./motion";

/** Seconds per brand for one loop of the marquee (9 brands: 36 s). */
const SECONDS_PER_BRAND = 4;

function Tile({ brand, official, copy }: { brand: BrandLogo; official: boolean; copy: boolean }) {
  return (
    <Link
      href={brand.href}
      tabIndex={copy ? -1 : undefined}
      className="am-lift hover:border-ink flex h-[100px] w-[168px] flex-col items-center justify-center gap-2.5 rounded-[22px] border border-[#E3E7EE] bg-white px-4 transition-colors md:h-[120px] md:w-[232px]"
    >
      {brand.logo ? (
        // Logos are served pre-sized by the API (h96 WebP).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logo}
          alt={copy ? "" : brand.name}
          loading="lazy"
          decoding="async"
          height={40}
          width={Math.round(40 * (brand.aspect ?? 3))}
          className="block h-8 w-auto max-w-[70%] object-contain md:h-10"
        />
      ) : (
        <span className="text-ink text-xl font-extrabold tracking-[-0.03em]">{brand.name}</span>
      )}
      {official && <span className="text-brand text-xs font-bold">Distributeur officiel</span>}
    </Link>
  );
}

/**
 * « Nos marques » (Main.dc.html): bordered tiles with the brand logos, « Distributeur officiel »
 * under the brands flagged official in the back office. Since 2026-10-27 (owner's request) every
 * home brand scrolls in an endless marquee instead of two fixed rows: the list is rendered twice and
 * the track slides by one copy; the copy is aria-hidden and out of the tab order. Hover or keyboard
 * focus pauses it; with reduced motion the tiles wrap on rows and the copy is hidden.
 */
export function BrandTiles({ brands, official }: { brands: BrandLogo[]; official: Set<string> }) {
  if (!brands.length) return null;
  const list = (copy: boolean) => (
    <ul
      aria-hidden={copy || undefined}
      className={`am-marquee__list ${copy ? "am-marquee__copy" : ""} m-0 flex shrink-0 list-none gap-3 p-0 pr-3 md:gap-4 md:pr-4`}
    >
      {brands.map((b) => (
        <li key={b.href} className="py-2">
          <Tile brand={b} official={official.has(b.href)} copy={copy} />
        </li>
      ))}
    </ul>
  );

  return (
    <Reveal group>
      <section id="marques" aria-labelledby="h-mar" className="scroll-mt-24 pt-11 md:pt-[88px]">
        <div className="am-fade mb-[10px] flex flex-wrap items-end justify-between gap-4 md:mb-4">
          <h2 id="h-mar" className="m-0 text-2xl font-extrabold tracking-[-0.02em] md:text-[34px]">
            Nos marques
          </h2>
          <Link href="/marques" className="text-brand -my-3 inline-flex min-h-11 items-center text-[15px] font-bold">
            <span className="am-link">Toutes les marques</span>
          </Link>
        </div>
        <div className="am-fade am-marquee -mx-[var(--site-gutter)] overflow-hidden xl:mx-0">
          <div className="am-marquee__track flex w-max" style={{ "--am-duration": `${brands.length * SECONDS_PER_BRAND}s` } as CSSProperties}>
            {list(false)}
            {list(true)}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
