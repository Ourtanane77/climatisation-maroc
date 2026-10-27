import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { preload } from "react-dom";
import { Clarity } from "@/components/analytics/Clarity";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/analytics/GoogleTagManager";
import { MetaPixel, MetaPixelNoScript } from "@/components/analytics/MetaPixel";
import { SITE, SITE_KEY, SITE_NAME, SITE_URL, clarityId, gtmId, metaPixelId } from "@/lib/site";
import { SiteKeyProvider } from "@/lib/site-context";
import "./globals.css";

/**
 * One typeface per storefront, self-hosted (public/fonts, latin subset: covers French, é è à ç œ « »;
 * variable fonts, one file per family). The @font-face rules and their metric-matched fallbacks
 * (size-adjust, ascent/descent overrides: no layout shift when the font swaps in) are at the top of
 * globals.css. Only the active site's file is preloaded: next/font options are build-time literals,
 * so with next/font both sites preloaded Figtree and Arfro's Manrope arrived late (CLS 0.28).
 */
const SITE_FONT: Record<typeof SITE_KEY, string> = {
  cm: "/fonts/figtree-latin-f7aa2171.woff2",
  arfro: "/fonts/manrope-latin-a343f882.woff2",
};

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
  const gtm = gtmId();
  const pixel = metaPixelId();
  preload(SITE_FONT[SITE_KEY], { as: "font", type: "font/woff2", crossOrigin: "anonymous", fetchPriority: "high" });
  return (
    // data-site switches the design tokens per storefront (globals.css).
    <html lang="fr-MA" data-site={SITE_KEY}>
      <body>
        <GoogleTagManagerNoScript id={gtm} />
        <MetaPixelNoScript id={pixel} />
        <SiteKeyProvider value={SITE_KEY}>{children}</SiteKeyProvider>
        <GoogleTagManager id={gtm} />
        <Clarity id={clarityId()} />
        <MetaPixel id={pixel} />
      </body>
    </html>
  );
}
