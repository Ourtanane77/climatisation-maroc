# Technical SEO audit: Climatisation Maroc (front office)

- **Date:** 2026-10-07
- **Target:** http://localhost:8080 (Docker dev stack: nginx, then Next.js dev server and Laravel API)
- **Method:** a crawler followed every internal `<a href>` from `/` (it fetched query-string URLs but did not follow links found on them), then fetched every `/sitemap.xml` URL it had not reached. It requested pages with `allow_redirects=false` and parsed the server HTML only, with no JavaScript run. It also tested the old-site URLs and some edge cases with curl, and read the code behind each finding.
- **Coverage:** 414 URLs fetched: 413 returned 200 and 1 returned 307. Of the 200s, 317 are indexable HTML pages and 96 are `noindex`. The sitemap lists 238 URLs and 198 image entries. 205 old-site URLs were also tested (all 170 product legacy IDs from `product_variants.legacy_id`, every legacy category ID, every `/home/*` and `/produit/*` shortcut, and the brand pattern).
- **Out of scope:** detailed JSON-LD validation is covered in `docs/audits/schema.md`, and Lighthouse and Core Web Vitals measurements in `docs/audits/performance.md`.

## Technical score: 78 / 100

| Category | Status | Notes |
|---|---|---|
| Crawlability (robots, sitemap, noindex) | PASS, with issues | The robots.txt is clean and the sitemap is valid. The sitemap lists an empty page (`/froid`) and one image that returns 404. |
| Indexability (canonicals, duplicates, thin pages) | NEEDS WORK | Paginated pages point their canonical to page 1. Three empty categories are indexable and linked from every page. One title/H1/description is duplicated. Tracking parameters make a page `noindex`. Most meta descriptions are fallbacks. |
| Security (HTTPS, headers) | N/A in dev | There are no security headers in the nginx config, which is also the production config (see Production-only concerns). |
| URL structure and redirects | PASS | URLs are clean, lowercase French slugs. 197 of 205 old-site URLs take one 308 hop to a page that returns 200. `/home/` takes 2 hops, and the 5 legal pages 307 to `/`. Trailing slashes take one 308 hop. Uppercase variants return 200 with a canonical instead of redirecting. |
| Mobile | PASS | Every page has `width=device-width, initial-scale=1` and zoom is not blocked. Controls are at least 40 to 44 px. |
| Core Web Vitals (from source) | PASS, with notes | The LCP hero is preloaded with `fetchpriority=high`. Images sit in fixed aspect-ratio boxes, so CLS risk is low. The home HTML is heavy: 334 KB raw, mostly the inline RSC payload. |
| Structured data | PASS (detected) | Every page has Organization and WebSite (with SearchAction). 409 pages have BreadcrumbList, 185 have Product or ProductGroup, plus FAQPage, Article and HVACBusiness. Validation is in schema.md. |
| JavaScript rendering | PASS | All content is server-rendered: titles, H1, prices, product links, breadcrumbs and pagination are in the first HTML response. No client-side rendering bailouts were found. Bots get the metadata in `<head>`. |
| Language (`lang`) and hreflang | PASS | Every page has `<html lang="fr-MA">` and `og:locale=fr_MA`. There is no hreflang, which is correct for a single-language site (see L-8). |

---

## Critical

None. No important page is blocked, broken, noindexed by mistake or redirected in a loop, and no indexable URL is missing from the server HTML.

## High

### H-1. Three empty categories are indexable, linked site-wide and return 200 (soft 404s)

| URL | Status | Robots | Canonical | Products | Words in `<main>` |
|---|---|---|---|---|---|
| `/chauffe-eau/chaudiere` | 200 | index | self | 0 | 40 |
| `/chauffe-eau/electrique` | 200 | index | self | 0 | 42 |
| `/chauffe-eau/gaz` | 200 | index | self | 0 | 44 |

