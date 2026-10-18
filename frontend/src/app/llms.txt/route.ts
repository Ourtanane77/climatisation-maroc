import { connection } from "next/server";
import { getNavigation } from "@/lib/navigation";
import { buildLlmsTxt } from "@/lib/seo/llms";
import { SITE, siteUrl } from "@/lib/site";

/**
 * /llms.txt of this storefront (lib/seo/llms.ts), with its own name and URLs. Rendered on request,
 * like the sitemap: the image is shared by both storefronts, so nothing is fixed at build time.
 */
export async function GET() {
  await connection();
  const nav = await getNavigation();
  return new Response(buildLlmsTxt(nav, SITE, siteUrl), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
