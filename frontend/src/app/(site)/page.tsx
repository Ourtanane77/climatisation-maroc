import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Bento } from "@/components/home/Bento";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { HomeHero } from "@/components/home/HomeHero";
import { DuctCard, InstallCard, SupplyCard } from "@/components/home/MiniCards";
import { ProBlock } from "@/components/home/ProBlock";
import { PromotionsRail } from "@/components/home/PromotionsRail";
import { RailSection } from "@/components/home/Rail";
import { SLOT } from "@/components/home/slot";
import { cn } from "@/lib/cn";
import { getHome } from "@/lib/home/api";
import { SITE_NAME } from "@/lib/site";
import { SITE_DESCRIPTION, seoMetadata } from "@/lib/seo/metadata";
import { designImage } from "@/lib/design-assets";

export const metadata: Metadata = seoMetadata({
  title: `${SITE_NAME} · Climatiseurs, chauffe-eau · Ariha Froid`,
  absolute: true,
  description: SITE_DESCRIPTION,
  path: "/",
  image: designImage("cover-ariha.png"),
});

/** Home page (design/Accueil.dc.html). Sections without data are left out. */
export default async function HomePage() {
  const home = await getHome();

  return (
    <>
      <HomeHero hero={home.hero} whatsapp={home.whatsapp} />
      {home.bento.length > 0 && <Bento tiles={home.bento} />}

      {home.newProducts.length > 0 && (
        <RailSection id="nouveautes" headingId="h-new" title="Nouveaux produits">
          {home.newProducts.map((p) => (
            <div key={p.href} className={cn(SLOT, "flex *:w-full")}>
              <ProductCard product={p} imageHeight={180} />
            </div>
          ))}
        </RailSection>
      )}

      {home.promotions.products.length > 0 && <PromotionsRail brands={home.promotions.brands} products={home.promotions.products} />}

      {home.ducts.length > 0 && (
        <RailSection
          id="gaines"
          headingId="h-gai"
          title="Gaines circulaires"
          arrows
          actions={
            <Link href="/gaines" className="-my-[3px] inline-block py-[3px] text-[15px] font-bold underline">
              Voir toutes les gaines
            </Link>
          }
        >
          {home.ducts.map((d) => (
            <DuctCard key={d.sku} duct={d} />
          ))}
        </RailSection>
      )}

      {home.supplies.length > 0 && (
        <RailSection id="cuivre" headingId="h-ins" title="Cuivre, gaz et pièces de rechange" arrows align="end">
          {home.supplies.map((p) => (
            <SupplyCard key={p.href} product={p} />
          ))}
          <InstallCard />
        </RailSection>
      )}

      <BrandMarquee brands={home.brands} />
      <ProBlock phone={home.pro.phone} />
    </>
  );
}
