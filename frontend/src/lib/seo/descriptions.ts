import { dh, formatNumber } from "@/lib/format";
import type { ProductPageData } from "@/lib/product/types";

/**
 * Default meta descriptions built only from catalogue data and what the site already states on
 * every page (free delivery across Morocco, cash on delivery). A description written in the back
 * office (SEO tab) always wins. Nothing is invented (docs/audits/seo-technical.md M-3).
 */

export const SERVICE_LINE = "Livraison gratuite partout au Maroc, paiement à la livraison.";

/** "9 000 à 24 000 BTU", "Ø 100 à Ø 250", or the single label. */
function range(labels: string[]): string | null {
  const clean = labels.map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (!clean.length) return null;
  return clean.length === 1 ? clean[0] : `${clean[0]} à ${clean[clean.length - 1]}`;
}

export function productDescription(product: ProductPageData): string {
  const priced = product.variants.filter((v) => !v.onRequest && v.price > 0);
  const from = priced.length ? Math.min(...priced.map((v) => v.price)) : null;
  const powers = product.variants.map((v) => v.label).filter((l): l is string => !!l);
  const head = [product.name, product.brand && !product.name.includes(product.brand.name) ? `(${product.brand.name})` : null].filter(Boolean).join(" ");
  const what = [product.category.label.toLowerCase(), range(powers)].filter(Boolean).join(", ");
  const price = from === null ? "Prix sur demande" : `${priced.length > 1 ? "à partir de " : ""}${dh(from)}`;
  // Temporary references (XLS-…, to be replaced in the back office) are never shown.
  const sku = product.variants.length === 1 ? product.variants[0].sku : null;
  const refs = sku && !sku.startsWith("XLS-") ? ` Réf. ${sku}.` : "";
  return `${head} : ${what}, ${price}.${refs} ${SERVICE_LINE}`;
}

/** Category or range: product count, brands and price range when known. */
export function categoryDescription(input: { name: string; productCount: number; brands: string[]; children: string[] }): string {
  const parts: string[] = [];
  if (input.productCount > 0) parts.push(`${formatNumber(input.productCount)} produit${input.productCount > 1 ? "s" : ""}`);
  if (input.brands.length) parts.push(`marques ${input.brands.slice(0, 5).join(", ")}`);
  if (input.children.length) parts.push(input.children.slice(0, 5).join(", ").toLowerCase());
  return `${input.name}${parts.length ? ` : ${parts.join(" · ")}` : ""}. ${SERVICE_LINE}`;
}
