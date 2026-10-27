import { NextResponse, type NextRequest } from "next/server";

/**
 * Front-office URLs are lower case: a path with capitals (/Climatisation/Mural, /produit/LG-Dual)
 * gets one 308 to its lower-case form instead of a duplicate 200 page (docs/audits/seo-technical.md
 * L-1). Old-site URLs keep their case: their names are ignored by the legacy redirects anyway.
 */
const LEGACY = /^\/(produit\/(details|service|marque)|home)(\/|$)/i;

/**
 * arfro.com's home is a route of its own (app/(site)/accueil-arfro), served at « / » by a rewrite,
 * so each storefront's home bundles only its own client components. The internal path itself is
 * never a public URL. SITE_KEY is read at runtime like src/lib/site.ts (server-only, not imported).
 */
const ARFRO_HOME = "/accueil-arfro";
const env: Record<string, string | undefined> = process.env;
const isArfro = () => env["SITE_KEY"]?.trim().toLowerCase() === "arfro";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === ARFRO_HOME || pathname === `${ARFRO_HOME}/`) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url, 308);
  }
  if (pathname === "/" && isArfro()) {
    const url = request.nextUrl.clone();
    url.pathname = ARFRO_HOME;
    return NextResponse.rewrite(url);
  }
  if (pathname === pathname.toLowerCase() || LEGACY.test(pathname)) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = pathname.toLowerCase();
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Pages only: not Next assets, API route handlers, files with an extension, or Laravel paths.
  matcher: ["/((?!_next/|api/|storage/|design/|brand/|admin|livewire|sanctum|filament|.*\\.[a-zA-Z0-9]+$).*)"],
};
