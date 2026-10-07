# Structured data audit (JSON-LD)

- Date: 2026-10-07
- Target: http://localhost:8080 (dev stack, `NEXT_PUBLIC_SITE_URL=http://localhost:8080`; production builds use `https://climatisationmaroc.com` via `docker-compose.prod.yml`)
- Scope: all 238 sitemap URLs plus `/recherche?q=clim`, `/panier` and `/comparer`, 241 pages in total (176 product pages, 19 of them multi-variant), all fetched as anonymous HTML. Every `application/ld+json` block was parsed. No Microdata or RDFa was found.
- Sources: `frontend/src/lib/seo/jsonld.tsx`, `frontend/src/app/(site)/layout.tsx`, `frontend/src/app/(site)/produit/[slug]/page.tsx`, `frontend/src/app/(site)/blog/[slug]/page.tsx`, `frontend/src/components/layout/Breadcrumb.tsx`, `frontend/src/components/ui/FaqAccordion.tsx`, `frontend/src/views/content/StaticPageView.tsx`, `frontend/src/app/(site)/contact/page.tsx`

## 1. Summary

| # | Priority | Issue | Pages |
|---|---|---|---|
| P1-1 | Critical | « Prix sur demande » products emit `Offer` with `price: "0.00"` and `OutOfStock`, but the page shows « Prix sur demande » / « En stock » | 59 product pages |
| P1-2 | Critical | `availability` comes from `orderable` instead of `stock_status`. It lies whenever a product is on request, and `sur_commande` is never mapped to `BackOrder` | all product pages |
| P1-3 | High | FAQPage is emitted on a commercial site (FAQ rich results are limited to government and health sites since August 2023). Some questions are repeated across pages | 7 pages |
| P2-1 | High | Single-variant products are emitted as `ProductGroup` with one `hasVariant` instead of `Product` | 157 product pages |
| P2-2 | High | Multi-variant `ProductGroup` has no `variesBy`, no group `image`, no `isVariantOf` / `inProductGroupWithID` on variants, and no varying property on variants | 19 product pages |
| P2-3 | Medium | Offers have no `shippingDetails` although free delivery across Morocco is visible content. `hasMerchantReturnPolicy` is blocked because the returns text is still a placeholder | all priced products |
| P2-4 | Medium | Promo prices have no strikethrough reference price, although the regular price is shown struck through | 10 variants |
| P2-5 | Medium | HVACBusiness (contact, à propos): `openingHours` is silently dropped (regex does not match the en dash), there is no `@id`, both stores share `url`, and there is no `hasMap` / `image` / `priceRange` | `/contact`, `/a-propos` |
| P2-6 | Medium | Article: `publisher` is a second, unlinked Organization named « Climatisation Maroc », `datePublished` is missing, the type is `Article` rather than `BlogPosting`, and there is no `image` | blog article |
| P2-7 | Medium | Organization: `logo` is missing because `public/brand/logo-ariha-froid.png` is absent. There is no `contactPoint` | all pages |
| P3-1 | Low | Product, Breadcrumb, FAQ and Article blocks are written with raw `JSON.stringify` (no `<` escaping), unlike the `JsonLd` helper | all |
| P3-2 | Low | WebSite `SearchAction` brings no rich result (Google retired the sitelinks search box in Nov 2024), and `/recherche` is disallowed in robots.txt and noindex | all |
| P3-3 | Low | Organization + WebSite are repeated on every page and WebSite has no `@id` | all |
| P3-4 | Low | `itemCondition` is missing on offers | all product pages |
| Info | n/a | No `aggregateRating` or `review` is emitted, which is correct because the site has no reviews and none should be fabricated. No `gtin` exists in the data, so none should be invented. `priceValidUntil` is not needed: there is no promo end date in the data model and none should be made up | n/a |

What passes:
- `@context` is `https://schema.org` everywhere, every URL is absolute, and every block parses as valid JSON.
- BreadcrumbList is present on every inner page (all 240 non-home pages), with exactly one per page and none on the home page. Labels and links match the visible breadcrumb. Omitting `item` on the last crumb is allowed.
- Prices in offers are the public selling price (`promo_price` when set). For example, LG Dual Inverter 9 000 BTU gives `5200.00` MAD, which matches `data/catalog.json` (`price` 6300, `promo_price` 5200). `priceCurrency` is `MAD`.
- No duplicate FAQPage or BreadcrumbList on any page. No deprecated types (HowTo, SpecialAnnouncement and so on).

## 2. Detection by page type

