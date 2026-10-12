import "server-only";

/**
 * Storefront configuration and URL helpers. The same build serves two sites (docs/architecture.md):
 * climatisationmaroc.com (`cm`, the default) and arfro.com (`arfro`). Both are read on the server at
 * runtime, never inlined at build time, so one image serves both:
 *   - SITE_KEY: cm | arfro (anything else = cm). Sent to Laravel as `X-Site` on every call.
 *   - SITE_URL: absolute base URL of this instance (canonical, Open Graph, sitemap, JSON-LD); falls
 *     back to NEXT_PUBLIC_SITE_URL, read through a dynamic lookup so Next does not inline it.
 * Client components get what they need as props (logo, order prefix): this module is server-only.
 */

export type SiteKey = "cm" | "arfro";

export interface SiteConfig {
  key: SiteKey;
  /** Storefront name: title suffix, Open Graph site name, WebSite JSON-LD. */
  name: string;
  /** The company behind both storefronts (Organization JSON-LD, store names). */
  owner: string;
  /** Logo files tried in order under public/ (the first that exists wins), else the wordmark. */
  logoFiles: string[];
  logoAlt: string;
  /** Text wordmark shown when no logo file exists. */
  wordmark: { text: string; tagline: string | null; label: string };
  /** Home page and default <title>. */
  defaultTitle: string;
  /** Default meta description, and the base of the fallback for pages without their own text. */
  description: string;
  /** Prefix of the order references the API issues for this storefront (CM-2026-00001). */
  orderPrefix: string;
  themeColor: string;
}

/** Neutral shop description (no site name in it): shared until each site gets its own text. */
const SHOP_DESCRIPTION =
  "Boutique d'Ariha Froid à Marrakech depuis 2008 : climatiseurs LG, Carrier, CIAT, Fitco, chauffe-eau et pièces. Livraison gratuite, paiement à la livraison.";

const SITES: Record<SiteKey, SiteConfig> = {
  cm: {
    key: "cm",
    name: "Climatisation Maroc",
    owner: "Ariha Froid",
    logoFiles: ["/logo-cm.svg", "/logo-arfro.svg"],
    logoAlt: "Arfro by Ariha Froid · Climatisation Maroc",
    wordmark: { text: "Ariha Froid", tagline: "Climatisation Maroc", label: "Ariha Froid · Climatisation Maroc" },
    defaultTitle: "Climatisation Maroc · Climatiseurs, chauffe-eau · Ariha Froid",
    description: SHOP_DESCRIPTION,
    orderPrefix: "CM",
    themeColor: "#0B5CAD",
  },
  arfro: {
    key: "arfro",
    name: "Arfro",
    owner: "Ariha Froid",
    logoFiles: ["/logo-arfro.svg"],
    logoAlt: "Arfro by Ariha Froid",
    wordmark: { text: "Arfro", tagline: null, label: "Arfro by Ariha Froid" },
    // À réécrire: the cm title with the site name substituted.
    defaultTitle: "Arfro · Climatiseurs, chauffe-eau · Ariha Froid",
    // À réécrire: the shared neutral description.
    description: SHOP_DESCRIPTION,
    orderPrefix: "AR",
    themeColor: "#0B5CAD",
  },
};

// Dynamic lookups: Next inlines `process.env.NEXT_PUBLIC_*` at build time, not `env[name]`.
const env: Record<string, string | undefined> = process.env;

/** This instance's storefront key (SITE_KEY at runtime; missing or unknown = cm). */
export function resolveSiteKey(value = env["SITE_KEY"]): SiteKey {
  return value?.trim().toLowerCase() === "arfro" ? "arfro" : "cm";
}

export function siteConfig(key: SiteKey = resolveSiteKey()): SiteConfig {
  return SITES[key];
}

export const SITE_KEY: SiteKey = resolveSiteKey();
export const SITE: SiteConfig = siteConfig(SITE_KEY);
export const SITE_NAME = SITE.name;

export const SITE_URL = (env["SITE_URL"] || env["NEXT_PUBLIC_SITE_URL"] || "http://localhost:8080").replace(/\/$/, "");

/** Headers that tell Laravel which storefront is asking (prices, content, settings, references). */
export function siteHeaders(): { "X-Site": SiteKey } {
  return { "X-Site": SITE_KEY };
}

/** Absolute URL for canonical links, Open Graph and JSON-LD. */
export function siteUrl(path = "/"): string {
  if (/^https?:/.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
