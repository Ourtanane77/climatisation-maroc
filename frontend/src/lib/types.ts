/**
 * Front-office view models. The API (docs/plan.md §5) returns these shapes; money is in centimes.
 */

export type ArtKey =
  "mural" | "gainable" | "cassette" | "solaire" | "vent" | "flex" | "coilS" | "coilL" | "duo" | "gaz" | "support" | "scotch" | "remote" | "iso" | "console";

export interface Link {
  label: string;
  href: string;
}

export interface Phone {
  label: string;
  display: string;
  href: string;
}

export interface Store {
  name: string;
  address: string;
}

export interface Social {
  name: "Facebook" | "Instagram" | "TikTok" | "WhatsApp";
  href: string;
}

export interface MegaMenu {
  title: string;
  href: string;
  subs: Link[];
  brands: Link[];
  featured?: {
    name: string;
    sku: string;
    price: number;
    image?: string | null;
    art?: ArtKey;
    href: string;
  };
}

export interface NavRange {
  key: string;
  label: string;
  href: string;
  mega?: MegaMenu;
}

export interface FooterColumn {
  title: string;
  links: Link[];
}

/** Everything the header, drawer and footer need (GET /api/v1/navigation). */
export interface SiteNavigation {
  promoBar?: { text: string; link?: Link } | null;
  ranges: NavRange[];
  promotions: Link;
  rightLinks: Link[];
  searchScopes: string[];
  whatsapp: { number: string; display: string };
  salesPhone: Phone;
  footer: {
    about: string;
    socials: Social[];
    columns: FooterColumn[];
    phones: Phone[];
    stores: Store[];
    hours: string;
    legal: Link[];
    copyright: string;
  };
}

export interface ProductOption {
  label: string;
  /** Full label for the title attribute, e.g. "12 000 BTU". */
  fullLabel: string;
  sku: string;
  price: number;
  regularPrice?: number | null;
  image?: string | null;
  dark?: boolean;
}

/** A product family as shown in listings. */
export interface ProductCardData {
  name: string;
  href: string;
  brand?: string | null;
  sku?: string | null;
  /** Shown in the reference slot when no single SKU applies, e.g. "4 puissances". */
  refText?: string | null;
  price: number;
  regularPrice?: number | null;
  fromPrice?: boolean;
  image?: string | null;
  imageAlt?: string;
  art?: ArtKey;
  dark?: boolean;
  badge?: { text: string; tone: "promo" | "brand" } | null;
  options?: ProductOption[];
  /** At least one variant can be ordered. */
  inStock?: boolean;
}

/** GET /api/v1/resolve?path= : what a free-form path is (catch-all routes). */
export type Resolved =
  | { type: "category"; path: string; template: "landing" | "listing" | "dense"; isRoot: boolean }
  | { type: "page"; slug: string; kind: "legal" | "about" | "delivery" | "other" }
  | { type: "city"; slug: string }
  | { type: "redirect"; to: string; status: number }
  | { type: "none" };

/** Search params as Next passes them to pages. */
export type SearchParams = Record<string, string | string[] | undefined>;

export interface DenseRowData {
  name: string;
  sku: string;
  price: number;
  href?: string;
  image?: string | null;
  art?: ArtKey;
  inStock: boolean;
}

export interface FacetValue {
  value: string;
  label: string;
  count?: number;
  selected: boolean;
}

export interface Facet {
  key: string;
  label: string;
  values: FacetValue[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Crumb {
  label: string;
  href?: string;
}