| Page type | Example URL | Blocks found |
|---|---|---|
| Home | http://localhost:8080/ | Organization, WebSite (+SearchAction) |
| Range (gamme) | http://localhost:8080/climatisation | BreadcrumbList, FAQPage, Organization, WebSite |
| Range | /chauffe-eau, /cuivre-et-gaz, /froid, /gaines, /pieces-de-rechange, /ventilation | BreadcrumbList, Organization, WebSite |
| Category | http://localhost:8080/climatisation/mural (and the 18 others) | BreadcrumbList, Organization, WebSite |
| Product (priced) | http://localhost:8080/produit/lg-dual-inverter | BreadcrumbList, FAQPage, ProductGroup, Organization, WebSite |
| Product (on request) | http://localhost:8080/produit/cuivre-14-srk-15-m | BreadcrumbList, ProductGroup (price 0), Organization, WebSite |
| Brand | http://localhost:8080/marques/lg (and the 15 others + /marques) | BreadcrumbList, Organization, WebSite |
| Promotions | http://localhost:8080/promotions | BreadcrumbList, Organization, WebSite |
| Blog index / category | /blog, /blog/categorie/guides | BreadcrumbList, Organization, WebSite |
| Blog article | http://localhost:8080/blog/quelle-puissance-de-climatiseur-pour-ma-piece | BreadcrumbList, Article, Organization, WebSite |
| Services / solutions | /services/installation, /services/visite-technique, /services/service-apres-vente, /solutions/restaurants | BreadcrumbList, FAQPage, Organization, WebSite |
| Services / solutions index | /services, /solutions | BreadcrumbList, Organization, WebSite |
| Contact | http://localhost:8080/contact | BreadcrumbList, 2x HVACBusiness, Organization, WebSite |
| À propos | http://localhost:8080/a-propos | BreadcrumbList, 2x HVACBusiness (identical to /contact), Organization, WebSite |
| Livraison et paiement | http://localhost:8080/livraison-et-paiement | BreadcrumbList, FAQPage, Organization, WebSite |
| Espace pro | http://localhost:8080/espace-professionnel | BreadcrumbList, FAQPage, Organization, WebSite |
| Other | /calculateur-puissance, /demander-un-devis, /devenir-revendeur, /plan-du-site | BreadcrumbList, Organization, WebSite |
| Noindex | /recherche, /panier, /comparer | BreadcrumbList, Organization, WebSite (harmless) |

Product page statistics (176 pages): 157 have a single variant and 19 have several (Puissance 15, Diamètre 3, Capacité 1). 120 have no brand (`brand: null` in the API, which is consistent and must not be invented). 116 have no description. 63 have no image at all. 0 have gtin, aggregateRating or review.

## 3. Findings and fixes

### P1-1 « Prix sur demande » emits an Offer at 0 MAD (critical)

Affected (59 pages, all single-variant, all `onRequest: true`, `stock: en_stock`):
- `/produit/cuivre-{14,38,12,58,34,78}-srk-15-m`
- `/produit/caisson-dextraction-{77,99,1212,1515,1818}`
- `/produit/diffuseur-lineaire-{500-1,500-2,600-1,600-2,800-1,1000-1,1000-2,1500-1,2000-1}`
- `/produit/grille-simple-{2010,3010,3015,4010,4020,5010,5015,5020,6010,6015,6020,7010,8010,8015,8020,10010,10015,10020}`
- `/produit/grille-double-{2010,3010,3015,4010,4020,5010,5015,5020,6010,6015,6020,7010,8010,8015,8020,10010,10015,10020}`
- `/produit/ventilateur-de-gaine-q315-plastique-sp`
- `/produit/flexible-isole-aluminium-q125-esbo-10-m`
- `/produit/flexible-isole-aluminium-q160-esbo-10-m`

