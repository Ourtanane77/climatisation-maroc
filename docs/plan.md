# Climatisation Maroc: implementation plan

Status: **draft for review (end of phase 1)**. Nothing below is built yet.

Sources:
- `design/`: the imported design files (see `design/README.md`).
- `docs/design-inventory/1…5-*.md`: a page-by-page inventory of every design
  file. It covers layout values, behaviour, states and all data verbatim, and
  it is the reference for seeding and for visual checks.

---

## 0. Decisions

### Resolved on 2026-10-06 (these override the proposals below)

- **File list confirmed.** 30 pages and 2 design boards.
- **Prices and references.** `data/catalog.json` (106 real SKUs from the live
  site) is the seed and the price authority.
  - Rows are grouped into families with variants. The grouping is in
    `docs/catalog-grouping.md`.
  - `price` is the regular price; `promo_price` is the selling price when
    discounted.
  - `php artisan catalog:download-images` copies the old site's images into
    local storage, so the new site never hotlinks.
  - Design-only products (cassette, cuivre, gaz) are seeded from the design
    values with `needs_verification`.
  - Category pages show every real family. Nothing is cut to match the
    design's card count.
- **Calculator.** One shared function, using the calculator page's model,
  serves the calculator page, the home finder and the article block.
- **Pages without copy.** They are built and kept unpublished. They are
  excluded from menus, the sitemap and internal link blocks.
- **Quote links.** All go to `/demander-un-devis`, except the on-page form on
  sector pages.
- **Pro prices.** A reseller sees `pro_price` where set, otherwise the public
  price.

### Technical decisions (phase 2)

- **Images.** Next.js 16 refuses to optimise images from private hosts, and
  the API sits on the internal `nginx` host.
  - Laravel generates responsive WebP renditions when images are imported or
    uploaded. The front end uses them through `srcset`, with
    `images.unoptimized`.
  - Uploaded files are served by nginx at `/storage/`.
- **Front end in Docker development.** It runs `next dev --webpack` with
  polling, because file events don't reach the container through Windows or
  macOS bind mounts. Host development keeps Turbopack (`npm run dev`).
- **Laravel in Docker development.** `vendor/` lives in a named volume, since a
  bind-mounted `vendor/` is far too slow on Windows.
- **Routing.** Only `/api/v1` is routed to Laravel. Next.js owns the other
  `/api/*` routes (BFF auth, forms, revalidation).
- **Libraries resolved at install.** Laravel 13.35, Filament 5.9, Sanctum 4,
  spatie/laravel-permission 8, spatie/laravel-settings 3, Pest 4, Larastan 3,
  Next.js 16.3, React 19.2, Tailwind 4, Vitest 5, Playwright 1.63.

### Original proposals (phase 1)

1. **Page count.** The index lists 32 unique files, not 31: 30 site pages plus
   2 design boards (`Structure et navigation`, `Plan du site`). The boards
   define the silo plan, mega menu, mobile menu, breadcrumb and footer, but
   they are not pages themselves. **I treat them as references and build an
   HTML sitemap at `/plan-du-site` from the footer and sitemap data.**
2. **Missing images.** 10 of them, including the Ariha Froid logo (listed in
   `design/README.md`). The tool cannot export files over 256 KiB. **Please
   drop them into `design/uploads/`.** Until then the logo renders as text
   and the cut-outs fall back to the `art.js` illustrations, rebuilt as React
   SVG components.
3. **Product price conflicts between pages** (details in inventory 1, last
   section):
   - Carrier Mural Inverter R32: 9 000 BTU at 4 200 / 5 050 Dhs on most
     pages; 12 000 BTU at 4 800 Dhs on Comparer.
   - Fitco Mural Inverter: "à partir de 3 700" (category) vs 12 000 Blanc at
     4 000 / 4 900.
   - LG Artcool: "à partir de 7 900" (category, marque) vs 18 000 at 9 900 /
     10 500, ref UA19MKH0.NJ0.
   - Carrier Miroir Noir: "à partir de 5 200" vs 12 000 at 5 600 / 6 600, ref
     42QHG012D8S-BM.

   **Proposal: seed only variants that have a reference and a price somewhere
   in the files, and let the "à partir de" price be computed from them.**
   Families shown only as "à partir de X" with no reference (LG Jetcool
   Inverter R32, Carrier Mural On/Off, Fitco Mural On/Off, LG Gainable
   Inverter "dès 7 800", Carrier Gainable On/Off 60000 with no ref) would be
   seeded **unpublished** with a "référence à compléter" note in the back
   office, not invented. As a result the category page will show fewer cards
   than the design (9) until real data arrives, by import or by hand.
