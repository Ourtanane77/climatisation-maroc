import { ArfroButtonLink, Section } from "@/components/arfro/ui";
import type { ArfroHomeSections } from "@/lib/home/arfro";
import { ArrowGlyph } from "./b/icons";
import { ProductTabs } from "./b/ProductTabs";
import { SectionHeader } from "./b/SectionHeader";

/**
 * 05 « Des équipements sélectionnés pour votre confort. » (owner's brief §5): the collections
 * (Climatisation, Chauffe-eau, Ventilation, Solutions professionnelles) as tabs of premium cards,
 * real catalogue data only. Empty collections are left out; nothing to show → no section.
 */
export function ArfroProducts({ data }: { data: NonNullable<ArfroHomeSections["products"]> }) {
  const collections = data.collections.filter((c) => c.products.length > 0);
  if (collections.length === 0) return null;
  return (
    <Section tone="white" id="produits" labelledBy="arfro-products-title">
      <SectionHeader
        id="arfro-products-title"
        eyebrow={data.eyebrow}
        title={data.title}
        text={data.text}
        action={
          data.cta ? (
            <ArfroButtonLink href={data.cta.href} variant="outline" icon={<ArrowGlyph />}>
              {data.cta.label}
            </ArfroButtonLink>
          ) : undefined
        }
      />
      <ProductTabs collections={collections} idBase="arfro-products" />
    </Section>
  );
}