Faulty (http://localhost:8080/produit/cuivre-14-srk-15-m):

```json
{
  "@context": "https://schema.org",
  "@type": "ProductGroup",
  "name": "Cuivre 1/4 SRK 15 m",
  "url": "http://localhost:8080/produit/cuivre-14-srk-15-m",
  "productGroupID": "cuivre-14-srk-15-m",
  "hasVariant": [{
    "@type": "Product",
    "name": "Cuivre 1/4 SRK 15 m",
    "sku": "XLS-CUIVRESRK14",
    "offers": {
      "@type": "Offer",
      "url": "http://localhost:8080/produit/cuivre-14-srk-15-m?v=XLS-CUIVRESRK14",
      "priceCurrency": "MAD",
      "price": "0.00",
      "availability": "https://schema.org/OutOfStock"
    }
  }]
}
```

Problems:
1. The offer says the product is free, while the page shows « Prix sur demande ». This misrepresents the price, can trigger a Merchant Center or manual-action price mismatch, and Google may show « 0,00 MAD » in results.
2. `OutOfStock` contradicts the visible « En stock » (see P1-2).
3. Google has no valid way to mark up a price-on-request product. An `Offer` without `price` is invalid for merchant listings, and a `Product` without `offers`, `review` or `aggregateRating` is invalid for product snippets.

Corrected: emit no Product or ProductGroup for these pages and keep only the BreadcrumbList (plus the site-wide blocks). For mixed families (none today, but the code must handle them), keep only the variants that have a price and drop the rest from `hasVariant`. If no variant is left, emit nothing.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "http://localhost:8080/" },
    { "@type": "ListItem", "position": 2, "name": "Cuivre et gaz", "item": "http://localhost:8080/cuivre-et-gaz" },
    { "@type": "ListItem", "position": 3, "name": "Cuivre", "item": "http://localhost:8080/cuivre-et-gaz/cuivre" },
    { "@type": "ListItem", "position": 4, "name": "Cuivre 1/4 SRK 15 m" }
  ]
}
```

Implementation (`frontend/src/app/(site)/produit/[slug]/page.tsx`): build the list as `const priced = product.variants.filter(v => !v.onRequest && v.price > 0)` and render the product JSON-LD only when `priced.length > 0`.

### P1-2 Availability mapped from `orderable` instead of the stock status (critical)

Faulty mapping: `availability: v.orderable ? InStock : OutOfStock`. Because `orderable = isOrderable() && !onRequest`, every on-request variant is reported OutOfStock even though the visible label is « En stock ». The `sur_commande` status (`StockStatus::SurCommande`) would also be reported InStock or OutOfStock instead of `BackOrder`.

Corrected mapping (the API already exposes `v.stock`):

| `stock_status` | Visible label | schema.org |
|---|---|---|
| `en_stock` | En stock | `https://schema.org/InStock` |
| `sur_commande` | Sur commande | `https://schema.org/BackOrder` |
| `rupture` | Rupture | `https://schema.org/OutOfStock` |

On-request variants emit no offer at all (P1-1).

### P1-3 FAQPage on a commercial site (high)

Pages: http://localhost:8080/climatisation, /produit/lg-dual-inverter, /services/installation, /services/visite-technique, /services/service-apres-vente, /solutions/restaurants, /livraison-et-paiement, /espace-professionnel.

Since August 2023, Google shows FAQ rich results only for well-known government and health websites. An HVAC shop is not eligible, so the markup brings nothing. It also duplicates the same Q&A across pages: « Quelle puissance choisir ? » appears on `/climatisation` and on `/produit/lg-dual-inverter`, and the payment and delivery answers repeat `/livraison-et-paiement`. Faulty example (http://localhost:8080/produit/lg-dual-inverter):

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Quelle puissance choisir ?", "acceptedAnswer": { "@type": "Answer", "text": "Environ 600 BTU par m² : 9 000 BTU jusqu’à 15 m², ..." } },
    { "@type": "Question", "name": "Le kit d’installation est-il inclus ?", "acceptedAnswer": { "@type": "Answer", "text": "Non. Ajoutez le kit duo 1/4-3/8 ..." } },
    { "@type": "Question", "name": "Comment payer ?", "acceptedAnswer": { "@type": "Answer", "text": "Vous payez à la livraison. ..." } }
  ]
}
```

Corrected: remove the block. Keep the visible accordions. In `frontend/src/components/ui/FaqAccordion.tsx`, change the default to `jsonLd = false` (or remove the script entirely).

### P2-1 Single-variant products wrapped in a ProductGroup (high)

157 of 176 product pages have exactly one variant and are emitted as `ProductGroup` + one `hasVariant`. Google's variant documentation expects a ProductGroup to group at least two variants. A single sellable item should be a plain `Product`.

Faulty (http://localhost:8080/produit/ventilateur-de-gaine-q160-plastique, structure as emitted):

```json
{ "@context": "https://schema.org", "@type": "ProductGroup", "name": "...", "productGroupID": "ventilateur-de-gaine-q160-plastique",
  "hasVariant": [{ "@type": "Product", "name": "...", "sku": "...", "offers": { "@type": "Offer", "...": "..." } }] }
