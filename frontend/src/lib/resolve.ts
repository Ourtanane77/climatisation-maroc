import "server-only";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { cache } from "react";
import { ApiError, apiGet } from "./api";
import type { Resolved } from "./types";

/**
 * Resolves a free-form path through GET /api/v1/resolve (categories, static pages, city pages,
 * redirects). Redirects and unknown paths end the request here.
 */
export const resolvePath = cache(async (path: string): Promise<Exclude<Resolved, { type: "redirect" | "none" }>> => {
  let resolved: Resolved;
  try {
    resolved = await apiGet<Resolved>(`/resolve?path=${encodeURIComponent(path)}`, { tags: ["resolve"] });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  if (resolved.type === "redirect") {
    if (resolved.status === 302) redirect(resolved.to);
    permanentRedirect(resolved.to);
  }
  if (resolved.type === "none") notFound();
  return resolved;
});
