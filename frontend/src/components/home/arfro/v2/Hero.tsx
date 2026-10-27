import { AirflowLines } from "@/components/arfro/AirflowLines";
import { Parallax, ScrollIndicator, SplitHeadline } from "@/components/arfro/motion";
import { ArfroButtonLink, EditorialImage, Eyebrow, Lead, resolveArfroImage } from "@/components/arfro/ui";
import { cn } from "@/lib/cn";
import type { ArfroHomeSections } from "@/lib/home/arfro";
import { HeroSettle } from "./a/HeroSettle";
import { ArrowIcon } from "./a/icons";

export const HERO_TITLE_ID = "arfro-hero-title";

/** Oversized hero headline (bigger than DisplayHeading « xl »). */
const H1 = "font-arfro m-0 font-extrabold text-balance text-[clamp(44px,7.2vw,112px)] leading-[0.95] tracking-[-0.04em]";

/**
 * Section 01 · Cinematic hero (docs/arfro-creative-brief.md). Desktop: the photo fills the band and
 * the headline sits on the calm part of the room (warm scrim on the left only, so any back-office
 * photo stays readable). Phones: another composition, photo on top (cropped on the unit and the
 * room) and the text below on Warm Neutral, never over the image. Airflow lines cross the room
 * (cool air inside, the heat stays outside). Without a photo: a navy typographic hero with the
 * airflow drawn larger. The h1 is plain server HTML (LCP), the photo loads with priority. The
 * transparent header overlaps the band (ArfroHeader.module.css): on desktop the photo and the text
 * column start below it (`--arfro-header-h`, CSS only, so no layout shift), the text top-aligned so a
 * font swap that re-wraps the headline never moves it; on phones the photo runs under the header.
 */
export function ArfroHeroV2({ data }: { data: NonNullable<ArfroHomeSections["hero"]> }) {
  const photo = resolveArfroImage(data.image);
  const onPhoto = photo !== null;

  return (
    <section
      aria-labelledby={HERO_TITLE_ID}
      data-tone={onPhoto ? "warm" : "navy"}
      className={cn(
        "arfro-section relative isolate overflow-hidden",
        onPhoto
          ? "bg-arfro-warm text-arfro-graphite md:flex md:min-h-[min(92svh,920px)] md:items-start"
          : "bg-arfro-navy flex min-h-[min(88svh,860px)] items-center text-white",
      )}
    >
      {onPhoto ? (
        <div className="relative h-[58svh] min-h-[360px] overflow-hidden md:absolute md:inset-x-0 md:top-(--arfro-header-h) md:bottom-0 md:h-auto md:min-h-0">
          <Parallax speed={0.18} className="absolute inset-x-0 -top-[8%] h-[116%]">
            <HeroSettle className="absolute inset-0">
              <EditorialImage
                image={data.image}
                alt={data.title}
                priority
                sizes="100vw"
                className="absolute inset-0"
                imgClassName="object-[72%_50%] md:object-[68%_50%]"
              />
            </HeroSettle>
          </Parallax>
          {/* Desktop: the photo starts below the header row (the unit never sits behind the menu); its top edge melts into the band. */}
          <div aria-hidden className="from-arfro-warm absolute inset-x-0 top-0 hidden h-28 bg-linear-to-b to-transparent md:block" />
          {/* Desktop: warm scrim on the text side only. */}
          <div aria-hidden className="from-arfro-warm/90 via-arfro-warm/55 absolute inset-y-0 left-0 hidden w-[68%] bg-linear-to-r to-transparent md:block" />
          {/* Phones: the photo melts into the text panel below. */}
          <div aria-hidden className="from-arfro-warm absolute inset-x-0 bottom-0 h-20 bg-linear-to-t to-transparent md:hidden" />
          <AirflowLines variant="hero" className="absolute inset-x-0 top-[14%] h-[44%] w-full opacity-90 md:top-[18%] md:h-[40%]" />
        </div>
      ) : (
        <>
          <AirflowLines variant="hero" className="absolute inset-x-0 top-1/2 h-[70%] w-full -translate-y-1/2 opacity-100" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
        </>
      )}

      <div
        className={cn(
          "site-gutter relative w-full",
          onPhoto
            ? "pt-4 pb-14 md:pt-[calc(var(--arfro-header-h)+64px)] md:pb-28"
            : "pt-[calc(var(--arfro-header-h)+48px)] pb-24 md:pt-[calc(var(--arfro-header-h)+80px)] md:pb-32",
        )}
      >
        <div className={cn(onPhoto ? "max-w-[min(640px,52vw)] max-md:max-w-none" : "max-w-[980px]")}>
          {data.eyebrow ? (
            <Eyebrow onDark={!onPhoto} className="mb-6 md:mb-8">
              {data.eyebrow}
            </Eyebrow>
          ) : null}
          <SplitHeadline as="h1" id={HERO_TITLE_ID} text={data.title} className={H1} />
          {data.text ? (
            <Lead onDark={!onPhoto} className={cn("mt-6 md:mt-8", onPhoto && "text-arfro-graphite/85 max-w-[44ch]")}>
              {data.text}
            </Lead>
          ) : null}
          {data.cta || data.secondary ? (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap md:mt-11">
              {data.cta ? (
                <ArfroButtonLink href={data.cta.href} variant={onPhoto ? "primary" : "light"} icon={<ArrowIcon />}>
                  {data.cta.label}
                </ArfroButtonLink>
              ) : null}
              {data.secondary ? (
                <ArfroButtonLink href={data.secondary.href} variant={onPhoto ? "outline" : "outline-light"}>
                  {data.secondary.label}
                </ArfroButtonLink>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom left, under the text column: on the photo it sits on the warm scrim (readable on any
          image, no pill over the room); on the navy hero it is white. */}
      <div className="site-gutter pointer-events-none absolute inset-x-0 bottom-8 hidden md:flex xl:bottom-10">
        <div className="pointer-events-auto">
          <ScrollIndicator href="#manifeste" onDark={!onPhoto} />
        </div>
      </div>
    </section>
  );
}
