import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import type { SiteLogo } from "@/components/layout/Logo";
import { CART_COOKIE, cartCount, parseCart } from "./cart/cookie";
import { SITE, type SiteConfig } from "./site";

/**
 * Logo file of this storefront: the first of its `logoFiles` found in public/ (public/logo-arfro.svg,
 * from design/logo_arfro.svg, for both sites today; drop public/logo-cm.svg to give cm its own), else
 * null (text wordmark).
 */
export function logoSrc(site: SiteConfig = SITE): string | null {
  return site.logoFiles.find((file) => existsSync(path.join(process.cwd(), "public", file))) ?? null;
}

/** Everything the (client) header, drawer and footer need to draw this storefront's logo. */
export function siteLogo(site: SiteConfig = SITE): SiteLogo {
  return { src: logoSrc(site), alt: site.logoAlt, wordmark: site.wordmark };
}

/** Cart count from the cookie, so the header renders the right number on the server. */
export async function initialCartCount(): Promise<number> {
  const jar = await cookies();
  return cartCount(parseCart(jar.get(CART_COOKIE)?.value));
}
