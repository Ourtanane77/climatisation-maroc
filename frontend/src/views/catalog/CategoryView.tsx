import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ApiError, apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { CategoryData } from "@/lib/catalog/types";
import type { Resolved, SearchParams } from "@/lib/types";
import DenseTemplate from "./DenseTemplate";
import LandingTemplate from "./LandingTemplate";
import ListingTemplate from "./ListingTemplate";

type CategoryResolved = Extract<Resolved, { type: "category" }>;

/** GET /categories/{path}, forwarding the reseller token (pro prices on popular cards). */
export const getCategory = cache(async (path: string): Promise<CategoryData> => {
  try {
    return await apiGet<CategoryData>(`/categories/${path}`, { tags: ["categories", "products"], token: await getToken() });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
});

export async function categoryMetadata(resolved: CategoryResolved, searchParams: SearchParams): Promise<Metadata> {
  const category = await getCategory(resolved.path);
  const filtered = Object.keys(searchParams).some((k) => k !== "page");
  return {
    title: category.seo.title ?? category.name,
    description: category.seo.description ?? category.intro ?? undefined,
    alternates: { canonical: category.href },
    // Filtered and sorted variants of a listing are not indexed (the canonical page is).
    robots: category.seo.noindex || filtered ? { index: false, follow: true } : undefined,
  };
}

/** Range landing (Gamme), listing (Catégorie) or dense list (Liste rapide), per the category template. */
export default async function CategoryView({ resolved, searchParams }: { resolved: CategoryResolved; searchParams: SearchParams }) {
  const category = await getCategory(resolved.path);
  switch (category.template) {
    case "landing":
      return <LandingTemplate category={category} />;
    case "dense":
      return <DenseTemplate category={category} />;
    default:
      return <ListingTemplate category={category} searchParams={searchParams} />;
  }
}
