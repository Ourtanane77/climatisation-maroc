# Report: Climatisation, Catégorie muraux, Produit LG Dual Inverter, Comparer, Cuivre et gaz

I read all five files in full. Lines 1-104 (header) and the footer are byte-identical to `Climatisation.dc.html` except where noted below; I confirmed this with `diff`. The script's `rv()` and `post()` are the shared home-page logic. Only `extra(v)` and a few constants change from page to page.

**Shared notes that apply to all five pages**

- **Breadcrumb component** (same on every page): `<nav aria-label="Fil d'Ariane">`
  - padding-top 24, gap 8, fs 14.
  - Earlier crumbs: #5F6368, weight 500. Last crumb: #1A1A1A, weight 700.
  - Separator "›" in #9AA3AD. The last crumb's href is `#`.
- **Breakpoints used in `extra`:** `mobile` = W<760, `tablet` = W<1100 (this includes mobile).
  - `gutter`: 16 mobile / 40 otherwise.
  - `secGap`: 40 mobile / 56 otherwise.
  - `h2Size`: 32 mobile / 44 otherwise.
  - `cmax` = W, so there is no max-width cap.
- **Price format:** `dh(n)` = fr-FR grouping with a non-breaking space, then " Dhs" (e.g. "5 700 Dhs").
  - `dh2` (Comparer and Cuivre only) adds 2 decimals with a comma for non-integers (e.g. "3,50 Dhs").
- **Discount badge:** `'−'+round((1-price/was)*100)+' %'`. It uses the U+2212 minus sign and has a space before %.
- **Savings line:** `'Économisez '+dh(was-price)`.
- **Toast:** fixed, bottom 24, #1A1A1A pill, padding 12×20, fs 15.
  - Text: `"<label> ajouté au panier"`. Lasts 2200 ms.
  - Every add increments the header cart `count` by 1, whatever the quantity.
- **Header/footer differences:**
  - Climatisation, Catégorie and Produit: the promo bar link, the nav "Promotions" and the drawer "Promotions" all point to `#promotions`, a dead anchor on these pages. There is no Enter-to-search.
  - Comparer and Cuivre et gaz: those three links go to `Promotions.dc.html`.
  - Comparer and Cuivre et gaz also add `onKeyDown={{onQKey}}` to both search inputs. Enter with a non-empty query goes to `Recherche.dc.html?q=<query>`.
  - No page sets an active nav item: all nav items are #1A1A1A, and the bg is only #E8EFF8 on mega-menu hover.
- **Query states on every page:** `?menu=<clim|eau|vent|gaines|cuivre|pieces>` opens that mega menu. `?drawer=1|<key>` opens the mobile drawer with that accordion expanded.

---

## Climatisation.dc.html

### 1. Identity
- **Purpose:** range landing page (hub) for air conditioning.
- **`<title>`:** "Climatisation et climatiseurs au Maroc · Climatisation Maroc · Jusqu'à -30 % sur les climatiseurs · Ariha Froid"
- **Meta description** (the same on Catégorie; not checked on the other pages): "Climatisation Maroc, boutique d'Ariha Froid à Marrakech depuis 2008. Climatiseurs LG, Carrier, CIAT, Fitco, chauffe-eau, gaines, cuivre et pièces. Livraison gratuite partout au Maroc, paiement à la livraison."
- **H1:** "Climatisation et climatiseurs au Maroc"
- **Breadcrumb:** Accueil (`Accueil.dc.html`) › Climatisation (`#`)
- **Implied URL:** `/climatisation`. The header and footer link to it as `Climatisation.dc.html`, and to sub-types as `Climatisation.dc.html?type=Mono%20split` (also Gainable, Cassette, Console et armoire).
- **Pages linked from the body:**
  - `Categorie Climatiseurs muraux.dc.html` (with `?type=Gainable|Cassette|Console%20et%20armoire`)
  - `Produit LG Dual Inverter.dc.html`
  - `Marque LG/Carrier/CIAT/Fitco.dc.html`
  - `Blog.dc.html`
  - `Solutions professionnelles.dc.html#devis`
  - `https://wa.me/212666854184`

### 2. Sections, top to bottom
`main` has padding 0 `gutter`.

