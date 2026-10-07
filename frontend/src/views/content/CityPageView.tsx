import type { Metadata } from "next";
import Link from "next/link";
import { CategoryVisual } from "@/components/catalog/CategoryVisual";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CtaBand, GRID_4, PageTitle, Section, SectionTitle } from "@/components/content/blocks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { getCityPage } from "@/lib/content/api";
import { SALES_PHONE_LABEL, phoneFor } from "@/lib/content/copy";
import type { Resolved } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import { seoMetadata } from "@/lib/seo/metadata";

type CityResolved = Extract<Resolved, { type: "city" }>;

/**
 * City landing page (/climatisation-<ville>). Not drawn: it reuses the Gamme (Climatisation.dc.html)
 * blocks — type tiles, "Les plus demandés", FAQ and the advice band — around the page's own text.
 * City pages stay unpublished until their copy is written, so this only renders published ones.
 */
export async function cityPageMetadata(resolved: CityResolved): Promise<Metadata> {
  const page = await getCityPage(resolved.slug);
  return seoMetadata({
    title: page.seo.title ?? `Climatisation ${page.city}`,
    description: page.seo.description ?? page.intro,
    path: page.href,
    noindex: page.seo.noindex,
  });
}

export default async function CityPageView({ resolved }: { resolved: CityResolved }) {
  const page = await getCityPage(resolved.slug);
  const h1 = page.seo.h1 ?? `Climatisation ${page.city}`;
  const sales = phoneFor(page.contact, SALES_PHONE_LABEL);
  const paragraphs = (page.body ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Climatisation", href: "/climatisation" }, { label: h1 }]} />
      <div className="flex max-w-[860px] flex-col gap-4 pt-6">
        <PageTitle>{h1}</PageTitle>
        {page.intro && <p className="text-ink-2 m-0 text-lg leading-[1.6]">{page.intro}</p>}
      </div>

      {page.types.length > 0 && (
        <Section id="types">
          <SectionTitle className="mb-8">Choisir un type de climatiseur</SectionTitle>
          <div className={GRID_4}>
            {page.types.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-24 text-ink hover:text-ink flex min-h-[260px] flex-col gap-1.5 p-6 transition-transform duration-300 hover:-translate-y-1 md:min-h-[340px]"
                style={{ background: t.bg ?? "#E8EFF8" }}
              >
                <span className="text-[26px] font-bold">{t.name}</span>
                {t.text && <span className="text-ink-2 max-w-[80%] text-[15px]">{t.text}</span>}
                <span aria-hidden className="mt-auto flex h-[150px] items-end justify-center md:h-[180px]">
                  <CategoryVisual
                    href={t.href}
                    image={t.image}
                    art={t.art}
                    sizes="(min-width: 1100px) 300px, (min-width: 760px) 45vw, 90vw"
                    className="h-auto max-h-full w-auto max-w-full object-contain"
                    artClassName="flex w-[80%] justify-center"
                  />
                </span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {page.products.length > 0 && (
        <Section id="populaires">
          <SectionTitle className="mb-8">Les plus demandés</SectionTitle>
          <div className={GRID_4}>
            {page.products.map((p) => (
              <ProductCard key={p.href} product={p} />
            ))}
          </div>
        </Section>
      )}

      {paragraphs.length > 0 && (
        <Section className="flex max-w-[860px] flex-col gap-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-ink-2 m-0 text-lg leading-[1.65]">
              {p}
            </p>
          ))}
        </Section>
      )}

      {page.faq.length > 0 && (
        <Section id="faq">
          <SectionTitle className="mb-8">Questions fréquentes</SectionTitle>
          <FaqAccordion items={page.faq} />
        </Section>
      )}

      <Section>
        <CtaBand variant="light" title="Besoin d'un conseil sur la puissance ?" text={`Ventes et conseil : ${sales}, du lundi au samedi de 9h à 19h.`}>
          <ButtonLink href="/demander-un-devis" variant="orange" mobileFull>
            Demander un devis
          </ButtonLink>
          <ButtonLink href={waLink(undefined, page.contact.whatsapp)} variant="whatsapp" mobileFull>
            Commander par WhatsApp
          </ButtonLink>
        </CtaBand>
      </Section>
    </>
  );
}
