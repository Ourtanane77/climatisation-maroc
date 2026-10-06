/** API shapes of the catalogue listing endpoints (backend/routes/api/catalog.php). Money in centimes. */
import type { ArtKey, Crumb, Facet, FaqItem, Link, ProductCardData } from "@/lib/types";

export interface CategoryTile {
  name: string;
  shortName: string | null;
  href: string;
  text: string | null;
  bg: string | null;
  art: ArtKey | null;
  image: string | null;
  productCount: number;
}

export interface BrandTile {
  name: string;
  slug: string;
  href: string;
  logo: string | null;
  logoAspect: number | null;
  note: string | null;
}

/** GET /categories/{path} */
export interface CategoryData {
  name: string;
  h1: string;
  shortName: string | null;
  path: string;
  href: string;
  template: "landing" | "listing" | "dense";
  isQuoteOnly: boolean;
  intro: string | null;
  body: string | null;
  breadcrumb: Crumb[];
  parent: Link | null;
  children: CategoryTile[];
  siblings: (Link & { active: boolean })[];
  powers: { label: string; sub: string; href: string }[];
  popular: ProductCardData[];
  brands: BrandTile[];
  guides: { title: string; href: string }[];
  faq: FaqItem[];
  seo: { title: string | null; description: string | null; noindex: boolean };
  productCount: number;
}

export interface PageMeta {
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

/** GET /categories/{path}/products */
export interface ListingData {
  data: ProductCardData[];
  facets: Facet[];
  meta: PageMeta & { sort: string };
}

/** GET /categories/{path}/products?flat=1 */
export interface DenseItem {
  name: string;
  sku: string;
  price: number;
  href: string;
  image: string | null;
  art: ArtKey | null;
  inStock: boolean;
  sub: string;
  subPath: string;
}

export interface FilterOption {
  value: string;
  label: string;
  selected: boolean;
}

/** GET /promotions */
export interface PromotionsData {
  data: ProductCardData[];
  filters: { brands: FilterOption[]; ranges: FilterOption[] };
  /** `all`: promoted families before the brand and range filters. */
  meta: PageMeta & { all: number };
}

/** GET /search */
export interface SearchData {
  term: string;
  total: number;
  data: ProductCardData[];
  tabs: { value: string; label: string; count: number }[];
  tab: string;
  popular: string[];
  ranges: Link[];
  meta: PageMeta;
}
