# Performance and Core Web Vitals audit

Date: 2026-10-07. Scope: front office at http://localhost:8080 (Next.js 16.3.8 behind nginx, Laravel API).
Pages: `/`, `/climatisation`, `/climatisation/mural`, `/produit/lg-dual-inverter`, `/cuivre-et-gaz`, `/blog`, `/panier`.

## Method and caveats

- **Dev server (live stack).** I used curl to measure TTFB, HTML size, compression and headers, then
  read the server-rendered HTML for images, preloads, `loading` and `fetchpriority` attributes, DOM size
  and the inline RSC payload. I also timed the API endpoints, both cache HIT and cache MISS.
- **Production build (lab).** The Lighthouse 12.8.2 JSON reports from the local production check
  (`next build && next start` on :3100, see `next.config.ts`) were run on 2026-10-06 with simulated
  mobile and desktop throttling. They cover `/`, `/climatisation/mural`, `/produit/lg-dual-inverter`,
  `/panier` and one blog article. The code has changed little since then. Their numbers stand in for
  production. I did not run Lighthouse 13 on a fresh production build.
- **No field data.** localhost has no CrUX data, so every value here is lab data. Google rates the
  75th percentile of real visits. Set up RUM (see H3) before the site goes live.
- **Dev-only distortions.** Do not act on these. They are listed at the end.

## Summary

| Metric (lab, production build) | Mobile (simulated Moto G, slow 4G) | Desktop | Status |
|---|---|---|---|
| Performance score | 90 (home) · 94 (listing, product) · 96 (cart, article) | 99–100 | Good |
| LCP | 2.7–3.6 s (home 3.6 s, product 3.2 s, listing 3.1 s, cart 2.7 s) | 0.6–0.9 s | Mobile: needs improvement (lab, see H3) |
| CLS | 0 on every page | 0 | Pass |
| TBT (lab proxy for INP) | 30–90 ms | 0 ms | Pass (lab). INP needs field data |
| FCP | ~0.9 s | 0.2–0.3 s | Good |
| Transfer per page (mobile) | home 736 KiB · product 401 · listing 379 · article 277 · cart 245 | home 765 KiB | OK |

What drives the mobile LCP: on every page the main cost is **render delay** (2.2 to 3.0 s). TTFB is
about 450 ms in the simulation and the LCP image loads in under 200 ms. Measured without throttling,
FCP equals LCP: 154 to 362 ms. Part of the render delay is a Lantern simulation artifact (see H3).
The home page also does real work: 2.2 s of main-thread time and about 390 KiB of image savings
(see H2).

No Critical issue was found. LCP images are discovered early, preloaded and fetched with high
priority. No above-the-fold image is lazy-loaded. Lab CLS is 0. Static assets are gzipped. API
responses come back in 50–125 ms.

---

## Critical

None.

---

## High

### H1. Brand logos are large PNGs (about 420 KB on the home page); on the product page the logo preload competes with the LCP image

Evidence:
- On `/`, all 9 logos come from `/storage/brands/*.png`: alpha 26.7 KB, arfro 53.8 KB, carrier
  55.5 KB, ciat 48.9 KB, fitco 16.7 KB, gs 30.8 KB, lafarga 59.9 KB, lg 56.3 KB, simsek 72.6 KB.
  That is about **421 KB**. The files are 110–520 px wide by 112–160 px tall. They display at about
  72–108 x 32–48 CSS px (inline `--mw/--mh/--dw/--dh`).
- On `/produit/lg-dual-inverter`, the buy-box logo `<img src="/storage/brands/lg.png" width="66"
  height="32">` (`components/product/ProductBuyBox.tsx`) has no `loading` attribute. React 19 therefore
  emits `<link rel="preload" as="image" href="/storage/brands/lg.png">` for it. In the Lighthouse
  network log it downloads (55.3 KB) at the same time as the LCP image (23.5 KB). Lighthouse
  `image-delivery-insight` estimates 56 KB of savings on this single file. `modern-image-formats`
  flags only this image.
- `/climatisation` loads 4 of the same PNGs.

Fix:
- Generate WebP renditions of brand logos in the same pipeline as product images (Laravel
  `ImageUrl` / importer). Size them at 2x the largest display height, about 96 px tall. Expect
  2–6 KB each, about 30–40 KB in total instead of 421 KB. Alternatively use SVG where the brand
  provides one.
