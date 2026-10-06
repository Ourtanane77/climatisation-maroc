import "server-only";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { CalculatorTier } from "@/lib/blog/types";
import type { HomeData } from "./types";

/** Home page data. The reseller token is forwarded so a validated reseller sees pro prices. */
export async function getHome(): Promise<HomeData> {
  return apiGet<HomeData>("/home", { tags: ["home", "products", "settings"], token: await getToken() });
}

/** Matching air conditioners for each power tier (calculator page and article calculator). */
export async function getCalculatorTiers(): Promise<CalculatorTier[]> {
  const res = await apiGet<{ tiers: CalculatorTier[] }>("/calculator/products", { tags: ["products"], token: await getToken() });
  return res.tiers;
}
