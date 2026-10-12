import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { connection } from "next/server";
import { SITE, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  // French (é è à ç œ « ») is fully covered by the latin subset: one preloaded file, not two.
  // Figtree is a variable font, so no weight list is needed (one file serves 400–800).
  subsets: ["latin"],
  display: "swap",
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
    <html lang="fr-MA" className={figtree.variable}>
      <body>{children}</body>
    </html>
  );
}
