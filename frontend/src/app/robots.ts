import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** robots.txt: back office, basket, checkout, account, search and API pages are not crawled. No `Host`
 * line: it is a non-standard (Yandex-only) directive. */
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
