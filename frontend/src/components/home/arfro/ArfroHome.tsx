import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { listingApiQuery } from "@/lib/catalog/query";
import type { ListingData } from "@/lib/catalog/types";
import type { BentoTile, HomeData } from "@/lib/home/types";
import { getNavigation } from "@/lib/navigation";
import { getBrands } from "@/lib/product/api";
import type { ProductCardData } from "@/lib/types";
import { ArfroHero } from "./ArfroHero";
import { BrandTiles } from "./BrandTiles";
import { CategoryCircles } from "./CategoryCircles";
import { FeatureBanners } from "./FeatureBanners";
import { PowerPanel } from "./PowerPanel";
import { Promises } from "./Promises";
import { Selections, type SelectionTab } from "./Selections";
import { ArfroAdvisor } from "./v2/Advisor";
import { ArfroBrands } from "./v2/Brands";
import { ArfroBusiness } from "./v2/Business";
import { ArfroCare } from "./v2/Care";
import { ArfroEnvironments } from "./v2/Environments";
import { ArfroFinal } from "./v2/Final";
import { ArfroHeroV2 } from "./v2/Hero";
import { ArfroJournal } from "./v2/Journal";
import { ArfroManifesto } from "./v2/Manifesto";
import { ArfroProducts } from "./v2/Products";
import { ArfroProjects } from "./v2/Projects";
import { ArfroTechnology } from "./v2/Technology";
import { ArfroTestimonials } from "./v2/Testimonials";
import { ArfroTrust } from "./v2/Trust";

/**
 * Products of the first home range (Climatisation), in the listing's default order, as a « Nos
 * sélections » tab: the home lists picked in the back office are short, the range is real catalogue
 * data (owner's request, 2026-10-27). Any API error just leaves the tab out.
 */
async function rangeProducts(tile: BentoTile | undefined): Promise<ProductCardData[]> {
  if (!tile || tile.key === "solutions" || !tile.href.startsWith("/")) return [];
  try {
    const listing = await apiGet<ListingData>(`/categories${tile.href}/products?${listingApiQuery({}, 8)}`, {
      tags: ["categories", "products"],
      token: await getToken(),
    });
    return listing.data;
  } catch {
    return [];
  }
}

/**
 * Arfro home (arfro-restyle Main.dc.html / Mobile.dc.html), from the same GET /home data as the
 * Climatisation Maroc home. Sections without data are left out. The duct and supplies rails of
 * Climatisation Maroc are not part of this layout: the supplies become a « Nos sélections » tab,
 * the ducts stay on their range page. Motion: motion.tsx and the « Arfro home motion » rules of globals.css (Arfro only).
 */
export async function ArfroHome({ home }: { home: HomeData }) {
  if (home.arfro) return <ArfroEditorialHome home={home} />;
  return <ArfroClassicHome home={home} />;
}

/**
 * The editorial home of the owner's brief (docs/arfro-creative-brief.md, 2026-10-27), section by
 * section from GET /home `arfro` (ArfroHomeSettings, « Accueil — Arfro » in the back office). A
 * section the API sends as null (switched off, or nothing real to show) is left out. Order: hero,
 * manifesto, environments, technology, products, ARFRO Care, advisor, projects, business, brands,
 * trust, testimonials, journal, final statement.
 */
function ArfroEditorialHome({ home }: { home: HomeData }) {
  const { sections: s, facts } = home.arfro!;
  // Full page width (the sections are bands whose content lines up with the page column through
  // `site-gutter`): breaks out of main's side padding (`bleed`, body is the cqw container) and its
  // bottom padding, so the closing navy band meets the navy footer without a white strip.
  return (
    <div className="bleed -mb-10 md:-mb-14">
      {s.hero && <ArfroHeroV2 data={s.hero} />}
      {s.manifesto && <ArfroManifesto data={s.manifesto} />}
      {s.environments && <ArfroEnvironments data={s.environments} />}
      {s.technology && <ArfroTechnology data={s.technology} />}
      {s.products && <ArfroProducts data={s.products} />}
      {s.care && <ArfroCare data={s.care} facts={facts} />}
      {s.advisor && <ArfroAdvisor data={s.advisor} />}
      {s.projects && <ArfroProjects data={s.projects} />}
      {s.business && <ArfroBusiness data={s.business} />}
      {s.brands && home.brands.length > 0 && <ArfroBrands data={s.brands} brands={home.brands} />}
      {s.trust && <ArfroTrust data={s.trust} facts={facts} />}
      {s.testimonials && <ArfroTestimonials data={s.testimonials} />}
      {s.journal && <ArfroJournal data={s.journal} />}
      {s.final && <ArfroFinal data={s.final} />}
    </div>
  );
}

/** Previous Arfro home (2026-10-13 restyle), kept while the API sends no `arfro` block. */
async function ArfroClassicHome({ home }: { home: HomeData }) {
  const range = home.bento[0];
  const [nav, brandList, rangeList] = await Promise.all([getNavigation(), getBrands().catch(() => []), rangeProducts(range)]);
  const official = new Set(brandList.filter((b) => b.official).map((b) => b.href));
  const advice = nav.footer.phones.find((p) => p.label === "Conseil") ?? nav.salesPhone;

  const tabs: SelectionTab[] = [
    { id: "promotions", label: "Promotions", products: home.promotions.products, more: { label: "Voir toutes les promotions", href: "/promotions" } },
    { id: "nouveautes", label: "Nouveautés", products: home.newProducts },
    ...(range ? [{ id: `gamme-${range.key}`, label: range.title, products: rangeList, more: { label: "Voir tout", href: range.href } }] : []),
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
