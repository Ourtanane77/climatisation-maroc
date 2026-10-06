/**
 * Basket and order view models returned by the commerce API (POST /cart/quote, POST /orders,
 * GET /orders/{reference}, POST /orders/track). Money is in centimes.
 */
import type { ArtKey } from "@/lib/types";

export interface QuoteLine {
  sku: string;
  /** "LG Dual Inverter 12 000 BTU" */
  name: string;
  productName: string;
  variantLabel: string | null;
  /** "Puissance : 12 000 BTU" */
  option: string | null;
  href: string;
  image: string | null;
  art: ArtKey | null;
  dark: boolean;
  unitPrice: number;
  regularPrice: number | null;
  qty: number;
  lineTotal: number;
  /** False when out of stock: kept in the basket, left out of the total. */
  available: boolean;
}

export interface Suggestion {
  sku: string;
  name: string;
  href: string;
  price: number;
  image: string | null;
  art: ArtKey | null;
  dark: boolean;
}

export interface Quote {
  pricing: "public" | "pro";
  lines: QuoteLine[];
  /** SKUs no longer sold (removed from the basket by the page). */
  invalid: { sku: string; reason: string }[];
  count: number;
  subtotal: number;
  deliveryFee: number;
  technicalVisit: { price: number; selected: boolean };
  total: number;
  suggestions?: Suggestion[];
}

export interface City {
  id: number;
  name: string;
  slug: string;
  isOther: boolean;
}

export interface OrderLineView {
  sku: string;
  name: string;
  href: string | null;
  image: string | null;
  art: ArtKey | null;
  dark: boolean;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export interface TimelineStep {
  key: string;
  label: string;
  date: string | null;
  state: "done" | "active" | "pending";
}

export interface OrderView {
  reference: string;
  placedAt: string | null;
  /** "6 octobre 2026" */
  placedOn: string | null;
  status: "nouvelle" | "confirmee" | "expediee" | "livree" | "annulee";
  statusLabel: string;
  customer: { name: string; phone: string; email: string | null };
  address: string;
  city: string;
  note: string | null;
  options: { technicalVisit: boolean; installationQuote: boolean };
  lines: OrderLineView[];
  subtotal: number;
  technicalVisitPrice: number;
  deliveryFee: number;
  total: number;
  timeline: TimelineStep[];
}

/** Laravel validation error body (422). */
export interface ValidationErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}
