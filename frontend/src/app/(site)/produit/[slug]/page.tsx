import type { Metadata } from "next";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
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