```

Corrected template for a single-variant priced product (values come from the API; omit `brand`, `description` or `image` when null, and never invent them):

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "http://localhost:8080/produit/<slug>#product",
  "name": "<product.name>",
  "description": "<product.description ?? product.shortDescription>",
  "image": ["http://localhost:8080/storage/products/<slug>/<file>-640.webp"],
  "sku": "<variant.sku>",
  "brand": { "@type": "Brand", "name": "<brand.name>" },
  "url": "http://localhost:8080/produit/<slug>",
  "offers": {
    "@type": "Offer",
    "url": "http://localhost:8080/produit/<slug>",
    "priceCurrency": "MAD",
    "price": "<variant.price / 100>",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@id": "http://localhost:8080/#organisation" },
    "shippingDetails": { "@id": "http://localhost:8080/livraison-et-paiement#livraison" }
  }
}
```

Note on `shippingDetails`: if you prefer not to reference by `@id`, inline the object from P2-3. Google resolves inline objects most reliably.

### P2-2 Multi-variant ProductGroup is incomplete (high)

Pages (19): /produit/lg-dual-inverter, lg-artcool-smart-inverter, carrier-mural-normal-onoff-410a, carrier-mural-inverter-r32, fitco-mural-normal-r410, fitco-mural-inverter, carrier-miroir-inverter-noir-r32, ciat-mural-inverter, lg-jetcool-inverter-r32, lg-gainable-inverter, carrier-gainable-normal-onoff-410a, carrier-gainable-inverter, fitco-gainable-normal-onoff-r410, ciat-gainable-inverter, chauffe-eau-solaire-simsek-circuit-ferme, ventilateur-de-gaine-nanyo-galvanise, multizone, flexible-souple-esbo-10-m, carrier-cassette-inverter.

