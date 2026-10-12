# Architecture

Climatisation Maroc is the online store of Ariha Froid (Marrakech): French only (`fr-MA`), prices
in Dhs, cash on delivery. The same code also serves a second storefront, Arfro (arfro.com): see
« Multi-site » below. The plan and the decisions behind it are in `docs/plan.md`; deliberate
differences from the design files are in `docs/deviations.md`.

## Monorepo

| Path | Contents |
|---|---|
| `backend/` | Laravel 13: REST API under `/api/v1`, Filament 5 back office at `/admin` (French), Sanctum, queues, mail |
| `frontend/` | Next.js 16 App Router (TypeScript, Tailwind 4): every page server-rendered |
| `docker/` | Dockerfiles (php-fpm, nginx, next), nginx config, MySQL init script, entrypoint |
| `design/` | Claude Design export: the UI source of truth (not shipped) |
| `data/catalog.json` | catalogue snapshot of the old site: seed and price authority |
| `docs/` | plan, design inventory, deviations, these guides |

```
browser ──► nginx :80 (climatisationmaroc.com, arfro.com)
              ├─ /api/v1, /admin, /livewire*, /sanctum, /filament, /up ─► php-fpm (Laravel), any host
              ├─ /storage/…  ─► files of storage/app/public (served by nginx), any host
              └─ everything else, by Host:
                   arfro.com ─► next-arfro :3000 (SITE_KEY=arfro) ─┐
                   any other ─► next :3000       (SITE_KEY=cm)    ─┴(server side, X-Site)─► nginx /api/v1 ─► Laravel
Laravel ─► MySQL 8, Redis (cache, queue, sessions) ; queue worker and scheduler containers
Laravel ──(after back-office changes)──► /api/revalidate of each Next.js instance
```

## Backend

- **API domains.** `routes/api.php` declares `/health`, `/resolve` and `/cities`, then loads one
  route file per domain from `routes/api/`: `catalog` (navigation, categories and listings,
  promotions, search), `products` (product page, compare, brands), `commerce` (basket quote,
  orders, tracking), `leads` (forms, reseller application, auth, pro space), `home` (home page,
  power calculator, blog), `content` (sectors, services, pages, cities, site map), `seo` (sitemap
  data, old-site redirects). Controllers live in `app/Http/Controllers/Api/<Domain>/`, shared logic
  in `app/Support/`.
- **Money** is stored in integer centimes. A product is a family (`Product`) with variants
  (`ProductVariant`: SKU, power, colour, `price`, `promo_price`, `pro_price`, stock).
- **Prices for the audience.** `App\Support\Api\Audience` reads the Sanctum token forwarded by
  the Next.js server. A validated reseller gets `pro_price` where set (never above the public
  selling price); everyone else gets the public price. Prices are always computed on the server,
  including the basket and the order (`CartPricer`, `OrderPlacer`).
- **Rate limits** (`AppServiceProvider`): `api-read` for public GET routes (requests from the
  private Docker network, i.e. the Next.js server, are not limited); `api-form` for form posts:
  5 per minute per visitor IP, per phone number and per login.
- **Form guard.** Every public form sends a honeypot field `website` (must stay empty) and `_t`,
  the **milliseconds** the form was open (must be ≥ 3000). Bot-like lead posts get a normal
  success answer and are dropped (`App\Support\Leads\FormGuard`); a refused order returns a
  visible 422, so a customer never believes a rejected order went through.
- **Images.** `catalog:download-images` stores the old site's photos on the `public` disk and
  generates WebP renditions (320/640/1200, `App\Support\Images\ImageRenditions`); uploads from the
  back office get the same renditions. The API returns site-relative `/storage/…` URLs. The disk
  is set by `FILESYSTEM_DISK` (S3 drops in through env).
- **Back office.** Filament resources in `app/Filament/` (French), roles with
  spatie/laravel-permission (`admin`, `gestionnaire`, `revendeur`), settings with
  spatie/laravel-settings (`GeneralSettings`, `HomeSettings`).