- Add `fetchPriority="low"` to the buy-box logo, or `loading="lazy"` if it sits below the gallery on
  mobile. Either change stops React from auto-preloading it ahead of the gallery image.
- Use versioned file names for the logos (see M2) so they can be cached as immutable.

Expected impact: about 380 KB less on the home page, about 50 KB less on product and
category pages, and the LCP image gets the bandwidth to itself on product pages (mobile LCP gain
about 100–300 ms on real 4G).

### H2. Home page: heavy decorative images and costly CSS effects (mobile LCP 3.6 s, 2.2 s of main-thread work)

Evidence (Lighthouse, mobile, home):
- `image-delivery-insight`: about **392 KiB** of savings. `uses-responsive-images`: about 240 KiB.
  - `/design/solutions-category-1280.webp` is **144 KB** and Lighthouse estimates 138 KB wasted. With
    `sizes="(max-width: 759px) 100vw, 40vw"`, a 412 px phone at DPR 1.75 picks the 1280w rendition.
    The image appears much smaller in the layout (masked with a gradient).
  - Category cut-outs at 480w: `cuivre-cut2` 49.5 KB, `chauffe-eau` 45.4 KB, `gaines-cut` 36 KB. All
    are flagged as poorly compressed: estimated savings 47, 43 and 34 KB.
  - LCP hero `cover-ariha-1280.webp` is 72.6 KB, with 45 KB of estimated compression savings.
- `mainthread-work-breakdown` totals 2.2 s: "Other" 1.14 s, script evaluation 0.44 s, style and layout
  0.32 s, rendering 0.24 s. The product pages total 0.8 s. The difference comes from home-only
  effects: `drop-shadow-[0_14px_18px_…]` filters on 6 cut-out images, `mask-image` gradients, and
  `mix-blend-multiply` on every product card image. Each one forces offscreen compositing or a
  filter pass.
- LCP render delay is 2,993 ms on mobile (the LCP image itself loads in 83 ms).

Fix:
1. Re-encode the design WebP renditions at quality 70–75 (`scripts/sync-design-assets.mjs`) and
   add AVIF where the script allows. Hero target: 40–50 KB at 1280w.
2. Add 320w/480w renditions of `solutions-category`. Set `sizes` to the real slot width, for example
   `(max-width: 759px) 92vw, 40vw` only if the image really fills the screen on mobile. Otherwise
   use the measured width.
3. Bake the drop shadow into the cut-out WebP (render it once in the asset script), or replace
   `filter: drop-shadow` with a cheap pseudo-element shadow. `filter` on large images is expensive
   on low-end Android.
4. `mix-blend-multiply` only serves to hide off-white backgrounds in product photos. Trim the
   backgrounds to transparent or pure white during the rendition step, then drop the blend mode.

Expected impact: about 300–400 KB less on the home page and less style/paint work, so lower LCP render delay
and less INP risk on low-end devices. Home mobile LCP should move toward 2.5–3.0 s in the lab.

### H3. A 2.7 s mobile LCP floor on every page: part simulation artifact, part client JS weight; validate with field data

Evidence:
- `/panier` (text LCP, no images) and the blog article (H1 LCP) both reach a simulated LCP of
  2.7 s with a render delay of 2.2–2.3 s. Measured without throttling, FCP = LCP = 154–174 ms.
  Locally, the first paint happens after all scripts have finished loading (observed load 96–99 ms
  < LCP). Lantern then assumes that LCP depends on every script requested before it, which inflates
  the simulated value.
- The dependency is still real: every page ships **8 JS chunks, about 151–154 KiB gzipped and
  about 610 KiB uncompressed** (main chunks 223.8 KB and 162.1 KB raw). The repo has 40 `"use client"`
  components. Lighthouse also reports `unused-javascript` (26 KiB) and `legacy-javascript`
  (13.8 KiB in the main chunk: `Array.prototype.at` and similar polyfills) on every page.

Fix:
1. Measure for real. Run Lighthouse with `--throttling-method=devtools`, or WebPageTest
  (Moto G4, 4G) against the production build. Before launch, add RUM: `useReportWebVitals` from
  `next/web-vitals` posting LCP/INP/CLS with attribution to an endpoint, or GA4. Once traffic exists,
  check CrUX Vis / the CrUX API, which includes LCP subparts.