- **Evidence:** all three appear on all 413 crawled pages (mega menu and footer), on `/chauffe-eau` and on `/plan-du-site`. The page body says *"Chaudière 0 produit. Aucun produit ne correspond à ces filtres. Retirez un filtre…"*, although no filter is applied. The sitemap already leaves them out (`SitemapController` drops empty categories), so the sitemap and the internal links disagree.
- **Why it matters:** Google will treat these as soft 404s or thin pages. They are linked from every page, so they also take link equity and crawl budget. The old-site URLs `/produit/service/8/…`, `/9/…` and `/11/…` also 308 to these empty pages.
- **Fix:**
  1. Use the sitemap's rule ("has a published product in it or below, or `is_quote_only`") in `NavigationController` (`backend/app/Http/Controllers/Api/Catalog/NavigationController.php:33`), in the `/chauffe-eau` landing children and in `/plan-du-site`.
  2. While a category is empty, return `noindex, follow`: add `|| category.productCount === 0 && !category.isQuoteOnly` to the `noindex` expression in `categoryMetadata` (`frontend/src/views/catalog/CategoryView.tsx:33`). Alternatively, set the category inactive in the back office so it returns 404.
  3. In `ListingTemplate.tsx:143`, show a "no product in this category yet" message when no filter is active, instead of the "no product matches these filters" message.

### H-2. `/froid` is in the sitemap and the main navigation but has no content

- **Evidence:** `/froid` returns 200, is indexable, has a self-canonical and is listed in `sitemap.xml`. Its whole `<main>` is *"Accueil › Froid et chambres froides / Froid et chambres froides"* (10 words, one link). `GET /api/v1/categories/froid` returns `"isQuoteOnly":true,"intro":null,"productCount":0,"children":[]`. `SitemapController` keeps it on purpose ("quote-only ranges (Froid), whose page is a quote request"), but the landing template shows no quote form or CTA.
- **Fix:** either render the quote block on quote-only landings (devis CTA and form, phone and WhatsApp numbers, the sector links that already exist), or leave it out of the sitemap and set it to `noindex` until the client supplies copy. CLAUDE.md says pages without real copy stay unpublished.

### H-3. Paginated listing pages point their canonical to page 1, so 33 products are only linked from those pages

- **Evidence:** `/ventilation/grilles-et-diffuseurs?page=2` to `?page=5` all return 200 with `<link rel="canonical" href="http://localhost:8080/ventilation/grilles-et-diffuseurs">` and the same title as page 1. The same applies to every listing (`/climatisation?page=2`, `/promotions?page=2`, `/marques/lg?page=2`). It even applies to an out-of-range page: `/climatisation/mural?page=999` returns 200 with page 1's content.
- **Impact:** 33 products (`/produit/grille-simple-4010` to `/produit/grille-simple-10020` and `/produit/grille-double-2010` to `/produit/grille-double-10020`) have exactly one internal link, from `?page=3`, `?page=4` or `?page=5`. They are 4 to 5 clicks from the home page. Google may drop or rarely crawl paginated URLs whose canonical points elsewhere, which leaves these products reachable only through the sitemap. The crawl found 96 pages at depth 4 or more.
- **Cause:** `categoryMetadata` passes `path: category.href` for every page number (`frontend/src/views/catalog/CategoryView.tsx:31`). The blog already does this correctly (`/blog?page=2` has a self-canonical).
- **Fix:**
  - Give `?page=N` (N ≥ 2) a self-referencing canonical (`${category.href}?page=${N}`) and a distinct title, for example `Grilles et diffuseurs · page 2`. Do the same on `/promotions` and `/marques/*`.
  - For `page` greater than `lastPage`, or a value that is not an integer, return `notFound()` (or 308 to the last page) instead of rendering page 1.
  - Optional: raise the listing page size for dense categories, or add sub-category links ("Grilles simples" / "Grilles doubles"), so that each product is at most 3 clicks deep.

