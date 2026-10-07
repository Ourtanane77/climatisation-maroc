/** Content API shapes (GET /api/v1/sectors, /services, /pages, /cities/{slug}, /site-map). */
import type { ArtKey, FaqItem, ProductCardData } from "@/lib/types";

export interface Seo {
  title: string | null;
  description: string | null;
  h1: string | null;
  noindex: boolean;
}

export interface Contact {
  phones: { label: string; display: string }[];
  salesPhone: string;
  whatsapp: string;
  hours: string;
  stores: { name: string; address: string }[];
  email: string;
}

export interface SectorCardData {
  slug: string;
  name: string;
  tagline: string | null;
  scene: string | null;
  bg: string | null;
  image: string | null;
  href: string;
}

export interface SectorDetail extends SectorCardData {
  heroText: string | null;
  intro: string | null;
  problems: { title: string; text?: string; icon?: string }[];
  solutions: { title: string; text: string | null; art: ArtKey | null; image: string | null; bg: string | null; cta: string | null; href: string | null }[];
  products: ProductCardData[];
  rangeTiles: { title: string; text: string | null; cta: string | null; bg: string | null; art: ArtKey | null; image: string | null; href: string }[];
  imageBand: { caption: string; bg: string | null; scene: string | null; image: string | null; alt: string | null }[];
  quoteTitle: string | null;
  whatsappText: string | null;
  faq: FaqItem[];
  seo: Seo;
  others: SectorCardData[];
  contact: Contact;
}

export interface ServiceSummary {
  slug: string;
  name: string;
  h1: string | null;
  heroText: string | null;
  href: string;
}

export interface ServiceDetail {
  slug: string;
  name: string;
  href: string;
  heroText: string | null;
  /** Hero photo uploaded in the back office (else the design's wall unit). */
  image: string | null;
  whatsappText: string | null;
  included: { title: string; icon?: string }[];
  steps: { title: string; text?: string }[];
  prices: { label: string; value: string }[];
  showSupplies: boolean;
  products: ProductCardData[];
  faq: FaqItem[];
  seo: Seo;
  contact: Contact;
}

/** Filament Builder block: {type, data}. */
export interface Block {
  type: string;
  data: Record<string, unknown>;
}

export interface PageDetail {
  slug: string;
  title: string;
  kind: "legal" | "about" | "delivery" | "other";
  href: string;
  intro: string | null;
  body: Block[];
  updatedLabel: string | null;
  faq: FaqItem[];
  seo: Seo;
  contact: Contact;
  legalPages?: { title: string; href: string }[];
  brands?: { name: string; href: string; logo: string | null; aspect: number | null; official: boolean }[];
}

export interface CityPageDetail {
  slug: string;
  city: string;
  href: string;
  intro: string | null;
  body: string | null;
  types: { name: string; text: string | null; art: ArtKey | null; bg: string | null; image?: string | null; href: string }[];
  products: ProductCardData[];
  faq: FaqItem[];
  seo: Seo;
  contact: Contact;
}

export interface SiteMapLink {
  title: string;
  href: string;
}

export interface SiteMapData {
  ranges: (SiteMapLink & { quoteOnly: boolean; children: SiteMapLink[] })[];
  services: SiteMapLink[];
  sectors: SiteMapLink[];
  blogCategories: SiteMapLink[];
  articles: SiteMapLink[];
  pages: (SiteMapLink & { kind: string })[];
  cities: SiteMapLink[];
}
