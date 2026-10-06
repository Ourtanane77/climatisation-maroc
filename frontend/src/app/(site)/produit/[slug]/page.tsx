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
import { siteUrl } from "@/lib/site";

/** Product page (design: Produit LG Dual Inverter). `?v=<sku>` selects the variant. */
export async function generateMetadata({ params }: PageProps<"/produit/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  const image = product.images[0]?.src;
  return {
    title: product.seo.title ?? `${product.name} · ${product.category.label}`,
    description: product.seo.description ?? product.shortDescription ?? undefined,
    alternates: { canonical: product.seo.canonical ?? product.href },
    robots: product.seo.noindex ? { index: false } : undefined,
    openGraph: { type: "website", url: product.href, images: product.seo.ogImage ?? image ?? undefined },
  };
}

export default async function ProductPage({ params, searchParams }: PageProps<"/produit/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const product = await getProduct(slug);
  const requested = typeof query.v === "string" ? query.v : null;
  const initialSku = product.variants.some((v) => v.sku === requested) ? requested! : product.defaultSku;

  const schema = {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name: product.name,
    description: product.description ?? product.shortDescription ?? undefined,
    url: siteUrl(product.href),
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    productGroupID: product.slug,
    hasVariant: product.variants.map((v) => ({
      "@type": "Product",
      name: v.name,
      sku: v.sku,
      image: v.image != null && product.images[v.image]?.src ? siteUrl(product.images[v.image].src!) : undefined,
      offers: {
        "@type": "Offer",
        url: siteUrl(`${product.href}?v=${encodeURIComponent(v.sku)}`),
        priceCurrency: "MAD",
        price: (v.price / 100).toFixed(2),
        availability: v.orderable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      },
    })),
  };

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </ProductProvider>
  );
}