## Medium

### M-1. Any query parameter other than `page` makes a category `noindex`, including tracking parameters

- **Evidence:** `/climatisation/mural?utm_source=fb` returns 200 with `<meta name="robots" content="noindex, follow">` and no canonical. The code is `const filtered = Object.keys(searchParams).some((k) => k !== "page")` (`CategoryView.tsx:27`).
- **Why it matters:** links shared on Facebook or Instagram, and Google Ads URLs with `utm_*`, `gclid` or `fbclid`, land on a `noindex` page with no canonical. Their link signals do not consolidate to the clean URL.
- **Fix:** keep a whitelist of the facet and sort keys that trigger `noindex` (`puissance, marque, prix, techno, fluide, couleur, promo, dimension, tri, vue, comparer`) and ignore every other key. Emit the canonical to the clean category URL in every case, including the `noindex` variants.

### M-2. Duplicate title, H1 and description: `/gaines` and `/gaines/gaines-circulaires`

- **Evidence:** both pages have title `Gaines circulaires · Climatisation Maroc`, H1 `Gaines circulaires` and the same fallback description. The API shows the root range's `name` and `h1` are "Gaines circulaires" (`shortName` "Gaines"), and its children are Gaines circulaires, Flexibles souples and Flexibles isolés.
- **Fix:** in the back office, give the root category a name or `seo.title`/`h1` that covers the whole range (to be confirmed with the client, for example "Gaines et flexibles"). Only the child should be called "Gaines circulaires".

### M-3. Meta descriptions: 117 of 176 products and 41 other indexable pages use the generic fallback

- **Evidence:** 117 product pages use the fallback pattern `"{Title} · Climatisation Maroc. Boutique d'Ariha Froid à Marrakech depuis 2008 : climatiseurs…"`. Most of the other 59 products have a 33 to 50 character description generated from data, for example `Gaines circulaires. Référence CLIM00320.` (25 pages are exactly 40 characters). Two pairs are identical: `Mural (mono split) LG, technologie Inverter.` on `/produit/lg-dual-inverter` and `/produit/lg-artcool-smart-inverter`, and `Mural (mono split) Carrier, technologie Inverter.` on `/produit/carrier-mural-inverter-r32` and `/produit/carrier-miroir-inverter-noir-r32`.
- **Non-product pages with the fallback:** `/chauffe-eau`, `/chauffe-eau/solaire`, `/climatisation/{cassette,console-armoire,gainable}`, `/cuivre-et-gaz/*`, `/froid`, `/gaines*`, `/marques` and 14 brand pages (all except `/marques/lg`), `/pieces-de-rechange*`, `/services`, `/ventilation*` and `/plan-du-site`.
- **Fix:** CLAUDE.md forbids inventing copy, so build the descriptions from real catalogue data only:
  - Products: brand, type, BTU range, technology, refrigerant, the "from" price (`à partir de 3 650 Dhs`), free delivery and cash on delivery.
  - Categories: product count, brands, price range.
  - Do this in `ProductController` / `CategoryController` (`seo.description` default). Client-written `seo.description` stays the override.

### M-4. Product titles longer than 60 characters keep the site-name suffix (inverted rule)

- **Evidence:** 10 product titles run from 83 to 91 characters, for example `Ventilateur de Gaine Q100 Plastique Superkool · Ventilateurs de gaine · Climatisation Maroc` (91) and `Flexible Isolé Thermique en Aluminium Q200 10 m · Flexibles isolés · Climatisation Maroc` (88). Shorter titles drop the suffix (`Carrier Mural Inverter R32 · Climatiseurs muraux`).
- **Cause:** `seoMetadata` only drops `· Climatisation Maroc` when the bare title is 60 characters or fewer (`frontend/src/lib/seo/metadata.ts`: `suffixed.length > TITLE_MAX && input.title.length <= TITLE_MAX`).
- **Fix:** drop the suffix whenever the suffixed title is over 60 characters. On products, also drop the category label when the product name alone is already long.

