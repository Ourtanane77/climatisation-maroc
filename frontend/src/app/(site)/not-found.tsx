import type { Metadata } from "next";
import { NotFoundContent } from "@/components/content/NotFoundContent";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false },
};

/** 404 inside the site chrome (unknown slugs, unpublished pages, missing products). */
export default function NotFound() {
  return <NotFoundContent />;
}
