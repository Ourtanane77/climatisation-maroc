import "server-only";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ApiError, apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { redirectLegacy } from "@/lib/seo/legacy";
import type { BrandListItem, BrandPageData, CompareData, ProductPageData } from "./types";

/** GET with the reseller token (pro prices) when present; a 404 from the API becomes the 404 page. */
async function get<T>(path: string, tags: string[]): Promise<T> {
  try {
    return await apiGet<T>(path, { tags, token: await getToken() });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export const getProduct = cache(async (slug: string) => {
  try {
    return await apiGet<ProductPageData>(`/products/${encodeURIComponent(slug)}`, { tags: ["products", `product:${slug}`], token: await getToken() });
  } catch (e) {
    // Unknown product: maybe an old-site page (/produit/panier, /produit/promotions) → redirect or 404.
    if (e instanceof ApiError && e.status === 404) return redirectLegacy(`/produit/${slug}`);
    throw e;
  }
});

export const getComparison = cache((skus: string[]) => get<CompareData>(`/products/compare?skus=${encodeURIComponent(skus.join(","))}`, ["products"]));

export const getBrands = cache(() => get<{ data: BrandListItem[] }>("/brands", ["brands"]).then((r) => r.data));

export const getBrand = cache((slug: string) => get<BrandPageData>(`/brands/${encodeURIComponent(slug)}`, ["brands", "products", `brand:${slug}`]));
