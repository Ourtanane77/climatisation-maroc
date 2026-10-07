import { NextResponse, type NextRequest } from "next/server";

/**
 * Front-office URLs are lower case: a path with capitals (/Climatisation/Mural, /produit/LG-Dual)
 * gets one 308 to its lower-case form instead of a duplicate 200 page (docs/audits/seo-technical.md
 * L-1). Old-site URLs keep their case: their names are ignored by the legacy redirects anyway.
 */
const LEGACY = /^\/(produit\/(details|service|marque)|home)(\/|$)/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === pathname.toLowerCase() || LEGACY.test(pathname)) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = pathname.toLowerCase();
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Pages only: not Next assets, API route handlers, files with an extension, or Laravel paths.
  matcher: ["/((?!_next/|api/|storage/|design/|brand/|admin|livewire|sanctum|filament|.*\\.[a-zA-Z0-9]+$).*)"],
};
