/** Site-wide constants and URL helpers. */

export const SITE_NAME = "Climatisation Maroc";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:8080").replace(/\/$/, "");

/** Absolute URL for canonical links, Open Graph and JSON-LD. */
export function siteUrl(path = "/"): string {
  if (/^https?:/.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