- **Mail** is queued on Redis (order, lead, reseller decision and password reset mails) and caught
  by Mailpit in development.

## Frontend

- **Rendering.** The root layout calls `connection()`: every page renders per request (it reads
  the cart cookie, a reseller's prices and API data), nothing is prerendered at build time.
- **Data.** `src/lib/api.ts` (`apiGet`) calls Laravel over the internal network
  (`API_INTERNAL_URL`, nginx). Public responses use Next's fetch cache (5 minutes) with the tag
  `api` plus specific tags; a request carrying a reseller token is never cached.
- **Routing.** Fixed routes first (`/produit/[slug]`, `/marques`, `/blog`, `/panier`…). One- and
  two-segment paths (`/climatisation`, `/climatisation/mural`, `/a-propos`, `/cgv`,
  `/climatisation-marrakech`) go through `GET /api/v1/resolve`, which answers category, published
  page, published city page, redirect or none (404). Old-site URL patterns
  (`/produit/details/…`, `/produit/service/…`, `/home/…`) have catch-all routes that redirect.
- **Backend-for-frontend.** The browser only talks to Next.js. Route handlers under
  `src/app/api/` proxy forms (`/api/forms/*`), the basket quote and orders (`/api/cart`,
  `/api/orders`), reseller auth (`/api/auth/*`, the Sanctum token kept in the httpOnly `cm_token`
  cookie) and the quick order (`/api/pro/*`); they forward the visitor's IP in `X-Forwarded-For`.
- **Basket.** The `cm_cart` cookie holds `[{sku, qty}]` only (no prices); `cm_visit` the technical
  visit option. The basket and checkout pages re-quote through the API on every change.
- **Compare.** Up to three variant SKUs in `localStorage` (`src/lib/compare.ts`) and in the URL
  (`/comparer?p=SKU,SKU,SKU`).
- **Design assets.** The owner's photos are committed as WebP renditions in `public/design/`
  (`manifest.json`), built by hand from `design/uploads/` with `npm run sync-assets`;
  `src/lib/design-assets.ts` uses a photo only when it is in the manifest. Logo:
  `public/logo-arfro.svg`.

## Multi-site

One database, one API, one back office and one queue serve two storefronts. Decisions:
`docs/plan.md` §0, « Multi-site (2026-10-12) ».

| Key | Site | Next.js service | Production URL | Dev URL | Order prefix |
|---|---|---|---|---|---|
| `cm` (default) | Climatisation Maroc | `next` | https://climatisationmaroc.com | http://localhost:8080 | `CM-` |
| `arfro` | Arfro | `next-arfro` | https://arfro.com | http://arfro.localhost:8080 | `AR-` |

- **Config.** `backend/config/sites.php` lists the sites (name, public URL, internal Next.js URL,
  order prefix, e-mail sender name; env `SITE_CM_*`, `SITE_ARFRO_*`).
  `App\Support\Sites\Sites` gives the list (`Sites::all()`) and the current site.
- **Two Next.js instances, one image.** nginx picks the instance by `Host` (`map $host` in
  `docker/nginx/default.conf`: `arfro.com`, `www.arfro.com`, `arfro.localhost` and any
  `arfro.*` host go to `next-arfro`, every other host to `next`). Each instance knows its site from
  `SITE_KEY` and its public URL from `SITE_URL` (canonical links, sitemap, robots), read at run
  time, so one build serves both. Laravel routes (`/api/v1`, `/admin`…) answer on both domains.
- **Site of a request.** The Next.js server sends `X-Site: <key>` on every API call;
  `App\Http\Middleware\ResolveSite` sets the current site (missing or unknown header = `cm`).
  Console commands and the back office use the default site; queued mails run as the site stored
  on the order or lead (`Sites::runAs()`).
- **Visibility.** Content models use `App\Models\Concerns\HasSites`: a `sites` JSON list (the
  sites a row appears on; empty = nowhere) and `site_content` (per-site texts replacing a field,
  plus `seo_title`, `seo_description`, `seo_h1`, so the two sites do not publish duplicate copy).
  Every public query is scoped with `visibleOn()`. Editorial slugs are unique per site.
- **Settings.** Each site has its own settings groups: `GeneralSettings` / `HomeSettings` for
  Climatisation Maroc, `ArfroGeneralSettings` / `ArfroHomeSettings` (groups `general_arfro`,
  `home_arfro`) for Arfro; injecting the base class gives the current site's values
  (`App\Support\Sites\SiteSettings`).
- **Orders, leads, resellers** record their `site`; order references are numbered per prefix
  (`CM-2026-00001`, `AR-2026-00001`). Prices and reseller accounts are shared by both sites.
- **Back office.** One panel for both sites. A user's `sites` limits the orders, leads, resellers
  and content they manage (empty = all; administrators always manage all).
- **Sessions and CORS.** The browser only talks to its own domain (Next.js BFF, Laravel behind the
  same nginx), so no cross-site setting lists the domains: the back-office session cookie is
  host-only (`SESSION_DOMAIN` empty, one login per domain), Sanctum uses bearer tokens (no
  stateful SPA domains), and CORS is never needed.

## Caching and revalidation

Two caches hold public data:

1. **Laravel API response cache** (`App\Support\Api\ApiCache`, Redis, tag `api-responses`) for
   public GET responses, keyed per site (`api:<site>:…`).
2. **Next.js fetch cache** (tag `api`) for the API responses used to render pages, one per
   Next.js instance.

After any change to a model visible on the site (categories, brands, products and variants,
images, specs, articles, sectors, services, pages, city pages, FAQ, SEO, redirects, cities) or to
the settings, `App\Support\Frontend\Revalidator` flushes the API response cache at once (all
sites) and, after the response, calls `POST <frontend_internal_url>/api/revalidate` on **every**
site of `config/sites.php` (`http://next:3000`, `http://next-arfro:3000`) with the shared
`REVALIDATE_SECRET`, whichever site the change concerns (the catalogue is shared). Each call is
independent: a storefront that is down is logged (`Front-office revalidation failed`, with the
site key) and the other is still revalidated; `Revalidator::send()` returns true only when all
succeeded. The Next.js route expires the tag immediately (`revalidateTag(tag,
{ expire: 0 })`).

This matters for unpublished content: Next.js only caches 200 responses, so the API's 404 never
replaces a cached page by itself. Known issue (2026-10-07, dev server): a 200 cached before a page
was unpublished kept being served after a successful revalidation call, although each render
fetched fresh 404s from `/resolve` and `/pages/{slug}`; the end-to-end test
`e2e/site.spec.ts` catches it. Answering « not found » with a cacheable 200 body (e.g.
`{"type":"none"}` from `/resolve`) would let a fresh answer replace the stale entry. If the revalidation call fails (front office down or too slow),
an unpublished page can stay visible until the next successful revalidation. Saving any item in
the back office again triggers one; `php artisan tinker --execute='App\Support\Frontend\Revalidator::send();'`
forces one by hand.

## Tests

| Layer | Tool | Where |
|---|---|---|
| API, models, back office | Pest (MySQL test database) | `backend/tests/` |
| Pure front-end logic, components | Vitest + Testing Library | `frontend/src/**/*.test.ts(x)` |
| User journeys through nginx | Playwright | `frontend/e2e/` |
| Routing through nginx | smoke script | `scripts/smoke.mjs` |
| Visual comparison with the design | Playwright screenshots | `frontend/scripts/visual-compare.mjs` |

CI (`.github/workflows/ci.yml`) runs the backend and frontend checks on every push and pull
request; the Docker stack, smoke and end-to-end job runs on manual dispatch.