4. **Power calculator formula.** The brief says "600 BTU/m², one size up for
   very sunny or top floor". The design has three variants:
   - `Calculateur puissance`: 600 BTU/m² × factors (high ceiling 1.2, very
     sunny 1.15, low sun 0.9, top floor 1.15, open kitchen 1.2), rounded up to
     the next tier.
   - Home power finder and the in-article calculator: tier by surface, one
     tier up when very sunny.

   **One shared function implementing the calculator page's model (files win).
   The home and article widgets pass only surface and sun, which gives the
   same results as their tier tables.**
5. **Placeholder content in the design:** `[TEXTE JURIDIQUE]`, `[DATE]`,
   `[DÉLAI PAR VILLE]`, `[CONDITIONS DE RETOUR]`, `[PHOTO MAGASIN]`.
   - **Seeded exactly as placeholders and editable in the back office.**
     Legal text is never invented.
6. **Pages the design implies but did not draw, which need copy.**
   - Other sectors (only a name and tagline exist).
   - 8 of 9 blog articles (title, category and reading time only).
   - Brand pages other than LG (logo only).
   - City pages (silo 7: Marrakech, Casablanca, Rabat, Agadir, Tanger, Fès).

   **Templates are built and seeded with what exists. Pages without body copy
   are created unpublished (not in nav, sitemap or links) until the client
   writes the text.** The exception is brand pages: their product listings are
   real content, so they are published with an empty intro.
7. **"Demander un devis" in page bodies.** On Climatisation, Produit and
   Catégorie it points to `Solutions professionnelles#devis`, while the
   header points to `Demander un devis`. **All go to `/demander-un-devis`.**
   On sector pages it stays the on-page `#devis` form, as drawn.
8. **Reseller price.** No pro price appears anywhere in the design. The design
   shows a `[TARIF REVENDEUR]` placeholder. **A validated reseller sees the
   variant's pro price where set, and the public price otherwise.**
9. **Range URLs.** The header nav (6 ranges) and the silo board disagree
   slightly: the board groups "Ventilation et gaines" and "Installation et
   fournitures". **The nav wins for structure: 6 top-level ranges plus Froid
   (sur devis); see §2.** The brief's `/climatisation/mural` is used for the
   "Climatiseurs muraux" page.

---

## 1. Design tokens (extracted from the files)

**Font:** Figtree 400/500/600/700/800 (self-hosted with `next/font`).

**Colours**

| Token | Hex | Use |
|---|---|---|
| `brand` | #0B5CAD | primary blue, footer, links, primary buttons |
| `brand-hover` | #084683 | |
| `accent` | #F4731F | orange CTA, cart pill |
| `accent-hover` | #D85A17 | |
| `promo` | #C4501A | discount badge, savings, errors, Promotions link |
| `ink` | #1A1A1A | text, chips selected |
| `ink-2` | #3C4043 | body secondary |
| `muted` | #5F6368 | meta, labels |
| `muted-2` | #7A828B | struck price, pending |
| `line-strong` | #9AA3AD | card button border, separators |
| `bg` | #F4F6F8 | page background |
| `tint-blue` | #E8EFF8 | soft blue panels, hover |
| `tint-blue-2` | #DCE8F5 | tiles |
| `tint-thumb` | #EEF3FA | product thumbnails |
| `tint-select` | #F1F5FA | selected list item |
| `tint-orange` | #FDEBDD | |
| `tint-orange-2` | #FDF0E6 | |
| `tint-orange-3` | #FCE6D6 | |
| `border` | #E3E8EE | |
| `border-2` | #E6EBF0 | |
| `divider` | #EEF1F4 | |
| `input` | #D3DDE8 | input border |
| `control` | #D5DCE3 | stepper and pill outline |
| `check` | #C3CEDA | unchecked box |
| `step-line` | #DCE5EF | |
| `zebra` | #F7F9FB | |
| `zebra-2` | #F9FAFC | |
| `whatsapp` | #25D366 | |
| `success` | #1F9D57 | |
| `success-bg` | #E3F5EA | |
| `error-bg` | #FFF7F2 | |
| `reco` | #12A6E8 | recommended tier border |
| `reco-bg` | #E6F5FD | recommended tier background |
| `footer-text` | #C9DAEE | |
| `footer-text-2` | #E3ECF7 | |
| `upload-border` | #B9C6D4 | dashed upload border |
| `upload-bg` | #F7F9FB | |
| `hairline` | #E6E9EC | header hairline |

**Radii:** 6, 7, 8, 12, 14, 16, 18, 20, 24, 28, 999.

**Shadows** (tint rgba(14,40,70,…)):

| Name | Value |
|---|---|
| card-hover | `0 24px 50px -32px /.45` |
| dropdown | `0 24px 50px -20px /.4` + ring #E6EBF0 |
| mega | `0 30px 60px -30px /.45` |
| sticky-header | `0 10px 30px -18px /.35` |
| bottom-bar | `0 -12px 32px -16px /.35` |

