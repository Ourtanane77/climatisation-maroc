import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { SITE_NAME, siteUrl } from "@/lib/site";

/** Site description: the default, and the base of the fallback for pages without their own text. */
export const SITE_DESCRIPTION =
  "Boutique d'Ariha Froid à Marrakech depuis 2008 : climatiseurs LG, Carrier, CIAT, Fitco, chauffe-eau et pièces. Livraison gratuite, paiement à la livraison.";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

/** Open Graph image for pages without their own photo: the home hero (design photo, 1280 px WebP). */
const DEFAULT_OG_IMAGE = "/design/cover-ariha-1280.webp";
let defaultImage: string | null | undefined;
function defaultOgImage(): string | null {
  if (defaultImage === undefined) {
    try {
      defaultImage = existsSync(path.join(process.cwd(), "public", DEFAULT_OG_IMAGE)) ? DEFAULT_OG_IMAGE : null;
    } catch {
      defaultImage = null;
    }
  }
  return defaultImage;
}

interface SeoInput {
  /** Page title without the site name (the template adds « · Climatisation Maroc »). */
  title: string;
  /** Use the title as is (it already names the site or the brand). */
  absolute?: boolean;
  /** Page text (intro, lead, SEO description); falls back to a sentence built from the title. */
  description?: string | null;
  /** Canonical path. Omit for pages that are not indexed. */
  path?: string | null;
  /** Real photo for Open Graph (product, article, hero); none means no og:image. */
  image?: string | null;
  noindex?: boolean;
  /** With noindex: let crawlers follow the links (listings, basket). Default true. */
  follow?: boolean;
  type?: "website" | "article";
  publishedTime?: string | null;
}

/**
 * Complete metadata for a page: title (≤ 60 characters where possible: the site name is dropped
 * whenever the suffixed title would pass 60), description (≤ 160), canonical, robots and Open Graph /
 * Twitter tags (the site's default image when the page has no photo). Next replaces the root
 * `openGraph` object instead of merging it, so locale and site name are repeated.
 */
export function seoMetadata(input: SeoInput): Metadata {
  const suffixed = `${input.title} · ${SITE_NAME}`;
  const fullTitle = input.absolute || suffixed.length > TITLE_MAX ? input.title : suffixed;
  const description = clampDescription(input.description?.trim() || fallbackDescription(input.title));
  const indexable = !input.noindex;
  const url = input.path ? siteUrl(input.path) : undefined;
  const image = input.image ?? (indexable ? defaultOgImage() : null);
  const images = image ? [{ url: siteUrl(image) }] : undefined;

  return {
    title: { absolute: fullTitle },
    description,
    ...(indexable && input.path ? { alternates: { canonical: input.path } } : {}),
    ...(indexable ? {} : { robots: { index: false, follow: input.follow ?? true } }),
    openGraph: {
      type: input.type ?? "website",
      locale: "fr_MA",
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      ...(url ? { url } : {}),
      ...(images ? { images } : {}),
      ...(input.type === "article" && input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    },
    twitter: { card: images ? "summary_large_image" : "summary", title: fullTitle, description, ...(images ? { images } : {}) },
  };
}

/** Pages without their own text: their title, then the site's description. */
export function fallbackDescription(title: string): string {
  return `${title} · ${SITE_NAME}. ${SITE_DESCRIPTION}`;
}

/** Cuts at the last word boundary before 160 characters, with an ellipsis. */
export function clampDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= DESCRIPTION_MAX) return clean;
  const cut = clean.slice(0, DESCRIPTION_MAX - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 80)).replace(/[\s,;:.·–-]+$/, "")}…`;
}
