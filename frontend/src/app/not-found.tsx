import type { Metadata } from "next";
import { NotFoundContent } from "@/components/content/NotFoundContent";
import SiteLayout from "./(site)/layout";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Page introuvable", noindex: true });

/**
 * 404 for URLs no route matches (e.g. three or more unknown segments): same page as
 * (site)/not-found.tsx, wrapped in the site chrome since the root layout has none.
 */
export default function RootNotFound() {
  return (
    <SiteLayout params={Promise.resolve({})}>
      <NotFoundContent />
    </SiteLayout>
  );
}
