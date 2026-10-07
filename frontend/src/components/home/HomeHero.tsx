import { ButtonLink } from "@/components/ui/Button";
import { DesignImg } from "@/components/ui/DesignImg";
import { MAT, MatIcon, WhatsAppIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { HERO_IMAGE, designPhoto } from "@/lib/home/assets";
import type { HomeData } from "@/lib/home/types";
import { waLink } from "@/lib/whatsapp";
import { PowerFinder } from "./PowerFinder";

const REASSURE = [
  { label: "Livraison gratuite au Maroc", d: MAT.truck },
  { label: "Paiement à la livraison", d: MAT.cash },
  { label: "Marques officielles", d: MAT.verified },
];

/**
 * Home hero (design/Accueil.dc.html): full-bleed blue band with the hero photo and its shade,
 * H1, subtitle, CTAs; the power finder bar overlapping its bottom edge; the reassurance strip.
 */
export function HomeHero({ hero, whatsapp }: Pick<HomeData, "hero" | "whatsapp">) {
  // Photo set in "Page d'accueil", else the design's hero photo when present.
  const photo = hero.image ? { src: hero.image } : designPhoto(HERO_IMAGE);
  return (
    <section aria-labelledby="h1" className="relative">
      <div className="bg-brand bleed relative flex min-h-[560px] items-center overflow-hidden text-white md:min-h-[520px] xl:min-h-[580px]">
        {/* The LCP element: a real image (preloaded, high priority), cropped like the design's
            background-size: cover. */}
        {photo && (
          <DesignImg photo={photo} sizes="100vw" priority className="absolute inset-0 size-full object-cover object-[72%_center] md:object-[right_center]" />
        )}
        {/* The shade is drawn with or without the photo, as in the design. */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0",
            "bg-[linear-gradient(180deg,rgba(8,45,92,0.82)_0%,rgba(8,45,92,0.62)_55%,rgba(8,45,92,0.35)_100%)]",
            "md:bg-[linear-gradient(90deg,rgba(8,45,92,0.8)_0%,rgba(8,45,92,0.6)_50%,rgba(8,45,92,0.2)_85%)]",
            "xl:bg-[linear-gradient(90deg,rgba(8,45,92,0.66)_0%,rgba(8,45,92,0.52)_38%,rgba(8,45,92,0.15)_62%,rgba(8,45,92,0)_80%)]",
          )}
        />
        <div className="site-gutter relative z-[2] w-full">
          <div className="flex max-w-full flex-col gap-6 pt-10 pb-[72px] md:max-w-[520px] md:pt-14 md:pb-24 xl:max-w-[600px] xl:pt-16 xl:pb-[104px]">
            {/* Empty badge row of the design (keeps the same vertical rhythm). */}
            <div aria-hidden className="flex gap-2" />
            <h1
              id="h1"
              className="m-0 animate-[rise_.8s_cubic-bezier(.2,.7,.2,1)] text-[32px] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance md:text-[44px] xl:text-[62px]"
            >
              {hero.title}
            </h1>
            {hero.subtitle && <p className="m-0 text-xl leading-normal font-semibold">{hero.subtitle}</p>}
            <div className="flex flex-col flex-wrap gap-2.5 md:flex-row">
              {hero.cta && (
                <ButtonLink href={hero.cta.href} variant="orange" className="transition-[background-color,transform] hover:-translate-y-0.5">
                  {hero.cta.label}
                </ButtonLink>
              )}
              <ButtonLink
                href={waLink(undefined, whatsapp)}
                variant="whatsapp"
                icon={<WhatsAppIcon size={22} />}
                className="pr-6 pl-[18px] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#1EBE5A] hover:brightness-100"
              >
                WhatsApp
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>

      <PowerFinder />

      <ul className="m-0 mt-8 flex list-none flex-wrap items-center justify-around gap-y-2.5 rounded-[24px] bg-white px-3 py-2.5 md:flex-nowrap md:rounded-full">
        {REASSURE.map((r, i) => (
          <li
            key={r.label}
            className={cn(
              "flex min-w-full flex-[1_1_0] items-center justify-start gap-2.5 px-3 py-1.5 md:min-w-0 md:justify-center",
              i > 0 && "md:border-border-2 md:border-l",
            )}
          >
            <span className="bg-tint-orange text-accent flex size-9 shrink-0 items-center justify-center rounded-full">
              <MatIcon d={r.d} size={19} />
            </span>
            <span className="text-[15px] font-bold whitespace-nowrap">{r.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
