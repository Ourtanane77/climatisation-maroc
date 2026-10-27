import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArfroHome } from "@/components/home/arfro/ArfroHome";
import { getHome } from "@/lib/home/api";
import { homeMetadata } from "@/lib/home/metadata";
import { SITE_KEY } from "@/lib/site";

export function generateMetadata(): Metadata {
  return homeMetadata();
}

/**
 * arfro.com home (components/home/arfro, docs/deviations.md « Arfro restyle »), served at « / »:
 * the proxy (src/proxy.ts) rewrites arfro.com's « / » here and sends a direct visit to this path
 * back to « / » (308). A route of its own so its client components are bundled apart from
 * Climatisation Maroc's home (../page.tsx). Not found on Climatisation Maroc.
 */
export default async function ArfroHomePage() {
  if (SITE_KEY !== "arfro") notFound();
  const home = await getHome();
  return <ArfroHome home={home} />;
}
