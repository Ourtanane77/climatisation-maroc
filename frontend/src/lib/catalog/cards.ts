import type { ProductCardData } from "@/lib/types";

/** Cards without a discount show the brand in blue (design: Catégorie, Recherche, Climatisation). */
export function withBrandBadge(card: ProductCardData): ProductCardData {
  if (card.badge || !card.brand) return card;
  return { ...card, badge: { text: card.brand, tone: "brand" } };
}
