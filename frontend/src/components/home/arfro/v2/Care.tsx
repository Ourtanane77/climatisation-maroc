import { ClipReveal, Reveal } from "@/components/arfro/motion";
import { ArfroButtonLink, DisplayHeading, EditorialImage, Eyebrow, Lead, Section, resolveArfroImage } from "@/components/arfro/ui";
import type { ArfroHomeFacts, ArfroHomeSections } from "@/lib/home/arfro";
import { ArrowGlyph } from "./b/icons";
import { SectionHeader } from "./b/SectionHeader";
import { ServiceList } from "./b/ServiceList";

/**
 * 06 ARFRO Care « Votre confort mérite un accompagnement durable. » (brief §6): only the services
 * the site really offers (installation on quote, technical visit, advice by phone/WhatsApp). With
 * the technician photo: photo on the left, editorial panel and stacked pillars on the right.
 * Without it: typographic spread, pillars in columns. Warm tone (lifestyle).
 */
export function ArfroCare({ data, facts }: { data: NonNullable<ArfroHomeSections["care"]>; facts?: ArfroHomeFacts }) {
  const hasPhoto = resolveArfroImage(data.image) != null;
  const cta = data.cta ? (
    <ArfroButtonLink href={data.cta.href} variant="primary" icon={<ArrowGlyph />}>
      {data.cta.label}
    </ArfroButtonLink>
  ) : undefined;

  if (!hasPhoto) {
    return (
      <Section tone="warm" id="services" labelledBy="arfro-care-title">
        <SectionHeader id="arfro-care-title" eyebrow={data.eyebrow} title={data.title} text={data.text} action={cta} />
        {data.items.length > 0 && <ServiceList items={data.items} facts={facts} className="mt-16 md:mt-24" />}
      </Section>
    );
  }

  return (
    <Section tone="warm" id="services" labelledBy="arfro-care-title">
      <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12 lg:items-start">
        <ClipReveal from="left" className="lg:sticky lg:top-28 lg:col-span-6">
          <EditorialImage image={data.image} alt="" sizes="(max-width: 1023px) 100vw, 50vw" className="rounded-arfro-md aspect-[4/5] w-full" />
        </ClipReveal>
        <div className="lg:col-span-6 lg:pt-6">
          <Reveal stagger>
            {data.eyebrow && <Eyebrow>{data.eyebrow}</Eyebrow>}
            <DisplayHeading id="arfro-care-title" size="m" className={data.eyebrow ? "mt-5" : undefined}>
              {data.title}
            </DisplayHeading>
            {data.text && <Lead className="mt-6">{data.text}</Lead>}
          </Reveal>
          {data.items.length > 0 && <ServiceList items={data.items} facts={facts} layout="rows" className="mt-10" />}
          {cta && <div className="mt-10">{cta}</div>}
        </div>
      </div>
    </Section>
  );
}
