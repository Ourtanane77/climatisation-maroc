import type { Metadata } from "next";
import { GRID_4, ProjectCtaBand, Section, SectionTitle, StepList } from "@/components/content/blocks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { IncludedGrid, PriceBand, ServiceHero } from "@/components/service/ServiceSections";
import { SupplyCard } from "@/components/service/SupplyCard";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { getService } from "@/lib/content/api";
import { PROJECTS_PHONE_LABEL, phoneFor } from "@/lib/content/copy";
import { waLink } from "@/lib/whatsapp";

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  return {
    title: service.seo.title ?? service.name,
    description: service.seo.description ?? service.heroText ?? undefined,
    alternates: { canonical: service.href },
    robots: service.seo.noindex ? { index: false } : undefined,
  };
}

/** Service page: installation, visite technique, service après-vente (design: Service.dc.html). */
export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = await getService(slug);
  const h1 = service.seo.h1 ?? service.name;

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Services", href: "/services" }, { label: service.name }]} />
      <ServiceHero name={service.name} h1={h1} text={service.heroText} whatsappHref={waLink(service.whatsappText ?? undefined, service.contact.whatsapp)} />

      {service.included.length > 0 && (
        <Section>
          <SectionTitle>Ce qui est inclus</SectionTitle>
          <IncludedGrid items={service.included} />
        </Section>
      )}

      {service.steps.length > 0 && (
        <Section>
          <SectionTitle>Comment ça se passe</SectionTitle>
          <StepList items={service.steps} />
        </Section>
      )}

      {service.prices.length > 0 && (
        <Section>
          <PriceBand prices={service.prices} />
        </Section>
      )}

      {service.showSupplies && service.products.length > 0 && (
        <Section>
          <SectionTitle>Matériel d&apos;installation</SectionTitle>
          <div className={GRID_4}>
            {service.products.map((p) => (
              <SupplyCard key={p.href} product={p} />
            ))}
          </div>
        </Section>
      )}

      {service.faq.length > 0 && (
        <Section>
          <SectionTitle>Questions fréquentes</SectionTitle>
          <FaqAccordion items={service.faq} />
        </Section>
      )}

      <Section>
        <ProjectCtaBand phone={phoneFor(service.contact, PROJECTS_PHONE_LABEL)} />
      </Section>
    </>
  );
}
