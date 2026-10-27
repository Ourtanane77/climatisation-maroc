import { AirflowLines } from "@/components/arfro/AirflowLines";
import { Section } from "@/components/arfro/ui";
import type { ArfroHomeFacts, ArfroHomeSections } from "@/lib/home/arfro";
import { SectionHeader } from "./b/SectionHeader";
import { ServiceList } from "./b/ServiceList";

/**
 * 11 « Votre confiance fait notre différence. » (brief §11): the site's real commitments only
 * (delivery, payment on delivery, installation on quote, advisor availability), no ratings or
 * counts. The advisor item links to the real « Conseil » phone and WhatsApp from Réglages.
 */
export function ArfroTrust({ data, facts }: { data: NonNullable<ArfroHomeSections["trust"]>; facts?: ArfroHomeFacts }) {
  if (data.items.length === 0) return null;
  return (
    <Section tone="ice" id="confiance" labelledBy="arfro-trust-title" className="overflow-hidden">
      <AirflowLines variant="divider" className="absolute inset-x-0 top-0 h-16 w-full md:h-20" />
      <SectionHeader id="arfro-trust-title" eyebrow={data.eyebrow} title={data.title} text={data.text} size="m" />
      <ServiceList items={data.items} facts={facts} numbered={false} className="mt-14 md:mt-20" />
    </Section>
  );
}
