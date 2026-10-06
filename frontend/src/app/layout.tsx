import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · Climatiseurs, chauffe-eau et installation · Ariha Froid`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Climatisation Maroc, boutique d'Ariha Froid à Marrakech depuis 2008. Climatiseurs LG, Carrier, CIAT, Fitco, chauffe-eau, gaines, cuivre et pièces. Livraison gratuite partout au Maroc, paiement à la livraison.",
  openGraph: { type: "website", locale: "fr_MA", siteName: SITE_NAME },
};

export const viewport: Viewport = {
  themeColor: "#0B5CAD",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr-MA" className={figtree.variable}>
      <body>{children}</body>
    </html>
  );
}
