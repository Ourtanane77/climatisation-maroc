import { legacyPath, redirectLegacy } from "@/lib/seo/legacy";

/** Old-site static pages (/home, /home/contact, /home/devis…): redirect to the new page, else 404. */
export default async function LegacyHomePage({ params }: PageProps<"/home/[[...rest]]">) {
  const { rest } = await params;
  return redirectLegacy(legacyPath("/home", rest));
}
