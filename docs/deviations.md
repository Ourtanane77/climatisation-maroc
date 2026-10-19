# Deliberate deviations from the design files

Each phase was compared with the design pages at 1440 and 390 px (the pages and
the capture script were removed on 2026-10-12, once the site was built).
Anything that differs on purpose is listed here.

## Phase 2: layout and shared components

| Area | Design | Built | Why |
|---|---|---|---|
| Brand icons (WhatsApp, Facebook…) | Loaded from the `cdn.simpleicons.org` CDN | Inline SVG | No third-party request, faster LCP, works offline. |
| Logo | `uploads/pasted-1791221833312-0.png` | Owner's logo files per site (`design/logos/`, served from `frontend/public/brand/`) | Image missing from the design export; replaced by the owner's files on 2026-10-12. |
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

## Multi-site (2026-10-12)

| Area | Design | Built | Why |
|---|---|---|---|
| Arfro storefront (arfro.com) | No design file | Own look since 2026-10-13 (see « Arfro restyle » below), own logo and icons; texts can differ per site | Owner's decision. |
| Logos (2026-10-12) | Colour logo in a white pill on the blue footer | Each site's own logo (« Ariha Froid » for Climatisation Maroc, « Arfro » for arfro.com); the footer shows the owner's white version directly on the blue; favicons from the owner's icons | Owner's logo files (`design/logos/`). |

## Owner requests after phase 8

| Area | Design | Built | Why |
|---|---|---|---|
| Article page layout (≥ 1100 px) | Text column 720 px + « Sommaire » 260 px, leaving empty space on wide screens | Text 2/3 and « Sommaire » 1/3 of the page column | Owner's request (2026-10-07): the summary looked like it took half the page. |
| « Gaines circulaires » type tile | — | Owner's photo with its white background removed (`design/uploads/gaines-cat/cat-gaines-circulaires.png`, made from the owner's photo) | The tiles show transparent photos on coloured backgrounds. |

## Arfro restyle (2026-10-13)

The owner asked for arfro.com to look different from Climatisation Maroc (same colours, same content
and pages), inspired by LG and Samsung storefronts. Approved mockups: the « Arfro restyle » design
canvas (home desktop and mobile, category, product). Climatisation Maroc is unchanged.

| Area | Climatisation Maroc | Arfro |
|---|---|---|
| Tokens | Figtree, grey page, orange accent | Manrope, white page with #F2F4F7 panels, blue primary buttons (orange for promotions only), rounder corners, flat cards (`[data-site="arfro"]` in `globals.css`) |
| Header | Search bar in the header | Dark promo strip, utility bar (Particuliers / Professionnels, services, phone), slim header with text links and icon buttons, blue cart pill |
| Home | Bento, rails | Hero photo with a white card, round category tiles, tabbed selections, feature banners, power helper, brands, promises |
| Cards | Bordered cards | Grey image well, brand in small capitals, « Acheter » and « Comparer » pills |
| Category and product pages | Design files | Grey category hero with sub-category pills, filter sidebar with hairlines; product variant cards, grey buy panel, section tabs |
| Footer | Brand blue | Navy #083F78 |

Arfro home details: the « Gaines circulaires » rail is left out (ducts stay on their range page);
copper and spare parts are the third « Nos sélections » tab; the power finder bar and the reassurance
strip become the « Quelle puissance choisir ? » panel and the promises strip; the pro block becomes
the « Solutions professionnelles » banner. On phones the banners, brands and promises stay (the
mobile mockup leaves them out) so no content disappears. Arfro cards hide a brand badge that only
repeats the brand name and show a « Comparer » pill on every card with a reference.