### M-5. A product image file with `%20` in its name returns 404 (page thumbnail and sitemap image)

- **Evidence:** on disk the file is `storage/app/public/products/carrier-miroir-inverter-noir-r32/42QHG024D8S-BM%20-01082025-climatisation-maroc1754045009.png`, plus its `-320/-640/-1200.webp` renditions. Two URLs return 404:
  - the sitemap image `http://localhost:8080/storage/products/carrier-miroir-inverter-noir-r32/42QHG024D8S-BM%20-01082025-climatisation-maroc1754045009.png`
  - the page thumbnail `/storage/products/carrier-miroir-inverter-noir-r32/42QHG024D8S-BM%20-01082025-climatisation-maroc1754045009-320.webp`
  
  The URL decodes `%20` to a space, which does not match the file name. The same URL with `%2520` returns 200. The other 197 sitemap images return 200.
- **Fix:** in `CatalogImporter`, `rawurldecode` downloaded file names and then slugify them (no spaces or `%`). Rename this file and its renditions and update `product_images.path` and `renditions`. As a safety net, `ImageUrl::path()` can `rawurlencode` each path segment.

### M-6. The home page H1 is a promotional banner

- **Evidence:** the H1 on `/` is `Jusqu'à -30 % sur toute la gamme de climatiseurs`. The page's main topic (climatiseurs, chauffe-eau, Ariha Froid in Marrakech, delivery across Morocco) is only in the title.
- **Fix:** make the promotional line a `<p>` or `<h2>` and use a descriptive H1, keeping the design's visual style. If the design must keep that headline, add a visually hidden H1 with the page's topic and record the deviation in `docs/deviations.md`.

### M-7. Thin category and brand pages (structural, needs real copy)

- **Evidence:** count of words in `<main>`: `/froid` 10, `/marques` 15, `/climatisation/console-armoire` 31 (1 product), `/ventilation/multizone` 33 (1 product), `/chauffe-eau/solaire` 39, `/chauffe-eau` 43, `/gaines/flexibles-souples` 44, `/marques/arfro` 56, `/marques/simsek` 57, `/marques/nanyo` 59, `/marques/vivo` 60. `intro` is `null` on most categories (for example `/gaines`).
- **Fix:** this is not a code fix. Ask the client for intros (the category `intro`/`body`, `seo.description` and the brand text fields already exist). Until then, keep single-product categories out of the main menu, or merge them into their parent.

## Low

