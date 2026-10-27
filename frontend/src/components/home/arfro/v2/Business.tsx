import { AirflowLines } from "@/components/arfro/AirflowLines";
import { ClipReveal, Parallax, Reveal } from "@/components/arfro/motion";
import { ArfroButtonLink, DisplayHeading, EditorialImage, Eyebrow, Lead, resolveArfroImage } from "@/components/arfro/ui";
import { cn } from "@/lib/cn";
import type { ArfroHomeSections } from "@/lib/home/arfro";
import { ArrowGlyph } from "./b/icons";

/**
 * 09 ARFRO Business « La performance climatique au service de vos projets. » (brief §9): a dark
 * engineering-partner spread. Left: eyebrow, headline, the numbered scope of the offer as a
 * technical index, CTAs « Parler à un expert » / « Demander un devis ». Right: the architectural
 * photo bleeding to the screen edge (none → the index takes the full width over the airflow lines).
 */
export function ArfroBusiness({ data }: { data: NonNullable<ArfroHomeSections["business"]> }) {
  const hasPhoto = resolveArfroImage(data.image) != null;
  return (
    <section id="professionnels" aria-labelledby="arfro-business-title" data-tone="navy" className="arfro-section bg-arfro-navy relative overflow-hidden text-white">
      <AirflowLines variant="dark" className="absolute inset-x-0 bottom-0 h-[55%] w-full opacity-60" />
      <div className={cn("relative grid", hasPhoto && "lg:grid-cols-2")}>
        <div className={cn("site-gutter py-16 md:py-24 xl:py-32", hasPhoto && "lg:pr-16! lg:pl-[max(var(--site-gutter),calc((100cqw-var(--site-max))/2))]! xl:pr-24!")}>
          <Reveal stagger className={cn(!hasPhoto && "grid gap-x-12 gap-y-6 lg:grid-cols-12 lg:items-end")}>
            <div className={cn(!hasPhoto && "lg:col-span-7")}>
              {data.eyebrow && <Eyebrow onDark>{data.eyebrow}</Eyebrow>}
              <DisplayHeading id="arfro-business-title" size={hasPhoto ? "m" : "l"} className={cn(data.eyebrow && "mt-5", "max-w-[18ch]")}>
                {data.title}
              </DisplayHeading>
            </div>
            {data.text && (
              <Lead onDark className={cn(hasPhoto ? "mt-6" : "lg:col-span-5")}>
                {data.text}
              </Lead>
            )}
          </Reveal>

          {data.items.length > 0 && (
            <Reveal as="ol" stagger className={cn("m-0 mt-12 grid list-none p-0 md:mt-16", !hasPhoto && "md:grid-cols-2 md:gap-x-12 xl:grid-cols-3")}>
              {data.items.map((item, i) => (
                <li key={item.title} className="border-arfro-line-dark grid grid-cols-[3rem_1fr] items-baseline gap-x-4 border-t py-5 md:py-6">
                  <span className="text-arfro-sky text-[12px] font-bold tracking-[0.14em] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-arfro m-0 text-[19px] leading-[1.3] font-bold tracking-[-0.01em] md:text-[21px]">{item.title}</h3>
                    {item.text && <p className="text-arfro-on-navy m-0 mt-2 text-[15px] leading-[1.6]">{item.text}</p>}
                  </div>
                </li>
              ))}
            </Reveal>
          )}

          {(data.cta || data.secondary) && (
            <div className="mt-12 flex flex-wrap gap-4">
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
        </div>

        {hasPhoto && (
          <ClipReveal from="right" className="relative min-h-[360px] overflow-hidden md:min-h-[480px] lg:min-h-full">
            <Parallax speed={0.08} className="absolute -inset-y-[8%] inset-x-0">
              <EditorialImage image={data.image} alt="" sizes="(max-width: 1023px) 100vw, 50vw" className="size-full" />
            </Parallax>
            <div aria-hidden className="from-arfro-navy/40 absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r to-transparent lg:block" />
          </ClipReveal>
        )}
      </div>
    </section>
  );
}
