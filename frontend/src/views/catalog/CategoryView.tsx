import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ApiError, apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { FACET_PARAMS, listingApiQuery } from "@/lib/catalog/query";
import type { CategoryData, ListingData } from "@/lib/catalog/types";
import type { Resolved, SearchParams } from "@/lib/types";
import DenseTemplate from "./DenseTemplate";
import LandingTemplate from "./LandingTemplate";
import ListingTemplate from "./ListingTemplate";
import { categoryDescription } from "@/lib/seo/descriptions";
import { seoMetadata } from "@/lib/seo/metadata";

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

/** Params that change the listing's content: those variants are not indexed (facets, sort, view). */
const LISTING_STATE_PARAMS = [...Object.keys(FACET_PARAMS), "tri", "vue", "comparer"];

/** `?page=N`: the page number when valid (≥ 1), null when absent, NaN when malformed. */
function pageParam(searchParams: SearchParams): number | null {
  const raw = searchParams.page;
  if (raw === undefined) return null;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return /^\d+$/.test(value ?? "") ? Number(value) : Number.NaN;
}

/**
 * A malformed or out-of-range `?page` on a listing is a 404, not a copy of page 1. Called from both
 * the metadata and the page (the page decides the HTTP status: metadata is streamed after it).
 */
async function assertPage(category: CategoryData, searchParams: SearchParams, filtered: boolean): Promise<number | null> {
  const page = category.template === "listing" ? pageParam(searchParams) : null;
  if (page === null) return null;
  if (!Number.isInteger(page) || page < 1) notFound();
  if (page > 1 && !filtered) {
    const listing = await apiGet<ListingData>(`/categories/${category.path}/products?${listingApiQuery(searchParams)}`, {
      tags: ["categories", "products"],
      token: await getToken(),
    });
    if (page > listing.meta.lastPage) notFound();
  }
  return page;
}

function isFiltered(searchParams: SearchParams): boolean {
  return Object.keys(searchParams).some((k) => LISTING_STATE_PARAMS.includes(k));
}

export async function categoryMetadata(resolved: CategoryResolved, searchParams: SearchParams): Promise<Metadata> {
  const category = await getCategory(resolved.path);
  // Facets, sort and view change the content: noindex. Other params (utm_*, gclid, fbclid…) are
  // ignored: the page stays indexable with its clean canonical.
  const filtered = isFiltered(searchParams);
  const page = await assertPage(category, searchParams, filtered);
  const paged = page !== null && page > 1;

  // A range whose name is also one of its sub-categories ("Gaines circulaires") uses its short
  // name, so the two pages do not share the same title.
  const sameAsChild = category.children.some((c) => c.name === category.name);
  const baseTitle = category.seo.title ?? (sameAsChild && category.shortName ? category.shortName : category.name);
  // Empty categories (no product yet, not a quote-only range) are thin pages: not indexed.
  const empty = category.productCount === 0 && !category.isQuoteOnly;

  return seoMetadata({
    title: paged ? `${baseTitle} · page ${page}` : baseTitle,
    description:
      category.seo.description ??
      category.intro ??
      categoryDescription({
        name: baseTitle,
        productCount: category.productCount,
        brands: category.brands.map((b) => b.name),
        children: category.children.filter((c) => c.productCount > 0).map((c) => c.shortName ?? c.name),
      }),
    // Each page of a listing is its own canonical (page 1 without ?page).
    path: paged ? `${category.href}?page=${page}` : category.href,
    noindex: category.seo.noindex || filtered || empty,
  });
}

/** Range landing (Gamme), listing (Catégorie) or dense list (Liste rapide), per the category template. */
export default async function CategoryView({ resolved, searchParams }: { resolved: CategoryResolved; searchParams: SearchParams }) {
  const category = await getCategory(resolved.path);
  await assertPage(category, searchParams, isFiltered(searchParams));
  switch (category.template) {
    case "landing":
      return <LandingTemplate category={category} />;
    case "dense":
      return <DenseTemplate category={category} />;
    default:
      return <ListingTemplate category={category} searchParams={searchParams} />;
  }
}