- **L-1. Case variants return 200 instead of redirecting.** `/CLIMATISATION`, `/Climatisation/Mural`, `/marques/LG` and `/produit/LG-Dual-Inverter` return 200 with a canonical to the lowercase URL. That is correct but wastes crawl budget. Add a 308 to the lowercase path in `resolvePath` or in middleware.
- **L-2. Some internal links point to non-canonical URLs.** 19 links point to 9 `?v=<sku>` product URLs, for example `/produit/flexible-souple-esbo-10-m?v=CLIM00322` (×5 on the home page) and `/produit/lg-dual-inverter?v=D13AJH.N`. The home page also links to the noindexed facet `/climatisation/mural?puissance=12000`. These are canonicalised correctly, but cards and home blocks should link to the clean product URL and let the page select the variant on the client. Facet entry points could use `rel="nofollow"`, as the sidebar facets already do. The relevant `href` builders are in `HomeController.php:132`, `CategoryController.php:236` and `NavigationController.php:123`.
- **L-3. 111 `/demander-un-devis?ref=…` links plus `?pro=1`.** These return 200, are indexable and canonicalise to `/demander-un-devis`, so they are harmless. They are linked from `/cuivre-et-gaz`, `/cuivre-et-gaz/cuivre` and product pages. Mark them `rel="nofollow"` to save crawl budget.
- **L-4. Filtered `/promotions` URLs are indexable but canonicalise to `/promotions`.** Examples: `/promotions?marque=lg`, `/promotions?marque=fitco`, `/promotions?gamme=climatisation%2Fmural`. Their content differs from `/promotions`, so make them `noindex, follow`, as on categories.
- **L-5. robots.txt.** `Host: http://localhost:8080/` is a non-standard directive (Yandex only, and the value should be a hostname). Remove `host` from `frontend/src/app/robots.ts`. The noindexed pages (`/panier`, `/comparer`, `/recherche`, `/connexion`, `/suivi-commande`) are also disallowed, so Google never sees their `noindex`. That is acceptable for private pages, because a disallowed URL only gets indexed without content if it has external links. `/admin/login` (Filament) has no `noindex` and no `X-Robots-Tag`. Add `Disallow: /admin` and `X-Robots-Tag: noindex` on `/admin`, `/api/` and `/livewire*` in nginx.
- **L-6. Sitemap details.**
  - 5 URLs have no `<lastmod>`: `/calculateur-puissance`, `/contact`, `/demander-un-devis`, `/devenir-revendeur` and `/plan-du-site`. Either drop the tag deliberately or use the related page or settings `updated_at`.
  - `/` and `/promotions` take the newest product or category date, which is acceptable.
  - Image entries point to the original PNGs (about 169 KB each on average) while the pages show `-640.webp`. Point them to the 1200 px WebP rendition.
  - nginx does not gzip `application/xml`: add it to `gzip_types`.
  - 129 products have photos in the sitemap and the rest have none. That is expected for products without photos, but worth tracking.
- **L-7. Open Graph.** 194 indexable pages have no `og:image`, including all categories, brands, `/contact` and `/a-propos`. Product `og:image` is the 640 px WebP. Use the 1200 px rendition (1200×630 is recommended), and use a default site image (logo or cover) when there is none.
- **L-8. hreflang.** The site is French only, so none is required. Optionally add a self-referencing `<link rel="alternate" hreflang="fr-MA">` and an `x-default` through `alternates.languages` in `seoMetadata`. If an Arabic or English version is planned, use the `seo-hreflang` skill.
- **L-9. Unpublished legal pages.** `cgv`, `cgu`, `informations-legales`, `confidentialite` and `securite` are unpublished. The old URLs `/home/conditionsgeneralesdevente` and others 302 to `/` (see the redirect table). Redirecting to the home page is a soft 404 for Google. Legal pages are also an expected trust signal on a shop. Publish them when the client supplies the texts. Until then, a 404 or 410 is cleaner than a 302 to `/`.
- **L-10. 404 pages emit two robots meta tags** (`noindex` from Next plus `noindex, follow` from `seoMetadata`). This is harmless because the status is 404.
- **L-11. Images without `width`/`height`.** 43 of 52 images on `/` and the product gallery images have no intrinsic size. Their containers set an aspect ratio (`aspect-[4/3]`, `aspect-square`), so this causes no CLS today. Adding the attributes is still cheap insurance.

---

## Old-site URLs and redirects

Results for 205 old-site URLs: **197 take one 308 hop to a page that returns 200**, with no chains and no 5xx (a few transient dev 500s returned 200 on retry).

