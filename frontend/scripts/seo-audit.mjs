// Prints title, description, canonical, robots and Open Graph tags of every front-office route,
// and checks each JSON-LD block parses with its required fields (review aid, not a test).
//   node scripts/seo-audit.mjs [base=http://localhost:8080]
const base = process.argv[2] ?? "http://localhost:8080";
const PATHS = [
  "/",
  "/climatisation",
  "/climatisation/mural",
  "/climatisation/mural?marque=lg",
  "/cuivre-et-gaz",
  "/chauffe-eau",
  "/froid",
  "/produit/lg-dual-inverter",
  "/produit/support-gt",
  "/marques",
  "/marques/lg",
  "/comparer?p=D13AJH.N,D19AKH.NK0",
  "/promotions",
  "/recherche?q=lg",
  "/calculateur-puissance",
  "/panier",
  "/commande",
  "/commande/confirmation",
  "/suivi-commande",
  "/demander-un-devis",
  "/contact",
  "/devenir-revendeur",
  "/connexion",
  "/connexion/mot-de-passe-oublie",
  "/connexion/nouveau-mot-de-passe",
  "/espace-professionnel",
  "/espace-professionnel/commande-rapide",
  "/solutions",
  "/solutions/restaurants",
  "/services",
  "/services/installation",
  "/services/visite-technique",
  "/services/service-apres-vente",
  "/blog",
  "/blog/categorie/guides",
  "/blog/quelle-puissance-de-climatiseur-pour-ma-piece",
  "/a-propos",
  "/livraison-et-paiement",
  "/plan-du-site",
  "/page-inexistante",
  "/styleguide",
];

const REQUIRED = {
  Organization: ["name", "url"],
  WebSite: ["name", "url"],
  HVACBusiness: ["name", "address", "telephone"],
  LocalBusiness: ["name", "address"],
  BreadcrumbList: ["itemListElement"],
  Product: ["name", "offers"],
  FAQPage: ["mainEntity"],
  Article: ["headline"],
  BlogPosting: ["headline"],
};

const attr = (html, re) =>
  html
    .match(re)?.[1]
    ?.replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"') ?? null;
const titles = new Map();
let problems = 0;

for (const p of PATHS) {
  // The dev server restarts now and then (watcher): retry gateway errors for up to a minute.
  let res;
  for (let attempt = 0; attempt < 12; attempt++) {
    res = await fetch(base + p, { redirect: "manual" }).catch(() => null);
    if (res && ![502, 503, 504].includes(res.status)) break;
    await new Promise((r) => setTimeout(r, 5000));
  }
  const html = await res.text();
  const title = attr(html, /<title>([^<]*)<\/title>/);
  const desc = attr(html, /<meta name="description" content="([^"]*)"/);
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
  const robots = attr(html, /<meta name="robots" content="([^"]*)"/);
  const ogTitle = attr(html, /<meta property="og:title" content="([^"]*)"/);
  const ogUrl = attr(html, /<meta property="og:url" content="([^"]*)"/);
  const ogImage = attr(html, /<meta property="og:image" content="([^"]*)"/);
  const types = [];
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(json);
      for (const node of [data, ...(data["@graph"] ?? [])].flat()) {
        const type = node["@type"];
        if (!type || type === undefined) continue;
        types.push(type);
        const missing = (REQUIRED[type] ?? []).filter((k) => node[k] == null || (Array.isArray(node[k]) && !node[k].length));
        if (missing.length) {
          problems++;
          console.log(`  ! ${p}: ${type} missing ${missing.join(", ")}`);
        }
        if (type === "ProductGroup") {
          const variants = node.hasVariant ?? [];
          if (!node.name || !variants.length) {
            problems++;
            console.log(`  ! ${p}: ProductGroup needs name and hasVariant`);
          }
          for (const v of variants) {
            const offers = [v.offers].flat();
            if (!v.name || !v.sku || !offers.every((o) => o && o.priceCurrency === "MAD" && o.price != null && o.availability)) {
              problems++;
              console.log(`  ! ${p}: variant ${v.sku ?? "?"} needs name, sku and offers (MAD price, availability)`);
            }
          }
        }
        if (type === "Product") {
          const offers = [node.offers].flat();
          if (!offers.every((o) => o.priceCurrency === "MAD" && (o.price != null || o.lowPrice != null) && o.availability)) {
            problems++;
            console.log(`  ! ${p}: Product offers need priceCurrency MAD, price and availability`);
          }
        }
      }
    } catch {
      problems++;
      console.log(`  ! ${p}: JSON-LD does not parse`);
    }
  }
  if (res.status === 200 && !robots?.includes("noindex")) {
    if (titles.has(title)) console.log(`  ! duplicate title with ${titles.get(title)}`);
    titles.set(title, p);
  }
  console.log(
    `${res.status} ${p}\n    title: ${title} (${title?.length ?? 0})\n    desc: ${desc ? desc.slice(0, 90) + (desc.length > 90 ? "…" : "") : "—"} (${desc?.length ?? 0})\n    canonical: ${canonical ?? "—"} · robots: ${robots ?? "—"} · og: ${ogTitle ? "title" : "-"}/${ogUrl ? "url" : "-"}/${ogImage ? "image" : "-"}\n    ld: ${types.join(", ") || "—"}`,
  );
}
console.log(problems ? `\n${problems} JSON-LD problem(s)` : "\nJSON-LD OK");
process.exit(problems ? 1 : 0);