2. Cut client JS. Run `next experimental-analyze` (Turbopack) and check what goes into the two large
  chunks. Typical wins in this codebase:
   - Keep the header mega-menu markup server-rendered and make only the open/close toggle a small
     client island.
   - Lazy-load drawer, compare bar, PowerFinder and cart-drawer code with `next/dynamic` when the
     user interacts.
3. Drop legacy polyfills by setting a modern `browserslist` in `package.json`, for example
   `"defaults and fully supports es6-module"`, or the Next default modern targets.

Expected impact: in the field, mobile LCP probably passes already on good networks. Cutting JS
by 30–50 KiB gz lowers hydration cost, which helps INP and simulated LCP.

---

## Medium

### M1. Product images are oversized for their slots; gallery thumbnails have no dimensions

Evidence:
- Product cards (home, listing, category) use `sizes="(max-width: 759px) 80vw, 300px"`, so mobile
  downloads the 640w rendition (9–24 KB). Lighthouse measures a display size of about 470x470 device px or less and flags
  15–21 KB of waste per card. On a 2-column mobile grid the card is about 45vw, not 80vw.
- The product-page gallery thumbnails load `-320.webp` (12 KB each, 4 thumbnails) into buttons about
  60–80 px wide. Lighthouse flags about 10 KB of waste each. They also have **no `width`/`height`**
  (`unsized-images`, 6 nodes on the product page, including the LCP image). The "Kit d'installation"
  images (`support-gt`, `kit-duo-…`) are also 320w with no dimensions.
- `/cuivre-et-gaz`: all 23 `<img>` tags lack width/height. They are `320.webp` inside fixed frames.
  `/climatisation/mural`: all 10 card images lack width/height.

Fix:
- Fix `sizes` on `ProductVisual`/`ProductCard` to the real grid:
  `(max-width: 759px) 45vw, (max-width: 1099px) 30vw, 300px`.
- Add a 160w rendition in the Laravel image pipeline for thumbnails and mini-cards, and serve it to
  gallery thumbnails with `srcSet`/`sizes="80px"`.
- Emit `width`/`height` from the API. Renditions are square, so `width={640} height={640}` or an
  `aspect-square` frame is enough.

CLS risk is currently low because the images sit in fixed-height frames (`h-full max-h-full`), and
lab CLS is 0. Intrinsic dimensions protect against regressions, for example a frame that loses its
height on one breakpoint.

### M2. `/storage` caching: duplicate Cache-Control, 30 days and not immutable

Evidence (`/storage/products/lg-dual-inverter/20260727170259-640.webp`):
```
Expires: Fri, 06 Nov 2026 …
Cache-Control: max-age=2592000
Cache-Control: public, max-age=2592000
ETag: "6ac55650-5cbc"
```
In `docker/nginx/*.conf` the `/storage/` location sets both `expires 30d` and
`add_header Cache-Control …`, so two headers are sent. Rendition file names already contain a
timestamp, so they never change in place. Lighthouse `uses-long-cache-ttl` flags 4–8 resources per
page. By contrast `/design/*` correctly sends `public, max-age=31536000, immutable` and
`/_next/static/media/*.woff2` is immutable.

Fix: in the `/storage/` location keep a single header:
`add_header Cache-Control "public, max-age=31536000, immutable";` and remove `expires`. For
`/storage/brands/*` (logo names are not versioned), either version them (H1) or keep a shorter
`max-age=604800` with ETag revalidation.

### M3. Link prefetch fans out 8–26 RSC requests per page view, each one a dynamic server render

Evidence (Lighthouse network log, production build):
- Home mobile: 8 `?_rsc=` fetches. Home desktop: **26**. Product page: 12. Listing: 15. The same
  routes are often fetched twice under different `_rsc` hashes (`/promotions`, `/panier`,
  `/climatisation/mural?puissance=12000`).
- The root layout calls `await connection()`, so every route is dynamic and each prefetch runs
  server code (navigation, cart count, reseller lookup, API calls).

Fix: set `prefetch={false}` on links in the mega-menu, footer and secondary blocks. Keep the default
on primary CTAs and the first row of product cards. Hover/intent prefetch still gives fast navigation.
This cuts origin load a lot under real traffic (and under crawlers).

### M4. Every page is rendered per request: no static shell and no CDN-cacheable HTML

