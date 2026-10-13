import type { Metadata } from "next";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ArfroBuyBox } from "@/components/product/ArfroBuyBox";
import { ArfroHighlights, ArfroInstall, ArfroSpecs, SectionTabs } from "@/components/product/ArfroSections";
import { FaqDetails } from "@/components/product/FaqDetails";
import { Highlights } from "@/components/product/Highlights";
import { InstallKit } from "@/components/product/InstallKit";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ProductProvider } from "@/components/product/ProductContext";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Section } from "@/components/product/Section";
import { SpecTable } from "@/components/product/SpecTable";
import { StickyAddBar } from "@/components/product/StickyAddBar";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { getProduct } from "@/lib/product/api";
import { sameRangeCard } from "@/lib/product/cards";
import { JsonLd, productSchema } from "@/lib/seo/jsonld";
import { productDescription } from "@/lib/seo/descriptions";
import { seoMetadata } from "@/lib/seo/metadata";
import { SITE_KEY } from "@/lib/site";

/** Product page (design: Produit LG Dual Inverter). `?v=<sku>` selects the variant. */
export async function generateMetadata({ params }: PageProps<"/produit/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  // Open Graph: the largest WebP rendition of the first photo (1200 px) when available.
  const first = product.images[0];
  const image =
    first?.srcSet
      ?.split(",")
      .map((s) => s.trim().split(" ")[0])
      .pop() ?? first?.src;
  // "Name · Category" while it fits in 60 characters (the site name is added when it still fits).
  const withCategory = `${product.name} · ${product.category.label}`;
  return seoMetadata({
    title: product.seo.title ?? (withCategory.length <= 60 ? withCategory : product.name),
    description: product.seo.description ?? productDescription(product),
    path: product.seo.canonical ?? product.href,
    noindex: product.seo.noindex,
    image: product.seo.ogImage ?? image,
  });
}

export default async function ProductPage({ params, searchParams }: PageProps<"/produit/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const product = await getProduct(slug);
  const requested = typeof query.v === "string" ? query.v : null;
  const initialSku = product.variants.some((v) => v.sku === requested) ? requested! : product.defaultSku;

  // No Product markup for « Prix sur demande » items (see productSchema).
  const schema = productSchema(product);

  if (SITE_KEY === "arfro") {
    // Arfro (Produit.dc.html): grey gallery well and buy panel, section tabs, grey highlight tiles,
    // specs and installation side by side, FAQ rows, same range. Same data and behaviours.
    const tabs = [
      ...(product.highlights.length || product.description ? [{ id: "presentation", label: "Présentation" }] : []),
      { id: "specifications", label: "Caractéristiques" },
      ...(product.accessories.length ? [{ id: "installation", label: "Pour l’installation" }] : []),
      ...(product.faq.length ? [{ id: "faq", label: "Questions" }] : []),
    ];
    // Same H2 as ArfroSections (a constant from a client module would be a client reference here).
    const h2 = "m-0 mb-5 text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em] md:text-[30px]";
    return (
      <ProductProvider product={product} initialSku={initialSku}>
        <Breadcrumb items={product.breadcrumb} />

        <section className="grid grid-cols-1 items-start gap-8 pt-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:gap-14">
          <ProductGallery />
          <ArfroBuyBox />
        </section>

        <SectionTabs tabs={tabs} />
        <ArfroHighlights id="presentation" items={product.highlights} description={product.description} />

        <div className="flex flex-wrap items-start gap-x-10 gap-y-12 pt-12 md:pt-[72px]">
          <ArfroSpecs id="specifications" />
          <ArfroInstall id="installation" accessories={product.accessories} />
        </div>

        {product.faq.length > 0 && (
          <section id="faq" aria-labelledby="faq-title" className="max-w-[900px] scroll-mt-24 pt-12 md:pt-[72px]">
            <h2 id="faq-title" className={h2}>
              Questions fréquentes
            </h2>
            <FaqDetails items={product.faq} />
          </section>
        )}

        {product.sameRange.length > 0 && (
          <section id="meme-gamme" aria-labelledby="meme-gamme-title" className="pt-12 md:pt-[72px]">
            <h2 id="meme-gamme-title" className={h2}>
              Dans la même gamme
            </h2>
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
              {product.sameRange.map((card) => (
                <ProductCard key={card.href} product={sameRangeCard(card)} />
              ))}
            </div>
          </section>
        )}

        <div className="h-16" aria-hidden />
        <StickyAddBar />
        {schema && <JsonLd data={schema} />}
      </ProductProvider>
    );
  }

  return (
    <ProductProvider product={product} initialSku={initialSku}>
      <Breadcrumb items={product.breadcrumb} />

      <section className="grid grid-cols-1 items-start gap-10 pt-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <ProductGallery />
        <ProductBuyBox />
      </section>

      <Highlights items={product.highlights} description={product.description} />
      <SpecTable />
      <InstallKit accessories={product.accessories} visitPrice={product.technicalVisitPrice} />

      {product.sameRange.length > 0 && (
        <Section id="meme-gamme" title="Dans la même gamme">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {product.sameRange.map((card) => (
              <ProductCard key={card.href} product={sameRangeCard(card)} />
            ))}
          </div>
        </Section>
      )}

      {product.faq.length > 0 && (
        <Section id="faq" title="Questions fréquentes">
          <FaqAccordion items={product.faq} />
        </Section>
      )}

      <StickyAddBar />
      {schema && <JsonLd data={schema} />}
    </ProductProvider>
  );
}
