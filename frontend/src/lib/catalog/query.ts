/**
 * Listing URLs. Front-office query names are French (`?marque=lg,carrier&puissance=12000&tri=prix-croissant`);
 * the API uses English keys. Filter links are plain URLs, so filtering works without JavaScript.
 */
import type { SearchParams } from "@/lib/types";

/** Front-office param → API facet key. */
export const FACET_PARAMS = {
  puissance: "power",
  marque: "brand",
  techno: "tech",
  fluide: "fluid",
  couleur: "colour",
  prix: "price",
  promo: "promo",
} as const;

export type FacetParam = keyof typeof FACET_PARAMS;

const PARAM_OF_FACET = Object.fromEntries(Object.entries(FACET_PARAMS).map(([k, v]) => [v, k])) as Record<string, FacetParam>;

export const SORTS = [
  { value: "prix-croissant", api: "price_asc", label: "Prix croissant" },
  { value: "prix-decroissant", api: "price_desc", label: "Prix décroissant" },
  { value: "nom", api: "name", label: "Nom" },
  { value: "pertinence", api: "relevance", label: "Pertinence" },
] as const;

export const DEFAULT_SORT = "prix-croissant";

export function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function list(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Selected values per facet param, from the page's search params. */
export function selectedFilters(params: SearchParams): Record<FacetParam, string[]> {
  return Object.fromEntries(Object.keys(FACET_PARAMS).map((p) => [p, list(params[p])])) as Record<FacetParam, string[]>;
}

/** Query string for GET /categories/{path}/products. */
export function listingApiQuery(params: SearchParams, perPage = 12): string {
  const q = new URLSearchParams();
  const selected = selectedFilters(params);
  for (const [param, values] of Object.entries(selected)) {
    if (values.length) q.set(FACET_PARAMS[param as FacetParam], values.join(","));
  }
  const sort = SORTS.find((s) => s.value === first(params.tri)) ?? SORTS[0];
  q.set("sort", sort.api);
  const page = Number.parseInt(first(params.page), 10);
  if (page > 1) q.set("page", String(page));
  q.set("per_page", String(perPage));
  return q.toString();
}

/** Keeps the listing state params (filters, sort, view) and drops the rest. */
function listingParams(params: SearchParams): URLSearchParams {
  const q = new URLSearchParams();
  for (const key of [...Object.keys(FACET_PARAMS), "tri", "vue", "page"]) {
    const raw = params[key];
    const v = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
    if (v) q.set(key, v);
  }
  return q;
}

function withQuery(base: string, q: URLSearchParams): string {
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

/** URL with one facet value toggled (page reset to 1). `facetKey` is the API key from the facet. */
export function toggleFilterHref(base: string, params: SearchParams, facetKey: string, value: string): string {
  const param = PARAM_OF_FACET[facetKey] ?? facetKey;
  const q = listingParams(params);
  const current = list(params[param]);
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  if (next.length) q.set(param, next.join(","));
  else q.delete(param);
  q.delete("page");
  return withQuery(base, q);
}

/** URL without any filter (keeps sort and view). */
export function clearFiltersHref(base: string, params: SearchParams): string {
  const q = listingParams(params);
  for (const p of Object.keys(FACET_PARAMS)) q.delete(p);
  q.delete("page");
  return withQuery(base, q);
}

/** URL with one listing param set (or removed when `value` is null). */
export function setParamHref(base: string, params: SearchParams, key: string, value: string | null): string {
  const q = listingParams(params);
  if (value == null || value === "") q.delete(key);
  else q.set(key, value);
  if (key !== "page") q.delete("page");
  return withQuery(base, q);
}
