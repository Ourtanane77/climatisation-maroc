import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import { cn } from "@/lib/cn";
import type { HomeData } from "@/lib/home/types";
import { Bento } from "./Bento";
import { BrandMarquee } from "./BrandMarquee";
import { HomeHero } from "./HomeHero";
import { DuctCard, InstallCard, SupplyCard } from "./MiniCards";
import { ProBlock } from "./ProBlock";
import { PromotionsRail } from "./PromotionsRail";
import { RailSection } from "./Rail";
import { SLOT } from "./slot";

/**
 * Climatisation Maroc home (design/Accueil.dc.html), rendered by app/(site)/page.tsx. Sections
 * without data are left out. arfro.com has its own home (components/home/arfro/ArfroHome.tsx).
 */
export function CmHome({ home }: { home: HomeData }) {
  return (
    <>
      <HomeHero hero={home.hero} whatsapp={home.whatsapp} heroWhatsapp={home.heroWhatsapp} />
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
