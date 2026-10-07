import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { CART_COOKIE, cartCount, parseCart } from "./cart/cookie";

/** Site logo (« Arfro by Ariha Froid », public/logo-arfro.svg from design/logo_arfro.svg), else null (text wordmark). */
export function logoSrc(): string | null {
  return existsSync(path.join(process.cwd(), "public", "logo-arfro.svg")) ? "/logo-arfro.svg" : null;
}

/** Cart count from the cookie, so the header renders the right number on the server. */
export async function initialCartCount(): Promise<number> {
  const jar = await cookies();
  return cartCount(parseCart(jar.get(CART_COOKIE)?.value));
}
