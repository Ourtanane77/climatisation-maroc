/**
 * Real air conditioners for the advisor result: the power variants of the climatisation listings
 * (GET /categories/climatisation/{type}/products, prices computed by the API for the audience),
 * then three levels Essentiel / Confort / Premium among the variants of the recommended size.
 */
import type { ArtKey } from "@/lib/types";
import type { AdvisorCategory } from "./model";
import { STANDARD_SIZES } from "./model";

/** One power variant of a published air conditioner. */
export interface AdvisorProduct {
  name: string;
  brand: string | null;
  sku: string;
  btu: number;
  /** Centimes, from the API (pro price for a validated reseller). */
  price: number;
  regularPrice: number | null;
  href: string;
  image: string | null;
  art: ArtKey | null;
  dark: boolean;
  category: AdvisorCategory;
  /** Family key (product URL without the variant query), one card per family. */
  family: string;
}

/** A climatisation type the site publishes (result's category links; `text` is its tile text). */
export interface AdvisorCategoryLink {
  key: AdvisorCategory;
  label: string;
  href: string;
  text: string | null;
}

export interface AdvisorCatalog {
  categories: AdvisorCategoryLink[];
  products: AdvisorProduct[];
}

/** Card of the listing API, as far as the advisor reads it. */
export interface ListingCard {
  name: string;
  href: string;
  brand?: string | null;
  image?: string | null;
  art?: ArtKey | null;
  dark?: boolean;
  options?: {
    label: string;
    fullLabel?: string;
    sku: string;
    price: number;
    regularPrice?: number | null;
    image?: string | null;
    dark?: boolean;
    onRequest?: boolean;
  }[];
}

/** Last segment of a climatisation sub-category path → advisor category. */
export function categoryFromPath(path: string): AdvisorCategory | null {
  const last = path.replace(/\/+$/, "").split("/").pop() ?? "";
  if (last === "mural" || last === "cassette" || last === "gainable") return last;
  if (last.startsWith("console")) return "console";
  return null;
}

/** "12 000 BTU", "12 000 BTU · Noir" or the chip "12K Noir" → 12000. */
export function parseBtu(fullLabel: string | undefined, label: string): number | null {
  const full = fullLabel?.match(/^([\d\s  ]+)\s*BTU/i);
  if (full) {
    const n = Number(full[1].replace(/\D/g, ""));
    if (n > 0) return n;
  }
  const chip = label.match(/^(\d+)K\b/i);
  return chip ? Number(chip[1]) * 1000 : null;
}

/** Priced power variants of the listing cards of one category. Variants « sur demande » are left out. */
export function productsFromCards(cards: ListingCard[], category: AdvisorCategory): AdvisorProduct[] {
  return cards.flatMap((card) => {
    const options = card.options ?? [];
    return options.flatMap((o) => {
      const btu = parseBtu(o.fullLabel, o.label);
      if (!btu || o.onRequest || !(o.price > 0)) return [];
      return [
        {
          name: card.name,
          brand: card.brand ?? null,
          sku: o.sku,
          btu,
          price: o.price,
          regularPrice: o.regularPrice ?? null,
          href: options.length > 1 ? `${card.href}?v=${encodeURIComponent(o.sku)}` : card.href,
          image: o.image ?? card.image ?? null,
          art: card.art ?? null,
          dark: o.dark ?? card.dark ?? false,
          category,
          family: card.href,
        },
      ];
    });
  });
}

export type TierLevel = "essentiel" | "confort" | "premium" | "selection";

export interface TierPick {
  level: TierLevel;
  product: AdvisorProduct;
}

export interface TierSelection {
  /** Size of the picked products (may be the next size up when none exists at the estimate). */
  btu: number | null;
  picks: TierPick[];
}

/** Cheapest variant of each family. */
function onePerFamily(list: AdvisorProduct[]): AdvisorProduct[] {
  const best = new Map<string, AdvisorProduct>();
  for (const p of list) {
    const cur = best.get(p.family);
    if (!cur || p.price < cur.price) best.set(p.family, p);
  }
  return [...best.values()];
}

/** Essentiel = lowest price, Premium = highest, Confort = the middle one. */
function levels(list: AdvisorProduct[]): TierPick[] {
  const sorted = [...list].sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, "fr"));
  if (sorted.length === 0) return [];
  if (sorted.length === 1) return [{ level: "selection", product: sorted[0] }];
  if (sorted.length === 2)
    return [
      { level: "essentiel", product: sorted[0] },
      { level: "premium", product: sorted[1] },
    ];
  return [
    { level: "essentiel", product: sorted[0] },
    { level: "confort", product: sorted[Math.floor((sorted.length - 1) / 2)] },
    { level: "premium", product: sorted[sorted.length - 1] },
  ];
}

/**
 * Three levels among the variants of `size` in the recommended categories: the first category with
 * at least three families, otherwise the categories pooled in order of preference. When nothing
 * exists at `size`, the next standard size up that has products (one step at most).
 */
export function pickTiers(products: AdvisorProduct[], size: number | null, categories: AdvisorCategory[]): TierSelection {
  if (size === null) return { btu: null, picks: [] };
  const start = STANDARD_SIZES.indexOf(size as (typeof STANDARD_SIZES)[number]);
  const sizes = start === -1 ? [size] : STANDARD_SIZES.slice(start, start + 2);

  for (const btu of sizes) {
    const byCategory = categories.map((c) => onePerFamily(products.filter((p) => p.category === c && p.btu === btu)));
    const full = byCategory.find((list) => list.length >= 3);
    const pool = full ?? onePerFamily(byCategory.flat());
    if (pool.length) return { btu, picks: levels(pool) };
  }
  return { btu: size, picks: [] };
}

export const TIER_LABEL: Record<TierLevel, string> = {
  essentiel: "Essentiel",
  confort: "Confort",
  premium: "Premium",
  selection: "Notre sélection",
};

export const TIER_TEXT: Record<TierLevel, string> = {
  essentiel: "Le prix le plus doux à cette puissance.",
  confort: "L’équilibre entre prix et équipement.",
  premium: "Le plus haut de gamme à cette puissance.",
  selection: "Le modèle disponible à cette puissance.",
};
