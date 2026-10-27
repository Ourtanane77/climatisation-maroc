import { Reveal } from "@/components/arfro/motion";
import { ClimateAdvisor } from "@/components/arfro/advisor/ClimateAdvisor";
import { DisplayHeading, Eyebrow, Lead, Section } from "@/components/arfro/ui";
import { getAdvisorCatalog, getAdvisorCities } from "@/lib/advisor/server";
import type { ArfroHomeSections } from "@/lib/home/arfro";

/**
 * 07 « Le bon climatiseur. Pour le bon espace. » (brief §7): the climate advisor. Heading from the
 * back office (`data`), the consultation in components/arfro/advisor, its rules in lib/advisor.
 * Real products and cities come from the API of the current site (cached listings); on an API
 * error the advisor still gives its estimate, without product cards.
 */
export async function ArfroAdvisor({ data }: { data: NonNullable<ArfroHomeSections["advisor"]> }) {
  const [catalog, cities] = await Promise.all([getAdvisorCatalog(), getAdvisorCities()]);

  return (
    <Section tone="ice" id="conseiller" labelledBy="arfro-advisor-title">
      <Reveal stagger className="max-w-[820px]">
        {data.eyebrow && <Eyebrow>{data.eyebrow}</Eyebrow>}
        <DisplayHeading id="arfro-advisor-title" size="m" className={data.eyebrow ? "mt-5" : undefined}>
          {data.title}
        </DisplayHeading>
        {data.text && <Lead className="mt-6">{data.text}</Lead>}
      </Reveal>
      <div className="mt-10 md:mt-14">
        <ClimateAdvisor cities={cities} catalog={catalog} />
      </div>
    </Section>
  );
}
