/**
 * View models of the product page, comparison and brand endpoints
 * (backend/app/Http/Controllers/Api/Products). Money is in centimes.
 */
import type { ArtKey, Crumb, FaqItem, ProductCardData } from "@/lib/types";

export interface Seo {
  title: string | null;
  description: string | null;
  h1: string | null;
  canonical: string | null;
  ogImage: string | null;
  noindex: boolean;
}

export interface BrandSummary {
  name: string;
  slug: string;
  href: string;
  logo: string | null;
  logoAspect: number | null;
  caption: string | null;
  official: boolean;
}

export interface SpecRow {
  label: string;
  value: string;
}

export interface ProductVariantData {
  sku: string;
  label: string | null;
  /** Family name + label, e.g. "LG Dual Inverter 12 000 BTU". */
  name: string;
  price: number;
  regularPrice: number | null;
  stock: "en_stock" | "rupture" | "sur_commande";
  stockLabel: string;
  orderable: boolean;
  /** « Prix sur demande » (price 0): not orderable, no price markup. */
  onRequest?: boolean;
  dark: boolean;
  /** Index in `images` of this variant's photo. */
  image: number | null;
  /** Variant-level spec rows (override family rows with the same label). */
  specs: SpecRow[];
}

export interface ProductImageData {
  src: string | null;
  thumb: string | null;
  /** WebP renditions ("url 320w, url 640w, url 1200w"). */
  srcSet?: string | null;
  alt: string;
}

export interface AccessoryData {
  name: string;
  sku: string;
  href: string;
  price: number;
  image: string | null;
  art: ArtKey | null;
  orderable: boolean;
}

export interface ProductPageData {
  name: string;
  slug: string;
  href: string;
  shortDescription: string | null;
  description: string | null;
  highlights: { title: string; icon: string }[];
  art: ArtKey | null;
  datasheet: string | null;
  brand: BrandSummary | null;
  category: { label: string; href: string };
  breadcrumb: Crumb[];
  defaultSku: string;
  selectorLabel: string;
  variants: ProductVariantData[];
  images: ProductImageData[];
  specs: SpecRow[];
  accessories: AccessoryData[];
  technicalVisitPrice: number;
  sameRange: ProductCardData[];
  faq: FaqItem[];
  seo: Seo;
  isReseller: boolean;
}

export interface CompareProduct {
  sku: string;
  name: string;
  href: string;
  price: number;
  regularPrice: number | null;
  image: string | null;
  art: ArtKey | null;
  dark: boolean;
  orderable: boolean;
  category: { label: string; href: string };
}

export interface CompareData {
  products: CompareProduct[];
  rows: { label: string; values: string[]; differs: boolean }[];
  max: number;
}

export interface BrandFeature {
  title: string;
  text: string;
  icon: string;
}

export interface BrandGroup {
  key: string;
  label: string;
  title: string;
  href: string;
  count: number;
  products: ProductCardData[];
}

export interface BrandPageData {
  brand: BrandSummary & { intro: string | null; features: BrandFeature[] };
  heroImage: string | null;
  groups: BrandGroup[];
  others: BrandSummary[];
  advicePhone: { display: string; href: string } | null;
  whatsapp: string;
  seo: Seo;
}

export interface BrandListItem extends BrandSummary {
  productCount: number;
}
