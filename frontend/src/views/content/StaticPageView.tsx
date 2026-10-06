import type { Metadata } from "next";
import Link from "next/link";
import { AboutHero, BrandLogos, StoreCards } from "@/components/content/AboutSections";
import { CtaBand, PageTitle, Section, SectionTitle } from "@/components/content/blocks";
import { LegalArticles } from "@/components/content/LegalArticles";
import { PageBlocks } from "@/components/content/PageBlocks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { getPage } from "@/lib/content/api";
import { PROJECTS_PHONE_LABEL, SALES_PHONE_LABEL, phoneFor } from "@/lib/content/copy";
import type { PageDetail } from "@/lib/content/types";
import type { Resolved } from "@/lib/types";

type PageResolved = Extract<Resolved, { type: "page" }>;

/**
 * Static pages: À propos (A propos.dc.html), Livraison et paiement (Livraison et paiement.dc.html),
 * legal pages (CGV.dc.html template) and any other published page (title, intro, blocks).
 */
export async function staticPageMetadata(resolved: PageResolved): Promise<Metadata> {
  const page = await getPage(resolved.slug);
  return {
    title: page.seo.title ?? page.title,
    description: page.seo.description ?? page.intro ?? undefined,
    alternates: { canonical: page.href },
    robots: page.seo.noindex ? { index: false } : undefined,
  };
}

export default async function StaticPageView({ resolved }: { resolved: PageResolved }) {
  const page = await getPage(resolved.slug);
  const h1 = page.seo.h1 ?? page.title;
  const crumbs = [{ label: "Accueil", href: "/" }, { label: page.title }];

  switch (page.kind) {
    case "about":
      return (
        <>
          <Breadcrumb items={crumbs} />
          <AboutHero h1={h1} intro={page.intro} />
          <PageBlocks blocks={page.body} />
          <BrandLogos brands={page.brands ?? []} />
          <StoreCards stores={page.contact.stores} hours={page.contact.hours} />
          <Faq page={page} />
          <Section>
            <CtaBand
              variant="light"
              title="Parlons de votre projet"
              text={`Ventes : ${phoneFor(page.contact, SALES_PHONE_LABEL)} · Projets et revendeurs : ${phoneFor(page.contact, PROJECTS_PHONE_LABEL)}`}
            >
              <ButtonLink href="/contact" variant="outline" mobileFull>
                Nous contacter
              </ButtonLink>
              <ButtonLink href="/demander-un-devis" variant="orange" mobileFull>
                Demander un devis
              </ButtonLink>
            </CtaBand>
          </Section>
        </>
      );

    case "legal":
      return (
        <>
          <Breadcrumb items={crumbs} />
          <div className="flex max-w-[900px] flex-col gap-3 pt-6">
            <PageTitle>{h1}</PageTitle>
            {page.updatedLabel && <p className="text-muted m-0 text-[15px]">Dernière mise à jour : {page.updatedLabel}</p>}
          </div>
          <LegalArticles
            intro={page.intro}
            articles={page.body.filter((b) => b.type === "article").map((b) => ({ title: String(b.data.title ?? ""), text: String(b.data.text ?? "") }))}
          >
            {!!page.legalPages?.length && (
              <div className="border-step-line mt-10 border-t pt-6">
                <p className="m-0 mb-3 text-base font-bold">Autres pages légales</p>
                <div className="flex flex-wrap gap-2">
                  {page.legalPages.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="border-border text-ink hover:border-ink hover:text-ink flex min-h-11 items-center rounded-full border-[1.5px] bg-white px-[18px] text-[15px] font-bold"
                    >
                      {l.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </LegalArticles>
        </>
      );

    default:
      // Livraison et paiement, and any other page: title, lead, blocks, FAQ.
      return (
        <>
          <Breadcrumb items={crumbs} />
          <div className="flex max-w-[820px] flex-col gap-3 pt-6">
            <PageTitle>{h1}</PageTitle>
            {page.intro && <p className="text-ink-2 m-0 text-[19px] leading-[1.55] text-pretty">{page.intro}</p>}
          </div>
          <PageBlocks blocks={page.body} />
          <Faq page={page}>
            {page.kind === "delivery" && (
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <span className="text-[17px]">Vous avez déjà commandé ?</span>
                <ButtonLink href="/suivi-commande" variant="blue">
                  Suivre ma commande
                </ButtonLink>
              </div>
            )}
          </Faq>
        </>
      );
  }
}

function Faq({ page, children }: { page: PageDetail; children?: React.ReactNode }) {
  if (!page.faq.length) return null;
  return (
    <Section>
      <SectionTitle>Questions fréquentes</SectionTitle>
      <FaqAccordion items={page.faq} />
      {children}
    </Section>
  );
}
