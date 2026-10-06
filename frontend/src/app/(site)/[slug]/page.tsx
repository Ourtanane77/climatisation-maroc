import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolvePath } from "@/lib/resolve";
import CategoryView, { categoryMetadata } from "@/views/catalog/CategoryView";
import CityPageView, { cityPageMetadata } from "@/views/content/CityPageView";
import StaticPageView, { staticPageMetadata } from "@/views/content/StaticPageView";

/**
 * One-segment paths: range (`/climatisation`), static page (`/a-propos`, `/cgv`…), city page
 * (`/climatisation-marrakech`), else a redirect or the 404 (docs/plan.md §2).
 */
export async function generateMetadata({ params, searchParams }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolvePath(`/${slug}`);
  switch (resolved.type) {
    case "category":
      return categoryMetadata(resolved, await searchParams);
    case "page":
      return staticPageMetadata(resolved);
    case "city":
      return cityPageMetadata(resolved);
  }
}

export default async function SlugPage({ params, searchParams }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const resolved = await resolvePath(`/${slug}`);
  switch (resolved.type) {
    case "category":
      return <CategoryView resolved={resolved} searchParams={await searchParams} />;
    case "page":
      return <StaticPageView resolved={resolved} />;
    case "city":
      return <CityPageView resolved={resolved} />;
    default:
      notFound();
  }
}
