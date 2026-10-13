import type { HomeData } from "@/lib/home/types";
import { getNavigation } from "@/lib/navigation";
import { getBrands } from "@/lib/product/api";
import { ArfroHero } from "./ArfroHero";
import { BrandTiles } from "./BrandTiles";
import { CategoryCircles } from "./CategoryCircles";
import { FeatureBanners } from "./FeatureBanners";
import { PowerPanel } from "./PowerPanel";
import { Promises } from "./Promises";
import { Selections, type SelectionTab } from "./Selections";

/**
 * Arfro home (arfro-restyle Main.dc.html / Mobile.dc.html), from the same GET /home data as the
 * Climatisation Maroc home. Sections without data are left out. The duct and supplies rails of
 * Climatisation Maroc are not part of this layout: the supplies become a « Nos sélections » tab,
 * the ducts stay on their range page.
 */
export async function ArfroHome({ home }: { home: HomeData }) {
  const [nav, brandList] = await Promise.all([getNavigation(), getBrands().catch(() => [])]);
  const official = new Set(brandList.filter((b) => b.official).map((b) => b.href));
  const advice = nav.footer.phones.find((p) => p.label === "Conseil") ?? nav.salesPhone;

  const tabs: SelectionTab[] = [
    { id: "promotions", label: "Promotions", products: home.promotions.products, more: { label: "Voir toutes les promotions", href: "/promotions" } },
    { id: "nouveautes", label: "Nouveautés", products: home.newProducts },
    { id: "fournitures", label: "Cuivre et pièces", products: home.supplies },
  ].filter((t) => t.products.length > 0);

  return (
    <>
      <ArfroHero hero={home.hero} />
      {home.bento.length > 0 && <CategoryCircles tiles={home.bento} />}
      {tabs.length > 0 && <Selections tabs={tabs} />}
      <FeatureBanners home={home} />
      <PowerPanel />
      <BrandTiles brands={home.brands} official={official} />
      <Promises phone={advice} />
    </>
  );
}