Faulty (http://localhost:8080/produit/lg-dual-inverter, abridged to 2 of 4 variants):

```json
{
  "@context": "https://schema.org",
  "@type": "ProductGroup",
  "name": "LG Dual Inverter",
  "description": "Le LG Dual Inverter adapte en continu la vitesse de son compresseur ...",
  "url": "http://localhost:8080/produit/lg-dual-inverter",
  "brand": { "@type": "Brand", "name": "LG" },
  "productGroupID": "lg-dual-inverter",
  "hasVariant": [
    { "@type": "Product", "name": "LG Dual Inverter 9 000 BTU", "sku": "D10AWH.NW0",
      "image": "http://localhost:8080/storage/products/lg-dual-inverter/20260727170259-640.webp",
      "offers": { "@type": "Offer", "url": "http://localhost:8080/produit/lg-dual-inverter?v=D10AWH.NW0", "priceCurrency": "MAD", "price": "5200.00", "availability": "https://schema.org/InStock" } },
    { "@type": "Product", "name": "LG Dual Inverter 12 000 BTU", "sku": "D13AJH.N", "...": "..." }
  ]
}
```

Missing:
- The group-level `image`. Google needs an image for merchant listings, and the gallery images are available.
- `variesBy`. Google accepts only `color`, `size`, `material`, `pattern`, `suggestedAge` and `suggestedGender`. Diameter (Ø) and capacity (L) groups map naturally to `https://schema.org/size`. Power in BTU has no accepted value: describe it with `additionalProperty` on each variant and leave `variesBy` out rather than mislabel it, or add `variesBy: color` only for families that really vary by colour.
- `inProductGroupWithID` on each variant, which links the variant back to its group.
- `itemCondition`, `shippingDetails` and the strikethrough price (P2-3, P2-4).

Corrected (http://localhost:8080/produit/lg-dual-inverter, all values from the API and `data/catalog.json`):

```json
{
  "@context": "https://schema.org",
  "@type": "ProductGroup",
  "@id": "http://localhost:8080/produit/lg-dual-inverter#product",
  "name": "LG Dual Inverter",
  "description": "Le LG Dual Inverter adapte en continu la vitesse de son compresseur : la pièce refroidit vite, puis la température reste stable avec une consommation réduite, jusqu'à 70 % d'électricité en moins. Il est classé tropical T3 pour les fortes chaleurs, reste silencieux et se pilote depuis le téléphone avec LG ThinQ.",
  "url": "http://localhost:8080/produit/lg-dual-inverter",
  "image": [
    "http://localhost:8080/storage/products/lg-dual-inverter/20260727170259-640.webp",
    "http://localhost:8080/storage/products/lg-dual-inverter/D13AJH-170820241723883334-640.webp"
  ],
  "brand": { "@type": "Brand", "name": "LG" },
  "productGroupID": "lg-dual-inverter",
  "hasVariant": [
    {
      "@type": "Product",
      "name": "LG Dual Inverter 9 000 BTU",
      "sku": "D10AWH.NW0",
      "inProductGroupWithID": "lg-dual-inverter",
      "image": "http://localhost:8080/storage/products/lg-dual-inverter/20260727170259-640.webp",
      "additionalProperty": { "@type": "PropertyValue", "name": "Puissance", "value": 9000, "unitText": "BTU" },
      "offers": {
        "@type": "Offer",
        "url": "http://localhost:8080/produit/lg-dual-inverter?v=D10AWH.NW0",
        "priceCurrency": "MAD",
        "price": "5200.00",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "priceType": "https://schema.org/StrikethroughPrice",
          "price": "6300.00",
          "priceCurrency": "MAD"
        },
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": { "@id": "http://localhost:8080/#organisation" },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "MAD" },
          "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "MA" }
        }
      }
    },
    {
      "@type": "Product",
      "name": "LG Dual Inverter 12 000 BTU",
      "sku": "D13AJH.N",
      "inProductGroupWithID": "lg-dual-inverter",
      "image": "http://localhost:8080/storage/products/lg-dual-inverter/D13AJH-170820241723883334-640.webp",
      "additionalProperty": { "@type": "PropertyValue", "name": "Puissance", "value": 12000, "unitText": "BTU" },
      "offers": {
        "@type": "Offer",
        "url": "http://localhost:8080/produit/lg-dual-inverter?v=D13AJH.N",
        "priceCurrency": "MAD",
        "price": "5500.00",
        "priceSpecification": { "@type": "UnitPriceSpecification", "priceType": "https://schema.org/StrikethroughPrice", "price": "6700.00", "priceCurrency": "MAD" },
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": { "@id": "http://localhost:8080/#organisation" },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "MAD" },
          "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "MA" }
        }
      }
    }
  ]
}
```

(The 18 000 BTU variant `D19AKH.NK0` sells at 7300.00 with a reference price of 8800.00, and the 24 000 BTU variant `D24AKH-N` at 8800.00 with 9700.00, following the same pattern.)

For Diamètre and Capacité groups (`ventilateur-de-gaine-nanyo-galvanise`, `flexible-souple-esbo-10-m`, `chauffe-eau-solaire-simsek-circuit-ferme` and the like), add `"variesBy": ["https://schema.org/size"]` on the group and `"size": "<variant.label>"` (for example `"Ø 160"` or `"300 L"`) on each variant.

Variants with no image (76 of 241): omit `image` on the variant (it inherits the group image). If the whole family has no image (63 products, for example `/produit/lg-cassette-inverter` and `/produit/caisson-dextraction-77`), the markup stays valid for product snippets but is not eligible for merchant listings until photos are added. Do not use placeholder art.

### P2-3 Shipping details and return policy (medium)

Every offer lacks `shippingDetails`. Free delivery across Morocco is visible on every product page and on http://localhost:8080/livraison-et-paiement (« Livraison gratuite partout au Maroc »), so it can be marked up as in the corrected offer above (`shippingRate` 0 MAD, `shippingDestination` MA). Do not add `deliveryTime`: the page says the delay « dépend de votre ville » and gives no figure.

Do not add `hasMerchantReturnPolicy` yet. The « Retours et garantie » section of http://localhost:8080/livraison-et-paiement still shows the literal placeholder `[CONDITIONS DE RETOUR]`. That is also a content issue on a published page, which the CLAUDE.md rules forbid, and should be fixed separately. Once real terms exist, add a single `MerchantReturnPolicy` (`applicableCountry: "MA"`, `returnPolicyCategory`, `merchantReturnDays`) under the Organization as `hasMerchantReturnPolicy`.

### P2-4 Promo price without a reference price (medium)

10 variants have `regularPrice > price`, and the page shows the regular price struck through. The offer only carries the selling price. Add `priceSpecification` with `priceType: https://schema.org/StrikethroughPrice` and the regular price, as in the corrected example above. Never expose `pro_price`. The JSON-LD uses `v.price` from the API, which is the public price for anonymous visitors, so a reseller session only changes its own HTML. Keep product pages uncached per user, or render the JSON-LD from the public price only.

`priceValidUntil`: there is no promo end date in `product_variants`. Do not invent one, because it is optional and a fake date is worse than none. If a promo end date is later added to the model, emit it in ISO 8601 (`2026-12-31`) only on discounted offers.

### P2-5 HVACBusiness on /contact and /a-propos (medium)

Faulty (http://localhost:8080/contact, identical on http://localhost:8080/a-propos):

```json
[
  { "@context": "https://schema.org", "@type": "HVACBusiness", "name": "Ariha Froid · Magasin Sakar",
    "parentOrganization": { "@id": "http://localhost:8080/#organisation" },
    "url": "http://localhost:8080/contact", "telephone": "+212524306850",
    "address": { "@type": "PostalAddress", "streetAddress": "Lot Sakar Villa 107", "addressLocality": "Marrakech", "postalCode": "40070", "addressCountry": "MA" } },
  { "@context": "https://schema.org", "@type": "HVACBusiness", "name": "Ariha Froid · Magasin Al Manar",
    "parentOrganization": { "@id": "http://localhost:8080/#organisation" },
    "url": "http://localhost:8080/contact", "telephone": "+212524306850",
    "address": { "@type": "PostalAddress", "streetAddress": "Magasin 60-2, Imm 50 Al Manar", "addressLocality": "Marrakech", "postalCode": "40100", "addressCountry": "MA" } }
]
```

Problems:
1. `openingHours` is missing although the hours are visible (« Lundi – Samedi, 9h – 19h »). In `openingHours()` in `frontend/src/lib/seo/jsonld.tsx`, the regex accepts only `à|au|-` as separators, and the settings text uses an en dash `–` (U+2013), so the function returns `null` and the property is silently dropped. The fix is to accept `[-–—]|à|au` in both places.
2. There is no `@id`, so the two pages declare the same businesses as anonymous duplicates. Give each store a stable `@id` and use the same block on both pages.
3. Both stores have the same `url`. Use a fragment per store, such as `/contact#magasin-sakar`.
4. There is no `geo` and no coordinates are known: do not invent them. Use `hasMap` with the Google Maps link already shown on the page.
5. `image` and `priceRange` are recommended. Add `image` only once a real store photo or logo exists (the logo file is currently missing, see P2-7). Omit `priceRange` rather than guess.

Corrected:

```json
[
  {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    "@id": "http://localhost:8080/contact#magasin-sakar",
    "name": "Ariha Froid · Magasin Sakar",
    "url": "http://localhost:8080/contact#magasin-sakar",
    "parentOrganization": { "@id": "http://localhost:8080/#organisation" },
    "telephone": "+212524306850",
    "email": "ecom@arihafroid.com",
    "address": { "@type": "PostalAddress", "streetAddress": "Lot Sakar Villa 107", "addressLocality": "Marrakech", "postalCode": "40070", "addressCountry": "MA" },
    "hasMap": "https://www.google.com/maps/search/?api=1&query=Lot%20Sakar%20Villa%20107%2C%20Marrakech%2040070",
    "openingHoursSpecification": [{
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["https://schema.org/Monday", "https://schema.org/Tuesday", "https://schema.org/Wednesday", "https://schema.org/Thursday", "https://schema.org/Friday", "https://schema.org/Saturday"],
      "opens": "09:00",
      "closes": "19:00"
    }],
    "areaServed": { "@type": "Country", "name": "Maroc" }
  },
  {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    "@id": "http://localhost:8080/contact#magasin-al-manar",
    "name": "Ariha Froid · Magasin Al Manar",
    "url": "http://localhost:8080/contact#magasin-al-manar",
    "parentOrganization": { "@id": "http://localhost:8080/#organisation" },
    "telephone": "+212524306850",
    "email": "ecom@arihafroid.com",
    "address": { "@type": "PostalAddress", "streetAddress": "Magasin 60-2, Imm 50 Al Manar", "addressLocality": "Marrakech", "postalCode": "40100", "addressCountry": "MA" },
    "hasMap": "https://www.google.com/maps/search/?api=1&query=Magasin%2060-2%2C%20Imm%2050%20Al%20Manar%2C%20Marrakech%2040100",
    "openingHoursSpecification": [{
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["https://schema.org/Monday", "https://schema.org/Tuesday", "https://schema.org/Wednesday", "https://schema.org/Thursday", "https://schema.org/Friday", "https://schema.org/Saturday"],
      "opens": "09:00",
      "closes": "19:00"
    }],
    "areaServed": { "@type": "Country", "name": "Maroc" }
  }
]
```

Both stores share the « Fixe » line. That matches the visible content, so it is kept. If each store has its own number, store it in the settings per store.

### P2-6 Blog article (medium)

Faulty (http://localhost:8080/blog/quelle-puissance-de-climatiseur-pour-ma-piece):

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Quelle puissance de climatiseur pour ma pièce ?",
  "description": "Surface, ensoleillement, étage : la méthode simple pour choisir entre 9 000, 12 000, 18 000 et 24 000 BTU, avec le tableau des puissances.",
  "mainEntityOfPage": "http://localhost:8080/blog/quelle-puissance-de-climatiseur-pour-ma-piece",
  "dateModified": "2026-10-06T20:01:22+00:00",
  "author": { "@type": "Organization", "name": "Ariha Froid" },
  "publisher": { "@type": "Organization", "name": "Climatisation Maroc" }
}
```

Problems:
1. `publisher` is a second Organization, « Climatisation Maroc » (that is the site name, which is the Organization's `alternateName`), with no link to `#organisation`. Google sees two publishers. Reference the site-wide Organization by `@id` for both `author` and `publisher`.
2. `datePublished` is missing because `publishedAt` is `null` in the API for a published article, and no date is shown on the page either. This is a data bug: set the publication date in the back office. Once it is set, it flows to both the page and the markup.
3. Use `BlogPosting`, the more specific type for a blog.
4. `image` is missing because the article has no `cover`. It is recommended for Article rich results. Add a real cover; do not use a placeholder.
5. `inLanguage` is missing.

Corrected (fill `datePublished` with the real date once it is set; `image` only when a cover exists):

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": "http://localhost:8080/blog/quelle-puissance-de-climatiseur-pour-ma-piece#article",
  "headline": "Quelle puissance de climatiseur pour ma pièce ?",
  "description": "Surface, ensoleillement, étage : la méthode simple pour choisir entre 9 000, 12 000, 18 000 et 24 000 BTU, avec le tableau des puissances.",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "http://localhost:8080/blog/quelle-puissance-de-climatiseur-pour-ma-piece" },
  "inLanguage": "fr-MA",
  "datePublished": "<article.publishedAt, ISO 8601>",
  "dateModified": "2026-10-06T20:01:22+00:00",
  "author": { "@id": "http://localhost:8080/#organisation" },
  "publisher": { "@id": "http://localhost:8080/#organisation" },
  "articleSection": "Guides d’achat"
}
```

### P2-7 Organization (medium)

Faulty (every page):

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "http://localhost:8080/#organisation",
  "name": "Ariha Froid",
  "alternateName": "Climatisation Maroc",
  "url": "http://localhost:8080/",
  "telephone": "+212666854184",
  "email": "ecom@arihafroid.com",
  "sameAs": ["https://web.facebook.com/maroc.climatisation", "https://www.instagram.com/arihafroid_climatisation/", "https://www.tiktok.com/@arihafroid_climatisation"]
}
```

Problems: `logo` is absent because `logoSrc()` looks for `frontend/public/brand/logo-ariha-froid.png`, which does not exist (only `sample-lg-dual.png` is in that folder). The header uses the same helper, so the visible logo is missing too. There is no `contactPoint` for the per-service numbers, and no link to the two stores.

Corrected (once the logo file is present):

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "http://localhost:8080/#organisation",
  "name": "Ariha Froid",
  "alternateName": "Climatisation Maroc",
  "url": "http://localhost:8080/",
  "logo": "http://localhost:8080/brand/logo-ariha-froid.png",
  "email": "ecom@arihafroid.com",
  "telephone": "+212666854184",
  "contactPoint": [
    { "@type": "ContactPoint", "contactType": "sales", "telephone": "+212666854184", "areaServed": "MA", "availableLanguage": "French" },
    { "@type": "ContactPoint", "contactType": "customer support", "telephone": "+212666088348", "areaServed": "MA", "availableLanguage": "French" },
    { "@type": "ContactPoint", "contactType": "billing support", "telephone": "+212666661882", "areaServed": "MA", "availableLanguage": "French" }
  ],
  "subOrganization": [
    { "@id": "http://localhost:8080/contact#magasin-sakar" },
    { "@id": "http://localhost:8080/contact#magasin-al-manar" }
  ],
  "sameAs": ["https://web.facebook.com/maroc.climatisation", "https://www.instagram.com/arihafroid_climatisation/", "https://www.tiktok.com/@arihafroid_climatisation"]
}
```

(Phone numbers and labels come from the navigation API footer: Ventes, Conseil, Service facturation. « Projets et revendeurs » can be added as `contactType: "sales"` with a `name`.)

### P3-1 Unescaped JSON-LD output (low, robustness and security)

`Breadcrumb.tsx`, `FaqAccordion.tsx`, `produit/[slug]/page.tsx` and `blog/[slug]/page.tsx` inject `JSON.stringify(schema)` directly. A product name, FAQ answer or article title containing `</script>` (all editable in Filament) would break out of the script tag. Use the existing `JsonLd` component from `frontend/src/lib/seo/jsonld.tsx`, which escapes `<` to `<`.

### P3-2 WebSite SearchAction (low)

```json
{ "@context": "https://schema.org", "@type": "WebSite", "name": "Climatisation Maroc", "url": "http://localhost:8080/", "inLanguage": "fr-MA",
  "publisher": { "@id": "http://localhost:8080/#organisation" },
  "potentialAction": { "@type": "SearchAction", "target": { "@type": "EntryPoint", "urlTemplate": "http://localhost:8080/recherche?q={search_term_string}" }, "query-input": "required name=search_term_string" } }
