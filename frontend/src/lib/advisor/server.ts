import "server-only";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { CategoryData } from "@/lib/catalog/types";
import { getCities } from "@/lib/commerce/server";
import { FALLBACK_CITIES, type AdvisorCity } from "./cities";
import { categoryFromPath, productsFromCards, type AdvisorCatalog, type AdvisorProduct, type ListingCard } from "./products";

const ROOT = "climatisation";

/**
 * The published climatisation types of the current site and their priced power variants, from the
 * same listing endpoints as the category pages (scoped to the site, audience prices). Any API error
 * leaves the advisor without products: it still gives the estimate and the category links it has.
 */
export async function getAdvisorCatalog(): Promise<AdvisorCatalog> {
  try {
    const token = await getToken();
    const root = await apiGet<CategoryData>(`/categories/${ROOT}`, { tags: ["categories", "products"], token });
    const types = root.children.flatMap((c) => {
      const key = categoryFromPath(c.href);
      return key && c.productCount > 0 ? [{ key, label: c.name, href: c.href, text: c.text }] : [];
    });
    const lists = await Promise.all(
      types.map((t) =>
        apiGet<{ data: ListingCard[] }>(`/categories${t.href}/products?per_page=48&sort=price_asc`, { tags: ["categories", "products"], token })
          .then((r) => productsFromCards(r.data, t.key))
          .catch(() => [] as AdvisorProduct[]),
      ),
    );
    return { categories: types, products: lists.flat() };
  } catch {
    return { categories: [], products: [] };
  }
}

export async function getAdvisorCities(): Promise<AdvisorCity[]> {
  try {
    const cities = await getCities();
    return cities.length ? cities.map((c) => ({ slug: c.slug, name: c.name })) : FALLBACK_CITIES;
  } catch {
    return FALLBACK_CITIES;
  }
}
