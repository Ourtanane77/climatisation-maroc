import { legacyPath, redirectLegacy } from "@/lib/seo/legacy";

/** Old-site listing shortcuts (/produit/cuivre/…, /produit/gaz/…, /produit/grille/…): redirect, else 404. */
export default async function LegacyListingPage({ params }: PageProps<"/produit/[slug]/[...rest]">) {
  const { slug, rest } = await params;
  return redirectLegacy(legacyPath(`/produit/${slug}`, rest));
}
