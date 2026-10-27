import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Reveal } from "@/components/arfro/motion";
import { ArfroButtonLink, EditorialImage } from "@/components/arfro/ui";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import type { ServiceDetail, ServiceSummary } from "@/lib/content/types";
import type { Phone } from "@/lib/types";
import { ArrowRight, Band, ContactBand, NumberedList, ProHero, SectionHead, indexLabel } from "./parts";

/**
 * Arfro services hub: the service pages published on this site, as numbered editorial rows. With
 * none published, only the ways to reach the team (quote, advice line): no service is described
 * that the site does not offer (docs/arfro-creative-brief.md, « Services (ARFRO Care) »).
 */
export function ArfroServicesHub({
  services,
  advice,
  projects,
  hours,
  whatsappHref,
}: {
  services: ServiceSummary[];
  /** « Conseil » phone of Réglages. */
  advice: Phone;
  /** « Projets et revendeurs » phone of Réglages. */
  projects: Phone;
  hours: string;
  whatsappHref: string;
}) {
  return (
    <>
      <ProHero
        eyebrow="ARFRO · Services"
        title="Votre confort mérite un accompagnement durable."
        lead={
          services.length > 0
            ? "Les services de nos équipes, avant et après l’achat de votre équipement."
            : "Un projet, une question sur un appareil ou une puissance : parlez-en à notre équipe."
        }
        actions={
          <>
            <ArfroButtonLink href="/demander-un-devis" icon={<ArrowRight />}>
              Demander un devis
            </ArfroButtonLink>
            <ArfroButtonLink href={advice.href} variant="outline">
              {advice.label} : {advice.display}
            </ArfroButtonLink>
          </>
        }
      />

      {services.length > 0 && (
        <Band tone="white" labelledBy="services-liste" innerClassName="pt-0 md:pt-0 xl:pt-0">
          <h2 id="services-liste" className="sr-only">
            Nos services
          </h2>
          <Reveal as="ul" stagger className="m-0 list-none p-0">
            {services.map((s, i) => (
              <li key={s.slug} className="border-arfro-line border-t last:border-b">
                <Link
                  href={s.href}
                  className="group text-arfro-graphite hover:text-arfro-graphite grid grid-cols-[48px_minmax(0,1fr)_auto] items-start gap-x-4 py-9 md:grid-cols-[96px_minmax(0,1fr)_auto] md:py-12"
                >
                  <span aria-hidden className="text-arfro-blue pt-2 text-[13px] font-bold tracking-[0.14em] tabular-nums">
                    {indexLabel(i)}
                  </span>
                  <span className="flex flex-col gap-3">
                    <span className="text-arfro-muted text-[13px] font-bold tracking-[0.14em] uppercase">{s.name}</span>
                    <span className="font-arfro text-arfro-navy text-[clamp(24px,2.6vw,38px)] leading-[1.12] font-extrabold tracking-[-0.02em]">{s.h1 ?? s.name}</span>
                    {s.heroText && <span className="text-arfro-muted max-w-[62ch] text-[17px] leading-[1.6]">{s.heroText}</span>}
                  </span>
                  <ArrowRight size={26} className="text-arfro-blue mt-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </Reveal>
        </Band>
      )}

      <ContactBand phone={projects} hours={hours} whatsappHref={whatsappHref} />
    </>
  );
}

/** Arfro service page (installation, visite technique…): same API data, editorial layout. */
export function ArfroServicePage({ service, h1, phone, whatsappHref }: { service: ServiceDetail; h1: string; phone: Phone; whatsappHref: string }) {
  return (
    <>
      <ProHero
        eyebrow={`Service · ${service.name}`}
        title={h1}
        lead={service.heroText ?? undefined}
        actions={
          <>
            <ArfroButtonLink href="/demander-un-devis" icon={<ArrowRight />}>
              Demander un devis
            </ArfroButtonLink>
            <ArfroButtonLink href={whatsappHref} variant="outline">
              Écrire sur WhatsApp
            </ArfroButtonLink>
          </>
        }
        aside={
          service.image ? (
            <EditorialImage image={{ src: service.image }} alt="" priority sizes="(min-width: 1100px) 40vw, 100vw" className="rounded-arfro-md bg-arfro-ice aspect-[4/3] w-full" />
          ) : undefined
        }
      />

      {service.included.length > 0 && (
        <Band tone="warm" labelledBy="inclus">
          <SectionHead id="inclus" eyebrow={service.name} title="Ce qui est inclus." />
          <div className="mt-10 md:mt-14">
            <NumberedList items={service.included} columns={2} />
          </div>
        </Band>
      )}

      {service.steps.length > 0 && (
        <Band tone="white" labelledBy="deroulement">
          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] xl:gap-20">
            <SectionHead id="deroulement" eyebrow="Déroulement" title="Comment ça se passe." className="xl:sticky xl:top-28 xl:self-start" />
            <NumberedList items={service.steps} />
          </div>
        </Band>
      )}

      {service.prices.length > 0 && (
        <Band tone="ice" labelledBy="tarifs">
          <SectionHead id="tarifs" eyebrow={service.name} title="Tarifs." />
          <dl className="m-0 mt-10 grid grid-cols-1 gap-x-12 md:mt-14 md:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {service.prices.map((p) => (
              <div key={p.label} className="border-arfro-line flex flex-col gap-2 border-t py-7">
                <dt className="text-arfro-muted text-base">{p.label}</dt>
                <dd className="font-arfro text-arfro-navy m-0 text-[clamp(30px,3.4vw,48px)] leading-[1.05] font-extrabold tracking-[-0.025em]">{p.value}</dd>
              </div>
            ))}
          </dl>
        </Band>
      )}

      {service.showSupplies && service.products.length > 0 && (
        <Band tone="white" labelledBy="materiel">
          <SectionHead id="materiel" eyebrow="Fournitures" title="Matériel d’installation." />
          <div className="mt-10 grid grid-cols-2 gap-4 md:mt-14 md:grid-cols-3 xl:grid-cols-4">
            {service.products.map((p) => (
              <ProductCard key={p.href} product={p} action="add" />
            ))}
          </div>
        </Band>
      )}

      {service.faq.length > 0 && (
        <Band tone="white" labelledBy="faq">
          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] xl:gap-20">
            <SectionHead id="faq" eyebrow="Questions fréquentes" title="Vos questions." />
            <FaqAccordion items={service.faq} />
          </div>
        </Band>
      )}

      <ContactBand phone={phone} hours={service.contact.hours} whatsappHref={whatsappHref} />
    </>
  );
}
