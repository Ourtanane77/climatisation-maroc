import "server-only";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ApiError, apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { ArticleResponse, BlogResponse } from "./types";

async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

/** Blog index (no category) or one category's listing. Unknown or empty categories → 404. */
export const getBlog = cache(async (category: string | null, page = 1): Promise<BlogResponse> => {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return orNotFound(apiGet<BlogResponse>(`/blog${qs ? `?${qs}` : ""}`, { tags: ["blog"] }));
});

/** A published article; its product blocks carry pro prices for a logged-in reseller. */
export const getArticle = cache(async (slug: string): Promise<ArticleResponse> => {
  return orNotFound(apiGet<ArticleResponse>(`/blog/${encodeURIComponent(slug)}`, { tags: ["blog", "products"], token: await getToken() }));
});

/** "?page=2" → 2 (anything invalid → 1). */
export function pageParam(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 1 ? n : 1;
}