```

The markup is valid, but Google retired the sitelinks search box in November 2024, so it brings no rich result. `/recherche` is also `Disallow`ed in robots.txt and `noindex`. You can keep it, since it is harmless and still a valid schema.org description. Corrected (adds an `@id`, emitted on the home page only):

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "http://localhost:8080/#website",
  "name": "Climatisation Maroc",
  "alternateName": "Ariha Froid",
  "url": "http://localhost:8080/",
  "inLanguage": "fr-MA",
  "publisher": { "@id": "http://localhost:8080/#organisation" },
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": "http://localhost:8080/recherche?q={search_term_string}" },
    "query-input": "required name=search_term_string"
  }
}
```

### P3-3 Organization and WebSite on every page (low)

This is not an error, because the entities are identical and linked by `@id`. Google only needs them on the home page. Moving them from `(site)/layout.tsx` to the home page saves about 1 KB per page. If they stay site-wide, keep the `@id`s stable so that every page refers to the same entity.

### P3-4 `itemCondition` (low)

All products are new. Add `"itemCondition": "https://schema.org/NewCondition"` to every offer, as shown in the corrected examples.

## 4. Missing opportunities (optional, after the fixes above)

| Opportunity | Where | Notes |
|---|---|---|
| `CollectionPage` + `ItemList` of product URLs | range, category, brand and promotions pages | No rich result outside the EU product carousel. Low value, but it clarifies the page. Only list priced, published products. |
| `Brand` entity with `logo` | `/marques/<slug>` | Could be referenced from Product `brand` by `@id`. Low value. |
| `Service` (provider = Organization, areaServed Marrakech or Maroc) | `/services/installation`, `/services/visite-technique`, `/services/service-apres-vente` | Only with the real visible prices (for example technical visit 300 Dhs = `technicalVisitPrice` 30000 centimes). No rich result. |
| `mpn` | manufacturer-coded SKUs (for example LG `D10AWH.NW0`) | Only where the SKU is the maker's model reference. Internal `XLS-…` / `CLIM…` codes are not MPNs. Needs a data flag; do not guess. |
| `gtin13` | all products | Not in the data. Add only if real EAN codes are collected. |

