import "server-only";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { ApiError, apiGet } from "@/lib/api";
import { SITE_KEY } from "@/lib/site";

/**
 * Old-site URLs (climatisationmaroc.com: /produit/details/{id}/{name}, /produit/service/{id}/…,
 * /produit/marque/{id}/{name}, /produit/cuivre/…, /home/{page}) → their new page, through
 * GET /api/v1/redirects/legacy. 301 answers become permanent redirects (308); 302 answers (target
 * not online yet) stay temporary. Unknown paths end on the 404 page. Only climatisationmaroc.com
 * (`cm`) had these URLs: on another storefront they are all 404, without asking the API.
 */
export async function redirectLegacy(path: string): Promise<never> {
  if (SITE_KEY !== "cm") notFound();
  let target: { type: "redirect"; to: string; status: number } | { type: "none" };
  try {
    target = await apiGet(`/redirects/legacy?path=${encodeURIComponent(path)}`, { tags: ["redirects"] });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  if (target.type !== "redirect") notFound();
  if (target.status === 301 || target.status === 308) permanentRedirect(target.to);
  redirect(target.to);
}

/** Path of a catch-all route: base plus its (decoded) segments. */
export function legacyPath(base: string, segments: string[] = []): string {
  return [base, ...segments.map(safeDecode)].join("/");
}

function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