1. **Breadcrumb**
2. **PageIntro** (`section`, padding-top 32, flex column, gap 16, max-width 820)
   - H1: fs `h1Size` = 32 / 44 / 56 (mobile / tablet / desktop), line-height 1.02, letter-spacing -0.035em, weight 700.
   - Paragraph (fs 18, line-height 1.6, #3C4043): "Climatiseurs muraux, gainables, cassettes et consoles des marques LG, Carrier, CIAT et Fitco. Choisissez le type adapté à votre pièce, puis la puissance selon la surface : environ 600 BTU par m², une taille au-dessus pour une pièce très ensoleillée."
3. **TypeTiles** `#types`, H2 "Choisir un type de climatiseur"
   - Shared H2 style: margin 0 0 32px, letter-spacing -0.03em, line-height 1.05, weight 700. Section padding-top is `secGap`.
   - Grid: 1fr (mobile) / repeat(2) (tablet) / repeat(4) (desktop); gap 16.
   - Tile: `<a>`, min-height 260 (mobile) / 340; radius 24; padding 24; flex column, gap 6; hover translateY(-4px).
   - Tile title fs 26/700. Text fs 15 #3C4043, max-width 80%.
   - Art is absolute (left/right 24, bottom 20, height 55%), bottom-centred.

   | Title | Text | bg | Art | href |
   |---|---|---|---|---|
   | Mural | Le plus courant, pour une chambre ou un salon. | #DCE8F5 | img `uploads/clima-cut2.png` | `Categorie Climatiseurs muraux.dc.html` |
   | Gainable | Invisible, intégré au faux plafond. | #FCE6D6 | art key `gainable` (100%) | `…?type=Gainable` |
   | Cassette | Au plafond, diffusion sur quatre côtés. | #E8EFF8 | art key `cassette` (52%) | `…?type=Cassette` |
   | Console et armoire | Au sol, pour les grands volumes. | #FDF0E6 | inline SVG of a floor cabinet (#0B5CAD stroke 2.5, orange #F4731F grille lines, width 38%) | `…?type=Console%20et%20armoire` |

4. **PowerChips** `#puissance`, H2 "Climatiseurs par puissance"
   - Layout: flex-wrap, gap 10.
   - Pill: min-height 64, padding 8px 22px, radius 999, white, border 1.5px #E3E8EE; hover border and text #0B5CAD.
   - Label fs 18/700; sub-label fs 14 #5F6368.
   - Values (all link to `Categorie Climatiseurs muraux.dc.html`, with no parameter):
     - "9 000 BTU" / "Jusqu’à 15 m²"
     - "12 000 BTU" / "Jusqu’à 20 m²"
     - "18 000 BTU" / "Jusqu’à 30 m²"
     - "24 000 BTU" / "Jusqu’à 40 m²"
     - "30 000 BTU et plus" / "Au-delà de 40 m²"
5. **ProductCard grid** `#populaires`, H2 "Les plus demandés"
   - Grid `c4`: 1fr / repeat(2) / repeat(4); gap 16.
   - **ProductCard spec** (also used on the Catégorie and Produit pages):
     - Card: `article`, white, radius 24, padding 20, flex column, gap 12. Hover: shadow 0 24px 50px -32px rgba(14,40,70,.45) plus translateY(-4px).
     - Badge: fs 14/700, border 1.5px, radius 8, padding 4px 10px. #C4501A for a discount; #0B5CAD for a brand or tag.
     - Name: link, fs 21/500, line-height 1.3, letter-spacing -0.01em, 2-line clamp.
     - Ref: fs 15 #5F6368, hidden if empty.
     - Image box: height 150. Uses the `pic()` helper: img with object-fit contain and multiply blend, falling back to the art key, plus a blurred ellipse shadow.
     - "À partir de": fs 14 (mobile) / 13, #5F6368, min-height 16.
     - Price: fs 28/800, letter-spacing -0.02em. Old price: fs 15 #7A828B, struck through. Saving: fs 14/700 #C4501A.
     - CTA "Voir le produit": height 54, radius 12, border 1.5px #9AA3AD, fs 17/700; hover fills black #1A1A1A.
     - Every card href is `Produit LG Dual Inverter.dc.html`.
   - **Data** (badge computed):

     | Name | Ref | Price | Old price | Badge | Saving | Image / art |
     |---|---|---|---|---|---|---|
     | LG Dual Inverter 12000 BTU | D13AJH.N | 5 700 Dhs | 6 500 Dhs | −12 % | Économisez 800 Dhs | `uploads/clima-cut2.png` |
     | Carrier Mural Inverter 9000 BTU R32 | 42QHG009D8SC-R32 | 4 200 Dhs | 5 050 Dhs | −17 % | Économisez 850 Dhs | art `mural` |
     | Fitco Mural Inverter 12000 BTU Blanc | FSW12T24PM/N | 4 000 Dhs | 4 900 Dhs | −18 % | Économisez 900 Dhs | art `mural` |
     | LG Cassette Inverter 18000 BTU | ATNW18GPLS1 | 12 500 Dhs | — | "LG" (blue badge) | — | art `cassette` |

6. **BrandTiles** `#marques`, H2 "Marques de climatisation"
   - Grid `c4`, gap 16. Tile: height 120, radius 20, white, centred; hover shadow 0 20px 40px -28px rgba(14,40,70,.4).
   - Logos are `uploads/logo-<brand>-t.png`, max-width 160. Heights: LG 40, Carrier 40, CIAT 36, Fitco 64.
   - Note under the logo: fs 14/700 #0B5CAD. Only LG has one: "Distributeur officiel".
   - Links: `Marque LG.dc.html`, `Marque Carrier.dc.html`, `Marque CIAT.dc.html`, `Marque Fitco.dc.html`.
7. **GuideCards** `#guides`, H2 "Guides associés"
   - Grid `c3`: 1fr / 2 / 3; gap 16.
   - Card: radius 24, padding 28, min-height 200, space-between. h3 fs 24/700, line-height 1.2. Link text "Lire le guide" fs 16/700 #0B5CAD.
   - All three link to `Blog.dc.html`:
     - "Quelle puissance de climatiseur pour ma pièce ?" (#DCE8F5)
     - "Climatiseur Inverter ou On/Off : lequel choisir ?" (#FCE6D6)
     - "Mural, gainable ou cassette : quel climatiseur choisir ?" (#E8EFF8)
8. **FaqAccordion** `#faq`, H2 "Questions fréquentes"
   - Container: white, radius 24, padding 8px 24px. Rows separated by 1px #EEF1F4.
   - Question button: min-height 64, padding 12px 0, fs 18/700, inside an h3. A "+" (fs 26, weight 400, #0B5CAD) rotates 45° when open.
   - Answer: fs 16, line-height 1.6, #3C4043, max-width 760. Animated with a `grid-template-rows` 0fr→1fr transition (.3s).
   - The first item is open by default (`faqO ?? 0`). Clicking the open item closes all (state -1).
   - Q: "Quelle puissance choisir ?" — A: "Environ 600 BTU par m² : 9 000 BTU jusqu’à 15 m², 12 000 jusqu’à 20 m², 18 000 jusqu’à 30 m², 24 000 jusqu’à 40 m², 30 000 et plus au-delà. Une taille au-dessus pour une pièce très ensoleillée ou au dernier étage."
   - Q: "La livraison est-elle gratuite ?" — A: "Oui, partout au Maroc, sous 48 heures."
   - Q: "Proposez-vous la pose ?" — A: "Oui, par nos propres techniciens, sur devis."
9. **AdviceCTA band** `#contact` (padding-top and padding-bottom `secGap`)
   - Box: #E8EFF8, radius 24, padding 24 (mobile) / 48. Flex space-between, wrap, gap 24.
   - H2: "Besoin d'un conseil sur la puissance ?"
   - Paragraph (fs 18 #3C4043, margin-top 8): "Ventes et conseil : 0666-854184, du lundi au samedi de 9h à 19h."
   - Buttons: height 52, radius 999, padding 0 26, fs 16/700, flex 1; button group width 100% on mobile.
     - "Demander un devis": #F4731F, links to `Solutions professionnelles.dc.html#devis`. Note this is not `Demander un devis.dc.html`.
     - "Commander par WhatsApp": #25D366, links to `https://wa.me/212666854184`.

### 3. Interactivity
- FAQ accordion only.
- No page-specific query states.

### 4. Responsive (390 vs 1440)
At 390 every grid collapses to 1 column:
- type tiles: min-height 260
- product cards and brands: 1 column (2 columns at tablet)
- guides: 1 column
- H1 32 / H2 32
- CTA band padding 24, with full-width stacked buttons

At 1440: types 4 columns, products 4, brands 4, guides 3, H1 56, H2 44.

### 5. Data
All data is in the tables and lists above.

### 6. Forms
None besides the shared header search.

### 7. Leftovers / dead code
- The script still carries the home page's data and logic, which this page never renders: `FAM`, `NEWS`, `DUCTS`, `SUP`, `TIERS`/power finder, bento `cats`, `news`, `fams`, `ducts`, `supplies`, `brands` marquee, `perks`, hero values, `chipsRow`, rail refs.
- `MUR` is defined in `extra` but unused on this page.
- `<sc-if value="{{ never }}">` blocks: a header drawer button, and a mobile bottom bar (Appeler / WhatsApp / Panier).
- Links to pages that don't exist in the folder: `Marque Carrier.dc.html`, `Marque CIAT.dc.html`, `Marque Fitco.dc.html`, `Chauffe-eau.dc.html`, `Ventilation.dc.html`, `Gaines.dc.html`, `Pieces de rechange.dc.html`, `Froid.dc.html`, `Produit.dc.html`, `CGU.dc.html`, `Informations legales.dc.html`, `Securite.dc.html`, `Confidentialite.dc.html`, `Service apres-vente.dc.html`.
- `?type=` links point at the muraux category, which ignores `type`.
- Images referenced but missing from `uploads/` (only `New_DZ2.png` and the `logo-*-t.png` files exist): `clima-cut2.png`, `pasted-1791221833312-0.png` (the site logo), `telecommande-cut2.png`, `chauffe-eau-b0352fa9.png`, `ventilateur-cut.png`, `gaines-cut.png`, `cuivre-cut2.png`, `pasted-1791236697258-0.png`.

### 8. New tokens
- Colours: #D5DCE3 (header "Plus" border), #C9D3DE (search hover border), #F1F5FA (selected dropdown option bg), #E6E9EC (header bottom hairline shadow).
- Shadows: rgba(14,40,70,…).
- Hero gradient rgba(8,45,92,…) is unused.

---

## Categorie Climatiseurs muraux.dc.html

### 1. Identity
- **Purpose:** product listing page for the wall-mounted (mural) sub-category, with filters and a compare tray.
- **`<title>`:** "Climatiseurs muraux · Climatisation Maroc · Jusqu'à -30 % sur les climatiseurs · Ariha Froid"
- **H1:** "Climatiseurs muraux"
- **Breadcrumb:** Accueil (`Accueil.dc.html`) › Climatisation (`Climatisation.dc.html`) › Climatiseurs muraux (`#`)
- **Implied URL:** `/climatisation/climatiseurs-muraux`. Sister types use `?type=…`.
- **Pages linked:** `Categorie Climatiseurs muraux.dc.html?type=…`, `Produit LG Dual Inverter.dc.html` (all cards), `Comparer.dc.html`, `Blog.dc.html`.
- **Script data difference:** `FAM` LG 12 000 image is `uploads/New_DZ2.png` here (it is `clima-cut2.png` on Climatisation). It is unused anyway.

### 2. Sections, top to bottom
1. **Breadcrumb**
2. **PageIntro** (padding-top 32, gap 16, max-width 820; H1 32/44/56)
   - Paragraph: "Le climatiseur mural se fixe au mur de la pièce et se raccorde à une unité extérieure. C'est la solution la plus simple pour une chambre, un salon ou un bureau."
3. **SisterTypeChips** (flex-wrap, gap 8, padding-top 20)
   - Pill: height 44, padding 0 18, radius 999, fs 15/700, border 1.5px #D5DCE3.
   - Active chip: bg #1A1A1A, text #fff. Others: white, #1A1A1A.
   - "Mural" (active, href `#`); "Gainable", "Cassette", "Console et armoire" link to `Categorie Climatiseurs muraux.dc.html?type=<encoded>`.
4. **Listing** `#produits` (padding-top `secGap`)
   - Grid `catCols`: 1fr (mobile) / `280px minmax(0,1fr)` (≥760); gap 32; align-items start.
   - **FilterColumn** (`aside`): white, radius 24, padding 20, flex column, gap 4, overflow auto.
     - Each group: border-bottom 1px #EEF1F4, padding 14px 0. h3 fs 16/700, margin-bottom 10.
     - Each option is a button: min-height 40, fs 15, gap 10.
     - Checkbox: 20×20, radius 6, border 1.5px. Off: #C3CEDA border, white. On: #0B5CAD fill with a "✓" (fs 13, white).
     - A count on the right: fs 14 #5F6368. Only the Marque group has counts.
   - **Results column** (flex column, gap 20):
     - **Toolbar** (space-between, wrap, gap 12):
       - "{n} produits" at fs 16/700.
       - On mobile only, a "Filtres" button: height 44, outline 1.5px #1A1A1A, radius 999.
       - Static sort display: a span "Trier : **Prix croissant**" (height 44, white pill, border 1.5px #D5DCE3, fs 15). It is not interactive.
       - View toggle: segmented pill (white, border 1.5px #D5DCE3, padding 3) holding "Grille" / "Liste" buttons (height 36, radius 999, fs 14/700). Active is #1A1A1A with white text.
     - **ActiveChips:** each selected filter value is a chip (height 36, radius 999, bg #E8EFF8, text #0B5CAD, fs 14/700) showing "<value> ✕". Clicking removes it. When any chip exists, an underlined "Tout effacer" link appears.
     - **ProductCard grid** `resCols`: 1fr (mobile) / repeat(2) (760-1099) / repeat(3) (≥1100). When view = "liste", it is 1fr (desktop only). gap 16.
       - Same card as on Climatisation, plus a **Compare checkbox** at the bottom right (role checkbox, min-height 44, fs 15/600 #3C4043, label "Comparer"; box 22×22 radius 6; on state #0B5CAD with "✓").
     - **Pagination:** centred, gap 8, padding-top 12. Circles 44×44 radius 50%: "1" is active (#0B5CAD, white text), "2" and "3" are white. All link to `#`.
     - **EmptyState** (when there are no results): white, radius 24, padding 48px 32px, centred.
       - h2 (fs 28/700): "Aucun climatiseur ne correspond à ces filtres"
       - Paragraph (fs 16 #3C4043, max-width 480): "Retirez un filtre ou appelez le 0666-854184 : nous vous orientons vers l'appareil disponible le plus proche."
       - Button "Effacer les filtres": height 52, padding 0 28, radius 999, #0B5CAD.
5. **GuidePills + SEO text** `#guides`, H2 "Guides associés"
   - Pills: min-height 52, padding 0 22, radius 999, white, fs 16/700. All link to `Blog.dc.html`:
     - "Quelle puissance de climatiseur pour ma pièce ?"
     - "Climatiseur Inverter ou On/Off : lequel choisir ?"
     - "R32 ou R410A : comprendre les gaz frigorigènes"
   - SEO paragraph (margin-top 32, max-width 860, fs 16, line-height 1.7, #3C4043): "Un climatiseur mural Inverter ajuste sa vitesse au besoin réel de la pièce : il consomme moins qu'un modèle On/Off et garde une température plus stable. Les modèles LG Dual Inverter sont classés tropical T3 pour les fortes chaleurs et se pilotent en Wi-Fi avec LG ThinQ. Livraison gratuite partout au Maroc, paiement à la livraison et pose par nos techniciens sur devis."
6. **CompareTray** (fixed, region "Comparateur")
   - Position: left 50%, translateX(-50%), bottom 24 (mobile 12), width calc(100% − 48px) (mobile −24px), max-width 980, z 35.
   - Style: bg #1A1A1A, white text, radius 999 (mobile 20px), padding 10 10 10 24 (mobile 16), shadow 0 24px 50px -20px rgba(0,0,0,.5), "rise" animation.
   - Contents:
     - Text "{n} produit(s) · 3 max" (fs 15/700).
     - Chips (desktop and tablet only): height 44, rgba(255,255,255,.12), product name plus a 32px ✕ "Retirer" button on rgba(255,255,255,.16).
     - "Effacer" underlined text button.
     - "Comparer" orange pill: height 48, padding 0 20, links to `Comparer.dc.html`. The selection is not passed.

### 3. Interactivity and state
- **Facets** (`G`):

  | Facet (label) | Values |
  |---|---|
  | Puissance | 9 000 BTU, 12 000 BTU, 18 000 BTU, 24 000 BTU |
  | Marque | LG (3), Carrier (3), CIAT (1), Fitco (2), Simsek (0) |
  | Technologie | Inverter, On/Off |
  | Fluide | R32, R410A |
  | Couleur | Blanc, Noir |
  | Prix | Moins de 4 000 Dhs, 4 000 à 6 000 Dhs, Plus de 6 000 Dhs |
  | En promotion | Oui |

- **Filter logic:** Only **Marque** and **Technologie** actually filter results. The other facets toggle chips but do not filter (prototype limitation; implement them for real).
- **Default selection:** `tech: [Inverter, On/Off]`. So the chips "Inverter" and "On/Off" plus "Tout effacer" show at load, with 9 results.
- **Sort:** static label "Prix croissant". Results are not sorted.
- **View:** Grille (default) / Liste.
- **Compare:** max 3, toggled per card; a 4th selection is ignored silently. The tray appears when at least 1 product is selected.
- **Pagination:** static.
- **Query states:**
  - `?comparer=1` pre-selects compare = ["LG Dual Inverter", "Carrier Mural Inverter R32", "Fitco Mural Inverter"]. The tray shows "3 produits · 3 max" with 3 chips, and those cards' checkboxes are checked.
  - `?empty=1` pre-selects `marque: ['Simsek']`, giving 0 results and the EmptyState with a "Simsek" chip.
  - `?filters=1` opens the mobile filter sheet.
  - `?type=` is not read.
- The Compare link from `Comparer.dc.html`'s "Ajouter un produit" slot is `Categorie Climatiseurs muraux.dc.html?comparer=1`.

### 4. Responsive
**At 390:**
- The aside is hidden.
- The "Filtres" button opens it as a full-screen sheet (`position: fixed; inset: 0; z-index: 70`) with:
  - a header row ("Filtres" in strong fs 20, ✕ 44px close button, min-height 56, border-bottom)
  - a sticky bottom button "Voir les {n} produits" (height 52, radius 999, #0B5CAD).
- Cards are 1 column. The compare tray becomes radius 20, chips hidden, with a spacer instead.
- H1 is 32.

**At 1440:**
- The 280px sidebar is always visible.
- Cards are 3 columns.
- The tray is a 999 pill with name chips.

**Tablet (760-1099):** sidebar plus 2 columns.

### 5. Data — `MUR` (9 products, in display order)
- All cards link to `Produit LG Dual Inverter.dc.html`.
- Badge: discount if there is an old price, otherwise the brand name in blue.
- "À partir de" shows when `from` is true.

| # | Name | Brand | Tech | Fluid | Price | Old price | Badge | Ref shown | Dark | Image |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | LG Dual Inverter | LG | Inverter | — | À partir de 5 400 Dhs | — | LG | D10AWH.NW0 · D13AJH.N · D19AKH.NK0 · D24AKH-N | no | `uploads/clima-cut2.png` |
| 2 | LG Artcool Smart Inverter | LG | Inverter | — | À partir de 7 900 Dhs | — | LG | — | yes | art `mural` (dark) |
| 3 | LG Jetcool Inverter R32 | LG | Inverter | R32 | À partir de 5 000 Dhs | — | LG | — | no | `mural` |
| 4 | Carrier Mural Inverter R32 | Carrier | Inverter | R32 | 4 200 Dhs | 5 050 Dhs | −17 % (Économisez 850 Dhs) | 42QHG009D8SC-R32 | no | `mural` |
| 5 | Carrier Miroir Inverter Noir | Carrier | Inverter | R32 | À partir de 5 200 Dhs | — | Carrier | — | yes | `mural` dark |
| 6 | Carrier Mural On/Off | Carrier | On/Off | — | À partir de 4 500 Dhs | — | Carrier | — | no | `mural` |
| 7 | Fitco Mural Inverter | Fitco | Inverter | — | À partir de 3 700 Dhs | — | Fitco | — | no | `mural` |
| 8 | Fitco Mural On/Off | Fitco | On/Off | — | À partir de 3 800 Dhs | — | Fitco | — | no | `mural` |
| 9 | CIAT Mural Inverter | CIAT | Inverter | — | 3 800 Dhs | 4 700 Dhs | −19 % (Économisez 900 Dhs) | 38HG09VSA | no | `mural` |

### 6. Forms
None besides the filter checkboxes.

### 7. Leftovers
- Same home-page leftovers in the script, and the same `never` blocks as Climatisation.
- Facets that don't filter (see section 3).
- Static sort and pagination.
- `?type=` links lead nowhere distinct.
- Simsek appears in Marque with 0 products. It exists only to demo the empty state.

### 8. New tokens
- #C3CEDA: unchecked checkbox border.
- #D5DCE3: pill borders.
- Radius 6: checkboxes.
- rgba(255,255,255,.12/.16): tray chips.

---

## Produit LG Dual Inverter.dc.html

### 1. Identity
- **Purpose:** product detail page for one product family with a power-variant selector.
- **`<title>`:** "LG Dual Inverter · Climatiseur mural · Ariha Froid"
- **H1:** "LG Dual Inverter {curL} BTU". Default is "LG Dual Inverter 12 000 BTU".
- **Breadcrumb:** Accueil › Climatisation (`Climatisation.dc.html`) › Climatiseurs muraux (`Categorie Climatiseurs muraux.dc.html`) › LG Dual Inverter (`#`)
- **Implied URL:** `/climatisation/climatiseurs-muraux/lg-dual-inverter`. The variant is held in state, not in the URL.
- **Pages linked:** `Solutions professionnelles.dc.html#devis`, wa.me, `Produit LG Dual Inverter.dc.html` (same-range cards).

### 2. Sections, top to bottom
1. **Breadcrumb**
2. **ProductHero** (`section`, padding-top 24)
   - Grid `pCols`: 1fr below 1100; `minmax(0,1.1fr) minmax(0,1fr)` at ≥1100; gap 40; align start.
   - **Gallery:** flex column, gap 12. Sticky at top 96 on desktop, static below 1100.
     - Main image: aspect-ratio 4/3, radius 24, white, padding 32.
     - Discount tag at absolute left 16 / top 16: fs 14/700, #C4501A text, 1.5px border, radius 8, white bg, e.g. "−12 %".
     - Thumbnails: grid repeat(4), gap 10. Each is square, radius 16, border 2px (#0B5CAD when active, else #E6EBF0), white, padding 8.
     - Gallery views (`GV`):
       1. "Vue principale": `uploads/clima-cut2.png`
       2. "Face avant": `uploads/New_DZ2.png`
       3. "Télécommande": `uploads/telecommande-cut2.png` (max-width 40%)
       4. "Schéma": art `mural`
     - Images have a drop-shadow 0 10px 14px rgba(14,40,70,.22).
   - **BuyBox:** flex column, gap 18.
     - Brand row: `uploads/logo-lg-t.png` (height 32) plus a badge "Distributeur officiel" (fs 13/700 #0B5CAD, bg #E8EFF8, radius 8, padding 4px 10px).
     - H1: fs 32/44/56, line-height 1.05.
     - "Réf. {ref}" (fs 15 #5F6368).
     - **VariantSelector**, label "Puissance" (fs 15/700):
       - Grid `powCols`: repeat(2) on mobile / repeat(4) otherwise; gap 8.
       - Button: min-height 64, radius 16, border 2px. Selected: #0B5CAD border and #E8EFF8 bg. Unselected: #E3E8EE border, white.
       - Shows "{l} BTU" (fs 16/700) and the price (fs 14 #5F6368). Uses `aria-pressed`.
     - Price block: price fs 40/800 letter-spacing -0.03em; old price fs 18 #7A828B struck; saving fs 15/700 #C4501A.
     - **In stock** (default):
       - "● En stock" (fs 15/700 #1F9D57, 10px dot).
       - QuantityStepper: height 56 pill, border 1.5px #D5DCE3; − / + buttons 52×52; value fs 17/700; minimum 1.
       - Add-to-cart button "Ajouter au panier": height 56, radius 999, #0B5CAD, flex 1, min-width 200. Shows "Ajouté au panier" for 1800 ms after clicking.
       - Toast text: "LG Dual Inverter {l} BTU ajouté au panier".
     - **Out of stock** (`?stock=…`):
       - Box: #FDEBDD, radius 16, padding 16px 18px.
       - Text "Rupture de stock pour cette puissance" (fs 15/700 #C4501A).
       - Input placeholder "Votre téléphone" (aria-label "Téléphone"): height 48, radius 999, border 1.5px #E3C7B3, min-width 160.
       - Button "Me prévenir": #1A1A1A, height 48. It has no handler.
     - Action grid `actCols`: 1fr on mobile / 1fr 1fr otherwise; gap 10.
       - "Commander par WhatsApp" (height 56, #25D366, links to `https://wa.me/212666854184` with no text).
       - "Demander un devis" (height 56, 1.5px #1A1A1A outline, links to `Solutions professionnelles.dc.html#devis`).
     - ReassuranceLine (fs 14 #3C4043): "Livraison gratuite partout au Maroc · Paiement à la livraison · Pose par nos techniciens sur devis"
3. **Highlights** `#points-forts`, H2 "Points forts"
   - Grid `ptCols`: repeat(2) on mobile / repeat(5) otherwise; gap 16.
   - Tile: white, radius 20, padding 20, gap 10. Icon box 44×44, radius 14, #E8EFF8, with a 24px two-tone line icon (blue path and orange path). h3 fs 17/700.
   - Items:
     1. "Refroidissement rapide" (icon snow)
     2. "Jusqu’à 70 % d’économie d’énergie" (icon `IC.bolt || IC.tag`, which resolves to tag)
     3. "Silencieux" (fan)
     4. "Tropical T3" (unit)
     5. "Wi-Fi LG ThinQ" (list)
   - Body (margin-top 24, max-width 860, fs 16, line-height 1.7, #3C4043): "Le LG Dual Inverter adapte en continu la vitesse de son compresseur : la pièce refroidit vite, puis la température reste stable avec une consommation réduite, jusqu'à 70 % d'électricité en moins. Il est classé tropical T3 pour les fortes chaleurs, reste silencieux et se pilote depuis le téléphone avec LG ThinQ."
4. **SpecTable** `#specifications`, H2 "Caractéristiques"
   - Next to the heading: a "Télécharger la fiche technique" outline pill (height 48, 1.5px #1A1A1A, href `#`).
   - Table: white, radius 24, overflow hidden. Rows are a grid `specCols` (1fr 1fr on mobile / 280px 1fr), gap 16, padding 16px 24px, fs 16.
   - Label #5F6368; value weight 600. Zebra striping: even rows #F7F9FB, odd rows #fff.
   - Rows (for the default 12 000 variant):

     | Label | Value |
     |---|---|
     | Marque | LG |
     | Gamme | Dual Inverter |
     | Type | Climatiseur mural |
     | Puissance | 12 000 BTU (follows the variant) |
     | Référence | D13AJH.N (follows the variant) |
     | Technologie | Inverter |
     | Classe climatique | Tropical T3 |
     | Connectivité | Wi-Fi LG ThinQ |

5. **InstallKit** (cross-sell) `#installation`, H2 "Pour l'installation"
   - Box: #FDF0E6, radius 24, padding 24/48, gap 12.
   - Each row is a toggle button: white, radius 18, padding 14px 18px, gap 16.
     - Checkbox 24×24, radius 7 (on: #0B5CAD fill with ✓; off: #C3CEDA border).
     - Thumbnail 64×52, radius 12, #EEF3FA.
     - Title fs 16/700, sub-text fs 14 #5F6368, price fs 18/800.
   - Rows:
     - "Kit duo 1/4-3/8 20 m" — "Réf. CUIV0018" — 1 130 Dhs — art `duo` — checked
     - "Support GT" — "Réf. CLIM00076" — 55 Dhs — art `support` — checked
     - "Visite technique" — "Un technicien mesure et conseille" — 300 Dhs — text "Visite" (fs 12/700 blue) — unchecked
   - Footer row:
     - "Total sélection : **{total}**" (fs 17, total fs 24). Default 1 185 Dhs.
     - Button "Tout ajouter au panier": height 56, #F4731F. Shows the toast "Kit d’installation ajouté au panier" and adds count +1 regardless of what is checked.
6. **ProductCard grid** `#meme-gamme`, H2 "Dans la même gamme"
   - Grid `c4`. Shows `MUR.slice(1,5)`:
     - LG Artcool Smart Inverter (À partir de 7 900 Dhs, badge LG, dark)
     - LG Jetcool Inverter R32 (À partir de 5 000 Dhs, badge LG)
     - Carrier Mural Inverter R32 (4 200 / 5 050 Dhs, −17 %, ref 42QHG009D8SC-R32)
     - Carrier Miroir Inverter Noir (À partir de 5 200 Dhs, badge Carrier, dark)
   - All link to `Produit LG Dual Inverter.dc.html`.
7. **FaqAccordion** `#faq`, H2 "Questions fréquentes" (first item open)
   - Q: "Quelle puissance choisir ?" — A: "Environ 600 BTU par m² : 9 000 BTU jusqu’à 15 m², 12 000 jusqu’à 20 m², 18 000 jusqu’à 30 m², 24 000 jusqu’à 40 m²."
   - Q: "Le kit d’installation est-il inclus ?" — A: "Non. Ajoutez le kit duo 1/4-3/8 et le support GT dans « Pour l’installation »."
   - Q: "Comment payer ?" — A: "Vous payez à la livraison. La livraison est gratuite partout au Maroc."
8. **StickyBar** (add to cart)
   - Shown when the page is scrolled more than 140px and the product is not out of stock.
   - Position: fixed bottom, full width, white, shadow 0 -12px 32px -16px rgba(14,40,70,.35), padding 12px `gutter`, gap 16, z 30.
   - Contents:
     - Thumbnail `uploads/clima-cut2.png`, 64×44 (hidden on mobile).
     - Name "LG Dual Inverter {l} BTU" (fs 16/700, ellipsis).
     - Price fs 22/800.
     - "Ajouter au panier" button (#0B5CAD, the effective height is 48).

### 3. Interactivity and state
- **Variant state:** `pi` defaults to 1 (12 000). It changes the H1, ref, price, old price, saving, discount tag, the spec rows for power and ref, the sticky-bar name and price, and the toast. It does **not** change the gallery image.
- **Gallery:** the thumbnails set `gi`.
- **Quantity:** `qty` ≥ 1, but it is not used in the add action (count +1 only).
- **Kit:** checkbox toggles with a live total.
- **FAQ:** accordion.
- **Query state:** `?stock=1` (any value) gives the out-of-stock state: the stock line, quantity stepper and add button are replaced by the "Me prévenir" box, and the sticky bar is disabled.

### 4. Responsive
**At 390:**
- One column, with the gallery stacked on top and not sticky.
- Variant buttons in 2 columns.
- Action buttons stacked.
- Highlights in 2 columns.
- Spec table 1fr 1fr.
- Kit box padding 24.
- Same-range cards in 1 column.
- Sticky bar thumbnail hidden.
- H1 32.

**At 1440:**
- Two columns (1.1fr / 1fr), with the gallery sticky at top 96.
- Variants in 4 columns.
- Actions side by side.
- Highlights in 5 columns.
- Specs 280px / 1fr.
- Cards in 4 columns.

### 5. Data — variants (`PW`)
Discounts and savings are computed.

| Label | Ref | Price | Old price | Badge | Saving | Image (in data, unused by the gallery) |
|---|---|---|---|---|---|---|
| 9 000 | D10AWH.NW0 | 5 400 Dhs | 6 200 Dhs | −13 % | 800 Dhs | `https://climatisationmaroc.com/prodimg/20260811161311.png` |
| 12 000 (default) | D13AJH.N | 5 700 Dhs | 6 500 Dhs | −12 % | 800 Dhs | `uploads/New_DZ2.png` |
| 18 000 | D19AKH.NK0 | 7 600 Dhs | 8 100 Dhs | −6 % | 500 Dhs | `https://climatisationmaroc.com/prodimg/20260811164300.png` |
| 24 000 | D24AKH-N | 8 900 Dhs | 9 500 Dhs | −6 % | 600 Dhs | `https://climatisationmaroc.com/prodimg/20260811164620.png` |

All other page data (highlights, specs, kit, FAQ, same-range products) is in section 2.

### 6. Forms
- Out-of-stock alert only: input "Votre téléphone" (type not set, so text; no required attribute; no validation) and a "Me prévenir" button with no handler.

### 7. Leftovers
- `IC.bolt` doesn't exist, so the energy highlight falls back to the tag icon.
- Per-variant images in `PW` are not used.
- The sticky-bar thumbnail is hard-coded.
- "Télécharger la fiche technique" links to `#`.
- `footBottom` is 0, so the sticky bar overlaps the bottom of the footer.
- The add-to-cart button style has `height:56px` overridden by `height:48px`.
- Same home-page script leftovers and `never` blocks as the other pages.

### 8. New tokens
- #F7F9FB: spec zebra row.
- #EEF3FA: kit thumbnail bg.
- #E3C7B3: out-of-stock input border.
- #1F9D57 (known) for "En stock".
- Radii 16 (thumbnails, variant buttons, out-of-stock box) and 7 (kit checkbox).
- Font sizes 40 (price) and 22 (sticky price).

---

## Comparer.dc.html

### 1. Identity
- **Purpose:** side-by-side product comparison, up to 3 products.
- **`<title>`:** "Comparer des climatiseurs · Climatisation Maroc"
- **H1:** "Comparer"
- **Breadcrumb:** Accueil › Climatiseurs muraux (`Categorie Climatiseurs muraux.dc.html`) › Comparer (`#`)
- **Implied URL:** `/comparer`
- **Pages linked:** `Produit LG Dual Inverter.dc.html`, `Categorie Climatiseurs muraux.dc.html`, `Categorie Climatiseurs muraux.dc.html?comparer=1`.
- **Header differs:** Promotions links go to `Promotions.dc.html`, and Enter in search goes to `Recherche.dc.html?q=`.

### 2. Sections
`main` padding: 0 `gutter` `secGap`.

1. **Breadcrumb**
2. **Title row** (padding-top 24, space-between, align flex-end, wrap, gap 16px 24px)
   - H1: fs 34 (mobile) / 44 / 56, line-height 1.05, text-wrap balance.
   - Sub-line (fs 17 #3C4043): "{n} produits · jusqu'à 3 produits".
   - **DiffToggle** switch (role="switch"): label "Afficher uniquement les différences" (fs 16/700).
     - Track 48×28, radius 999: #0B5CAD when on, #C3CEDA when off.
     - Knob 22px white, left 3 → 23.
3. **CompareTable** (section padding-top 28)
   - Wrapper: overflow-x auto, radius 24, white, thin scrollbar.
   - Inner grid `cmpCols` = label column + one column per product + one "add" slot column:
     - Label column: 112px (mobile) / 200px.
     - Product columns: 200px (mobile) / 230px (tablet) / minmax(0,1fr) (desktop).
     - min-width: mobile 112+200×cols; tablet 200+230×cols; desktop 0.
   - Header row:
     - The sticky first cell (left 0, z 2, white, border-right 1px #EEF1F4, padding 20px 24px, or 12px on mobile) shows "Produits" (fs 14/700 #5F6368; empty on mobile).
     - Product column cells: padding 20, gap 10, border-right #EEF1F4.
       - Remove ✕ button at absolute top/right 12: 40px circle, #F4F6F8, hover #FDEBDD, aria-label "Retirer {name}".
       - Image link: height 100 (mobile) / 150.
       - Name link: fs 15 (mobile) / 18, weight 600, min-height 46.
       - Price: fs 22 / 26, weight 800. Old price fs 14 #7A828B, struck.
       - Button "Ajouter au panier": height 48, radius 12, border 1.5px #9AA3AD. Shows "Ajouté ✓" in #1F9D57 for 1800 ms.
     - Add slot (`hasSlot` = n<4, so always shown):
       - Dashed card: 2px dashed #C3CEDA, radius 18, min-height 240. Hover border and text #0B5CAD.
       - A 52px circle with "+" (#E8EFF8, fs 28 blue), and "Ajouter un produit" (fs 16/700).
       - Links to `Categorie Climatiseurs muraux.dc.html?comparer=1`.
   - Spec rows:
     - Label cell: sticky left, fs 15/700 #3C4043, padding 16px 24px (12px on mobile), border-top and border-right #EEF1F4.
     - Value cells: padding 16px 20px, fs 16.
     - A value is bold (700) when the row differs and the value isn't "—". "—" is shown in #9AA3AD.
     - Row zebra: even rows #F9FAFC, odd rows #fff.
   - Footnote (fs 14 #5F6368, margin-top 16): "Un tiret indique une caractéristique non renseignée dans notre catalogue. Demandez-nous la fiche technique."

### 3. Interactivity
- Remove a product (`keep` state).
- Diff toggle: hides rows where every product has the same value. With the default 3 products it hides Puissance, Surface conseillée and Technologie.
- Per-column add to cart, plus toast.
- No page-specific query state. The comparison set is hard-coded and nothing is passed from the category tray.

### 4. Responsive
**At 390:** the table scrolls horizontally with a sticky 112px label column, 200px product columns, a smaller image (100), and name and price at 15/22. H1 34.

**At 1440:** a fluid table with a 200px label column and equal flexible columns. No scroll.

### 5. Data (`ALL`)
Spec keys in order: Marque, Puissance, Surface conseillée, Technologie, Fluide, Couleur, Wi-Fi.

| key | Name | Price | Old price | Image | href | Marque | Puissance | Surface conseillée | Technologie | Fluide | Couleur | Wi-Fi |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| lg | LG Dual Inverter 12 000 BTU | 5 700 Dhs | 6 500 Dhs | `uploads/clima-cut2.png` | `Produit LG Dual Inverter.dc.html` | LG | 12 000 BTU | Jusqu’à 20 m² | Inverter | — | — | Oui, LG ThinQ |
| carrier | Carrier Mural Inverter R32 12 000 BTU | 4 800 Dhs | — | art `mural` | `Categorie Climatiseurs muraux.dc.html` | Carrier | 12 000 BTU | Jusqu’à 20 m² | Inverter | R32 | — | — |
| fitco | Fitco Mural Inverter 12 000 BTU Blanc | 4 000 Dhs | 4 900 Dhs | art `mural` | `Categorie Climatiseurs muraux.dc.html` | Fitco | 12 000 BTU | Jusqu’à 20 m² | Inverter | — | Blanc | — |

Note: Carrier 12 000 at 4 800 Dhs (no old price) is a new SKU/price that doesn't appear elsewhere. The Carrier Mural on other pages is 9 000 at 4 200 / 5 050.

### 6. Forms
None.

### 7. Leftovers
- Helpers declared in `extra` but unused: `wa`, `pill`, `logo`, `toastIt`, `waHref`, `cardP`, `btnDir`, `btnW`, `c3`, `c4`, plus `fmt2`/`dh2`/`LOGOAR` at the top level.
- "jusqu'à 3 produits" is shown, yet the add slot still appears when there are 3 products (`n<4`).
- Same home-page script leftovers and `never` blocks.

### 8. New tokens
- #F9FAFC: compare zebra row (different from Produit's #F9FB-style #F7F9FB).
- #C3CEDA: switch off-state and dashed slot border.
- Switch component: 48×28 track, 22px knob.
- fs 34 (mobile H1), fs 26 (price).

---

## Cuivre et gaz.dc.html

### 1. Identity
- **Purpose:** range page for installation supplies, built as a dense quick-order list with a selection sidebar (a B2B-style listing).
- **`<title>`:** "Cuivre et gaz · Climatisation Maroc"
- **H1:** "Cuivre et gaz"
- **Breadcrumb:** Accueil › Cuivre et gaz (`#`)
- **Implied URL:** `/cuivre-et-gaz`. The mega menu sub-categories are Cuivre, Kits duo, Isolant, Gaz frigorifique.
- **Pages linked:** `Panier.dc.html`, wa.me ("Me prévenir"). Item links go to `#`.
- **Header differs:** Promotions links go to `Promotions.dc.html`, and Enter in search goes to `Recherche.dc.html?q=`. The header cart `count` is overridden to the number of items in the selection, which is 2 at load.

### 2. Sections
`main` padding: 0 `gutter` `secGap`.

1. **Breadcrumb**
2. **PageIntro** (padding-top 24, gap 12, max-width 820)
   - H1: fs 34 / 44 / 56, line-height 1.05.
   - Paragraph (fs 18, line-height 1.55, #3C4043): "Tubes cuivre, kits duo, isolant et gaz frigorifique pour l'installation de vos climatiseurs."
3. **QuickOrder layout** (section padding-top 24)
   - Grid `lqCols`: 1fr below 1100; `minmax(0,1fr) 340px` at ≥1100; gap 24.
   - **Left column** (flex column, gap 16):
     - **SubcategoryPills:** horizontal scroll, no scrollbar, gap 8.
       - Pill: height 44, padding 0 18, radius 999, border 1.5px (#E3E8EE, or #1A1A1A when active), fs 15/700. Active: bg #1A1A1A with white text. Hover border #1A1A1A. Uses `aria-pressed`.
       - Values: "Tout", "Cuivre", "Kits duo", "Isolant", "Gaz frigorifique".
     - **Toolbar** (wrap, gap 10):
       - Search filter: flex 1 1 260px, height 48, radius 999, border 1.5px #D3DDE8, white, magnifier icon #5F6368. Input placeholder "Filtrer : nom ou référence", aria-label "Filtrer la liste".
       - Sort: native `<select>` (aria-label "Trier"), height 48, radius 999, border #D3DDE8, fs 15/700, custom chevron. Options: "Pertinence" (default), "Prix croissant", "Prix décroissant", "Nom".
       - View: radiogroup "Affichage" (padding 3, inset 1.5px #D3DDE8 border) with buttons "Liste" (default) and "Grille" (height 42, radius 999, active #1A1A1A).
     - Count: "{n} produits" (fs 15/700). "13 produits" at load.
     - **DenseRow list** (view = Liste): white, radius 24, padding 16px 24px (mobile 4px 16px).
       - Column header row (desktop ≥1100 only): fs 13/700 #5F6368, letter-spacing .02em, border-bottom #EEF1F4. Columns: "", "Produit", "Référence", "Prix" (right-aligned), "Quantité", "".
       - Row grid `rCols`: `64px minmax(0,1fr) 110px 110px 132px 110px` (≥760); `56px minmax(0,1fr) auto` on mobile. gap 8px 16px. Padding 12px 0 (mobile 14px 0). Border-bottom #EEF1F4 except on the last row.
       - Grid areas: desktop `"img name ref price qty act"`; mobile `"img name price" "img qty act"`.
       - Thumbnail: 64px (mobile 56), radius 12, #EEF3FA, padding 6.
       - Name: fs 16/700. On mobile the ref shows under the name (fs 13 #5F6368); otherwise it gets its own column (fs 14 #3C4043, tabular-nums).
       - Price: fs 18/800, right-aligned.
       - Qty stepper: height 40 pill, border 1.5px #D5DCE3, 36px −/+ buttons ("Diminuer"/"Augmenter"), value fs 15/700, minimum 1.
       - Add button: height 40, min-width 100 (mobile 96), radius 999, border 1.5px #9AA3AD, fs 14/700. Label "Ajouter"; after adding, "Ajouté ✓" with #1F9D57 fill. This state is persistent while the item is in the selection.
       - Out-of-stock row: opacity 0.6, stepper hidden, red text "Rupture de stock" (fs 13/700 #C4501A) under the name, and a "Me prévenir" outline pill (border #D5DCE3) linking to wa.me with the text "Bonjour, prévenez-moi quand {name} ({ref}) sera disponible."
     - **Grid view:** grid `gCols` = repeat(2) on mobile / repeat(3) otherwise; gap 12.
       - Card: white, radius 20, padding 16, gap 10.
       - Art box height 110. Name fs 15/700, min-height 40. Ref fs 13 #5F6368. Price fs 20/800.
       - Button: height 44, radius 12, "Ajouter" / "Ajouté ✓". Out-of-stock items show "Rupture de stock" instead (fs 14/700 #C4501A). No quantity stepper in grid view.
   - **SelectionSidebar** (desktop ≥1100 only): `aside`, white, radius 24, padding 24, gap 14, sticky at top 88.
     - h2 "Votre sélection" (fs 22/700).
     - Lines: name (fs 15/600) / "Qté {q} · {unit price} / unité" (fs 13 #5F6368) / line total (fs 15/800), with a border-bottom #EEF1F4.
     - Empty text: "Ajoutez des articles depuis la liste."
     - "Total" (fs 16 #3C4043) with the amount at fs 28/800.
     - CTA "Voir le panier": height 56, radius 999, #F4731F, hover #D85A17, links to `Panier.dc.html`.
     - Footer line (fs 14, centred): "Livraison gratuite · Paiement à la livraison"
4. **Selection StickyBar** (below 1100)
   - Fixed bottom, white, top shadow, padding 12 `gutter`.
   - Shows "{n} article(s) dans votre sélection" (fs 13 #3C4043) and the total (fs 22/800), plus a "Voir le panier" orange pill linking to `Panier.dc.html`.
   - The footer gets padding-bottom 80 to make room.

### 3. Interactivity and state
- Sub-category filter (`sub`).
- Live text filter on name and ref (`lq`).
- Sort: Pertinence keeps the source order; Prix croissant / Prix décroissant sort by price; Nom uses fr `localeCompare`.
- View: Liste / Grille.
- Per-row quantity (`qs`). "Ajouter" adds that quantity to the selection (`bk`), resets the row quantity to 1, and shows the toast "{name} ajouté au panier".
- The selection starts as `{CUIV0018: 2}`: "Kit duo 1/4-3/8 20 m", "Qté 2 · 1 130 Dhs / unité", 2 260 Dhs. The total is 2 260 Dhs and the bar says "2 articles dans votre sélection".
- Out-of-stock list: `['CUIV0009']`.
- No page-specific query state.

### 4. Responsive
**At 390:**
- Single column.
- Rows become two-line grid cards (image on the left; name+ref / price on top; qty / Ajouter below).
- No column header.
- The sidebar is hidden and the bottom bar is shown instead.
- Grid view uses 2 columns.
- Pills scroll horizontally.
- H1 34.

**Tablet (760-1099):** six-column rows without the header row; sidebar hidden; bottom bar shown.

**At 1440:** header row, six columns, 340px sticky sidebar, no bottom bar.

### 5. Data — `L` (13 items, source order)
Columns are name / ref / price / sub-category / art key.

| Name | Ref | Price | Sub-category | Art | Stock |
|---|---|---|---|---|---|
| Cuivre 1/4 Lafarga 15 m | CUIV0005 | 495 Dhs | Cuivre | coilS | in stock |
| Cuivre 3/8 Lafarga 15 m | CUIV0006 | 750 Dhs | Cuivre | coilL | in stock |
| Cuivre 1/2 15 m | CUIV0007 | 1 050 Dhs | Cuivre | coilL | in stock |
| Cuivre 5/8 Lafarga 15 m | CUIV0008 | 1 350 Dhs | Cuivre | coilL | in stock |
| Cuivre 3/4 15 m | CUIV0009 | 1 875 Dhs | Cuivre | coilL | **Rupture de stock** |
| Kit duo 1/4-3/8 20 m | CUIV0018 | 1 130 Dhs | Kits duo | duo | in stock |
| Kit duo 1/4-1/2 20 m | CUIV0017 | 1 280 Dhs | Kits duo | duo | in stock |
| Kit duo 5/8-3/8 20 m | CUIV0048 | 2 100 Dhs | Kits duo | duo | in stock |
| Armaflex 9/6 | CLIM00008 | 3,50 Dhs | Isolant | iso (inline SVG: #2B3640 tube, #1A1A1A end, #C46A3A core) | in stock |
| Armaflex 9/12 | CLIM00004 | 4,50 Dhs | Isolant | iso | in stock |
| Gaz R410 GS 11,3 kg | GAZ00042 | 5 000 Dhs | Gaz frigorifique | gaz | in stock |
| Gaz R407 GS 11,3 kg | GAZ00045 | 3 800 Dhs | Gaz frigorifique | gaz | in stock |
| Gaz R22 13,6 kg | GAZ00044 | 3 750 Dhs | Gaz frigorifique | gaz | in stock |

Notes:
- The prices are decimal (3.5 and 4.5), so the database needs decimal price support.
- There are no brand fields. Lafarga and GS appear only in the names, and the mega menu lists brands Lafarga and GS.

### 6. Forms
- Filter text input (placeholder "Filtrer : nom ou référence").
- Sort select with 4 options.
- No required fields or validation.

### 7. Leftovers
- Item links are `#`, with no product pages.
- The bottom bar's hover style changes its height and padding (`style-hover="…height:52px;padding:0 20px"`), which looks like a mistake.
- Unused helpers: `logo`, `toastIt`, `waHref`, `cardP`, `btnDir`, `btnW`, `c3`, `c4`, `LOGOAR`.
- The home-page `SUP` array in the script duplicates some of these SKUs.
- Same `never` blocks.

### 8. New tokens
- #D3DDE8: toolbar input, select and segmented borders.
- #EEF3FA: thumbnail bg.
- #D5DCE3: qty stepper and "Me prévenir" border.
- #2B3640 and #C46A3A: insulation illustration.
- Layout widths: sidebar 340px; Catégorie aside 280px.

---

## Cross-file data discrepancies to resolve before seeding the DB
- **Carrier Mural Inverter R32:**
  - 9 000 at 4 200 / 5 050 Dhs (Climatisation, Catégorie, Produit)
  - 12 000 at 4 800 Dhs with no old price (Comparer)
- **Fitco Mural Inverter:**
  - "À partir de 3 700 Dhs" (Catégorie)
  - 12 000 Blanc at 4 000 / 4 900 Dhs (Climatisation, Comparer, `FAM`)
- **LG Artcool:**
  - "À partir de 7 900 Dhs" (Catégorie)
  - 18 000 at 9 900 / 10 500 Dhs, ref UA19MKH0.NJ0 (`FAM`, unused)
- **Carrier Miroir:**
  - "À partir de 5 200 Dhs" (Catégorie)
  - 12 000 at 5 600 / 6 600 Dhs, ref 42QHG012D8S-BM (`FAM`, unused)
- **Product links:** every product card links to `Produit LG Dual Inverter.dc.html`, whatever the product.
- **Quote CTAs:** "Demander un devis" in the page bodies goes to `Solutions professionnelles.dc.html#devis`, but the header goes to `Demander un devis.dc.html`.
