import type { ArtKey } from "@/lib/types";

/** GET /auth/me */
export interface Reseller {
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
}

/** A reference as returned by the quick-order endpoints (prices in centimes). */
export interface QuickItem {
  sku: string;
  name: string;
  href: string;
  /** Public selling price. */
  price: number;
  /** The reseller's price (pro price where set, else the public price). */
  proPrice: number;
  art: ArtKey | null;
  image: string | null;
  inStock: boolean;
}

/** GET /pro/landing */
export interface ProLanding {
  brands: { name: string; href: string; logo: string | null; aspect: number }[];
  faq: { question: string; answer: string }[];
  preview: { ref: string; name: string; qty: number; total: number }[];
}
