import "server-only";
import { cookies } from "next/headers";
import { CART_COOKIE, cartCount, parseCart } from "./cart/cookie";
import { SITE, type SiteConfig, type SiteLogo } from "./site";

/** This storefront's logo, passed to the (client) header, drawer and footer. */
export function siteLogo(site: SiteConfig = SITE): SiteLogo {
  return site.logo;
}

/** Cart count from the cookie, so the header renders the right number on the server. */
export async function initialCartCount(): Promise<number> {
  const jar = await cookies();
  return cartCount(parseCart(jar.get(CART_COOKIE)?.value));
}