**Breakpoints:** mobile < 760 ≤ tablet < 1100 ≤ desktop. The full header nav
appears at ≥ 1000. Gutter is 16 / 40. There is no max-width cap (the content
spans the viewport).

**Type scale**

| Element | Mobile / tablet / desktop |
|---|---|
| H1 | 34 / 44 / 56 (home hero 38 / 52 / 62; error pages per inventory) |
| H2 | 32 / 44 / 44 |
| Product name | 21/500 |
| Price | 28/800 (PDP 40) |
| Body | 16–19 |
| Labels | 15/700 |

**Control heights:** 44 (minimum touch target), 48, 52 (inputs), 54 (card
button), 56 (primary CTA).

**Motion:** `rise` keyframe (translateY 14px → 0) and `cubic-bezier(.2,.7,.2,1)`.
Hover lift is -4px.

These go in `frontend/src/styles/tokens.css` as CSS variables, mapped in
`tailwind` theme config.

## 2. Information architecture and route map

### Catalogue ranges

**Climatisation** (`/climatisation`)
- **Children:** Mural `/climatisation/mural`, Gainable `/climatisation/gainable`,
  Cassette `/climatisation/cassette`, Console et armoire
  `/climatisation/console-armoire`.
- **Range page template:** Gamme (landing).

**Chauffe-eau** (`/chauffe-eau`)
- **Children:** Électrique, À gaz, Solaire, Chaudière.
- **Range page template:** Gamme.

**Ventilation** (`/ventilation`)
- **Children:** Ventilateurs de gaine, Multizone, Grilles et diffuseurs.
- **Range page template:** Gamme.

**Gaines** (`/gaines`)
- **Children:** Gaines circulaires, Flexibles souples, Flexibles isolés.
- **Range page template:** Gamme.

**Cuivre et gaz** (`/cuivre-et-gaz`)
- **Children:** Cuivre, Kits duo, Isolant, Gaz frigorifique.
- **Range page template:** Liste rapide (dense).

**Pièces de rechange** (`/pieces-de-rechange`)
- **Children:** Télécommandes, Supports, Adhésifs et mastics, Trappes de
  visite, Outillage.
- **Range page template:** Liste rapide (dense).

**Froid et chambres froides** (`/froid`)
- **Children:** none (sur devis).
- **Range page template:** Gamme with a quote CTA.

Sub-category pages use the **Catégorie** template (filters, sort, pagination,
compare), or the dense template when their parent is dense.
`Category.template` ∈ {`landing`, `listing`, `dense`} is set per category in
the back office.

### Page → route → design file

| Page | Route | Design file (state) |
|---|---|---|
| Accueil | `/` | Accueil |
| Gamme | `/[range]` | Climatisation |
| Catégorie | `/[range]/[sub]` | Categorie Climatiseurs muraux (`?comparer=1` = compare tray) |
| Liste rapide | `/[range]` or `/[range]/[sub]` with template dense | Cuivre et gaz |
| Fiche produit | `/produit/[slug]` (`?v=<sku>` selects variant) | Produit LG Dual Inverter |
| Marques hub | `/marques` | implied (brand tiles) |
| Marque | `/marques/[slug]` | Marque LG |
| Promotions | `/promotions` | Promotions |
| Recherche | `/recherche?q=` | Recherche (results / no result) |
| Comparer | `/comparer?p=a,b,c` | Comparer |
| Calculateur | `/calculateur-puissance` | Calculateur puissance |
| Panier | `/panier` | Panier (filled / empty) |
| Commande | `/commande` | Commande (reduced header) |
| Confirmation | `/commande/confirmation?ref=&t=` | Confirmation |
| Suivi | `/suivi-commande` | Suivi commande (form / result) |
| Demander un devis | `/demander-un-devis` (`?pro=1`) | Demander un devis (form / envoyé) |
| Contact | `/contact` | Contact |
| Services hub | `/services` | implied by breadcrumb |
| Service | `/services/installation`, `/services/visite-technique`, `/services/service-apres-vente` | Service (3 variants) |
| Espace professionnel | `/espace-professionnel` | Espace professionnel |
| Devenir revendeur | `/devenir-revendeur` | Devenir revendeur (form / envoyé) |
| Connexion | `/connexion`, `/connexion/mot-de-passe-oublie`, `/connexion/nouveau-mot-de-passe?token=` | Connexion (login / oubli) |
| Commande rapide (auth) | `/espace-professionnel/commande-rapide` | Commande rapide |
| Solutions hub | `/solutions` | Solutions professionnelles |
| Secteur | `/solutions/[slug]` | Restaurants |
| Blog | `/blog` | Blog |
| Blog catégorie | `/blog/categorie/[slug]` | Blog categorie |
| Article | `/blog/[slug]` | Article puissance climatiseur |
| Ville | `/climatisation-[ville]` | not drawn; Gamme components |
| À propos | `/a-propos` | A propos |
| Livraison et paiement | `/livraison-et-paiement` | Livraison et paiement |
| Pages légales | `/cgv`, `/cgu`, `/informations-legales`, `/securite`, `/confidentialite` | CGV (`?p=` variants) |
| Plan du site | `/plan-du-site` | boards (decision 1) |
| 404 | any unknown | Page introuvable |

