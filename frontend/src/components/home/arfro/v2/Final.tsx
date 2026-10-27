import { AirflowLines } from "@/components/arfro/AirflowLines";
import { Parallax, Reveal, SplitHeadline } from "@/components/arfro/motion";
import { ArfroButtonLink, EditorialImage, Lead, resolveArfroImage } from "@/components/arfro/ui";
import { cn } from "@/lib/cn";
import type { ArfroHomeSections } from "@/lib/home/arfro";
import { ArrowGlyph } from "./b/icons";

/**
 * 13 « Le confort commence ici. » (brief §13): the closing statement. Full-bleed atmospheric photo
 * under a navy veil when the slot is filled; otherwise deep navy crossed by the airflow signature.
 * Oversized headline whose words rise in, the line, and the two CTAs.
 */
export function ArfroFinal({ data }: { data: NonNullable<ArfroHomeSections["final"]> }) {
  const hasPhoto = resolveArfroImage(data.image) != null;
  return (
    <section
      id="commencer"
      aria-labelledby="arfro-final-title"
      data-tone="navy"
      className={cn(
        "arfro-section bg-arfro-navy relative isolate flex items-end overflow-hidden border-b border-white/10 text-white",
        // The tall atmospheric band only with a photo; without one the statement keeps the section rhythm.
        hasPhoto && "min-h-[78svh] md:min-h-[86svh]",
      )}
    >
      {hasPhoto ? (
        <>
          <Parallax speed={0.1} className="absolute -inset-y-[10%] inset-x-0 -z-20">
            <EditorialImage image={data.image} alt="" sizes="100vw" className="size-full" />
          </Parallax>
          {/* Veil for legibility: navy rising from the bottom where the text sits. */}
          <div aria-hidden className="from-arfro-navy via-arfro-navy/70 to-arfro-navy/10 absolute inset-0 -z-10 bg-gradient-to-t" />
        </>
      ) : (
        <AirflowLines variant="hero" className="absolute inset-x-0 top-[8%] -z-10 h-[70%] w-full" />
      )}
      <div className={cn("site-gutter relative w-full pb-16 md:pb-24 xl:pb-32", hasPhoto ? "pt-32" : "pt-16 md:pt-24 xl:pt-32")}>
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            {data.eyebrow && <p className="text-arfro-sky m-0 mb-6 text-[12px] font-bold tracking-[0.18em] uppercase md:text-[13px]">{data.eyebrow}</p>}
            <SplitHeadline
              id="arfro-final-title"
              text={data.title}
              className={cn(
                "font-arfro m-0 max-w-[14ch] font-extrabold text-balance",
                "text-[clamp(44px,8vw,128px)] leading-[0.96] tracking-[-0.04em]",
              )}
            />
          </div>
          <Reveal stagger className="flex flex-col items-start gap-8 lg:col-span-4 lg:pb-3">
            {data.text && <Lead onDark>{data.text}</Lead>}
            {(data.cta || data.secondary) && (
              <div className="flex flex-wrap gap-4">
                {data.cta && (
                  <ArfroButtonLink href={data.cta.href} variant="light" icon={<ArrowGlyph />}>
                    {data.cta.label}
                  </ArfroButtonLink>
                )}
                {data.secondary && (
                  <ArfroButtonLink href={data.secondary.href} variant="outline-light">
                    {data.secondary.label}
                  </ArfroButtonLink>
                )}
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
