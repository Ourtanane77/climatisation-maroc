# Deliberate deviations from the design files

Each phase is compared with the design at 1440 and 390 px. The capture script
is `frontend/scripts/visual-compare.mjs` and its output goes to
`frontend/test-results/visual/<phase>/`. Anything that differs on purpose is
listed here.

## Phase 2: layout and shared components

| Area | Design | Built | Why |
|---|---|---|---|
| Brand icons (WhatsApp, Facebook…) | Loaded from the `cdn.simpleicons.org` CDN | Inline SVG | No third-party request, faster LCP, works offline. |
| Logo | `uploads/pasted-1791221833312-0.png` | Text wordmark until the file is added to `design/uploads/` | Image missing from the design export (see `design/README.md`). It is picked up automatically when present. |
| Mega-menu featured product | Photo cut-out | The featured product's own catalogue photo | The featured product is set in the back office (Page d'accueil), so its photo follows it. |
| Focus states | None | 3 px brand-blue `:focus-visible` ring | Accessibility requirement (keyboard navigation). |
| Mega menu, footer | Accueil's own versions differ from the Structure board's richer variants | Accueil's versions | The page files win over the boards. |
| Header search | The scope picker only changes the placeholder | Real `<form action="/recherche">`; the scope is sent as `gamme` | The search must work. |
| Text rendering | Browser default line-height | Same (`line-height: normal` overrides Tailwind's 1.5) | Not a deviation; noted because Tailwind changes it by default. |
| Footer phone rows | 30 px pitch | 32 px | Font metrics; within tolerance. |

The phase 2 placeholders (home page, navigation from the design's values) are
replaced by the real pages and `GET /api/v1/navigation` in phases 4–7.

## Phase 3: data model and back office

The back office has no design file; it uses Filament's layout with the design's colours and font.

| Area | Design | Built | Why |
|---|---|---|---|
| Footer social links | Facebook, Instagram and TikTok link to `#` | The client's real URLs (2026-10-06), editable in Réglages | Resolves the phase 2 deviation. |
| Back-office buttons | Brand blue `#0B5CAD` | Same; orange actions use `#D85A17` | `#F4731F` with white text is about 3:1, below the 4.5:1 needed for text. |
| Design-only products (cassette, cuivre, kits duo, isolant, gaz) | Shown with references and prices | Seeded as drawn, flagged « À vérifier » | Absent from `data/catalog.json`; must be confirmed before launch. |
| Legal pages, 7 sectors, 8 articles, 6 city pages | Titles only, or placeholder text | Created unpublished | No copy supplied; never invent text. |

## Phases 4–7: front office

Design images (2026-10-06): the owner supplied the hero photo (`cover-ariha.png`),
the hotel-lobby photo `solutions-category.png` (used where the design has
`pasted-1791236697258-0.png`: « Solutions professionnelles » tile, sector image
band) and product photos. `clima.png` is the owner's transparent wall unit and
stands in for `clima-cut2.png` (`frontend/scripts/sync-design-assets.mjs` accepts
alternative source names). `ventilateur-cut.png`, `gaines-cut.png`,
`cuivre-cut2.png` and `telecommande-cut2.png` were derived from the supplied
photos by removing their black background (originals kept in `design/uploads/`);
`chauffe-eau-b0352fa9.png` is the supplied transparent photo, resized, and
`cuivre-56818f19.png` (« Tout pour l'installation » card) is the copper photo as
supplied. They appear on the home page, the LG brand hero, the service hero, the
404 range tiles and the sector image band.

Still missing: the logo (`pasted-1791221833312-0.png`, text wordmark meanwhile).

Page width (owner's request, 2026-10-06): the design stretches the content to the
window edge (40 px gutters). The site centres it in a column of at most 1440 px
(`--site-max` in `frontend/src/app/globals.css`); the promo bar, header, hero and
footer backgrounds stay full width, with their content aligned to the column.

### Catalogue (gamme, catégorie, liste rapide, promotions, recherche)

| Area | Design | Built | Why |
|---|---|---|---|
| Product cards | Hand-picked single variants | Families with variant chips and « N puissances / N modèles » | Catalogue model (families with variants). Fitco's 8 chips truncate. |
| Labels | « Mono split » | « Mural » (category short name) | Data from the back office, editable. |
| Guides, footer legal links | All shown | Published ones only | Unpublished pages never appear in link blocks. |
| Other ranges' section titles | Drawn for Climatisation only | Derived from the category name; advice band only on ranges sold by power | Same template, real data. |
| Sort, pagination | Static | Working; filtered URLs `noindex` with canonical to the base page | SEO. |
| Search | Matches the duo kit on « cuivre » by keyword | Name, keywords, SKU, brand, category | The duo kits have no keywords yet (back office). No-result card lists the 6 ranges with products. |
| Quick-list bottom bar | — | Reserves its height with `body` padding below 1100 px | Bar must not cover the last row. |
| Type tiles (mobile) | 260 px | 300 px | The console drawing overlapped its text. |
| `?comparer=1` | Preselects demo products | Shows the stored selection | No demo data on a live site. |

### Product, brands, compare

| Area | Design | Built | Why |
|---|---|---|---|
| Default variant | 12 000 BTU | The catalogue's default variant (9 000) | Data-driven; `?v=` selects another. |
| Gallery | Drawn shots | Real photos, plus « Schéma » only with fewer than 4 photos; photos multiply-blended | Real catalogue photos have white backgrounds. |
| Spec table | Fixed row order | Marque, catalogue specs (variant overrides family), Référence | The catalogue's specs differ per product. |
| Datasheet button | Links to `#` | Shown only when a file exists | No dead links. |
| Brand page hero | `clima-cut2.png` | The design photo for LG; other brands show their first product photo | The design photo is an LG unit. |
| Brand groups | Selected categories | Every category with products; power range shown for every power family | Real data. |
| Brand pills | Sticky at 64 px | Sticky at the top | The header hides on scroll-down. |
| Compare | « Ajouter un produit » slot always | Hidden at 3 products; Wi-Fi shows the stored value | « jusqu'à 3 produits ». |

### Basket, checkout, confirmation, tracking

| Area | Design | Built | Why |
|---|---|---|---|
| Demo values | Prefilled form, static basket, fake lookup | Real data | Live site. |
| Validation | Phone and CGV | Also name, address and city (server) | An order needs them. Phone error shows after blur or submit. |
| Out-of-stock lines | — | « Rupture de stock », excluded from the total | Cannot be delivered. |
| Confirmation | — | « Visite technique » row when chosen | Matches the order total. |
| Toasts | — | « Trop de tentatives », network error | Functional states. |
| Quantity stepper | « − » active at 1 | Disabled at 1 | Remove has its own button. |

### Leads, reseller account, pro space

| Area | Design | Built | Why |
|---|---|---|---|
| Account bar | Inside the header | Right-aligned bar under the header | Kept outside `SiteHeader`; can move into the header's right group later. |
| « [TARIF REVENDEUR] » | Placeholder | Dashed badge with the real reseller price | Pro prices are server-rendered. |
| Quick order | Demo rows | One empty row; toast singular for 1 line | Live site. |
| Reseller form | E-mail and password not validated | Required | An account needs both. |
| CGV link in forms | `/cgv` | `/cgv`, which returns 404 while the CGV is unpublished | Publish the CGV before launch. |

### Home, calculator, blog

| Area | Design | Built | Why |
|---|---|---|---|
| Nouveaux produits, promotions | 4 single references | Family cards (2 new families today) | Catalogue model. |
| Duct names | Old row names | Family plus variant (« … 10 m Ø 125 ») | Grouped catalogue. |
| « Voir les nouveautés » / « Tout le catalogue » | Links | Removed / to `/plan-du-site` | No such pages. |
| Power finder, article calculator | Tier bump | Shared calculator model (decision 4) | One function everywhere; edge cases differ slightly. |
| Calculator products | Hand-picked | Real published air conditioners of that power (murals first, max 3) | Real data. |
| Article date | `[DATE]` | Shown only when `published_at` is set | No placeholder text. |
| Blog | 9 articles, 4 categories | 1 published article, 1 category | Unpublished content hidden. |

### Solutions, services, static pages, cities, 404

| Area | Design | Built | Why |
|---|---|---|---|
| Solutions hub, « Autres secteurs » | 8 sectors | Restaurants only; block hidden | Other sectors unpublished. |
| Recommended products | Single variants | Families | Catalogue model. |
| À propos, Livraison | Photo placeholders, placeholder chips | Kept as drawn | Waiting for real photos and copy. |
| Legal pages | « Dernière mise à jour : [DATE] » | Hidden until a date is set; all 5 unpublished | No copy yet. |
| `/services`, city pages | Not drawn | Built from Service and Gamme components | Implied by breadcrumbs. |
| Plan du site | Boards | Board's six groups with live data | Only published pages. |

## Phase 8: performance and accessibility

| Area | Design | Built | Why |
|---|---|---|---|
| Colour tokens | promo red `#C4501A`, muted grey `#7A828B`, success green `#1F9D57`, Facebook `#1877F2` | `#BE4D19`, `#6A7178`, `#198047`, `#1772E8` | WCAG AA contrast (4.5:1 for text); visually almost identical. |
| Out-of-stock rows (quick list) | Whole row faded | Only the thumbnail faded | Faded text failed contrast. |
| Pro page contact card | Light footer tones for the phone label and hours | White | Contrast on the blue card. |
| Header WhatsApp number | — | Hidden while a reseller is logged in | As in the logged-in design (Commande rapide); the account pill takes its place. |
| Design photos | PNG files | WebP renditions with `srcset` (hero 2.4 MB → 23–139 KB) | Page speed (home LCP 35 s → 3 s on mobile). |

Open (owner's decision): white text on the brand orange `#F4731F` (2.9:1) and on WhatsApp
green `#25D366` (2.0:1) is below AA. Options: darken them (about `#BE5918`, `#178741`) or keep
the colours with dark `#1A1A1A` text. Left as drawn until decided.

## Owner requests after phase 8

| Area | Design | Built | Why |
|---|---|---|---|
| Article page layout (≥ 1100 px) | Text column 720 px + « Sommaire » 260 px, leaving empty space on wide screens | Text 2/3 and « Sommaire » 1/3 of the page column | Owner's request (2026-10-07): the summary looked like it took half the page. |
| « Gaines circulaires » type tile | — | Owner's photo with its white background removed (`design/uploads/gaines-cat/cat-gaines-circulaires.png`, made from the owner's photo) | The tiles show transparent photos on coloured backgrounds. |
