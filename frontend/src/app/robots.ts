import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Per storefront, on request: one image serves both sites, so nothing is fixed at build time. */
export const dynamic = "force-dynamic";

/** robots.txt: back office, basket, checkout, account, search and API pages are not crawled. No `Host`
 * line: it is a non-standard (Yandex-only) directive. Points to this storefront's own sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/panier",
        "/commande",
        "/api/",
        "/connexion",
        "/espace-professionnel/commande-rapide",
        "/recherche",
        "/suivi-commande",
        "/comparer",
      ],
    },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