Evidence: `src/app/layout.tsx` calls `await connection()`, and the comment explains this is so the
cart cookie and reseller prices can be read. Production TTFB was 20–50 ms locally. During this audit,
with a concurrent crawl hitting the dev stack, `next` logs show `application-code: 2.5–5.0 s` per
product render. The next container sat at 65% CPU and 5.4 GB. That is a dev distortion, but it shows
the whole HTML depends on server capacity.

Fix (when time allows):
- Move the per-user parts into small dynamic islands under `<Suspense>`: cart count, reseller
  price badge, account menu.
- Turn on Cache Components / PPR, so the catalogue shell is static and revalidated by the existing
  tag-based `/api/revalidate`. Public prices stay server-computed. Reseller prices remain in the
  dynamic hole, which matches the "prices are computed on the server" rule.

Expected impact: TTFB under 100 ms from cache under load, and a good margin for the 75th percentile
TTFB in Morocco on mobile networks.

### M5. API cache keys accept any query parameter (unbounded cache keys)

Evidence: `ApiCache::key()` hashes the full query string. `/api/v1/categories/climatisation/mural/products?sort=price_asc&r=8514`
returns `X-Api-Cache: MISS` (90 ms) and stores a new Redis entry. A random `?r=` on every request
bypasses the cache and fills Redis. Timings otherwise:

| Endpoint | gzip / raw | HIT TTFB | MISS TTFB |
|---|---|---|---|
| `/api/v1/navigation` | 2.6 KB / 8.6 KB | 60 ms | n/a |
| `/api/v1/home` | 4.7 KB / 31.7 KB | 59–63 ms | n/a |
| `/api/v1/categories/climatisation/mural/products` | 3.2 KB / 27.6 KB | 53 ms | 114–155 ms |
| `/api/v1/products/lg-dual-inverter` | 2.8 KB / 14.9 KB | 74 ms | 122 ms |
| `/api/v1/search?q=lg` | 2.1 KB / 13.5 KB | 86 ms | 104–284 ms |

Fix: build the key only from the parameters each route actually accepts (filters, sort, page, q),
dropping unknown ones. Cap `q` length. Pair this with the existing `throttle:api-read`.

### M6. Both Figtree subsets (latin and latin-ext) are preloaded at High priority

Evidence: every page preloads two woff2 files at High priority, 10.3 KB and 20.0 KB, both before the
LCP image. `layout.tsx` declares `subsets: ["latin", "latin-ext"]`. French text, including œ/Œ, is
covered by the Google "latin" subset. `font-display: swap` and next/font's metric-adjusted fallback
are in place (`font-display` audits pass, CLS 0).

Fix: use `subsets: ["latin"]`, or keep latin-ext with `preload: false` on a second font instance.
Figtree is a variable font, so the `weight` array can be removed (one file serves 400–800).
Saving: about 20 KB of high-priority bandwidth in the critical path.

---

## Low

### L1. Compression: no Brotli, gzip level 1, some types missing
- `gzip on` with the default `gzip_comp_level 1`. No Brotli: a request with only `Accept-Encoding: br`
  received the home HTML uncompressed (334 KB).
- `gzip_types` lacks `application/xml` (`/sitemap.xml`, 58 KB, is served uncompressed),
  `text/xml` and `application/manifest+json`.
- HTML is gzipped well: home 303 KB becomes 47 KB, listing 212 KB becomes 32 KB, product 167 KB
  becomes 31 KB. The API compresses 6–7x.

Fix: `gzip_comp_level 5; gzip_proxied any; gzip_vary on;` and add `application/xml text/xml`. Add
the `ngx_brotli` module (or terminate at a CDN with Brotli). Brotli saves another 15–20% on HTML/JS/JSON.
In production, set `compress: false` in `next.config.ts` so compression is not done twice when nginx
compresses.

### L2. HTML weight: the RSC payload roughly doubles the document
Production home document: 265 KB raw (40 KB transferred), product 148 KB, listing about 130 KB. In
dev, the inline `self.__next_f` flight data is 190 KB (home), 133 KB (listing) and 109 KB (product).
It repeats the full navigation tree (about 320 `href`s) and card props such as `sku`, `price`,
`image` and `style`. Fix: pass only the fields client components need, and keep navigation markup in
server components so it is not serialised (see H3). Small gain in parse time and transfer.