### Routing mechanics (Next.js App Router)

- Static segments come first (`/produit`, `/marques`, `/blog`, …).
- A top-level `app/[slug]/page.tsx` resolves, in order:
  1. a range category;
  2. a static page (legal, à propos, livraison);
  3. `climatisation-<ville>` to a city page;
  4. otherwise a redirect lookup, then `notFound()`.
- `app/[slug]/[sub]/page.tsx` resolves sub-categories.
- Legacy patterns get dedicated catch-alls (`/produit/details/[...rest]`,
  `/produit/service/[...rest]`, `/home/[...rest]`) that look up the legacy id
  or path and call `permanentRedirect()`. Anything else unknown falls through
  to the redirect table before the 404.

### Silo linking (from the Structure board)

- A child links to its parent and its siblings.
- A grandchild links to its child and its mother, and to 2–3 sisters.
- The only crossings are the header, the footer, the home page and the
  product page's "Pour l'installation" block.
- Blocks:
  - Gamme: types, power, populaires, marques, "Guides associés".
  - Catégorie: sister type chips, "Guides associés".
  - Produit: breadcrumb, "Dans la même gamme", installation kit.
  - Secteur: "Autres secteurs".
  - Article: "À lire aussi", in-category only.
- Guides are attached to categories through a pivot (`article_category_links`)
  so the blocks are data-driven.

## 3. Component inventory (built once, reused)

**Layout**
- `PromoBar`: from Settings.
- `SiteHeader`:
  - logo, scoped search (scope dropdown, Enter → /recherche), WhatsApp phone,
    cart pill with count, 6-range nav + Promotions + right links;
  - sticky compact mode on scroll, hides on scroll-down;
  - tablet scrolling nav with a "Plus" dropdown, mobile search toggle.
- `MegaMenu`: sub-ranges, brands, featured product card with "Ajouter au
  panier". Set per range in the back office.
- `MobileDrawer`: range accordions, extra links, call and WhatsApp buttons.
- `CheckoutHeader`: reduced header used on `/commande`.
- `AccountBar`: reseller pill with "Se déconnecter".
- `SiteFooter`: about, socials, 4 link columns (accordions on mobile), phones
  by role, stores, hours, legal links.
- `Breadcrumb`: also emits BreadcrumbList JSON-LD.
- `Toast`.
- `StickyBar`: shared by the product add bar, selection bar, quote bar and
  mobile order bar.

**Catalogue**
- `ProductCard`, in four modes:
  - family with variant chips and "À partir de";
  - single item;
  - brand badge;
  - mini.
- `Badge`: discount −N %, brand, Nouveau.
- `Price`: price, struck price, saving.
- `DenseRow` with `QtyStepper`, plus `DenseGridCard`.
- `FilterColumn`: checkbox facets with counts; becomes a mobile sheet.
- `ActiveFilterChips`.
- `SortSelect`.
- `ViewToggle`.
- `Pagination`.
- `CompareCheckbox`, `CompareTray`, `CompareTable` (diff switch).
- `TypeTiles`.
- `PowerChips`.
- `PowerFinder`: the home bar with surface stepper, sun dropdown and tiers.
- `Bento`: home catalogue tiles.
- `Rail`: horizontal snap list with arrows.
- `BrandMarquee`, `BrandTiles`, `BrandLogo`: equal-area sizing from the
  logo's aspect ratio.
- `ProductGallery`.
- `VariantSelector`.
- `BuyBox`: in-stock and out-of-stock alert states.
- `Highlights`.
- `SpecTable`.
- `InstallKit`.
- `SubcategoryPills`.
- `SelectionSidebar`.

**Commerce**
- `CartLine`.
- `OrderSummary`.
- `CheckoutForm`.
- `OptionCheckbox`.
- `CodBanner`: cash-on-delivery banner.
- `StatusTimeline`: horizontal on desktop, vertical on mobile.
- `OrderLookupForm`.
- `QuickOrderTable`: reference combobox, paste list, unknown-reference
  handling.
- `FrequentRefs`.

**Content**
- `PageIntro`.
- `FaqAccordion`: one item open at a time, first item open; emits FAQPage
  JSON-LD.
