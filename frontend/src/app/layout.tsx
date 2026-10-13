import type { Metadata, Viewport } from "next";
import { Figtree, Manrope } from "next/font/google";
import { connection } from "next/server";
import { SITE, SITE_KEY, SITE_NAME, SITE_URL } from "@/lib/site";
import { SiteKeyProvider } from "@/lib/site-context";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  // French (é è à ç œ « ») is fully covered by the latin subset: one preloaded file, not two.
  // Figtree is a variable font, so no weight list is needed (one file serves 400–800).
  subsets: ["latin"],
  display: "swap",
});

// arfro.com's typeface (its look follows LG/Samsung storefronts). Not preloaded: Climatisation Maroc
// never uses it, and next/font options must be literals (no per-site preload).
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

/** Per storefront (SITE_KEY, SITE_URL), read at runtime: one build serves both sites. */
export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: SITE.defaultTitle, template: `%s · ${SITE_NAME}` },
    description: SITE.description,
    applicationName: SITE_NAME,
    openGraph: { type: "website", locale: "fr_MA", siteName: SITE_NAME },
    // Per storefront (public/brand/<key>/), hence not the app/icon file convention.
    icons: {
      icon: [
        { url: SITE.icons.favicon, sizes: "32x32", type: "image/png" },
        { url: SITE.icons.icon, sizes: "512x512", type: "image/png" },
      ],
      apple: { url: SITE.icons.apple, sizes: "180x180", type: "image/png" },
    },
  };
}

export function generateViewport(): Viewport {
  return { themeColor: SITE.themeColor, width: "device-width", initialScale: 1 };
}

/**
 * Every page is rendered per request: it reads the cart cookie, a reseller's prices and API data
 * (cached by fetch, expired by Laravel). Nothing is prerendered at build time, when the API is
 * not reachable (docker image build).
 */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  return (
    // data-site switches the design tokens per storefront (globals.css).
    <html lang="fr-MA" data-site={SITE_KEY} className={`${figtree.variable} ${manrope.variable}`}>
      <body>
        <SiteKeyProvider value={SITE_KEY}>{children}</SiteKeyProvider>
      </body>
    </html>
  );
}