| Old URL pattern | Tested | Result |
|---|---|---|
| `/produit/details/{id}/{name}`, e.g. `/produit/details/105/x` | 170 (all `legacy_id`) | All 308 to the product page with 200. 73 targets carry `?v=<sku>`, e.g. `/produit/lg-gainable-inverter?v=ABNW36GM2S1.ENWBME`, and that page's canonical is the clean URL. The 170 IDs map to 113 product families. Unknown ID `/produit/details/99999/x` returns 404. |
| `/produit/service/{id}/{range}/{name}`, e.g. `/produit/service/3/Climatisation/Mono%20Split` | 18 | All 308 to 200: 3 to `/climatisation/mural`, 4 to `/gainable`, 5 to `/cassette`, 7 to `/console-armoire`, 10 to `/chauffe-eau/solaire`, 12 to `/froid`, 13 to `/pieces-de-rechange`, 14 to `/ventilation`, 15 to `/gaines`, 25 to `/cuivre-et-gaz/cuivre`, 26 to `/cuivre-et-gaz/gaz-frigorifique`, 27 to `/ventilation/grilles-et-diffuseurs`. Unknown IDs fall back to the range in the URL (`/climatisation`, `/chauffe-eau`, `/pieces-de-rechange`). **8, 9 and 11 go to the empty `/chauffe-eau/gaz`, `/electrique` and `/chaudiere` (H-1), and 12 goes to the empty `/froid` (H-2).** Old equity therefore lands on soft-404 pages: while those categories are empty, send these IDs to `/chauffe-eau` (back-office `Redirections` row, 301). |
| `/home/devis`, `/home/contact`, `/home/revendeur`, `/home/index` | 4 | 308 to `/demander-un-devis`, `/contact`, `/devenir-revendeur` and `/`, all 200 |
| `/home/` (trailing slash) | 1 | **2-hop chain:** 308 to `/home`, then 308 to `/`. Low priority. Map `/home/` directly to `/` (handle the trailing slash before the legacy lookup, or add a redirect row). |
| `/home/conditionsgeneralesdevente`, `…dutilisation`, `/home/informationslegales`, `/home/politiqueconfidentialite`, `/home/securite` | 5 | **307 to `/`**, because the target pages are unpublished (L-9). Google treats a redirect to the home page as a soft 404. It is acceptable short-term because it is temporary, but publish the legal pages before launch. |
| `/produit/cuivre`, `/gaz`, `/grille`, `/panier`, `/promotions` | 5 | 308 to the matching new page, 200 |
| `/produit/marque/{id}/{name}` | 4 | 308 to `/marques/lg`, `/marques/carrier`, `/marques/ciat`. An unknown brand returns 404. |
| `/home/apropos` | 1 | 404. I guessed this URL; it is not in `config/legacy_urls.php`. If the old site had an "à propos" page, add `apropos` and the old slug, mapped to `/a-propos`. |

Before launch, compare this mapping with the old site's real URL list (Search Console "Pages" export or server logs). After launch, watch the `Redirections` hit counter and the 404 log for patterns that are not covered.

Other redirect checks:

| URL | Result |
|---|---|
| `/climatisation/` and `/produit/lg-dual-inverter/` | 308 to the path without the slash (one hop) |
| `/commande` | 307 to `/panier` (empty cart, temporary is correct) |
| `/espace-professionnel/commande-rapide` | 307 to `/connexion?suite=…` (linked from `/plan-du-site`; that link should only show to logged-in resellers or be `nofollow`) |
| `/produit`, `/devis`, `/index.php`, `/produit/details/99999/x`, `/home/xyz`, `/marques/inconnue`, `/blog/categorie/xyz`, `/a/b/c/d` | 404 with `noindex` |
| `/produit/lg-dual-inverter?v=NOPE` | 200, canonical to the clean URL (acceptable) |

No redirect chains or loops were found. Every 308 lands directly on a page that returns 200.

## Indexability matrix (what passed)

| Page type | Robots | Canonical | Verdict |
|---|---|---|---|
| Home, ranges, categories, products, brands, blog, services, solutions, static pages | index | self (absolute) | OK |
| Category facets and sort (`?puissance=`, `?marque=`, `?tri=`, `?vue=`, `?comparer=`) | `noindex, follow` plus `rel="nofollow"` on facet links | none | OK (see M-1 for tracking parameters) |
| `?page=N` on listings | index | page 1 | Wrong (H-3) |
| `/blog?page=N` | index | self | OK (but `/blog?page=2` is empty: return 404 past the last page) |
| `/panier`, `/comparer`, `/recherche`, `/connexion`, `/connexion/mot-de-passe-oublie`, `/suivi-commande` | `noindex, follow` and disallowed | none | OK |
| `/styleguide` | `noindex, nofollow` | none | OK (not linked; consider returning 404 in production) |
| `?v=<sku>` product variants, `/demander-un-devis?ref=` | index | clean URL | OK |

