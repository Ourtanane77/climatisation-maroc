import { AirflowLines } from "@/components/arfro/AirflowLines";
import { ArfroProductCard } from "@/components/arfro/product/ArfroProductCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ArfroBuyBox } from "@/components/product/ArfroBuyBox";
import { ArfroHighlights, ArfroKeyFacts, ArfroSpecs, SectionTabs } from "@/components/product/ArfroSections";
import { FaqDetails } from "@/components/product/FaqDetails";
import { ProductProvider } from "@/components/product/ProductContext";
import { StickyAddBar } from "@/components/product/StickyAddBar";
import { cn } from "@/lib/cn";
import type { ProductPageData } from "@/lib/product/types";
import { JsonLd, type productSchema } from "@/lib/seo/jsonld";
import { ArfroAudience } from "./ArfroAudience";
import { ArfroCompareToggle } from "./ArfroCompare";
import { ArfroGallery } from "./ArfroGallery";
import { ArfroServices } from "./ArfroServices";
import { audienceRows } from "./data";
import { ARFRO_PDP_H2, PDP_SPLIT, PdpEyebrow } from "./styles";

/**
 * Arfro product page (docs/arfro-creative-brief.md « Later rounds »): hero (gallery and buy
 * column), section tabs, advantages, key figures, « Pour qui ? », specifications and documentation,
 * installation and services, FAQ, comparison and the same range. Every block reads the product's
 * own data and is left out without it. Same provider, prices, structured data and sticky bar as
 * Climatisation Maroc's page.
 */
export function ArfroProductPage({ product, initialSku, schema }: { product: ProductPageData; initialSku: string; schema: ReturnType<typeof productSchema> }) {
  const hasPresentation = product.highlights.length > 0 || !!product.description;
  const hasAudience = audienceRows(product).length > 0;
  const hasServices = product.accessories.length > 0;
  const tabs = [
    ...(hasPresentation ? [{ id: "presentation", label: "Présentation" }] : []),
    { id: "specifications", label: "Caractéristiques" },
    ...(hasAudience ? [{ id: "pour-qui", label: "Pour qui ?" }] : []),
    ...(hasServices ? [{ id: "installation", label: "Installation" }] : []),
    ...(product.faq.length ? [{ id: "faq", label: "Questions" }] : []),
    { id: "comparer", label: product.sameRange.length ? "Même gamme" : "Comparer" },
  ];
  const compareAddHref = `${product.category.href}?comparer=1`;

  return (
    <ProductProvider product={product} initialSku={initialSku}>
      <Breadcrumb items={product.breadcrumb} />

      <section
        aria-label="Produit"
        className="relative grid grid-cols-1 items-start gap-8 pt-4 md:pt-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12 xl:gap-20"
      >
        <ArfroGallery />
        <ArfroBuyBox />
      </section>

      <SectionTabs tabs={tabs} />
      <ArfroHighlights id="presentation" items={product.highlights} description={product.description} />
      <ArfroKeyFacts id="en-bref" />
      <ArfroSpecs id="specifications" />
      <ArfroAudience id="pour-qui" />
      <ArfroServices id="installation" accessories={product.accessories} visitPrice={product.technicalVisitPrice} />

      {product.faq.length > 0 && (
        <section id="faq" aria-labelledby="faq-title" className={cn(PDP_SPLIT, "scroll-mt-28 pt-14 md:pt-20")}>
          <div>
            <PdpEyebrow>Questions</PdpEyebrow>
            <h2 id="faq-title" className={ARFRO_PDP_H2}>
              Questions fréquentes
            </h2>
          </div>
          <FaqDetails items={product.faq} />
        </section>
      )}

      <section id="comparer" aria-labelledby="comparer-title" className="relative scroll-mt-28 pt-14 md:pt-20">
        <AirflowLines variant="divider" className="mb-10 h-10 w-full md:mb-14" />
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-5 md:mb-10">
          <div>
            <PdpEyebrow>Comparer et choisir</PdpEyebrow>
            <h2 id="comparer-title" className={ARFRO_PDP_H2}>
              {product.sameRange.length ? "Dans la même gamme" : "Comparer avant de choisir"}
            </h2>
          </div>
          <ArfroCompareToggle addHref={compareAddHref} />
        </div>
        {product.sameRange.length > 0 && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
            {product.sameRange.map((card) => (
              <ArfroProductCard key={card.href} product={card} sizes="(min-width: 1280px) min(18vw, 260px), (min-width: 640px) 36vw, 70vw" />
            ))}
          </div>
        )}
      </section>

      <div className="h-16" aria-hidden />
      <StickyAddBar />
      {schema && <JsonLd data={schema} />}
    </ProductProvider>
  );
}
