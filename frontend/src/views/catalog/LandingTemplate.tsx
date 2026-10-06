import { ProductCard } from "@/components/catalog/ProductCard";
import { AdviceCta, BrandTiles, GuideCards, PageIntro, PowerChips, Section, TypeTiles } from "@/components/catalog/Sections";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { withBrandBadge } from "@/lib/catalog/cards";
import type { CategoryData } from "@/lib/catalog/types";
import { getNavigation } from "@/lib/navigation";
import { waLink } from "@/lib/whatsapp";

/**
 * Range landing page (design: Climatisation.dc.html): intro, type tiles, power chips, popular
 * products, brands, related guides, FAQ and the advice band. Blocks without data are skipped.
 */
export default async function LandingTemplate({ category }: { category: CategoryData }) {
  const nav = await getNavigation();
  const unit = category.shortName ?? category.name;
  const lower = unit.toLowerCase();

  return (
    <>
      <Breadcrumb items={category.breadcrumb} />
      <PageIntro title={category.h1} intro={category.intro} />

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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {category.popular.map((p) => (
              <ProductCard key={p.href} product={withBrandBadge(p)} />
            ))}
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
        <Section id="faq" title="Questions fréquentes">
          <FaqAccordion items={category.faq} />
        </Section>
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
