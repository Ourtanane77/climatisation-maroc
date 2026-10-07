/**
 * Price and number formatting, matching the design (`fmt`/`dh` helpers in design/*.dc.html):
 * fr-FR grouping with non-breaking spaces, then " Dhs". Amounts come from the API in centimes.
 */

const NBSP = " ";
const MINUS = "−";

/** 5700 → "5 700" (non-breaking spaces). Decimals only when needed: 3.5 → "3,50". */
export function formatNumber(value: number): string {
  const hasDecimals = Math.round(value * 100) % 100 !== 0;
  const text = value.toLocaleString("fr-FR", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  });
  return text.replace(/[\s  ]/g, NBSP);
}

/** Centimes → "5 700 Dhs". */
export function dh(centimes: number): string {
  return `${formatNumber(centimes / 100)}${NBSP}Dhs`;
}

/** Discount badge text, e.g. "−12 %" (real minus sign, non-breaking space). */
export function discountBadge(regular: number, selling: number): string {
  const pct = Math.round((1 - selling / regular) * 100);
  return `${MINUS}${pct}${NBSP}%`;
}

/** "Économisez 800 Dhs". */
export function savingText(regular: number, selling: number): string {
  return `Économisez ${dh(regular - selling)}`;
}

/** "4 articles" / "1 article". */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count}${NBSP}${count > 1 ? pluralForm : singular}`;
}

/** Items without a price (price 0, e.g. added from the client's Excel list) are « sur demande ». */
export const ON_REQUEST = "Prix sur demande";

export function isOnRequest(centimes: number | null | undefined): boolean {
  return centimes == null || centimes <= 0;
}

/** "5 700 Dhs", or « Prix sur demande » for an item without a price. */
export function priceText(centimes: number): string {
  return isOnRequest(centimes) ? ON_REQUEST : dh(centimes);
}

/** Quote form prefilled with the reference (« Demander un prix »). */
export function priceRequestHref(sku?: string | null): string {
  // A temporary « XLS-… » reference means nothing to the visitor or the team: no prefill then.
  const ref = publicRef(sku);
  return ref ? `/demander-un-devis?ref=${encodeURIComponent(ref)}` : "/demander-un-devis";
}

/**
 * Reference shown to visitors: null for the temporary « XLS-… » references of products added from
 * the client's Excel list until the real reference is entered (the cart still uses the SKU).
 */
export function publicRef(sku: string | null | undefined): string | null {
  return sku && !/^XLS-/i.test(sku) ? sku : null;
}
