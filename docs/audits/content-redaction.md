# Content and copy audit (rédaction française)

- Date: 2026-10-07
- Target: http://localhost:8080 (dev stack)
- Scope: all 238 sitemap URLs were fetched as anonymous HTML. Seven linked pages outside the sitemap were also fetched: `/chauffe-eau/electrique`, `/chauffe-eau/gaz`, `/chauffe-eau/chaudiere`, `/panier`, `/suivi-commande`, `/comparer` and `/connexion`. I also loaded `/recherche?q=clim` and a 404 URL. Visible text, `<title>`, meta description, headings, `alt`, `placeholder` and `aria-label` were scanned on every page. I read 26 product pages in full: 7 show « Prix sur demande » as the main price, and 59 of the 176 product pages show it in total. All other page types were read in full.
- Method: text extraction and automated typography checks (Python). Spacing characters were checked at the code-point level (U+0020, U+00A0, U+202F). Facts were checked against `data/catalog.json` and `data/excel-additions.json`. Readability uses the Kandel–Moles index, the French adaptation of Flesch.
- Caveats: word counts include breadcrumbs and short UI labels in the main area, so treat them as approximate. The header and footer are excluded. The dev server returned some 502 errors under load. Those pages were fetched again and are all included.
- Business rule: **no fact, price or product is invented here.** Any text marked **PROPOSITION** is new copy for the owner to approve. Text marked **À CONFIRMER** depends on a fact only the owner can supply.

Typography conventions used in the corrected text below:
- `⍽` stands for a non-breaking space (U+00A0) and `ˬ` for a narrow non-breaking space (U+202F). Where the corrected text is written in plain prose, apply these rules (§7):
  - non-breaking space before `:`
  - narrow non-breaking space before `; ! ? %`
  - non-breaking space inside `« »`
  - non-breaking space between a number and its unit, and as the thousands separator

---

## 1. Scores

| Indicator | Score | Comment |
|---|---|---|
| **Content quality (overall)** | **48 / 100** | The editorial pages (blog, calculator, restaurants, delivery, services) are clean and readable. They are dragged down by visible placeholders, unsupported claims (« −30 % », « sous 48 heures »), 117 boilerplate meta descriptions, about 165 product pages with no descriptive copy, and old-site product names that were never normalised. |
| E-E-A-T, weighted | **46 / 100** | Breakdown below |
| — Experience (20 %) | 40 | « depuis 2008 », two named shops and in-house technicians are real signals. But the shop and team photos are placeholders, the restaurant gallery uses illustrations, and there are no project references or customer reviews. |
| — Expertise (25 %) | 50 | The blog guide is accurate and consistent with the calculator (600 BTU/m²). There is no named author or technician, product specs are minimal, and only 1 of about 30 air-conditioner families has a description. |
| — Authoritativeness (25 %) | 40 | « Distributeur officiel LG » and « Marques officielles » are claimed without proof, LG technical claims are not sourced, and the brand pages are empty for 14 of 16 brands. |
| — Trustworthiness (30 %) | 50 | Two addresses, five phone numbers, an email, opening hours, cash on delivery and free delivery are all strong. Against that: returns and warranty text is a placeholder, there is no CGV, legal notice or privacy page (yet forms make users accept the CGV), two claims contradict each other, and internal `XLS-…` references are shown. |
| **AI citation readiness** | **45 / 100** | Good: the « En bref » block, power table and FAQ on the blog article, the calculator method, and a climatisation FAQ. Weak: no dated or authored content, no defining paragraph on 30+ category and brand pages, claims not attributed to a source, and product pages with no quotable facts beyond SKU and price. |

Readability (Kandel–Moles; 60–70 is standard, 70–80 is easy):

| URL | Words / sentence | Score |
|---|---|---|
| /blog/quelle-puissance-de-climatiseur-pour-ma-piece | 13.1 | 79 (easy) |
| /solutions/restaurants | 12.9 | 75 |
| /livraison-et-paiement | 9.2 | 82 |
| /services/installation | 8.7 | 81 |
| /climatisation/mural | 29.0 | 61 (one 60-word paragraph; split it) |
| /a-propos | 21.0 | 53 (long sentences; see M7) |

---

## 2. Prioritised summary

