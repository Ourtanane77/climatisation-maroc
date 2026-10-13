import "server-only";

/**
 * Storefront configuration and URL helpers. The same build serves two sites (docs/architecture.md):
 * climatisationmaroc.com (`cm`, the default) and arfro.com (`arfro`). Both are read on the server at
 * runtime, never inlined at build time, so one image serves both:
 *   - SITE_KEY: cm | arfro (anything else = cm). Sent to Laravel as `X-Site` on every call.
 *   - SITE_URL: absolute base URL of this instance (canonical, Open Graph, sitemap, JSON-LD); falls
 *     back to NEXT_PUBLIC_SITE_URL, read through a dynamic lookup so Next does not inline it.
 * Client components get what they need as props (logo, order prefix): this module is server-only
 * (types are imported with `import type`, which leaves no runtime import).
 */

export type SiteKey = "cm" | "arfro";

/** A storefront's logo: colour version (header) and white version (footer, on the brand blue). */
export interface SiteLogo {
  src: string;
  white: string;
  alt: string;
  /** Intrinsic size of both files (same artwork), for the width/height attributes. */
  width: number;
  height: number;
}

function brand(key: SiteKey, alt: string, width: number): Pick<SiteConfig, "logo" | "icons"> {
  const dir = `/brand/${key}`;
  return {
    logo: { src: `${dir}/logo.png`, white: `${dir}/logo-white.png`, alt, width, height: 180 },
    icons: { favicon: `${dir}/favicon-32.png`, icon: `${dir}/icon.png`, apple: `${dir}/apple-icon.png` },
  };
}

export interface SiteConfig {
  key: SiteKey;
  /** Storefront name: title suffix, Open Graph site name, WebSite JSON-LD. */
  name: string;
  /** The company behind both storefronts (Organization JSON-LD, store names). */
  owner: string;
  /** Logos under public/brand/<key>/ (from the owner's files in design/logos/, see design/README.md). */
  logo: SiteLogo;
  /** Favicon (32 px), app icon (512 px) and Apple touch icon (180 px). */
  icons: { favicon: string; icon: string; apple: string };
  /** Home page and default <title>. */
  defaultTitle: string;
  /** Default meta description, and the base of the fallback for pages without their own text. */
  description: string;
  /** Prefix of the order references the API issues for this storefront (CM-2026-00001). */
  orderPrefix: string;
  themeColor: string;
  /** Google Tag Manager container (production only, see gtmId()); null = none. */
  gtm: string | null;
  /** Microsoft Clarity project (production only, see clarityId()); null = none. */
  clarity: string | null;
}

/** Neutral shop description (no site name in it): shared until each site gets its own text. */
const SHOP_DESCRIPTION =
  "Boutique d'Ariha Froid à Marrakech depuis 2008 : climatiseurs LG, Carrier, CIAT, Fitco, chauffe-eau et pièces. Livraison gratuite, paiement à la livraison.";

const SITES: Record<SiteKey, SiteConfig> = {
  cm: {
    key: "cm",
    name: "Climatisation Maroc",
    owner: "Ariha Froid",
    ...brand("cm", "Ariha Froid · Climatisation Maroc", 621),
    defaultTitle: "Climatisation Maroc · Climatiseurs, chauffe-eau · Ariha Froid",
    description: SHOP_DESCRIPTION,
    orderPrefix: "CM",
    themeColor: "#0B5CAD",
    gtm: null,
    clarity: null,
  },
  arfro: {
    key: "arfro",
    name: "Arfro",
    owner: "Ariha Froid",
    ...brand("arfro", "Arfro by Ariha Froid", 632),
    // À réécrire: the cm title with the site name substituted.
    defaultTitle: "Arfro · Climatiseurs, chauffe-eau · Ariha Froid",
    // À réécrire: the shared neutral description.
    description: SHOP_DESCRIPTION,
    orderPrefix: "AR",
    themeColor: "#0B5CAD",
    gtm: "GTM-W8BQPKPX",
    clarity: "yx5c5sr7f7",
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

/**
 * Tag Manager container of this instance: the runtime env GTM_ID when set (an ID, or « off »), else the
 * site's own; production builds only, so development visits never reach the analytics.
 */
export function gtmId(site: SiteConfig = SITE): string | null {
  return trackerId("GTM_ID", site.gtm);
}

/** Clarity project of this instance: runtime env CLARITY_ID (an ID, or « off »), else the site's own. */
export function clarityId(site: SiteConfig = SITE): string | null {
  return trackerId("CLARITY_ID", site.clarity);
}

/** A tracker ID: the env override when set (« off » disables), else the site's ID in production. */
function trackerId(envName: string, siteId: string | null): string | null {
  const override = env[envName]?.trim();
  if (override) return override.toLowerCase() === "off" ? null : override;
  return process.env.NODE_ENV === "production" ? siteId : null;
}

/** Headers that tell Laravel which storefront is asking (prices, content, settings, references). */
export function siteHeaders(): { "X-Site": SiteKey } {
  return { "X-Site": SITE_KEY };
}

/** Absolute URL for canonical links, Open Graph and JSON-LD. */
export function siteUrl(path = "/"): string {
  if (/^https?:/.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
