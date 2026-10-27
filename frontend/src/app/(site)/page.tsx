import type { Metadata } from "next";
import { CmHome } from "@/components/home/CmHome";
import { getHome } from "@/lib/home/api";
import { homeMetadata } from "@/lib/home/metadata";

export function generateMetadata(): Metadata {
  return homeMetadata();
}

/**
 * Climatisation Maroc home (design/Accueil.dc.html, components/home/CmHome.tsx). arfro.com never
 * renders this route: the proxy (src/proxy.ts) rewrites its « / » to ./accueil-arfro, a separate
 * route, so each home's client components are bundled apart (Turbopack bundles every client
 * component a route imports, rendered or not) and neither site downloads the other's home code.
 */
export default async function HomePage() {
  const home = await getHome();
  return <CmHome home={home} />;
}
