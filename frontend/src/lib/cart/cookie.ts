/** Cart cookie format, shared by the client store and server components. */

export const CART_COOKIE = "cm_cart";
export const MAX_QTY = 999;
export const MAX_LINES = 100;

export interface CartLine {
  sku: string;
  qty: number;
}

export function parseCart(raw: string | undefined | null): CartLine[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(decodeURIComponent(raw));
    if (!Array.isArray(data)) return [];
    return data
      .filter((l): l is CartLine => typeof l?.sku === "string" && Number.isInteger(l?.qty))
      .map((l) => ({ sku: l.sku.slice(0, 64), qty: Math.min(MAX_QTY, Math.max(1, l.qty)) }))
      .slice(0, MAX_LINES);
  } catch {
    return [];
  }
}

export function serializeCart(lines: CartLine[]): string {
  return encodeURIComponent(JSON.stringify(lines.slice(0, MAX_LINES)));
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}
