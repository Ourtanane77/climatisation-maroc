import "server-only";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ApiError, apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { CityPageDetail, PageDetail, SectorCardData, SectorDetail, ServiceDetail, ServiceSummary, SiteMapData, Contact } from "./types";

/**
 * Content fetchers (sectors, services, static pages, city pages, plan du site). Pages that list
 * products forward the reseller token so pro prices stay server-side.
 */
async function getOr404<T>(path: string, tags: string[], withToken = false): Promise<T> {
  try {
    return await apiGet<T>(path, { tags, token: withToken ? await getToken() : null });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export const getSectors = cache(() => getOr404<{ data: SectorCardData[]; contact: Contact }>("/sectors", ["content", "sectors"]));
export const getSector = cache((slug: string) => getOr404<SectorDetail>(`/sectors/${encodeURIComponent(slug)}`, ["content", "sectors", "products"], true));
export const getServices = cache(() => getOr404<{ data: ServiceSummary[]; contact: Contact }>("/services", ["content", "services"]));
export const getService = cache((slug: string) => getOr404<ServiceDetail>(`/services/${encodeURIComponent(slug)}`, ["content", "services", "products"], true));
export const getPage = cache((slug: string) => getOr404<PageDetail>(`/pages/${encodeURIComponent(slug)}`, ["content", "pages"]));
export const getCityPage = cache((slug: string) =>
  getOr404<CityPageDetail>(`/cities/${encodeURIComponent(slug)}`, ["content", "city-pages", "products"], true),
);
export const getSiteMap = cache(() => getOr404<SiteMapData>("/site-map", ["content", "categories", "pages", "sectors", "services", "blog"]));
