import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { CART_COOKIE, cartCount, parseCart } from "./cart/cookie";

/**
 * Site logo URL: the owner's « Arfro by Ariha Froid » SVG (public/logo-arfro.svg, from
 * design/logo_arfro.svg), else the design's PNG if synced to public/brand/, else null (text wordmark).
 */
export function logoSrc(): string | null {
  for (const file of ["logo-arfro.svg", "brand/logo-ariha-froid.png"]) {
    if (existsSync(path.join(process.cwd(), "public", file))) return `/${file}`;
  }
  return null;
}

/** Cart count from the cookie, so the header renders the right number on the server. */
export async function initialCartCount(): Promise<number> {
  const jar = await cookies();
  return cartCount(parseCart(jar.get(CART_COOKIE)?.value));
}
