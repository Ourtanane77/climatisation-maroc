import { legacyPath, redirectLegacy } from "@/lib/seo/legacy";

/** Old-site URL (/produit/details/…): permanent redirect to its new page, else 404 (src/lib/seo/legacy.ts). */
export default async function LegacyPage({ params }: PageProps<"/produit/details/[...rest]">) {
  const { rest } = await params;
  return redirectLegacy(legacyPath("/produit/details", rest));
}
