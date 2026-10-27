import { ArfroCategoryHeader } from "@/components/arfro/listing/ArfroCategoryHeader";
import { ArfroProductCard } from "@/components/arfro/product/ArfroProductCard";
import { ProductCard } from "@/components/catalog/ProductCard";
import { AdviceCta, BrandTiles, GuideCards, PageIntro, PowerChips, Section, TypeTiles } from "@/components/catalog/Sections";
import { FaqDetails } from "@/components/product/FaqDetails";
import { ProjectCtaBand } from "@/components/content/blocks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { withBrandBadge } from "@/lib/catalog/cards";
import type { CategoryData } from "@/lib/catalog/types";
import { PROJECTS_PHONE_LABEL } from "@/lib/content/copy";
import { getNavigation } from "@/lib/navigation";
import { SITE_KEY } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

/**
 * Range landing page (design: Climatisation.dc.html): intro, type tiles, power chips, popular
 * products, brands, related guides, FAQ and the advice band. Blocks without data are skipped.
 */
export default async function LandingTemplate({ category }: { category: CategoryData }) {
  const nav = await getNavigation();
  const unit = category.shortName ?? category.name;
  const lower = unit.toLowerCase();
  const arfro = SITE_KEY === "arfro";

  return (
    <>
      <Breadcrumb items={category.breadcrumb} />
      {arfro ? (
        // Arfro: editorial header (Soft Ice band, airflow motif, the range's own photo).
        <ArfroCategoryHeader title={category.h1} intro={category.intro} breadcrumb={category.breadcrumb} href={category.href} />
      ) : (
        <PageIntro title={category.h1} intro={category.intro} />
      )}

      {category.children.length > 0 && (
        <Section id="types" title={category.path === "climatisation" ? "Choisir un type de climatiseur" : `Choisir un type de ${lower}`}>
          <TypeTiles tiles={category.children} />
        </Section>
      )}

      {category.powers.length > 0 && (
        <Section id="puissance" title="Climatiseurs par puissance">
          <PowerChips powers={category.powers} />
        </Section>
      )}

      {category.popular.length > 0 && (
        <Section id="populaires" title="Les plus demandés">
          <div className={arfro ? "grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-4" : "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"}>
            {category.popular.map((p) =>
              arfro ? (
                <ArfroProductCard key={p.href} product={p} sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 92vw" />
              ) : (
                <ProductCard key={p.href} product={withBrandBadge(p)} />
              ),
            )}
          </div>
        </Section>
      )}

      {category.brands.length > 0 && (
        <Section id="marques" title={`Marques de ${lower}`}>
          <BrandTiles brands={category.brands} />
        </Section>
      )}

      {category.guides.length > 0 && (
        <Section id="guides" title="Guides associés">
          <GuideCards guides={category.guides} />
        </Section>
      )}

      {category.faq.length > 0 && (
        <Section id="faq" title="Questions fréquentes" className={arfro ? "max-w-[900px]" : undefined}>
          {arfro ? <FaqDetails items={category.faq} /> : <FaqAccordion items={category.faq} />}
        </Section>
      )}

      {category.isQuoteOnly && (
        // Quote-only range (Froid et chambres froides): projects are quoted, not sold online. The
        // "Parlons de votre projet" band is the design's pro CTA (Solutions, secteurs, services).
        <section className="pt-10 md:pt-14">
          <ProjectCtaBand phone={nav.footer.phones.find((p) => p.label === PROJECTS_PHONE_LABEL)?.display ?? nav.salesPhone.display} />
        </section>
      )}

      {category.powers.length > 0 ? (
        <AdviceCta
          title="Besoin d'un conseil sur la puissance ?"
          text={`Ventes et conseil : ${nav.salesPhone.display}, du lundi au samedi de 9h à 19h.`}
          whatsappHref={waLink(undefined, nav.whatsapp.number)}
        />
      ) : (
        <div className="pb-4" />
      )}
    </>
  );
}
