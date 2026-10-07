import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { connection } from "next/server";
import { SITE_DESCRIPTION } from "@/lib/seo/metadata";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  // French (é è à ç œ « ») is fully covered by the latin subset: one preloaded file, not two.
  // Figtree is a variable font, so no weight list is needed (one file serves 400–800).
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · Climatiseurs, chauffe-eau · Ariha Froid`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: { type: "website", locale: "fr_MA", siteName: SITE_NAME },
};

export const viewport: Viewport = {
  themeColor: "#0B5CAD",
  width: "device-width",
  initialScale: 1,
};

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