Arfro chrome details: below 1360 px the header steps down (smaller links, round cart, fewer icons)
so the navigation never overflows; the WhatsApp button moves from the desktop header to the drawer
(the phone number is in the utility bar); the footer's bottom row keeps every phone and the full
store addresses instead of the mockup's condensed line; the drawer adds « Suivre ma commande » and
« Espace professionnel » because the utility bar is hidden on phones. Arfro's header is sticky
(Climatisation Maroc's hides on scroll).

Arfro catalogue details: the technical-visit option sits in the product buy panel (only where the
product has an installation kit), so the installation section has one « + » per accessory and no
« Tout ajouter »; the product H1 is the family name; « Demander un devis » is a text link under the
promises; the listing's SEO heading reads « Bien choisir vos <catégorie> »; the promo filter is a
single « En promotion » row.

## Owner requests (2026-10-18)

| Area | Design | Built | Why |
|---|---|---|---|
| Checkout payment (`/commande`) | One « Paiement à la livraison » card, cash on delivery only | Unchanged while card payment is off; when a site turns it on, a « Mode de paiement » card with two radio cards (« Paiement à la livraison », « Carte bancaire »), the submit reads « Confirmer et payer par carte » and the note under it announces the CMI page | Owner's request: optional online card payment through CMI, per site. |
| Payment page (`/commande/paiement`) | — | New page: order reference, amount, CMI notice and a « Payer … par carte » button; the signed form is posted to CMI automatically (the button stays for browsers without JavaScript) | CMI « 3D Pay Hosting » needs the browser to post a signed form to its page. |
| Confirmation page, card orders | Third step « Paiement à la réception », cash line in the address card | Third step and payment line follow the card payment (paid, pending, to be redone); a notice (failed, being checked, pending) with « Réessayer le paiement » / « Payer maintenant » while the order can be paid. Cash orders unchanged | The customer must see whether the card payment went through. |
| Checkout e-mail | Optional | Required, with its own message, when « Carte bancaire » is chosen | CMI needs the customer's e-mail. |
| Footer bottom row (both sites) | Copyright and legal links | Adds the agency signature « Conçu avec ♥ par Logic Technologies » after the legal links (server-rendered, no JavaScript; link with `utm_source` = the site's host; black text on a white pill, readable on both blue footers) | Owner's request: credit the agency that built the sites. |

## Owner requests (2026-10-19)

| Area | Design | Built | Why |
|---|---|---|---|
| Social links (footers, Contact title row) | Facebook, Instagram, TikTok, WhatsApp | Up to seven networks per site (adds YouTube, X, Threads, Pinterest) in a fixed order, WhatsApp last; only the networks filled in Réglages show. Same circle style; the rows wrap to a second line when they no longer fit (Arfro has eight icons) | Owner's request: each site's own accounts (Arfro has seven). |
| Contact map (`/contact`) | OpenStreetMap view of Marrakech | Google Maps embed of the « ARFRO » place, set per site in Réglages (« Carte Google Maps »), in the same card with the store overlay; 4:3 on phones (at least 360 px high), the height of the store cards from 1280 px. The OpenStreetMap view stays when the setting is empty | Owner's request: show the store on Google Maps on both sites. |
| Legal pages (`/cgv`, `/cgu`, `/informations-legales`, `/securite`, `/confidentialite`) | CGV template with « [TEXTE JURIDIQUE] » placeholders, Climatisation Maroc only | Real French texts on both sites, each set naming its own site (`Database\Seeders\Data\LegalPages`, migration `2026_10_19_100000_write_legal_pages`, never over text edited in the back office). CGV article 5 is titled « Paiement » instead of « Paiement à la livraison » (it also covers the optional CMI card payment). Facts not in the repository are « [À compléter : …] » markers: Informations légales and Confidentialité stay unpublished until the owner fills them. A single line break inside an article now shows as a line break (`whitespace-pre-line`), for lists | Owner's request: legal pages live on both storefronts, managed in the CMS. |
| Home hero « WhatsApp » button (Climatisation Maroc) | One link to the sales number | Same button (look unchanged); with two or more numbers in Réglages (« Numéros WhatsApp du bouton de la page d’accueil ») it opens a small white menu above the button, one link per number shown as « 0666 85 41 84 » (optional label before it), opening wa.me in a new tab; Escape, outside click or Tab closes it, arrow keys move between numbers. One number or none: a direct link as before. Climatisation Maroc: 0666 85 41 84 and 0666 08 83 48. Arfro's hero has no WhatsApp button, unchanged | Owner's request: two sales numbers behind the hero button. |
| Floating WhatsApp button (every storefront page) | None | 56 px WhatsApp-green circle with the white WhatsApp icon, fixed bottom right (16 px, 24 px from 768 px, plus the safe area), set per site in Réglages (« Bouton WhatsApp flottant »; Climatisation Maroc 0666 77 43 94, Arfro empty so no button). Lifted above the fixed bottom bars (product add-to-cart bar, quote bar, listing selection bar, compare bar, pro quick order bar: `data-bottom-bar`), under the toast, drawers and dialogs. Not on the checkout pages (own layout), so it does not distract from paying; hidden when printing | Owner's request: a WhatsApp contact always at hand. |