| # | Priority | Issue | Pages |
|---|---|---|---|
| C1 | Critical | Placeholders visible: `[PHOTO MAGASIN]`, `[PHOTO ÉQUIPE]`, `[DÉLAI PAR VILLE]`, `[CONDITIONS DE RETOUR]` | /a-propos, /livraison-et-paiement |
| C2 | Critical | Unsupported discount claim « jusqu'à -30 % » (the highest discount shown on the site is −18 %; the highest in the catalogue is 24 %) | every page (promo bar) + home H1 |
| C3 | Critical | Contradiction: « livraison… sous 48 heures » (FAQ and FAQPage schema) versus « Le délai dépend de votre ville » | /climatisation vs /livraison-et-paiement |
| C4 | Critical | « J'accepte les conditions générales de vente » is required, but no CGV page exists or is linked. There is also no legal notice or privacy page, although forms collect name, phone, ICE and email. | /devenir-revendeur, checkout |
| H1 | High | Internal placeholder references `XLS-…` shown publicly as « Réf. » | 62 product pages + listings |
| H2 | High | 117 meta descriptions are a template (« {Titre} · Climatisation Maroc. Boutique d'Ariha Froid… Livraison… ») cut off with « … ». 47 more are just « Pièces de rechange. Référence CLIM00012. » | 164 pages |
| H3 | High | Product names inherited from the old site: Title Case, `Q` used for `Ø`, ON/OFF / On-Off / On/Off, R410 vs 410A, « Spain », misspellings (« Venteuse », « Carrer », « Motorise », « Plazma »?), `°c`, `40X40`, `x50 PCS` | about 170 product names (see §4) |
| H4 | High | Empty or near-empty pages that are linked or listed: `/froid` (H1 only), `/chauffe-eau/electrique`, `/gaz` and `/chaudiere` (« 0 produit »), linked from the menu, footer, /chauffe-eau and /plan-du-site | 4 pages + the links to them |
| H5 | High | « Promotions » block on the home page shows Fitco Mural Inverter, Carrier Mural Inverter R32 and CIAT Mural Inverter, none of which is on promotion (/promotions lists LG Dual, LG Artcool and Fitco Mural Normal) | / |
| H6 | High | Thin product pages: no description on about 165 of 176. Several air conditioners have no type, technology or power in their specs (only « Marque » and « Référence ») | /produit/* |
| H7 | High | Unverified authority claims: « Distributeur officiel » (LG), « Marques officielles », « Solutions clés en main sous 48 h ouvrées », LG « jusqu'à 70 % d'électricité en moins », « Tropical T3 », « Wi-Fi LG ThinQ » (none of these is in `catalog.json`) | /marques/lg, /produit/lg-dual-inverter, /climatisation/mural, /a-propos, / |
| M1 | Medium | No non-breaking space before `: ? ! %` site-wide, regular space between number and unit (`9 000 BTU`, `15 m`), mixed `'` and `’` | all |
| M2 | Medium | Hours written « Lundi – Samedi, 9h – 19h » and « 9h à 19h » | all (footer) + about 30 pages |
| M3 | Medium | Phone format « 0666-854184 » differs from the form placeholder « 06 12 34 56 78 » | all |
| M4 | Medium | Inconsistent phone routing: « Ventes et conseil : 0666-854184 » whereas Conseil is 0666-088348 | /climatisation |
| M5 | Medium | Category, subcategory and brand pages have no introductory text (H1 + grid only) | 27 listing pages + 15 brand pages |
| M6 | Medium | Duplicate title and H1 « Gaines circulaires » on /gaines and /gaines/gaines-circulaires. Duplicate meta descriptions for the Carrier Inverter and LG mural products | 4 pages |
| M7 | Medium | /a-propos: long sentences; shop name glued to the address (« Magasin Sakar » / « Lot Sakar… » are separate elements, which is fine visually but needs checking on mobile) | /a-propos |
| M8 | Medium | Home teaser « Hôtels · Restaurants · Bureaux · Écoles … » but only « Restaurants et cafés » is published | / |
| M9 | Medium | The restaurant « En images » gallery is made of illustrations, not real installations | /solutions/restaurants |
| M10 | Medium | Blog article has no visible date or author, and « 6 min de lecture » for about 430 words of body text | /blog/quelle-puissance-… |
| L1 | Low | Discount badge −18 % on cards but −17 % on the LG Dual Inverter page | /, /promotions vs /produit/lg-dual-inverter |
| L2 | Low | Minor wording (« Hésitez entre deux puissances ? », « Choisir un type de gaines », « 30 000 + », « Super promo », « Commander par WhatsApp » on the after-sales page) | various |
| L3 | Low | Footer accordion headings read twice (« Informations + Informations ») by crawlers and screen readers | all |
| L4 | Low | Server-rendered 404 page has no French message or links (body shows « 404 » only) | any unknown URL |
| L5 | Low | `aria-label="Menu"` is fine in French. No other English UI string was found, apart from « Spain » in product names (H3) | — |

---

## 3. Detailed findings

### C1. Visible placeholders (Critical)

| URL | Faulty text | Correction |
|---|---|---|
| http://localhost:8080/a-propos | `[PHOTO MAGASIN]` (twice: hero image and the Sakar shop card) | Replace with a real photo of each shop supplied by the owner. Until then, hide the image block instead of showing the label. Source: `frontend/src/components/content/AboutSections.tsx`, `frontend/src/components/content/blocks.tsx` |
| http://localhost:8080/a-propos | `[PHOTO ÉQUIPE]` (Al Manar shop card) | Same: a real photo or no image. Note that it sits on the **Al Manar shop** card, so a shop photo is expected there, not a team photo. |
| http://localhost:8080/livraison-et-paiement | « Le délai dépend de votre ville. Il vous est confirmé lors de l'appel de confirmation. `[DÉLAI PAR VILLE]` » | **À CONFIRMER** with the owner (real lead times per city). Until then, remove the placeholder and keep: « Le délai dépend de votre ville. Il vous est confirmé lors de l’appel de confirmation. » Source: `backend/database/seeders/ContentSeeder.php` |
| http://localhost:8080/livraison-et-paiement | « Retours et garantie `[CONDITIONS DE RETOUR]` Contacter le service après-vente » | **À CONFIRMER**: return period, conditions, and manufacturer warranty per brand. Until then, **PROPOSITION**: « Retours et garantie⍽: pour toute question sur un retour ou sur la garantie d’un appareil, contactez notre service après-vente au 0666-854184 ou sur WhatsApp. » (states no duration and invents nothing). This also unblocks `hasMerchantReturnPolicy` (see `docs/audits/schema.md`, P2-3). |

### C2. « Jusqu'à -30 % » is not supported by the data (Critical)

Facts:
- The largest badge displayed anywhere is **−18 %** (counted across all 245 pages: −18 % ×6, −17 % ×6, −10 % ×3).
- The largest `price`/`promo_price` gap in `data/catalog.json` is 24 % (Carrier Mural Inverter 9 000 BTU R32: 5 050 → 3 850 Dhs). The site shows that variant at 5 300 Dhs with no discount, using the Excel price.
- /promotions lists 3 products, not « toute la gamme ».

| URL | Faulty text | Correction |
|---|---|---|
| all pages (promo bar) | « Super promo : jusqu'à -30 % sur les climatiseurs » | **À CONFIRMER** (actual promo rate). With the current data, **PROPOSITION**: « Promotions⍽: jusqu’àˬ−18ˬ% sur une sélection de climatiseurs ». Use the minus sign `−` (U+2212), as the badges already do. |
| http://localhost:8080/ (H1) | « Jusqu'à -30 % sur toute la gamme de climatiseurs » | **PROPOSITION**: « Jusqu’àˬ−18ˬ% sur une sélection de climatiseurs ». Better for SEO, keep the promo as the hero kicker and make the H1 « Climatiseurs et chauffe-eau livrés gratuitement partout au Maroc ». Source: `backend/database/settings/2026_10_06_200300_create_general_and_home_settings.php` (editable in the back office) |

Ideally, compute the « jusqu'à » rate on the server from the live promotions, as is already done for prices.

### C3. Delivery time contradiction (Critical)

| URL | Faulty text | Correction |
|---|---|---|
| http://localhost:8080/climatisation (FAQ + FAQPage JSON-LD) | « La livraison est-elle gratuite ? — Oui, partout au Maroc, sous 48 heures. » | « La livraison est-elle gratuite⍽? — Oui, partout au Maroc. Le délai dépend de votre ville⍽: il vous est confirmé lors de l’appel de confirmation. » Keep « sous 48 heures » only if the owner confirms it for every city. Source: `backend/database/seeders/ReferenceSeeder.php:114` |
| http://localhost:8080/a-propos | « Solutions clés en main sous 48 h ouvrées » | **À CONFIRMER**. If unconfirmed, use « Solutions clés en main, de l’étude à la mise en service ». Source: `ContentSeeder.php:309` |

### C4. CGV, legal notice and privacy (Critical, trust)

- http://localhost:8080/devenir-revendeur: « J'accepte les conditions générales de vente » is required but is plain text, with no link. The checkout uses the same string (`frontend/src/components/commerce/CheckoutForm.tsx`, `frontend/src/components/leads/ResellerForm.tsx`).
- No CGV, legal notice or privacy page exists in the sitemap or footer, although the contact, quote, reseller and restaurant forms collect personal data.
- Action (owner and lawyer): publish « Conditions générales de vente », « Mentions légales » (company name, legal form, RC, ICE, registered address, editor) and « Politique de confidentialité » (personal data under loi 09-08 / CNDP). Link them in the footer and from the checkbox: « J’accepte les <a>conditions générales de vente</a> ». **Do not write these texts without the owner's legal information.**

### H1. `XLS-…` references displayed (High)

`data/excel-additions.json` says these are placeholders: « référence (XLS-…) à remplacer ». They are still shown as public references on 62 product pages and in the listings (for example « Trappe de Visite 40X40 XLS-TRAPPEDEVISITE40X40 », « Ventilateur de Gaine Q315 Plastique S&P XLS-VENTILATEURDEGAINEQ315PLASTIQUESP », « XLS-SILICONEALPHA », « XLS-BANDEGRISE », « LG Gainable Inverter R32 ZBNW18GM1TA.ANWTLM »).

| Example URL | Faulty text | Correction |
|---|---|---|
| http://localhost:8080/produit/caisson-dextraction-77 | « Réf. XLS-CAISSON77 » | Hide « Réf. » while the reference starts with `XLS-` (or while `needs_verification` is set), until the owner supplies the real reference. |
| http://localhost:8080/produit/grille-simple-2010 | « Réf. XLS-GRILLESIMPLE2010 » | same |
| http://localhost:8080/produit/cuivre-14-srk-15-m | « Réf. XLS-CUIVRESRK14 » | same |
| http://localhost:8080/pieces-de-rechange/trappes-de-visite | « Trappe de Visite 40X40 XLS-TRAPPEDEVISITE40X40 » | same |

These 62 pages also have no image, no description and (59 of them) no price. **Recommendation:** keep them out of the sitemap, or set them to `noindex`, until they are verified. This follows the CLAUDE.md rule « Design-only items are seeded with `needs_verification` ».

### H2. Meta descriptions (High)

Three patterns were found:

1. **Template (117 product pages + 32 listing, brand and utility pages)**: « Cuivre 1/4 Lafarga 15 m · Cuivre · Climatisation Maroc. Boutique d'Ariha Froid à Marrakech depuis 2008 : climatiseurs LG, Carrier, CIAT, Fitco, chauffe-eau et… ». The title is repeated, the text has nothing to do with the page (a copper tube page lists air-conditioner brands), and it is cut off with « … ». Source: `frontend/src/lib/seo/metadata.ts`.
2. **Reference only (47 product pages)**: « Pièces de rechange. Référence CLIM00012. » (40 characters).
3. **Short (11 air-conditioner pages)**: « Mural (mono split) Carrier, technologie Inverter. » This one is duplicated on /produit/carrier-mural-inverter-r32 and /produit/carrier-miroir-inverter-noir-r32. « Mural (mono split) LG, technologie Inverter. » is also duplicated.

**PROPOSITION**: templates built only from data that exists (fill them on the server, max 155 characters, no truncation):

- Product with a price:
  `{Nom normalisé}{, de X à Y BTU si variantes} à partir de {prix} Dhs. Livraison gratuite partout au Maroc, paiement à la livraison. Réf. {SKU}.`
  - Example for /produit/carrier-mural-normal-onoff-410a: « Climatiseur mural Carrier On/Off R410A, de 9⍽000 à 24⍽000⍽BTU, à partir de 4⍽500⍽Dhs. Livraison gratuite partout au Maroc, paiement à la livraison. »
- Product with « Prix sur demande »:
  `{Nom normalisé} : prix et disponibilité sur demande au 0666-854184 ou sur WhatsApp. Livraison gratuite partout au Maroc.`
- Listing page:
  `{Catégorie} : {N} produits {marques présentes}. Livraison gratuite partout au Maroc, paiement à la livraison. Ariha Froid, Marrakech.`
  - Example for /cuivre-et-gaz/cuivre: « Tubes cuivre Lafarga et SRK en couronnes de 15⍽m, du 1/4 au 7/8. Livraison gratuite partout au Maroc, paiement à la livraison. »
- Brand page:
  `{Marque} chez Ariha Froid : {N} produits ({catégories}). Livraison gratuite partout au Maroc, paiement à la livraison.`

Pages that need a hand-written description (**PROPOSITION**):

| URL | Proposed meta description |
|---|---|
| /marques | « Les marques distribuées par Ariha Froid⍽: LG, Carrier, CIAT, Fitco, Simsek, Soudal, S&P… Climatisation, chauffe-eau, ventilation et accessoires. » |
| /services | « Installation, visite technique (300⍽Dhs) et service après-vente de climatisation par les techniciens d’Ariha Froid, à Marrakech et partout au Maroc. » |
| /plan-du-site | « Toutes les pages de Climatisation Maroc⍽: catalogue, services, guides, espace professionnel et contact. » |
| /chauffe-eau | « Chauffe-eau solaire Simsek à circuit fermé, de 200 à 500⍽L. Livraison gratuite partout au Maroc, paiement à la livraison. » (update when other types are added) |
| /climatisation/gainable | « Climatiseurs gainables LG, Carrier, CIAT et Fitco, de 12⍽000 à 60⍽000⍽BTU, intégrés au faux plafond. Livraison gratuite, pose sur devis. » |
| /climatisation/cassette | « Climatiseurs cassette LG et Carrier Inverter pour plafond, diffusion sur quatre côtés. Livraison gratuite partout au Maroc, pose sur devis. » |

Titles: these are mostly good (unique, 30–60 characters). To fix:
- /produit/chauffe-eau-solaire-simsek-circuit-ferme has an 84-character title. → « Chauffe-eau solaire Simsek circuit fermé 200 à 500⍽L · Climatisation Maroc »
- Product titles do not contain the generic term. → « Climatiseur mural Carrier Inverter R32 · Climatiseurs muraux » rather than « Carrier Mural Inverter R32 · Climatiseurs muraux »
- /produit/lg-dual-inverter uses « Climatiseur mural » where every other mural product uses « Climatiseurs muraux ». Pick one.
- Brand pages: the H1 is the bare brand name (« Alpha », « Nanyo »). → « Alpha au Maroc » / « Produits Alpha », to match the title.

### H3. Product name consistency (High)

See §4 for the full normalisation table. The rules (**PROPOSITION** for the owner, since the names live in `data/catalog.json` and the back office):

1. **French sentence case.** Capitalise only the first word, brands and range names. Write « Chauffe-eau solaire Simsek circuit fermé », not « Chauffe-eau Solaire Simsek Circuit Fermé ». Brand ranges keep their capitals (Dual Inverter, Artcool, Jetcool, Miroir).
2. **Diameter**: `Ø⍽160`, not `Q160`. The site already uses « Ø 160 » in badges and variant selectors, while the names say « Q160 » (Ø was replaced by Q on the old site's keyboard). On /produit/ventilateur-de-gaine-nanyo-galvanise the H1 says « Ø 100 » and the image alt says « Q100 ».
3. **Technology**: « On/Off » everywhere. Today the site has « ON/OFF », « On-Off », « On/Off » and « Normal ON/OFF ». « Normal » is redundant.
4. **Refrigerant**: the full designation, « R410A », « R32 », « R134a », « R404A ». Today the site has « 410A », « R410 » and « R134 ». « R407 » is ambiguous (R407C or R407F): **À CONFIRMER**.
5. **Dimensions**: `40⍽×⍽40`, `20⍽×⍽10`, `100⍽×⍽100⍽×⍽25`, not `40X40`, `20/10` or `100/100/25`. Keep `9/6` for Armaflex (thickness / diameter notation is standard in the trade).
6. **Units**: `°C`, not `°c`. `m²`. A non-breaking space between number and unit. « ml » in « Scotch Aluminium 30 ml 50 » almost certainly means **mètres linéaires**, not millilitres: **À CONFIRMER**, then write « 30⍽m ».
7. **No English**: « Spain » → « (Espagne) » or drop it. « x50 PCS » → « lot de 50 ».
8. **Variant order** must be the same in the H1 and in image alts. Today « Carrier Mural Inverter R32 9 000 BTU » (H1) sits next to « Carrier Mural Inverter 9 000 BTU R32 » (alt), and « Chauffe-eau Solaire Simsek Circuit Fermé 200 L » (H1) next to « …Simsek 200 L Circuit Fermé » (alt).
9. **Listing cards show a reference instead of the range**: « LG Cassette Inverter ATNW18GPLS1 » and « LG Gainable Inverter R32 ZBNW18GM1TA.ANWTLM » on /marques/lg and /solutions/restaurants. Show « 18⍽000⍽BTU » like the other cards.

### H4. Empty or near-empty pages that are linked (High)

| URL | Content | Correction |
|---|---|---|
| http://localhost:8080/froid (in the sitemap) | H1 « Froid et chambres froides » and nothing else (74 words, chrome included) | Remove it from the sitemap, the footer (« Froid ») and /plan-du-site until real content exists. This follows the CLAUDE.md rule « Pages without real copy stay unpublished ». |
| /chauffe-eau/electrique, /chauffe-eau/gaz, /chauffe-eau/chaudiere (not in the sitemap) | « 0 produit — Aucun produit ne correspond à ces filtres » | They are linked from the main menu, the footer, the /chauffe-eau tiles and /plan-du-site. Hide empty subcategories from every link block. |
| /chauffe-eau | The « Choisir un type de chauffe-eau » block offers 4 types; 3 of them are empty | Show only « Solaire » until other products exist. |

### H5. « Promotions » block on the home page (High)

| URL | Faulty text | Correction |
|---|---|---|
| http://localhost:8080/ | Heading « Promotions » above « Fitco Mural Inverter », « Carrier Mural Inverter R32 » and « CIAT Mural Inverter », which have no discount badge and do not appear on /promotions | Feed the block from the same query as /promotions (products with an active `promo_price`), or rename the block. **PROPOSITION**: « Climatiseurs muraux les plus demandés ». |

### H6. Thin product pages (High)

The minimum is 300 words of real content for a product page (400 or more for complex products such as air conditioners). Measured total main-area word counts are 156–306, and most of that is UI (quantity selector, buttons, reassurance line, related products). Product-specific copy is close to zero:

| URL (sample) | Product copy present | Missing |
|---|---|---|
| /produit/lg-dual-inverter | Description (60 words), 5 strengths, 9 specs | Sources for the LG claims (H7) |
| /produit/carrier-mural-inverter-r32, /carrier-mural-normal-onoff-410a | 6 specs | Description |
| /produit/fitco-mural-hyper-plazma-gold | « Marque, Référence » only | Type, technology, refrigerant, power in the specs (the power is in the H1), description |
| /produit/lg-cassette-inverter | « Marque, Référence » only, no image | Specs, image, description |
| /produit/fitco-armoire-r410, /fitco-gainable-r410-on-off | « Marque, Référence » only | « On/Off » appears only inside the reference « FFS60APA-ON/OFF/N » |
| /produit/chauffe-eau-solaire-simsek-circuit-ferme | Circuit, capacity | Description of how it works |
| /produit/armaflex-96 | « Référence » only, price « 3 Dhs » | **Sales unit** (per metre? per 2 m tube?): **À CONFIRMER**. Without it the price is misleading. |
| /produit/kit-duo-14-38-20-m | « Référence » only | What the kit contains: **À CONFIRMER** |
| /produit/plaque-pipal-alpha-dim-3-m-12-m-354-m2 | « Marque, Référence » | 3⍽m × 1,2⍽m = 3,6⍽m², not « 3,54 m² »: **À CONFIRMER** |
| 59 « Prix sur demande » pages (caissons, linear diffusers, grilles, SRK copper, Esbo insulated flexibles…) | « Référence XLS-… » only | Everything (H1) |

**PROPOSITION** for the « Prix sur demande » pages: in place of « Livraison gratuite partout au Maroc · Paiement à la livraison · Pose par nos techniciens sur devis », which promises installation for an accessory, use « Prix et disponibilité sur demande⍽: appelez le 0666-854184 ou écrivez-nous sur WhatsApp. Livraison gratuite partout au Maroc. ». More generally, only show « Pose par nos techniciens sur devis » on appliances (air conditioners, water heaters), not on tape, sealant or grilles.

**PROPOSITION**: a factual description template for air conditioners. Every value comes from existing variant data:
> « Le {gamme} est un climatiseur {type} {technologie} de {marque}, disponible en {liste des puissances}. Il fonctionne au {fluide}. Pour choisir la puissance, comptez environ 600⍽BTU par m² (voir notre calculateur). Livraison gratuite partout au Maroc, paiement à la livraison, pose par nos techniciens sur devis. »

### H7. Authority and performance claims to verify (High)

| URL | Claim | Action |
|---|---|---|
| /marques/lg (title, H1 badge, intro), /produit/lg-*, /climatisation (brand logo), /a-propos | « Distributeur officiel » / « Ariha Froid est distributeur officiel LG au Maroc. » | **À CONFIRMER**: is there a written LG Maroc agreement? If not, write « Ariha Froid vend et installe les climatiseurs LG… ». Also check whether « au Maroc » implies exclusivity. |
| /a-propos, home (« Marques officielles ») | « Marques officielles » | Vague. **PROPOSITION**: « Produits neufs des marques LG, Carrier, CIAT, Fitco… » (only if the owner confirms the products are new and come from official channels). |
| /marques/lg, /produit/lg-dual-inverter | « jusqu’à 70 % d’électricité en moins » / « Jusqu’à 70 % d’économie d’énergie » | This is an LG figure measured against a non-Inverter unit. Attribute it: « jusqu’àˬ70ˬ% d’économie d’énergie par rapport à un climatiseur non Inverter (donnée constructeur LG) ». **À CONFIRMER** on the LG datasheet for the D10AWH range. |
| /produit/lg-dual-inverter, /marques/lg, /climatisation/mural | « classé tropical T3 », « se pilote en Wi-Fi avec LG ThinQ » | Not in `catalog.json` (`CatalogSeeder.php:98-110`, `ReferenceSeeder.php:85-87`). **À CONFIRMER** per reference: Wi-Fi may need a separate module depending on the model. |

### M1. Typography (Medium, site-wide)

Measured at the code-point level:

| Rule | State | Examples (URL) | Correct form |
|---|---|---|---|
| Space before `:` | **Regular space** everywhere (246 pages: promo bar, aria-label « Rayon de recherche : Toutes ») | « Super promo : jusqu'à » (all), « Ventes : 0666-854184 » (/a-propos), « Trier : » (listings), « Filtrer : nom ou référence » (placeholder) | `Promotions⍽: …`, `Ventes⍽: 0666…`, `Trier⍽:` |
| Space before `? !` | Regular space | « Quelle puissance de climatiseur pour ma pièce ? » (H1 + title), « Pour qui ? », « Comment payer ? », « Besoin d’un conseil ? » | `pièceˬ?` |
| Space before `%` | Regular space | « -30 % », « jusqu’à 70 % » | `−18ˬ%`, `70ˬ%` (the discount badges are already correct: `−18⍽%`) |
| Thousands separator + unit | Prices are correct (`5⍽200⍽Dhs`). For BTU the thousands separator is non-breaking but the space before « BTU » is regular (« 18⍽000 BTU »). Blog and FAQ: « 9 000, 12 000, 18 000 et 24 000 BTU » with regular spaces | /blog/…, /climatisation, product H1s, /calculateur-puissance | `18⍽000⍽BTU`, `9⍽000`, `15⍽m²`, `11,3⍽kg`, `10⍽m` |
| Apostrophe | `'` and `’` mixed on the same page (« Jusqu'à » in the promo bar, « Jusqu’à » in the tables; « Fil d'Ariane »; « l'appareil » in the blog, « d’achat » in its breadcrumb) | all | `’` everywhere (or `'` everywhere, but be consistent) |
| Minus sign | « -30 % » with a hyphen | promo bar, home H1 | `−` (U+2212), as the badges already use |
| « » quotes | Correct (« Pour l’installation », « clim ») | /produit/lg-dual-inverter, /recherche | — |
| `°C` | « Mastic 1500 °c Soudal » (8 pages, title, alt, aria-label) | /produit/mastic-1500-c-soudal, /pieces-de-rechange/adhesifs-et-mastics, /marques/soudal | « Mastic réfractaire 1⍽500⍽°C Soudal » (« réfractaire »: **À CONFIRMER**) |
| Accented capitals | Correct (« À propos », « Électrique », « Écrivez-nous », « Établissement ») | — | — |
| Currency | « Dhs » is consistent everywhere. No « DH », « MAD » or « dhs » in visible text | — | — |

Recommended implementation: one `frTypo()` helper applied to CMS and catalogue text at render time. It should insert U+202F before `; ! ? %`, U+00A0 before `:` and `»` and after `«`, and U+00A0 between a number and a unit (`BTU|Dhs|m²|m|mm|kg|L|°C|h`).

### M2. Opening hours (Medium)

| URL | Faulty text | Correction |
|---|---|---|
| all pages (footer), /contact, /a-propos, /demander-un-devis, /devenir-revendeur, /espace-professionnel, /solutions/restaurants | « Lundi – Samedi, 9h – 19h » | « Du lundi au samedi, de 9⍽h à 19⍽h » |
| /services/*, /marques/*, /blog, /climatisation, /espace-professionnel | « du lundi au samedi de 9h à 19h. » | « du lundi au samedi, de 9⍽h à 19⍽h. » |

Source: `frontend/src/lib/content/copy.ts`, `frontend/src/lib/navigation.ts`, the general settings migration. Fixing this also fixes the `openingHours` parsing problem (schema audit P2-5).

### M3. Phone number format (Medium)

| URL | Faulty text | Correction |
|---|---|---|
| all | « 0666-854184 », « 0666-088348 », « 0666-602599 », « 0666-661882 », « 0524-306850 » | Moroccan pairs, matching the « 06 12 34 56 78 » placeholder already used on /suivi-commande: « 06⍽66⍽85⍽41⍽84 », « 06⍽66⍽08⍽83⍽48 », « 06⍽66⍽60⍽25⍽99 », « 06⍽66⍽66⍽18⍽82 », « 05⍽24⍽30⍽68⍽50 ». The `tel:+212…` links are already correct. |

### M4. Inconsistent « conseil » number (Medium)

| URL | Faulty text | Correction |
|---|---|---|
| http://localhost:8080/climatisation (bottom CTA) | « Ventes et conseil : 0666-854184, du lundi au samedi de 9h à 19h. » | Everywhere else, Conseil is 0666-088348 (/blog, /calculateur-puissance, /marques/*, footer). → « Conseil⍽: 06⍽66⍽08⍽83⍽48, du lundi au samedi, de 9⍽h à 19⍽h. » Or confirm that the sales line also gives advice. Source: `frontend/src/views/catalog/LandingTemplate.tsx` |

### M5. Listing and brand pages with no text (Medium)

These have no introduction (H1 + filters + grid):
- /climatisation/gainable, /climatisation/cassette, /climatisation/console-armoire
- /chauffe-eau, /chauffe-eau/solaire, /ventilation
- /ventilation/ventilateurs-de-gaine, /ventilation/multizone, /ventilation/grilles-et-diffuseurs
- /gaines, /gaines/gaines-circulaires, /gaines/flexibles-souples, /gaines/flexibles-isoles
- /cuivre-et-gaz/cuivre, /cuivre-et-gaz/isolant, /cuivre-et-gaz/kits-duo, /cuivre-et-gaz/gaz-frigorifique
- /pieces-de-rechange and its 5 subcategories, /promotions (one line), /marques
- 15 brand pages (all except /marques/lg). For example, /marques/nanyo shows the H1 « Nanyo », one product and nothing else.

Only /climatisation, /climatisation/mural and /cuivre-et-gaz have a paragraph.

**PROPOSITION**: 2–3 sentences per page. These samples use only information already on the site; the owner should check them:

- **/climatisation/gainable**: « Le climatiseur gainable s’installe dans le faux plafond⍽: seules les grilles de soufflage et de reprise restent visibles. Il peut desservir plusieurs pièces à partir d’une seule unité. Nous proposons des gainables LG, Carrier, CIAT et Fitco, de 12⍽000 à 60⍽000⍽BTU, en Inverter ou On/Off. » (« plusieurs pièces » is generic gainable knowledge; drop it if the owner prefers.)
- **/climatisation/cassette**: « La cassette se fixe au plafond et diffuse l’air sur quatre côtés⍽: c’est la solution des grandes salles, commerces et restaurants. Gammes LG et Carrier Inverter, pose par nos techniciens sur devis. »
- **/climatisation/console-armoire**: « Le climatiseur armoire se pose au sol et convient aux grands volumes⍽: salles, magasins, ateliers. »
- **/cuivre-et-gaz/cuivre**: « Tubes cuivre frigorifiques en couronnes de 15⍽m, du 1/4 au 7/8 de pouce, marques Lafarga et SRK. Pour raccorder unité intérieure et extérieure, voir aussi nos kits duo et l’isolant Armaflex. »
- **/cuivre-et-gaz/gaz-frigorifique**: « Bouteilles de gaz frigorifique GS⍽: R410A, R32 (À CONFIRMER: present in the catalogue?), R134a, R404A, R407 et R22. Manipulation réservée aux professionnels. » Check the list against the catalogue: R410, R407, R404, R134, R22 and RS70 are present; R32 is not, so remove it unless the owner adds it.
- **/gaines/gaines-circulaires** (and fix the duplicate, M6): « Gaines circulaires rigides de 3⍽m, du Ø⍽100 au Ø⍽250, pour la ventilation et l’extraction. »
- **Brand pages** (template): « {Marque}⍽: {N} produits disponibles chez Ariha Froid, en {catégories}. Livraison gratuite partout au Maroc, paiement à la livraison. »

### M6. Duplicates (Medium)

| URLs | Duplicate | Correction |
|---|---|---|
| /gaines and /gaines/gaines-circulaires | Same title « Gaines circulaires · Climatisation Maroc », same H1 « Gaines circulaires », same template description. /plan-du-site shows « Gaines circulaires > Gaines circulaires » | Parent: H1 and title « Gaines et flexibles » (the menu already says « Gaines »). The child stays « Gaines circulaires ». |
| /produit/carrier-mural-inverter-r32 and /produit/carrier-miroir-inverter-noir-r32 | Meta « Mural (mono split) Carrier, technologie Inverter. » | H2 templates (the name makes it unique) |
| /produit/lg-dual-inverter and /produit/lg-artcool-smart-inverter | Meta « Mural (mono split) LG, technologie Inverter. » | same |
| /produit/fitco-gainable-normal-onoff-r410 (12 000), /produit/fitco-gainable-r410-on-off (60 000), /produit/fitco-gainable-r410 (48 000) | Three families with almost the same name for one Fitco On/Off gainable range | Merge them into one family with variants (see `docs/catalog-grouping.md`), or give each a distinct name. **À CONFIRMER** |
| /produit/mousse-soudal and /produit/mousse-polyurethane-soudal | Two Soudal polyurethane foams with no way to tell them apart (the FROID00222 image file appears on both) | Add the product type (expanding, gun, fire-rated…) and the volume: **À CONFIRMER** |
| /calculateur-puissance vs /blog/quelle-puissance-de-climatiseur-pour-ma-piece | H1 « …pour votre pièce ? » vs « …pour ma pièce ? »: two pages competing for the same query | Calculator H1, **PROPOSITION**: « Calculateur de puissance de climatiseur ». It already links to the guide. |

### M7. /a-propos (Medium)

| Faulty text | Correction |
|---|---|
| « Climatisation Maroc est la boutique en ligne d'Ariha Froid, fournisseur de climatisation et de froid à Marrakech depuis 2008. Nous vendons et installons tous types de systèmes de climatisation, pour les professionnels comme pour les particuliers, à Marrakech et dans les autres villes du Maroc. » | « Climatisation Maroc est la boutique en ligne d’Ariha Froid, fournisseur de climatisation et de froid à Marrakech depuis 2008. Nous vendons et installons des climatiseurs, chauffe-eau et équipements de ventilation, pour les particuliers comme pour les professionnels. Nous livrons partout au Maroc. » (« tous types de systèmes » is an absolute claim; the catalogue has no VRV/VRF or chiller.) |
| Missing E-E-A-T | **PROPOSITION**, with the owner's real data only: founder or manager name, team size, number of installations or years of experience of the technicians, legal identifiers (RC, ICE), and photos of the two shops. |

### M8. Home sector teaser (Medium)

| URL | Faulty text | Correction |
|---|---|---|
| http://localhost:8080/ | « Solutions professionnelles — Hôtels · Restaurants · Bureaux · Écoles … » | Only /solutions/restaurants is published. → « Solutions professionnelles — Restaurants et cafés · Projets sur devis ». Add sectors as their pages are published. Source: `HomeController.php`, `ContentSeeder.php` |

### M9. Restaurant gallery (Medium)

http://localhost:8080/solutions/restaurants, section « En images » (« La salle », « L’accueil », « Le comptoir »): the visuals are an SVG illustration and a design image (`/design/solutions-category-…`), not Ariha Froid installations. Under the heading « En images », a reader expects real work. Either use real project photos, which give a strong Experience signal, or hide the section.

### M10. Blog article (Medium)

http://localhost:8080/blog/quelle-puissance-de-climatiseur-pour-ma-piece

| Issue | Correction |
|---|---|
| No visible date. JSON-LD has only `dateModified` | Show « Publié le {date réelle} · Mis à jour le {date réelle} » from the back office (never a made-up date) |
| Author is the « Ariha Froid » organisation | **PROPOSITION**: « Par l’équipe technique Ariha Froid ». Better: a named technician with their role, with the owner's agreement. |
| « 6 min de lecture » for about 430 words of body text | « 2 min de lecture » (computed at 200–230 words per minute) |
| « Hésitez entre deux puissances ? » | « Vous hésitez entre deux puissances⍽? » |
| « Sommaire » rendered in capitals (« SOMMAIRE ») in the side panel | Fine if it is CSS `text-transform`. Keep « Sommaire » in the source. |
| 1,500-word guideline for a blog post | The topic is well covered at about 430 words. **PROPOSITION** to extend it with no invented data: an « Erreurs fréquentes » section (oversizing, surface measured without the open kitchen…), a « Questions fréquentes » block (« 9⍽000 ou 12⍽000⍽BTU pour 15⍽m²⍽? », « Faut-il compter la hauteur sous plafond⍽? »), and a link to /services/visite-technique. |

### L1–L5 (Low)

| # | URL | Faulty text | Correction |
|---|---|---|---|
| L1 | / and /promotions vs /produit/lg-dual-inverter | Badge « −18 % » on the card, « −17 % » on the product page | Use one rule: the badge on the displayed variant (9 000 BTU: −17ˬ%), or « jusqu’àˬ−18ˬ% » on the card |
| L2 | / (power widget) | « 30 000 + » / « Au-delà de 40 m² » | « 30⍽000⍽BTU et plus » (the form used on /climatisation and /calculateur-puissance). Source: `frontend/src/components/home/PowerFinder.tsx` |
| L2 | / (power widget) | « Soleil » (field label), button « Voir → » | « Ensoleillement », « Voir les climatiseurs » |
| L2 | /gaines | « Choisir un type de gaines » | « Choisir un type de gaine » |
| L2 | /services/service-apres-vente | « Commander par WhatsApp » button; bottom CTA « Projets et revendeurs : 0666-602599 » | « Nous écrire sur WhatsApp »; CTA « Service après-vente⍽: 06⍽66⍽85⍽41⍽84 » (the number given in that page's own FAQ) |
| L2 | /solutions/restaurants, /services/* | « Commander par WhatsApp » on service pages | « Nous écrire sur WhatsApp » (you don't « order » a quote) |
| L2 | promo bar | « Super promo » | « Promotions » (avoids the anglicised « super ») |
| L2 | / | « Le confort au cœur de votre quotidien » (generic slogan, no information) | **PROPOSITION**: « Livraison gratuite partout au Maroc, paiement à la livraison » |
| L3 | all (footer) | `<h3><button>Informations<span>+</span></button><span>Informations</span></h3>` is read as « Informations + Informations » | Put `aria-hidden` on the duplicate span, or render a single label |
| L4 | any 404 | The server HTML of the 404 page has only « 404 » (title « Page introuvable »). The H1, message and links appear to be client-side only | Render on the server: « Page introuvable — La page demandée n’existe pas ou a été déplacée. » + links to Accueil, Climatisation, Contact |

---

## 4. Product name normalisation (PROPOSITION, to apply in `catalog.json` and the back office)

Names marked **À CONFIRMER** contain a guess about meaning; the owner must check them before any change.

| Current name (H1) | Example URL | Proposed name |
|---|---|---|
| Carrier Mural Normal ON/OFF 410A | /produit/carrier-mural-normal-onoff-410a | Carrier mural On/Off R410A |
| Carrier Gainable Normal ON/OFF 410A | /produit/carrier-gainable-normal-onoff-410a | Carrier gainable On/Off R410A |
| Carrier Mural Inverter R32 | /produit/carrier-mural-inverter-r32 | Carrier mural Inverter R32 |
| Carrier Miroir Inverter Noir R32 | /produit/carrier-miroir-inverter-noir-r32 | Carrier Miroir Inverter R32 noir |
| Carrier Cassette Inverter / Gainable Inverter | /produit/carrier-cassette-inverter | Carrier cassette Inverter / Carrier gainable Inverter |
| CIAT Mural Inverter / Gainable Inverter | /produit/ciat-mural-inverter | CIAT mural Inverter / CIAT gainable Inverter |
| Fitco Mural Normal R410 | /produit/fitco-mural-normal-r410 | Fitco mural On/Off R410A |
| Fitco Gainable Normal ON/OFF R410 · Fitco Gainable R410 On-Off · Fitco Gainable R410 | /produit/fitco-gainable-normal-onoff-r410, …-r410-on-off, …-r410 | Fitco gainable On/Off R410A (one family, see M6) |
| Fitco Armoire R410 | /produit/fitco-armoire-r410 | Fitco armoire On/Off R410A |
| Fitco Mural Hyper Plazma Gold | /produit/fitco-mural-hyper-plazma-gold | Fitco mural Hyper Plasma Gold (**À CONFIRMER**: is the manufacturer's spelling « Plazma » or « Plasma »?) |
| LG Gainable Inverter R32 (card: « ZBNW18GM1TA.ANWTLM ») | /produit/lg-gainable-inverter-r32 | LG gainable Inverter R32, card « 18⍽000⍽BTU » |
| LG Cassette Inverter (card: « ATNW18GPLS1 ») | /produit/lg-cassette-inverter | LG cassette Inverter, card « 18⍽000⍽BTU » |
| Chauffe-eau Solaire Simsek Circuit Fermé | /produit/chauffe-eau-solaire-simsek-circuit-ferme | Chauffe-eau solaire Simsek à circuit fermé |
| Gaz R410 GS Spain 11,3 kg | /produit/gaz-r410-gs-113-kg | Gaz R410A GS 11,3⍽kg |
| Gaz GS R134 Spain 13,6 kg | /produit/gaz-gs-r134-spain-136-kg | Gaz R134a GS 13,6⍽kg |
| Gaz R404 GS Spain 10,9 kg | /produit/gaz-r404-gs-spain-109-kg | Gaz R404A GS 10,9⍽kg |
| Gaz R407 GS Spain 11,3 kg | /produit/gaz-r407-gs-113-kg | Gaz R407C GS 11,3⍽kg (**À CONFIRMER**: C or F) |
| Gaz R22 Spain 13,6 kg | /produit/gaz-r22-136-kg | Gaz R22 GS 13,6⍽kg (the brand shown on the page is GS) |
| Gaz RS70 Spain 10,9 kg | /produit/gaz-rs70-spain-109-kg | Gaz RS-70 10,9⍽kg (**À CONFIRMER**: brand) |
| Gaz Chalumeau | /produit/gaz-chalumeau | Cartouche de gaz pour chalumeau (**À CONFIRMER**) |
| Cuivre 1/4 Lafarga 15 m (…) | /produit/cuivre-14-lafarga-15-m | Tube cuivre 1/4 Lafarga, couronne de 15⍽m |
| Kit Duo 1/4-3/8 20 m (…) | /produit/kit-duo-14-38-20-m | Kit duo cuivre 1/4 – 3/8, 20⍽m |
| Armaflex 9/6 (…) | /produit/armaflex-96 | Isolant Armaflex 9/6 (+ sales unit, H6) |
| Gaines Circulaires 3 m Q100 (…) | /produit/gaines-circulaires-3-m-q100 | Gaine circulaire Ø⍽100, 3⍽m |
| Flexible Calorifugé Q160 Arfro 10 m | /produit/flexible-calorifuge-q160-arfro-10-m | Flexible calorifugé Arfro Ø⍽160, 10⍽m |
| Flexible Isolé Thermique en Aluminium Q200 10 m | /produit/flexible-isole-thermique-en-aluminium-q200-10-m | Flexible aluminium isolé Ø⍽200, 10⍽m |
| Flexible Isolé Aluminium Q125 Esbo 10 m | /produit/flexible-isole-aluminium-q125-esbo-10-m | Flexible aluminium isolé Esbo Ø⍽125, 10⍽m |
| Flexible Souple Esbo 10 m | /produit/flexible-souple-esbo-10-m | Flexible souple Esbo, 10⍽m |
| Flexible Isogris Q13 50 m (…) | /produit/flexible-isogris-q13-50-m | Flexible Isogris Ø⍽13, 50⍽m |
| Venteuse Q100 Plastique (…) | /produit/venteuse-q100-plastique | **Ventouse** Ø⍽100 plastique (« venteuse » is not a French word) |
| Venteuse Q100 Galvanisé | /produit/venteuse-q100-galvanise | Ventouse Ø⍽100 galvanisée (ventouse is feminine) |
| Ventilateur de Gaine Q100 Plastique S&P (…) | /produit/ventilateur-de-gaine-q100-plastique-sp | Ventilateur de gaine S&P Ø⍽100 plastique |
| Ventilateur de Gaine Nanyo Galvanisé | /produit/ventilateur-de-gaine-nanyo-galvanise | Ventilateur de gaine Nanyo galvanisé (variants Ø⍽100 to Ø⍽315). **À CONFIRMER**: the Q160 variant carries model DPT25-66B and the Q200 variant DPT16-55B, which looks swapped |
| Ventilateur Carrer 14 14 Motorise 100Q VFB4 | /produit/ventilateur-carrer-14-14-motorise-100q-vfb4 | Ventilateur carré 14⍽×⍽14 motorisé Ø⍽100 VFB4 (**À CONFIRMER**) |
| Caisson d'Extraction 7/7 (…) | /produit/caisson-dextraction-77 | Caisson d’extraction 7/7 (lowercase « e », curly apostrophe) |
| Diffuseur Carré 150/150 Blanc (…) | /produit/diffuseur-carre-150150-blanc | Diffuseur carré blanc 150⍽×⍽150 |
| Diffuseur Circulaire Q160 Blanc (…) | /produit/diffuseur-circulaire-q160-blanc | Diffuseur circulaire blanc Ø⍽160 |
| Diffuseur Linéaire 500 × 1 (…) | /produit/diffuseur-lineaire-500-1 | Diffuseur linéaire 500⍽mm, 1 fente (**À CONFIRMER**: is « × 1 » the number of slots?) |
| Grille Simple 20/10 · Grille Double 20/10 (…) | /produit/grille-simple-2010 | Grille simple déflexion 20⍽×⍽10 · Grille double déflexion 20⍽×⍽10 (**À CONFIRMER**) |
| Trappe de Visite 40X40 · …Modèle 60X60 · …Blanche Laquée Modèle 60X60 | /produit/trappe-de-visite-40x40 | Trappe de visite 40⍽×⍽40 · Trappe de visite 60⍽×⍽60 · Trappe de visite blanche laquée 60⍽×⍽60 |
| Trappe de Visite en Plâtre 100/60 | /produit/trappe-de-visite-en-platre-10060 | Trappe de visite en plâtre 100⍽×⍽60 |
| Télécommande Universelle 1 000 | /produit/telecommande-universelle-1-000 | Télécommande universelle 1000 (it is a model name, so no thousands space; **À CONFIRMER**: « 1000 en 1 »?) |
| Télécommande LG Split | /produit/telecommande-lg-split | Télécommande LG pour climatiseur split |
| Thermostat Tactile Power | /produit/thermostat-tactile-power | Thermostat tactile Power (**À CONFIRMER**: is Power a brand? It is listed under LG) |
| Mastic 1500 °c Soudal | /produit/mastic-1500-c-soudal | Mastic 1⍽500⍽°C Soudal |
| Mastic Gris · Mastic Soudal Transparent AS | /produit/mastic-gris | Mastic gris · Mastic transparent Soudal AS |
| Mousse Polyuréthane Soudal · Mousse Soudal | /produit/mousse-soudal | Mousse polyuréthane Soudal {type / volume} (see M6) |
| Silicone Fix Soudal · Silicone Alpha | /produit/silicone-fix-soudal | Silicone Soudal Fix · Silicone Alpha |
| Colle PVC 0,5 kg · Colle Soudal 5 kg Intercool | /produit/colle-pvc-05-kg | Colle PVC 0,5⍽kg · Colle Soudal Intercool 5⍽kg |
| Collier Colson GT x50 PCS | /produit/collier-colson-gt-x50-pcs | Colliers Colson GT (lot de 50) |
| Scotch Aluminium 30 ml 50 Armé (…) | /produit/scotch-aluminium-30-ml-50-arme | Ruban adhésif aluminium armé 50⍽mm × 30⍽m (**À CONFIRMER**: « ml » = mètres linéaires, « 50 » = width in mm?) |
| Scotch Aluminium Alpha 35 ml 50 / 70 | /produit/scotch-aluminium-alpha-35-ml-50 | Ruban adhésif aluminium Alpha 50⍽mm × 35⍽m (**À CONFIRMER**) |
| Scotch Emballage GT · Scotch Noir GT | /produit/scotch-emballage-gt | Ruban adhésif d’emballage GT · Ruban adhésif noir GT |
| Bande Adhésive 10 m 50 mm 3 mm | /produit/bande-adhesive-10-m-50-mm-3-mm | Bande adhésive 50⍽mm × 3⍽mm, 10⍽m |
| Bande Perforée 10 m · Bande PT · Bande Grise | /produit/bande-perforee-10-m | Bande perforée 10⍽m · Bande PT (**À CONFIRMER**: meaning of PT) · Bande grise |
| Silent Bloc Clim 100/100/25 | /produit/silent-bloc-clim-10010025 | Silentblocs pour climatiseur 100⍽×⍽100⍽×⍽25⍽mm |
| Support Megalife Blanc GT · Support GT · Support PT | /produit/support-gt | Support blanc Megalife GT · Support GT · Support PT |
| Pompe à Vide Value 115 | /produit/pompe-a-vide-value-115 | Pompe à vide Value 115 (Value is the brand) |
| Plaque Pipal Alpha Dim 3 m 1,2 m 3,54 m² | /produit/plaque-pipal-alpha-dim-3-m-12-m-354-m2 | Plaque Pipal Alpha 3⍽m × 1,2⍽m (**À CONFIRMER**: area 3,54 or 3,6⍽m²) |
| Filtre Eau 7 Étapes Vivo Pompe Inox | /produit/filtre-eau-7-etapes-vivo-pompe-inox | Filtre à eau Vivo 7 étapes avec pompe, inox (**À CONFIRMER**) |
| Multizone (H1 « Multizone Ø 160 », alt « Multizone Q160 ») | /produit/multizone | Caisson multizone Ø⍽160 to Ø⍽250 (**À CONFIRMER**: product type) |

---

## 5. Word counts against the minimums (approximate, main area)

| Type | URL | Words | Minimum | State |
|---|---|---|---|---|
| Home | / | 742 | 500 | OK (mostly product cards; the brand paragraph is in the footer) |
| Service | /services/installation | 357 | 800 | Thin |
| Service | /services/visite-technique | 291 | 800 | Thin |
| Service | /services/service-apres-vente | 189 | 800 | Very thin (no brand, warranty or lead-time information) |
| Service hub | /services | 153 | — | Duplicates the intros of the 3 pages |
| Blog | /blog/quelle-puissance-… | about 430 of body (674 in total) | 1,500 | Topic covered, can be extended (M10) |
| Sector | /solutions/restaurants | 605 | 800 | Correct, the best page on the site |
| About | /a-propos | 297 | — | Placeholders (C1) |
| Contact / location | /contact | 212 | 500–600 | OK for contact; no « comment venir » text and no landmark per shop. **À CONFIRMER** if you want to add one |
| Delivery | /livraison-et-paiement | 305 | — | Placeholders (C1) |
| Pro | /espace-professionnel | 371 | — | OK |
| Calculator | /calculateur-puissance | 318 | — | OK, the method is explained |
| Product | 176 pages | 156–306 | 300 / 400 | About 165 below the minimum (H6) |
| Listing | 27 pages | 74–686 | — | No intro on 24 of them (M5) |
| Brand | 16 pages | 108–384 | — | 15 with no text (M5) |

Reminder: word count is not a ranking factor. The aim is that each page answers its query: what the product is, what it is for, which power or size to pick, and how to order.

---

## 6. E-E-A-T: what exists and what is missing

What exists (keep):
- Company: Ariha Froid, « depuis 2008 », two shops with full addresses (Lot Sakar Villa 107, Marrakech 40070; Magasin 60-2, Imm 50 Al Manar, Marrakech 40100), « Itinéraire » links.
- Contact: five numbers by need (Ventes, Conseil, Projets et revendeurs, Facturation, Fixe), ecom@arihafroid.com, WhatsApp, hours.
- Commercial terms: free delivery, cash on delivery, technical visit at 300 Dhs, installation on quote. All are consistent across pages, except C3.
- Content: an accurate, useful power guide; a calculator with its method explained; a clear restaurant page.

What is missing (in order of impact):
1. Warranty and returns (C1), CGV, legal notice, privacy (C4).
2. Real photos: shops, team, installations (C1, M9).
3. Legal identity: corporate name, RC, ICE (the reseller form asks for the customer's ICE, but the company shows none of its own).
4. Proof for the claims (H7) and removal of false or contradictory claims (C2, C3).
5. A named author or reviewer for the guides (M10).
6. Customer reviews: there are none, and none should be invented. If the owner collects real reviews (Google Business Profile), they can be shown.

---

## 7. AI citation readiness

Strengths:
- The blog has an « En bref » block of 3 self-contained sentences (« Comptez environ 600 BTU par m² de pièce. »), a power/surface table, and question-form H2s. It is easy to quote.
- The /climatisation FAQ gives short, factual answers (but fix C3, which is also emitted in FAQPage).
- /calculateur-puissance explains its method (« Le point de départ est de 600 BTU par m²… »).

Gaps:
- No dated or attributed content: answer engines favour pages with a date and a named source (M10).
- 30+ listing and brand pages have no defining sentence (« Le climatiseur gainable est… ») that could be quoted (M5).
- Product pages have no quotable fact beyond the reference and the price. There is no surface coverage on the units missing specs, and no list of contents for the kits.
- Manufacturer claims are not attributed (« jusqu’à 70 % », H7). A model that cites them would spread an unsourced claim.
- Inconsistent product names (§4) make it hard to recognise the same product across sources.

Quick wins:
- Add one definition sentence at the top of each category page.
- Add « Publié le / Mis à jour le » to the article.
- Add a « Questions fréquentes » block (2–3 questions) on /services/installation (already present), /services/service-apres-vente (one question today) and /livraison-et-paiement (once the placeholders are filled).

---

## 8. What passes

- `lang="fr-MA"` on every page. No lorem ipsum, TODO or `undefined`/`NaN` in visible text.
- No English UI string (buttons, labels and messages are all French). « Menu » (aria-label) is French.
- Prices: the `5⍽700⍽Dhs` format with non-breaking spaces is correct everywhere. « Dhs » is used consistently.
- Accented capitals are correct (« À propos », « Électrique », « Écrivez-nous », « Établissement », « À partir de »).
- « » quotes have correct non-breaking spaces where used.
- Heading hierarchy: one H1 per page, no skipped levels in the main content (checked on all 238 pages).
- Titles are unique except for M6, and 28–61 characters long except for one at 84.
- The blog, the calculator and the /climatisation FAQ agree with each other (600 BTU/m²; 9⍽000 → 15⍽m², 12⍽000 → 20⍽m², 18⍽000 → 30⍽m², 24⍽000 → 40⍽m²).
- Displayed prices match `catalog.json` / `excel-additions.json` (spot-checked on the Carrier, LG and Simsek families).

---

## 9. Questions for the owner (needed before writing the final copy)

1. Real promotion rate, to replace « jusqu’à -30 % » (C2).
2. Delivery times per city, and whether « 48 heures » applies (C3, C1).
3. Return conditions and the warranty for each brand (C1).
4. Company legal details for the legal notice and CGV (C4).
5. Written proof of « distributeur officiel LG »; datasheets for T3, Wi-Fi and 70 % (H7).
6. Photos of the two shops, the team and installations (C1, M9).
7. Real references for the 62 `XLS-…` products and prices for the 59 « sur demande » items (H1).
8. Meaning of the old-site abbreviations: « ml », « PT », « × 1 / × 2 », « simple / double », « Pompe Inox », « Power », « Plazma », « Carrer » (§4).
9. Sales unit for Armaflex (3 Dhs) and contents of the kits duo (H6).
10. The Pipal plate area (3,54 vs 3,6 m²) and the Nanyo models DPT25-66B / DPT16-55B (§4).
