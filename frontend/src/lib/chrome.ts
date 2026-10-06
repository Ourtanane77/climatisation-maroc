import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { CART_COOKIE, cartCount, parseCart } from "./cart/cookie";

/** Logo URL if the Ariha Froid logo file is present in public/brand/, otherwise null (text wordmark). */
export function logoSrc(): string | null {
  const file = path.join(process.cwd(), "public", "brand", "logo-ariha-froid.png");
  return existsSync(file) ? "/brand/logo-ariha-froid.png" : null;
}

/** Cart count from the cookie, so the header renders the right number on the server. */
export async function initialCartCount(): Promise<number> {
  const jar = await cookies();
  return cartCount(parseCart(jar.get(CART_COOKIE)?.value));
}
