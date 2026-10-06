import type { ProductCardData } from "@/lib/types";
import { powerRange } from "./logo";

/**
 * "Dans la même gamme" card (design: Produit): no variant chips, reference only for single items;
 * badge = the discount for a single item, else the brand ("À partir de" families show the brand).
 */
export function sameRangeCard(card: ProductCardData): ProductCardData {
  const single = !card.options?.length;
  const brandBadge = card.brand ? { text: card.brand, tone: "brand" as const } : null;
  return {
    ...card,
    options: [],
    refText: null,
    badge: single ? (card.badge ?? brandBadge) : brandBadge,
  };
}

/**
 * Brand page card (design: Marque LG): brand badge, no chips, power range ("9 000 à 24 000 BTU") in
 * the reference slot for families of powers, the SKU for single items.
 */
export function brandCard(card: ProductCardData): ProductCardData {
  const options = card.options ?? [];
  return {
    ...card,
    options: [],
    refText: options.length ? powerRange(options.map((o) => o.fullLabel)) : null,
    badge: card.brand ? { text: card.brand, tone: "brand" } : card.badge,
  };
}