- `CtaBand`: blue, light and orange variants.
- `ContactChannels`.
- `StoreCard`.
- `MapCard`: OSM embed.
- `StepList`: vertical and horizontal.
- `IncludedGrid`.
- `PriceCards`.
- `ServiceHero`.
- `SectorHero`.
- `SectorCard` with `SectorScene`: the SVG scenes from the design.
- `ProblemGrid`.
- `SolutionCards`.
- `RangeTiles`.
- `ImageBand`.
- `ProHero`.
- `PerkGrid`.
- `AudienceCards`.
- `QuickOrderPreview`.
- `ArticleCard`.
- `FeaturedArticle`.
- `CategoryChips`.
- `Toc`: desktop sticky with scroll-spy, collapsible on mobile.
- `Callout`: "En bref" and "Astuce".
- `InlineCalculator`.
- `PowerTable`.
- `InlineProductCard`.
- `ShareBar`.
- `AboutHero`.
- `PromiseCards`.
- `LegalLayout`: numbered table of contents, "Autres pages légales".
- `NotFoundHero`.

**Forms**
- `Field`, `TextInput`, `Select`, `Textarea`, `PhoneInput` (Moroccan
  validation), `CitySelect`, `ChipGroup`, `SegmentedToggle`, `FileDrop`,
  `Checkbox`, `PasswordInput` (show/hide), `ErrorText`, `SuccessCard`,
  `Honeypot`.

**Art**
- `ProductArt`: React SVG versions of the `art.js` illustrations (mural,
  gainable, cassette, solaire, vent, flex, coilS, coilL, duo, gaz, support,
  scotch, remote, iso, duct). Used as the image fallback.

