import type { ArtKey, Link, Phone, ProductCardData } from "@/lib/types";

/** GET /api/v1/home (backend HomeController). Money in centimes. */

export interface BentoTile {
  key: string;
  title: string;
  href: string;
  /** Key of the two-tone icon set (IC in components/ui/icons). */
  icon: string | null;
  bg: string | null;
  /** Short line under the title ("Ventilateurs de gaine · Multizone"). */
  text: string | null;
  /** Sub-range chips (first two tiles) or sector links (solutions tile). */
  types: Link[] | null;
  art: ArtKey | null;
  /** Cut-out image uploaded on the category in the back office. */
  image: string | null;
}

export interface DuctItem {
  name: string;
  sku: string;
  href: string;
  diameter: number | null;
  kind: "souple" | "calo" | "alu";
  price: number;
}

export interface BrandLogo {
  name: string;
  href: string;
  logo: string | null;
  /** Width / height of the logo, for equal-area sizing. */
  aspect: number | null;
}

export interface HomeData {
  hero: {
    title: string;
    subtitle: string | null;
    image: string | null;
    cta: Link | null;
  };
  whatsapp: string;
  bento: BentoTile[];
  newProducts: ProductCardData[];
  promotions: { brands: string[]; products: ProductCardData[] };
  ducts: DuctItem[];
  supplies: ProductCardData[];
  brands: BrandLogo[];
  pro: { phone: Phone | null };
}
