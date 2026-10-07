import type { MetadataRoute } from "next";
import { apiGet } from "@/lib/api";
import { siteUrl } from "@/lib/site";

/**
 * sitemap.xml from GET /api/v1/sitemap: only active, non-empty categories and published products
 * and content (Laravel decides), with product photos. Regenerated automatically: hourly, and
 * whenever the back office saves (tag "api", see App\Support\Frontend\Revalidator).
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await apiGet<{ data: { path: string; lastmod: string | null; images?: string[] }[] }>("/sitemap", {
    tags: ["sitemap"],
    revalidate: 3600,
  });
  return data.map(({ path, lastmod, images }) => ({
    url: siteUrl(path),
    ...(lastmod ? { lastModified: lastmod } : {}),
    // Image sitemap: product photos (absolute URLs).
    ...(images?.length ? { images: images.map((src) => siteUrl(src)) } : {}),
  }));
}
