import type { CSSProperties } from "react";
import Link from "next/link";
import { DesignImg } from "@/components/ui/DesignImg";
import { HERO_IMAGE, designPhoto } from "@/lib/home/assets";
import type { HomeData } from "@/lib/home/types";

const PILL = "am-btn flex h-[50px] items-center justify-center rounded-full px-[26px] text-[15px] font-bold transition-colors";

/**
 * Arfro home hero (Main.dc.html / Mobile.dc.html): one large rounded photo with a white card
 * bottom left (eyebrow, H1, subtitle, two pill buttons) on desktop; photo above a grey panel on
 * phones. The dots under it are decorative (one slide), so there is no carousel control.
 * Motion (globals.css « Arfro home motion »): the card slides up and its parts rise one after the other, the photo
 * drifts slowly (ken burns); the H1 and the photo are never transparent (LCP).
 */
export function ArfroHero({ hero }: { hero: HomeData["hero"] }) {
  // Photo set in "Page d'accueil", else the design's hero photo (as on Climatisation Maroc).
  const photo = hero.image ? { src: hero.image } : designPhoto(HERO_IMAGE);
  return (
    <section aria-labelledby="h1" className="pt-4 md:pt-6">
      <div className="overflow-hidden rounded-[24px] bg-[#F2F4F7] md:relative md:h-[520px] md:rounded-[28px] md:bg-[#0F1B2D] xl:h-[600px]">
        {photo && (
          <DesignImg
            photo={photo}
            sizes="(max-width: 759px) 100vw, 1440px"
            priority
            className="am-kenburns block h-[240px] w-full object-cover md:absolute md:inset-0 md:h-full md:object-[right_center]"
          />
        )}
        <div className="am-hero-card relative flex flex-col gap-3 px-[22px] pt-6 pb-[26px] md:absolute md:bottom-10 md:left-10 md:w-[min(520px,calc(100%-80px))] md:gap-4 md:rounded-[22px] md:bg-white md:p-9">
          <span className="am-hero-in text-promo text-xs font-extrabold tracking-[0.08em] uppercase md:text-[13px]">Offre du moment</span>
          <h1 id="h1" className="am-hero-h1 m-0 text-[30px] leading-[1.08] font-extrabold tracking-[-0.02em] text-balance md:text-[44px] md:leading-[1.05]">
            {hero.title}
          </h1>
          {hero.subtitle && (
            <p style={{ "--am-i": 1 } as CSSProperties} className="am-hero-in text-muted m-0 text-[15px] leading-normal md:text-[17px]">
              {hero.subtitle}
            </p>
          )}
          <div style={{ "--am-i": 2 } as CSSProperties} className="am-hero-in flex flex-col gap-3 pt-1.5 md:flex-row md:flex-wrap">
            {hero.cta && (
              <Link href={hero.cta.href} className={`${PILL} bg-brand hover:bg-brand-hover text-white hover:text-white`}>
                {hero.cta.label}
              </Link>
            )}
            <Link
              href="/calculateur-puissance"
              className={`${PILL} text-ink hover:bg-ink border-ink border-[1.5px] hover:text-white ${hero.cta ? "max-md:hidden" : ""}`}
            >
              Calculer ma puissance
            </Link>
          </div>
        </div>
      </div>
      <div aria-hidden className="hidden items-center justify-center gap-2 pt-[18px] md:flex">
        <span className="bg-ink h-1.5 w-7 rounded-full" />
        <span className="size-1.5 rounded-full bg-[#C9D0DB]" />
        <span className="size-1.5 rounded-full bg-[#C9D0DB]" />
      </div>
    </section>
  );
}