### L3. favicon.ico is 25 KB and served with `no-cache`
It is requested at High priority on every cold load. Use a 16/32 px ICO (about 1–5 KB) plus an SVG
icon. Next serves `app/favicon.ico` with a hashed query (`?favicon.…`), so it can be cached long.

### L4. Original design masters are shipped in `public/design` (27 MB)
68 files, including PNG masters up to 2.8 MB (`solutions-category.png`, `cover-ariha.png`). Pages only
reference the WebP renditions, but the masters are in the image and publicly reachable. Move them out
of `public/` (keep only the renditions). Also, `?v=<mtime>` versioning (`lib/design-assets.ts`) changes
whenever a build updates file mtimes, which invalidates the year-long cache on every deploy. A
content hash would avoid that.

### L5. API responses: `Cache-Control: no-cache, private`, no ETag
The API is called only from the Next server (`lib/api.ts`, `server-only`) and cached there (fetch
tags, `revalidate: 300`) and in Redis, so browsers are unaffected today. If a client-side call is ever
added (for example search-as-you-type), send `ETag` and `public, max-age=60,
stale-while-revalidate=300` for anonymous GETs.

### L6. INP: no lab problems, but watch the interactive widgets
TBT is 30–90 ms on mobile and no long tasks are reported. DOM size is 206–778 elements on the
production build (dev count: home about 830, `/cuivre-et-gaz` about 730), all well under 1,500. Risky
handlers to watch in field data: the mega-menu open, variant switches on the product page (gallery +
price + sticky bar re-render), listing filters, and adding to the cart. Keep each handler's synchronous work
under 50 ms, and update the URL or analytics after paint (`requestAnimationFrame` / `startTransition`).

---

## What is already done well

- Home hero: `<img>` with `srcSet`, `sizes="100vw"`, `width/height`, `loading="eager"`,
  `fetchPriority="high"`, plus `<link rel="preload" as="image" imageSrcSet … fetchPriority="high">`.
  `lcp-discovery-insight`, `prioritize-lcp-image` and `lcp-lazy-loaded` all pass.
- Product page: the main gallery image is preloaded with `fetchPriority="high"`. It is the LCP
  element on mobile and desktop.
- Everything below the fold is `loading="lazy"` with `decoding="async"`. 38 of 39 images on the home
  page are lazy, and no above-the-fold image is lazy.
- All catalogue images are WebP renditions (320/640/1200w). `/design` photos have
  `immutable` one-year caching. Fonts are self-hosted by next/font (immutable, `swap`, metric
  fallback).
- Only one render-blocking stylesheet (14 KB gz, about 150 ms estimated). No third-party scripts.
- Two API cache layers (Next data cache with tag revalidation, plus Redis) and fast API responses.

## Dev-only distortions (do not optimise these)

| Observation on the dev stack | Why it does not reflect production |
|---|---|
| TTFB 0.35 s to 30 s for the same page (`/climatisation`: 30.2 s, 24.8 s, then 2.7 s) | `next dev --webpack` compiles on demand, watches with polling (1.5 s), and a concurrent crawl kept the `next` container at about 65% CPU and 5.4 GB |
| `main-app.js` is 13.2 MB raw / 3.1 MB gzip; dev also loads `polyfills.js` (113 KB) and `webpack.js` (143 KB) | Unminified dev bundle with HMR runtime. Production ships 8 chunks, about 152 KiB gz |
| `/_next/static/*` served with `Cache-Control: no-cache, must-revalidate` | Production `next start` serves hashed chunks as `public, max-age=31536000, immutable` |
| Inline flight data 190 KB on home; document 303 KB raw | Includes dev-only debug info; production home document is 265 KB raw |
| CSS `layout.css` 100 KB raw / 16 KB gz | Production CSS is 73.5 KB raw / 14.2 KB gz |

## Suggested order of work

1. H1: brand logo WebP renditions and fix the buy-box logo preload (quick, large byte saving).
2. H2: re-encode design renditions, correct `sizes`, remove costly filters on the home page.
3. M1 + M2: card/thumbnail `sizes` and 160w rendition, nginx immutable caching for `/storage`.
4. M6 + L1 + L3: font subset, compression settings, favicon (config-only changes).
5. H3: set up RUM and the bundle analysis, then trim client JS. M3: limit prefetch.
6. M4: static shell / PPR, and M5: API cache key whitelist, before launch traffic.