## 5. Data notes for the catalogue owner

- 80 variants are flagged `needs_verification`, and 19 of them have a public price that is shown and therefore marked up (for example `ciat-gainable-inverter`, `carrier-cassette-inverter`, `ciat-mural-inverter`, `multizone`). The markup matches the page, so it is valid, but any unverified price is now announced to search engines as a firm offer. Consider holding these prices back (both on the page and in the markup) until they are verified.
- `/produit/flexible-isole-thermique-en-aluminium-q250-10-m` uses `ESBO` (the brand name) as its SKU, which is a weak identifier.
- 59 « Prix sur demande » items are marked `en_stock`. If they are really made to order, `sur_commande` would be more accurate on the page as well.

## 6. Re-test checklist

1. `curl -s http://localhost:8080/produit/cuivre-14-srk-15-m | grep -c '"price":"0.00"'` returns `0`, and the page has no Product or ProductGroup block.
2. No `FAQPage` remains anywhere: `grep -c FAQPage` returns 0 on the 8 pages listed in P1-3.
3. `/produit/lg-dual-inverter` passes the Rich Results Test (Product snippets + Merchant listings) with no errors. Warnings may remain only for `hasMerchantReturnPolicy`, `gtin` or `mpn`, which are intentionally absent.
4. `/contact` HVACBusiness shows `openingHoursSpecification` and a distinct `@id` per store.
5. The blog article shows a single publisher, `#organisation`, and has `datePublished`.
6. The production build emits `https://climatisationmaroc.com/...` in every `@id`, `url` and `item`.
