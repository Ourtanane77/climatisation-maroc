import { AirflowLines } from "@/components/arfro/AirflowLines";
import { ClipReveal, Parallax, Reveal, SplitHeadline } from "@/components/arfro/motion";
import { ArfroButtonLink, EditorialImage, Eyebrow, Section, resolveArfroImage } from "@/components/arfro/ui";
import { cn } from "@/lib/cn";
import type { ArfroHomeSections } from "@/lib/home/arfro";
import { ArrowIcon } from "./a/icons";

export const MANIFESTO_ID = "manifeste";
export const MANIFESTO_TITLE_ID = "arfro-manifeste-title";

const H2 = "font-arfro m-0 font-extrabold text-balance text-[clamp(34px,5vw,76px)] leading-[1.02] tracking-[-0.032em]";

/**
 * Section 02 · Manifesto (id « manifeste », the hero's scroll cue). Oversized statement on the left,
 * a tall architectural crop of the photo on the right (clip reveal, slow parallax) layered on an
 * ice plane, and the airflow connector drawn from the text to the image. Without a photo the
 * statement takes the full width over a wide airflow line.
 */
export function ArfroManifesto({ data }: { data: NonNullable<ArfroHomeSections["manifesto"]> }) {
  const hasPhoto = resolveArfroImage(data.image) !== null;

  return (
    <Section id={MANIFESTO_ID} labelledBy={MANIFESTO_TITLE_ID} tone="white" className="scroll-mt-20 overflow-hidden">
      <div className={cn("relative grid items-center gap-14 md:gap-16", hasPhoto && "lg:grid-cols-12 lg:gap-8")}>
        <div className={cn("relative z-10", hasPhoto ? "lg:col-span-6" : "max-w-[1100px]")}>
          {data.eyebrow ? <Eyebrow className="mb-6 md:mb-8">{data.eyebrow}</Eyebrow> : null}
          <SplitHeadline as="h2" id={MANIFESTO_TITLE_ID} text={data.title} className={H2} />
          {data.text || data.cta ? (
            <Reveal className="mt-10 flex gap-5 md:mt-14 md:gap-8">
              <span aria-hidden className="bg-arfro-electric mt-[0.9em] h-px w-10 shrink-0 md:w-16" />
              <div>
                {data.text ? (
                  <p className="text-arfro-graphite/80 m-0 max-w-[40ch] text-[19px] leading-[1.6] md:text-[22px] md:leading-[1.55]">{data.text}</p>
                ) : null}
                {data.cta ? (
                  <ArfroButtonLink href={data.cta.href} variant="link" className="mt-8 text-[16px]" icon={<ArrowIcon />}>
                    {data.cta.label}
                  </ArfroButtonLink>
                ) : null}
              </div>
            </Reveal>
          ) : null}
        </div>

        {hasPhoto ? (
          <>
            {/* Airflow connector: from the statement down to the photo (desktop composition only). */}
            <AirflowLines variant="connector" className="absolute top-[42%] left-[38%] hidden h-[52%] w-[26%] lg:block" />
            <div className="relative lg:col-span-5 lg:col-start-8">
              <div aria-hidden className="rounded-arfro-md bg-arfro-ice absolute -right-3 -bottom-3 h-[72%] w-[78%] md:-right-8 md:-bottom-8" />
              <ClipReveal from="bottom" className="rounded-arfro-md bg-arfro-warm relative aspect-[4/5] overflow-hidden">
                <Parallax speed={0.08} className="absolute inset-x-0 -top-[7%] h-[114%]">
                  <EditorialImage
                    image={data.image}
                    alt={data.title}
                    sizes="(min-width: 1024px) 38vw, 100vw"
                    className="absolute inset-0"
                    imgClassName="object-[22%_50%]"
                  />
                </Parallax>
              </ClipReveal>
            </div>
          </>
        ) : (
          <AirflowLines variant="divider" className="h-16 w-full md:h-20" />
        )}
      </div>
    </Section>
  );
}
