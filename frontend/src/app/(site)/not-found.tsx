import type { Metadata } from "next";
import { NotFoundContent } from "@/components/content/NotFoundContent";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Page introuvable", noindex: true });

/** 404 inside the site chrome (unknown slugs, unpublished pages, missing products). */
export default function NotFound() {
  return <NotFoundContent />;
}