**Interaction states.** All interactive components get visible `:focus-visible`
rings, keyboard support (accordions, listboxes, comboboxes, switches,
radiogroups as in the design's ARIA) and 44 px touch targets.

## 4. Data model (Laravel / MySQL 8)

Money is stored as **integer centimes**, because some prices have decimals
(Armaflex 3,50 Dhs). Every SEO-capable model uses a shared `seo` morph row
`seo_meta`: `title`, `description`, `h1`, `canonical`, `og_image`,
`noindex`.

**Catalogue**
- `categories`: id, parent_id, name, slug, intro (rich text), body (SEO
  text), template (landing/listing/dense), icon, tile_bg, image, position,
  is_active, quote_only.
  - Tree via `parent_id`; drag reorder in Filament.
- `brands`: id, name, slug, logo, logo_aspect, intro, is_official_distributor,
  categories_caption, position, is_active.
- `products` (family): id, category_id, brand_id, name, slug,
  short_description, description, highlights (json: [{title, icon}]),
  datasheet_path, is_new, is_featured, is_published, legacy_id (indexed),
  art_key, technology, refrigerant, wifi, position, timestamps.
- `product_variants`: id, product_id, sku (unique), label, power_btu,
  colour, price, promo_price, pro_price, stock_status
  (in_stock/out_of_stock/on_order), position, is_default, legacy_id.
- `product_images`: id, product_id, variant_id (nullable), path, alt,
  position.
- `product_specs`: id, product_id, variant_id (nullable), label, value,
  position. A variant-level row overrides the family row with the same label.
- `product_accessories`: product_id, accessory_product_id, position. This
  drives "Pour l'installation".
- `facet` values derive from columns (power_btu, brand, technology,
  refrigerant, colour, price band, promo flag). There is no EAV.

**Orders**
- `orders`:
  - id, reference (unique, `CM-YYYY-NNNNN`, yearly sequence),
    access_token;
  - customer_name, phone, email, city_id, address, note;
  - status (nouvelle/confirmee/expediee/livree/annulee),
    status_changed_at, internal_note;
  - option_technical_visit, technical_visit_price,
    option_installation_quote;
  - subtotal, total, user_id (reseller, nullable), pricing (public/pro),
    ip, timestamps.
- `order_lines`: id, order_id, variant_id (nullable), sku, name, label,
  unit_price, qty, line_total. These are snapshots taken at order time.
- `order_status_history`: id, order_id, status, user_id, note, created_at.
  This feeds the tracking timeline dates.

**Leads and accounts**
- `leads`:
  - id, type (devis/contact/revendeur/secteur/alerte_stock);
  - status (nouveau/traite/archive);
  - name, company, phone, email, city_id, subject, project_type,
    space_type, surface, message, customer_kind (particulier/professionnel);
  - sector_page_id, product_variant_id, payload (json);
  - attachment_path, source_url, ip, timestamps.
- `reseller_accounts`: id, user_id, company, ice (15 digits), city_id,
  activity (installateur/revendeur/bureau_etudes/promoteur/autre),
  contact_name, phone, status (en_attente/valide/refuse), validated_at,
  validated_by, refusal_reason.
- `users`: name, email, phone (unique, nullable), password, role
  (admin/gestionnaire/revendeur).
  - Roles via `spatie/laravel-permission`.
  - Login accepts an e-mail or a phone number.

**Content**
- `article_categories`: name, slug, description, position.
- `articles`: category_id, title, slug, excerpt, body (blocks json:
  paragraph, h2, h3, callout, table, figure, calculator, products),
  reading_time, cover, art_key, cover_bg, published_at, author, is_published.
- `article_links`: polymorphic link of an article to a category, sector or
  product. This feeds "Guides associés".
- `sector_pages`: name, slug, tagline, scene_key, tile_bg, image, hero_text,
  intro, problems (json), solutions (json), product ids (pivot),
  range_tiles (json), image_band (json), quote_form_title, position,
  is_published.
- `service_pages`: slug, title, h1, intro, included (json), steps (json),
  prices (json), show_supplies, supply product ids, whatsapp_text,
  legacy_id, position, is_published.
- `city_pages`: city_id, slug, intro, body, is_published.
- `pages`: slug, title, kind (legal/about/delivery/other), body (blocks or
  numbered articles json), updated_label, is_published.
- `faq_items`: faqable_type, faqable_id, question, answer, position. This is
  polymorphic over Category, Product, ServicePage, SectorPage, Page, CityPage
  and Brand.
- `cities`: name, slug, position, is_delivery_city.
  - Seeded with the 17 cities in the design plus "Autre ville".

**System**
- `settings`: `spatie/laravel-settings` groups.
  - `general`: phones by role, e-mail, stores (name, address, map query),
    hours, socials, WhatsApp number, top-bar text and link, technical visit
    price.
  - `home`: hero title, subtitle, image, CTA; featured product ids; promo
    family ids; new product ids; brand order; rail settings; mega-menu
    featured product per range; pro block perks.
- `redirects`: from_path (unique), to_path, status_code (301), hits,
  last_hit_at.
- `stock_alerts` (folded into leads type `alerte_stock`).
- Storage: Laravel filesystem disk `public` (local) behind
  `FILESYSTEM_DISK`, so S3 drops in through env only. Images go through
  `next/image` with a remote loader pointing at the API storage URL.

## 5. API contract (`/api/v1`, JSON, French messages)

All list endpoints are cached in Redis and tag-invalidated when Filament saves.
Public `GET` routes are throttled at 120/min per IP. Form `POST` routes are
throttled at 5/min per IP and per phone, and require an empty `website`
honeypot plus a minimum form time (`_t` ≥ 3 s).

### Catalogue and content

| Method | Path | Notes |
|---|---|---|
| GET | `/navigation` | header ranges, mega menus, drawer, footer columns, legal links, settings (phones, stores, socials, promo bar) |
| GET | `/home` | hero, power tiers, bento, new products, promo families, ducts rail, supplies rail, brands, pro block |
| GET | `/categories/{path}` | category plus children, siblings, parent, guides, FAQ, SEO, template |
| GET | `/categories/{path}/products` | `?brand[]&power[]&tech[]&fluid[]&colour[]&price=&promo=1&sort=price_asc\|price_desc\|name\|relevance&page=&per_page=&q=` → `{data, facets:{key:[{value,label,count}]}, meta}` |
| GET | `/products/{slug}` | family, variants, images, specs, highlights, accessories, same-range products, FAQ, brand, breadcrumb, SEO |
| GET | `/products/compare?skus=` | max 3, normalised spec rows |
| GET | `/brands` | list |
| GET | `/brands/{slug}` | brand, products grouped by category, other brands |
| GET | `/promotions` | `?brand&range&page` → families with promo variants |
| GET | `/search` | `?q&range&page` → results plus range counts, popular searches, suggested ranges; accent-insensitive over name, SKU and keywords |
| GET | `/search/suggest` | `?q` → top 5 (header and quick order) |
| GET | `/calculator/power` | `?surface&ceiling&sun&top_floor&room` → `{need_btu, tier, label, explanation, cta_url, products[]}` |
| GET | `/blog` | `?category&page` |
| GET | `/blog/{slug}` | |
| GET | `/sectors` | |
| GET | `/sectors/{slug}` | |
| GET | `/services` | |
| GET | `/services/{slug}` | |
| GET | `/cities/{slug}` | |
| GET | `/pages/{slug}` | |
| GET | `/cities` | city select list |
| GET | `/resolve?path=` | `{type: category\|page\|city\|redirect\|none, …}` for the catch-all route |
| GET | `/redirects/legacy?kind=product\|service&id=` | `{to}` |
| GET | `/sitemap` | all public URLs with lastmod |

### Basket and orders

| Method | Path | Notes |
|---|---|---|
| POST | `/cart/quote` | `{lines:[{sku,qty}], options:{technical_visit}}` → priced lines (public or pro by auth), invalid lines, subtotal, visit, total, suggestions. Prices are always recomputed on the server. |
| POST | `/orders` | customer, address, options, `cgv:true`, lines → `{reference, access_token}`. Validates phone `^0[5-7]\d{8}$` (digits only), city in list, stock. Queues e-mails. |
| GET | `/orders/{reference}?t=` | confirmation view (token) |
| POST | `/orders/track` | `{reference, phone}` → status, timeline, lines, address |

### Leads

| Method | Path | Notes |
|---|---|---|
| POST | `/leads/quote` | type devis; multipart with optional attachment (image/pdf ≤ 10 MB) |
| POST | `/leads/contact` | |
| POST | `/leads/sector` | `sector_slug` |
| POST | `/leads/stock-alert` | `sku`, `phone` |

### Pro

| Method | Path | Notes |
|---|---|---|
| POST | `/resellers/apply` | company, ICE (15 digits), city, activity, contact, phone, e-mail, password ≥ 8, message, CGV → user (role revendeur) plus reseller account `en_attente` plus a lead of type revendeur |
| POST | `/auth/login` | `{login, password}` → Sanctum token; rejected unless reseller `valide` |
| POST | `/auth/logout` | |
| GET | `/auth/me` | |
| POST | `/auth/forgot` | |
| POST | `/auth/reset` | |
| GET | `/pro/frequent-refs` | auth |
| POST | `/pro/quick-order/resolve` | `{lines:[{ref,qty}]}` or `{paste:"…"}` → resolved lines with public price, pro price and errors |

### Auth model

- The Next.js server acts as a backend-for-frontend.
- Next route handlers (`/api/auth/*`, `/api/forms/*`) call the Laravel API
  over the internal network and keep the Sanctum token in an `httpOnly`,
  `Secure`, `SameSite=Lax` cookie.
- Server components forward the token, so pro prices are server-rendered and
  never reach anonymous visitors.
- The client IP is forwarded with `X-Forwarded-For` (trusted proxy) for rate
  limits.

### E-mails

All e-mails are queued on Redis and caught by Mailpit in development.

- `NewOrderShop` and `OrderConfirmationCustomer` (only when an e-mail is
  given).
- `NewLeadShop` for each lead type.
- `LeadReceivedCustomer` (only when an e-mail is given).
- `ResellerValidated` and `ResellerRefused`.
- Password reset.

## 6. Front-end architecture

- Next.js (App Router, TypeScript, Tailwind) with React Server Components.
- Data is fetched with `fetch(…, {next:{tags}})`. On-demand revalidation runs
  through `/api/revalidate`, called by Laravel when content is saved.
- **Basket:** a cookie `cm_cart` (JSON `[{sku,qty}]` plus options), read by
  the server for the header count and the cart page. It is mutated by a small
  client store. The cart and checkout pages always re-quote through
  `/cart/quote`.
- **Compare selection:** in `localStorage` and the URL.
- **Filters:** URL query params parsed on the server. Facet counts come from
  the API. Filter links are real `<a>` links, with the client enhancing them
  without a reload.
- **WhatsApp:** a single helper builds
  `https://wa.me/212666854184?text=…` with the product name and SKU, using
  the texts from the design.
- **Behaviour and validation:** `lib/phone.ts` (Moroccan phone validation,
  shared rules mirrored in Laravel) and `lib/power.ts` (the calculator).
- **Tests:** Vitest plus Testing Library (basket store, phone, power,
  checkout form) and Playwright (basket → checkout → confirmation; visual
  snapshots at 1440 and 390 against the design pages).

## 7. Back office (Filament, French)

**Dashboard widgets:** new orders, new leads by type, published products,
active promotions, resellers pending.

**Resources**

**Produits**
- Form with tabs: Général, Variantes (repeater), Images, Caractéristiques,
  Accessoires, FAQ, SEO.
- Bulk actions: publish/unpublish, apply a promo %, change category.
- CSV import and export through Filament import/export, keyed on SKU.

**Catégories:** tree with drag reorder.

**Marques**

**Commandes**
- Status workflow actions with history.
- Printable order sheet: a Blade view, A4.
- Internal note.
- Filters by status and date.

**Demandes:** tabs by type, status actions, attachment download.

**Revendeurs:** validate and refuse actions with e-mails.

**Blog:** Articles and Catégories, with a block builder.

**Pages:** Secteurs, Services, Villes, Pages (légales et statiques).

**FAQ:** relation managers on each page type, plus a global list.

**Page d'accueil:** a settings page.

**Redirections:** includes the hit counter.

**Réglages**

**Utilisateurs**
- Roles admin and gestionnaire.
- Gestionnaire has no access to Utilisateurs, Réglages or Redirections.

## 8. Docker and tooling

**`docker/`**

| Service | Contents |
|---|---|
| `nginx` | routes `/api`, `/admin`, `/storage`, `/livewire` → php-fpm; everything else → next |
| `php` | multi-stage: composer deps, then runtime 8.4-fpm-alpine with opcache and redis ext |
| `queue` | `php artisan queue:work` |
| `scheduler` | `schedule:work` |
| `mysql` | 8 |
| `redis` | |
| `next` | multi-stage: deps, build, then the standalone runtime |
| `mailpit` | development only |

**Compose files**
- `docker-compose.yml`: development, with bind mounts and hot reload.
- `docker-compose.prod.yml`: built images, no mailpit, healthchecks, volumes
  for mysql, redis and storage.

**One command:** `make up` builds, starts, waits for mysql, then runs
`migrate --seed` and `storage:link`.

**Makefile targets:** up, down, migrate, seed, fresh, test, lint, logs,
shell.

**Lint and analysis**
- Back end: Pint, Larastan level 6, Pest.
- Front end: ESLint, Prettier, `tsc --noEmit`, Vitest, Playwright.

**CI** (`.github/workflows/ci.yml`): back-end tests against a MySQL service,
front-end lint, typecheck and unit tests, and the Playwright smoke run.

## 9. Seed data (verbatim from the design only)

**Catalogue**

*Products with references*
- LG Dual Inverter (4 variants).
- Fitco Mural Inverter (12K Blanc, 24K Noir).
- Carrier Mural Inverter R32 (9K).
- CIAT Mural Inverter (9K).
- Carrier Miroir Inverter Noir R32 (12K).
- LG Artcool Smart Inverter (18K).
- LG Gainable Inverter (36K, 48K).
- LG Cassette Inverter 18000 (ATNW18GPLS1).
- Chauffe-eau solaire Simsek 300 L and 500 L.
- 6 ducts (Flexible …).
- 13 cuivre/gaz items, plus Support GT and Télécommande universelle.

*Families shown without references:* see decision 3.

*Product content:* specs, highlights, FAQ and installation kit for LG Dual
Inverter.

*Brands:* 9, with logos and aspect ratios. LG gets its intro and technology
cards.

**Content**
- Blog: 9 articles. The full body is seeded for "Quelle puissance de
  climatiseur pour ma pièce ?"; the others are titles only and unpublished.
  There are 4 categories with their descriptions.
- Sectors: 8 sectors with taglines and scenes. Restaurants et cafés gets its
  full content.
- Services: 3 with full content.
- Pages: À propos, Livraison et paiement, and the 5 legal pages (article
  headings plus placeholders).
- FAQs: everything listed in the inventory.

**Settings and reference data**
- Settings: phones, stores, hours, socials, promo bar, home sections.
- Cities: the 18 entries from the design.

**Demo accounts**

| Role | Login | Password |
|---|---|---|
| Admin | admin@climatisationmaroc.test | from `.env` |
| Gestionnaire | gestionnaire@climatisationmaroc.test | from `.env` |
| Reseller (validé) | contact@froid-atlas.ma | from `.env` |

The reseller is the demo company from the design ("Froid Atlas SARL").
Demo orders `CM-2026-01042` and leads exist **only** in a separate
`DemoSeeder`, not in production seeding.

## 10. Legacy import (phase 9)

`php artisan legacy:import {dump.sql} --dry-run --map=config/legacy.php`

1. Load the dump into a scratch schema `legacy_import` (`mysql` client in the
   container).
2. Introspect tables and columns and print a report.
3. Apply the configurable mapping. Table and column names live in
   `config/legacy.php`, which is written only after inspecting your dump.
4. Group variants into families with configurable name patterns: strip
   `\d[\d\s]*000 BTU`, colour words, and so on.
5. Copy images to the storage disk.
6. Write `legacy_id` and generate redirects.
7. Output a CSV report of unmapped rows and families to review.

## 11. Phase checklist (with visual check)

Each phase ends with:
- a comparison against the design file at 1440 and 390 (Playwright
  screenshots side by side with the design page rendered locally);
- a list of deliberate deviations in `docs/deviations.md`;
- a report to the owner, who reviews and commits (agents never commit).

| Phase | Scope |
|---|---|
| 2 | Docker stack, Laravel and Next skeletons, tokens, layout components (header, mega menu, drawer, footer, breadcrumb, buttons, forms, cards, FAQ), `ProductArt` |
| 3 | Migrations, models, factories, seeders, Filament resources and settings |
| 4 | Catalogue pages and APIs: gamme, catégorie (filters, facets, sort, pagination, compare), liste rapide, produit, marque, promotions, recherche, comparer |
| 5 | Basket, checkout, confirmation, tracking, e-mails |
| 6 | Leads (devis, contact, revendeur, secteur, stock alert), Sanctum auth via BFF, espace pro, commande rapide |
| 7 | Blog, solutions, services, cities, static pages, home sections, calculator |
| 8 | SEO: metadata, JSON-LD, sitemap.xml, robots.txt, redirects, image optimisation, Core Web Vitals pass, accessibility audit |
| 9 | Legacy import, full test suite, CI, production compose, docs (setup, architecture, deployment, French back-office guide) |
