import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import type { PageDetail } from "@/lib/content/types";
import { GRID_2, PageTitle, Section, SectionTitle } from "./blocks";

/**
 * À propos sections that come from shared data rather than the page body (design: A propos.dc.html):
 * the blue hero, "Nos marques" (brand logos sized by equal area) and "Nos magasins à Marrakech".
 * The design's photo slots ("[PHOTO MAGASIN]", "[PHOTO ÉQUIPE]") are not rendered: they come back
 * when the owner supplies real shop photos (never a placeholder shown to visitors).
 */

export function AboutHero({ h1, intro }: { h1: string; intro: string | null }) {
  return (
    <section className="rounded-28 bg-brand mt-6 px-5 py-8 text-white md:px-10 md:py-12 xl:p-14">
      <div className="flex max-w-[760px] flex-col gap-[18px]">
        <PageTitle className="text-white">{h1}</PageTitle>
        {intro && <p className="text-footer-text-2 m-0 max-w-[600px] text-[19px] leading-[1.55] text-pretty">{intro}</p>}
      </div>
    </section>
  );
}

/** Logo box with the same area for every brand (design `logo()`): A = 4000 px² (2400 mobile). */
function logoSize(aspect: number, area: number, maxH: number, maxW: number) {
  let w = Math.sqrt(area * aspect);
  let h = Math.sqrt(area / aspect);
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  if (w > maxW) {
    w = maxW;
    h = w / aspect;
  }
  return { w: Math.round(w), h: Math.round(h) };
}

export function BrandLogos({ brands }: { brands: NonNullable<PageDetail["brands"]> }) {
  if (!brands.length) return null;
  return (
    <Section>
      <SectionTitle>Nos marques</SectionTitle>
      <div className="rounded-24 grid grid-cols-3 items-center justify-items-center gap-x-4 gap-y-6 bg-white p-6 md:grid-cols-5 xl:grid-cols-9">
        {brands.map((b) => {
          const ar = b.aspect ?? 3;
          const desk = logoSize(ar, 4000, 54, 130);
          const mob = logoSize(ar, 2400, 40, 96);
          return (
            <Link key={b.href} href={b.href} aria-label={b.name} className="flex min-h-[72px] flex-col items-center justify-center gap-2">
              {b.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.logo}
                  alt={b.name}
                  className="block h-[var(--mh)] w-[var(--mw)] object-contain md:h-[var(--dh)] md:w-[var(--dw)]"
                  style={{ "--mw": `${mob.w}px`, "--mh": `${mob.h}px`, "--dw": `${desk.w}px`, "--dh": `${desk.h}px` } as React.CSSProperties}
                />
              )}
              {b.official && <span className="text-brand text-xs font-bold">Distributeur officiel</span>}
            </Link>
          );
        })}
      </div>
    </Section>
  );
}

export function StoreCards({ stores, hours }: { stores: { name: string; address: string }[]; hours: string }) {
  if (!stores.length) return null;
  return (
    <Section>
      <SectionTitle>Nos magasins à Marrakech</SectionTitle>
      <div className={GRID_2}>
        {stores.map((s) => {
          return (
            <article key={s.name} className="rounded-24 flex flex-col overflow-hidden bg-white">
              <div className="flex flex-col gap-2.5 p-6">
                <h3 className="m-0 text-[22px] font-bold">{s.name}</h3>
                <address className="text-[17px] leading-[1.5] not-italic">{s.address}</address>
                <span className="text-ink-2 text-[15px]">{hours}</span>
                <ButtonLink href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.address)}`} variant="outline" full>
                  Itinéraire
                </ButtonLink>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