## Sitemap quality summary

- 238 URLs, no duplicates, all returning 200, all indexable, all with a self-canonical. The only exception is H-2 (`/froid` is indexable but empty).
- No unpublished or empty category appears in it except `/froid` (quote-only).
- 233 of 238 URLs have `lastmod`. There are 198 image entries, and 1 of them returns 404 (M-5).
- Crawlable pages missing from the sitemap: `/chauffe-eau/chaudiere`, `/chauffe-eau/electrique` and `/chauffe-eau/gaz`. Leaving them out is correct while they are empty; fix the navigation instead (H-1).
- No orphan sitemap URL: every sitemap URL has at least one internal link. However, 33 products depend on a single link from a paginated page (H-3), and `/produit/multizone` is only linked from `/ventilation/multizone`.

## Dev-only artefacts (ignored in scoring)

- The Next dev server returned 500 and 502 errors under crawl load. The logs show `SyntaxError: Unexpected end of JSON input`, `Manifest file is empty` and `Failed to generate static paths` while webpack recompiled. All of these pages returned 200 on retry. Response times were 0.3 to 31 s, which is the dev compile time. Re-test status codes and timings on a production build (`next build && next start`).
- Unminified `webpack.js` chunks and `Cache-Control: no-cache, must-revalidate` on HTML. The home HTML is 334 KB raw (32 KB gzipped for a category page), mostly the inline RSC payload. Check this again on a production build.
- `vary: rsc, next-router-state-tree…` headers and HMR traffic.

## Production-only concerns (verify at go-live)

1. **HTTPS and host canonicalisation.** `NEXT_PUBLIC_SITE_URL`/`APP_URL` must be `https://climatisationmaroc.com` at build time (`docker-compose.prod.yml:78`). All canonicals, `og:url`, sitemap `<loc>` and the robots `Sitemap:` line currently print `http://localhost:8080`. The TLS terminator must 301 `http://` to `https://` and `www.` to the apex (or the reverse), in one hop. Old-site URLs on `http://` should still reach their new page in at most two hops.
2. **Absolute redirect `Location`.** The legacy 308s answer `Location: http://localhost:8080/…`, built from the configured site URL and not from the request `Host`. Confirm that production redirects say `https://climatisationmaroc.com/…`, not `http://`.
3. **Security headers.** These are absent today and `docker/nginx/default.conf` is also the production image's config. Add `Strict-Transport-Security` (at the TLS terminator), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN` (or CSP `frame-ancestors 'self'`) and a basic `Content-Security-Policy`.
4. **Search Console.** After launch, submit `https://climatisationmaroc.com/sitemap.xml`. Watch the Page indexing report for "Soft 404" (H-1, H-2) and "Alternate page with proper canonical" (H-3). Track the hit counter in the back office `Redirections` for old URLs that miss.
5. **`/styleguide`.** It is `noindex, nofollow` but publicly reachable. Return 404 in production builds.

## Fix order

1. H-1 and H-2: navigation and indexing rules for empty and quote-only categories (backend nav plus `categoryMetadata`).
2. H-3: pagination canonicals, titles and the out-of-range 404.
3. M-1: whitelist the facet parameters and always emit the canonical.
4. M-4 and M-3: title-length rule and data-driven default descriptions.
5. M-5: rename the image file and make the importer sanitise file names.
6. M-2, M-6 and M-7: content and back-office work with the client.
7. Low items, then the production checklist before DNS cut-over.
