# Design analysis: Panier, Commande, Confirmation, Suivi commande, Recherche, Promotions

I read all six files to the end. Apart from the `<title>`, five of them have the same lines 1–104 (promo bar, sticky header, mega menu, drawer). Everything from `</main>` through the start of `extra(v)` is also the same in all six: footer, toast, the dead bottom bar, and the whole script prelude (data constants, `rv()`, `post()`). I checked this with `diff`. Each page differs only in its `<main>` and its `extra(v)` method. Commande also differs in the header.

## Shared notes (apply to all 6)

**Responsive values**
- Gutter is 16 on mobile and 40 otherwise. `cmax` is W, so there is no max-width cap.
- `secGap` is 40 on mobile and 56 otherwise.
- Every page's `extra()` sets H1 size to 34 on mobile, 44 on tablet (<1100) and 56 on desktop.
- Card padding `cardP` is 20 on mobile and 32 otherwise.
- `h2Size` is 32 on mobile and 44 otherwise.
- The product grid (`gridCols`) is 1 column on mobile, 2 on tablet and 4 on desktop. Promotions overrides the desktop value to 3 columns.

**Breadcrumb component**
- 14px text in #5F6368 with `padding-top:24px`.
- The separator is `›` in #9AA3AD.
- The last item is #1A1A1A at weight 700 with `href="#"`; earlier items are #5F6368 at weight 500.

**Price format**
- `toLocaleString('fr-FR')`, with every space replaced by a non-breaking space, then ` Dhs`. Example: `5 700 Dhs`.
- Discount badge text is `−{round((1-price/was)*100)} %`, using a real minus sign and a non-breaking space before %.
- The saving line reads `Économisez {was-price} Dhs`.

**Header cart count**
- The count is `state.count`, which starts at 0 and goes up with each add-to-cart.
- Panier is the exception: it shows the real number of items in the cart.
- Adding a product shows a toast: `{label} ajouté au panier`. It is black #1A1A1A, a pill, 15px, and lasts 2.2 s. Its bottom offset ends up at 24 everywhere, because `post()` overrides it.

**Query strings available on every page**
- `?menu=clim|eau|vent|gaines|cuivre|pieces` opens the mega menu after 300 ms.
- `?drawer=1` (or `?drawer=<key>`) opens the mobile drawer with that accordion section expanded.

**Search box**
- Pressing Enter with a non-empty value goes to `Recherche.dc.html?q=<term>`.

**Active nav item**
- No page marks an active nav item. The Promotions page does not highlight "Promotions"; that link is #C4501A on every page.

**Product data constants (in every file; only the ones a page uses are listed under that page)**
- `CARTL`: the demo cart.
- `SUGG`: install suggestions.
- `PROMO`: 12 discounted air conditioners.
- `CAT`: `PROMO` plus 6 accessories.
- The full lists are under the pages that use them.

---

## Panier.dc.html

### 1. Identity
- **Purpose:** the cart.
- **`<title>`:** `Votre panier · Climatisation Maroc`.
- **H1:** `Votre panier`. In the empty state it is `Votre panier est vide`.
- **Breadcrumb:** Accueil (Accueil.dc.html) › Panier.
- **Links to:** Produit LG Dual Inverter, Cuivre et gaz, Pieces de rechange (cart line links), Commande, Climatisation ("Continuer mes achats"), Categorie Climatiseurs muraux, Promotions.
- **Header and footer:** the standard shared ones.

### 2. Sections (filled cart, `hasLines`)

1. **Breadcrumb.**

2. **Title row**
   - `padding-top:24px`, flex, baseline-aligned, gap 16, wraps.
   - H1 at 34/44/56, weight 700, line-height 1.05, letter-spacing −0.03em.
   - Next to it, item count `{n} article(s)` at 17px in #5F6368. With the demo cart this reads "4 articles".

3. **Cart grid**
   - `padding-top:32px`, gap 24, `align-items:start`.
   - Columns: `minmax(0,1fr) 400px` at 1100 and up; `1fr` below 1100.

   **3a. CartLine list card**
   - White, radius 24, padding `4px {cardP}`.
   - Each line is a grid with gap `14px 20px` and padding `20px 0`. Lines are separated by `1px solid #EEF1F4`; the last line has no border.
   - Desktop columns: `96px minmax(0,1fr) auto 130px 44px`, areas `"img info qty tot rm"`.
   - Mobile columns: `72px minmax(0,1fr) auto`, areas `"img info rm" "qty qty tot"`.
   - **Thumbnail:** 96×76 on desktop, 72×60 on mobile. Radius **16**, background **#EEF3FA**, padding 10, links to the product.
   - **Info:**
     - Name: 18px/700, links to the product.
     - `Réf. {ref}`: 14px, #5F6368.
     - Optional option line (`opt`): 14px, #3C4043.
   - **Quantity stepper:**
     - 48px tall pill with a `1.5px solid #D5DCE3` border.
     - `−` and `+` buttons are 44×44 at 20px. The aria-labels are "Diminuer la quantité" and "Augmenter la quantité".
     - The value is 16px/700 with min-width 24.
   - **Total:**
     - Line total: 20px/800.
     - When quantity is above 1, a unit line `{qty} × {price}` appears at 13px in #5F6368.
   - **Remove button:**
     - 44px circle, background #F4F6F8, turns #FDEBDD on hover.
     - Trash icon with stroke #3C4043.
     - aria-label "Retirer l'article".

   **3b. ReassuranceBar (inline, under the lines)**
   - Flex, wraps, gap `12px 28px`, padding `4px 8px`.
   - Items are 15px/600 with a 22px icon filled #0B5CAD.
   - Items: `Paiement à la livraison` (cash icon), `Livraison gratuite partout au Maroc` (truck icon).

   **3c. OrderSummary aside**
   - White, radius 24, padding `cardP`, flex column, gap 16.
   - Sticky at `top:88px` from 1100 up; static below.
   - Contents, top to bottom:
     - H2 `Récapitulatif`, 24px/700.
     - Row `Sous-total`: label #3C4043, value 700. All rows are 16px.
     - Row `Livraison`: value `Gratuite`, 700, #1F9D57.
     - 1px divider, #EEF1F4.
     - Row `Total`: label 18px/700, value 32px/800 with letter-spacing −0.02em.
     - CTA `Passer la commande`: 56px orange pill #F4731F, hover #D85A17, links to Commande.dc.html.
     - Underlined link `Continuer mes achats`: 15px/700, links to Climatisation.dc.html.

4. **Suggestions: H2 `Pour l'installation`**
   - Size `h2Size`, margin-bottom 24, `padding-top:secGap`.
   - Grid: 3 columns on tablet and desktop, 1 on mobile; gap 16.
   - Each card:
     - White, radius 20, padding 16, flex row, gap 16.
     - Thumbnail 80×68, radius 14, background #EEF3FA.
     - Name 16px/700, price 18px/800.
     - Button: 44px pill, border 1.5px, text 15px/700.
       - Default: `Ajouter`, white with border #9AA3AD.
       - Already in the cart: `Ajouté ✓`, fill and border #1F9D57, white text.

**Empty state (`isEmpty`)**
- A single card: white, radius 24, padding `40px 20px` on mobile and `72px 32px` otherwise, centred, gap 16.
- Icon: 88px circle #FDEBDD with a 40px orange cart icon.
- H1 `Votre panier est vide`.
- Paragraph (17px, line-height 1.55, #3C4043, max-width 520): `Ajoutez un climatiseur ou un accessoire. La livraison est gratuite partout au Maroc et vous payez à la livraison.`
- Two buttons, stacked full-width on mobile and side by side otherwise:
  - `Voir les climatiseurs`: blue #0B5CAD (hover #084683), links to Categorie Climatiseurs muraux.dc.html.
  - `Voir les promotions`: white with a `1.5px #1A1A1A` border, turns black on hover, links to Promotions.dc.html.
- The breadcrumb still shows. The "Pour l'installation" section is hidden.

### 3. Behaviour and state
- **Cart state:** `state.cart` starts from `CARTL`. With `?vide=1` it starts as `[]`, which gives the empty state.
- **Quantity:** `upd(id,±1)`, with a minimum of 1.
- **Remove:** filters the line out. Removing every line shows the empty state.
- **Totals:**
  - `sub = Σ price×qty`.
  - `total = sub`.
  - Delivery is always "Gratuite": no fee, no threshold.
- **Not on this page:** coupon, delivery options, technical visit.
- **Header count:** the total quantity.
- **Suggestion add:** if the item is already in the cart, its quantity goes up by 1; otherwise it is appended with quantity 1 and `href:'Cuivre et gaz.dc.html'` (even for the Télécommande). A toast also appears.

### 4. Responsive (390 vs 1440)
**At 390**
- Summary sits below the lines and is not sticky.
- Cart lines use the 2-row layout with the quantity stepper under the info.
- Thumbnails are 72×60.
- Suggestions are 1 column.
- Empty-state buttons are stacked full-width.

**At 1440**
- Two columns: lines on the left, a 400px sticky summary on the right.
- Lines are a single row.
- Suggestions are 3 columns.

### 5. Data (verbatim)

**`CARTL` (demo cart)**

| id | name | ref | opt | price | qty | image | href |
|---|---|---|---|---|---|---|---|
| lg | LG Dual Inverter 12 000 BTU | D13AJH.N | Puissance : 12 000 BTU | 5700 | 1 | img `uploads/clima-cut2.png` | Produit LG Dual Inverter.dc.html |
| duo | Kit duo 1/4-3/8 20 m | CUIV0018 | – | 1130 | 1 | art `duo` | Cuivre et gaz.dc.html |
| gt | Support GT | CLIM00076 | – | 55 | 2 | art `support` | Pieces de rechange.dc.html |

- Displayed values: line totals 5 700 Dhs, 1 130 Dhs, 110 Dhs (with the unit line "2 × 55 Dhs").
- Sous-total and Total: **6 940 Dhs**. Count: "4 articles".

**`SUGG` (install suggestions)**

| id | name | ref | price | art |
|---|---|---|---|---|
| c14 | Cuivre 1/4 Lafarga 15 m | CUIV0005 | 495 | coilS |
| c38 | Cuivre 3/8 Lafarga 15 m | CUIV0006 | 750 | coilL |
| tel | Télécommande universelle | CLIM00080 | 70 | remote |

### 6. Forms
None.

---

## Commande.dc.html

### 1. Identity
- **Purpose:** checkout. Cash on delivery only.
- **`<title>`:** `Commande · Climatisation Maroc`.
- **H1:** `Finaliser la commande`.
- **Breadcrumb:** none.
- **Links to:** Accueil (logo), Panier ("Retour au panier"), CGV, Confirmation (on submit). The footer links are unchanged.

**Reduced header (differs from the standard one)**
- No promo bar, not sticky, no search, no nav, no WhatsApp, no mega menu, no burger.
- A single row: `<header style="background:#fff;box-shadow:0 1px 0 #E6E9EC">`, height 76, gap 12.
- Contents:
  - Logo, height 36 on mobile and 50 on desktop (38 once scrolled).
  - Phone link `tel:+212666854184`, pushed right with `margin-left:auto`:
    - 40px circle, background #E8EFF8, with the material phone icon filled #0B5CAD.
    - Text `0666-854184` at 16px/700. The text is hidden on mobile (`phD`).
    - aria-label "Appeler le 0666-854184".
  - `Retour au panier` pill: 44px, padding `0 18px 0 14px`, border `1.5px solid #D5DCE3` (#1A1A1A on hover), 15px/700, with a left-chevron icon, links to Panier.dc.html.
- The footer is the standard one.

### 2. Sections
1. **Title:** `padding-top:32px`, H1 at 34/44/56.

2. **Checkout grid**
   - `padding-top:32px`, gap 24.
   - Columns: `minmax(0,1fr) 420px` at 1100 and up; `1fr` below.
   - The left column is a flex column with gap 16.

   **2a. Card `Vos coordonnées`**
   - White, radius 24, padding `cardP`, gap 20. H2 24px/700.
   - Fields grid: 2 columns, 1 on mobile; gap 16.

   **2b. Card `Adresse de livraison`**
   - Same styling and field grid as 2a.

   **2c. Cash-on-delivery banner**
   - Background #E8EFF8, radius 24, padding `20px 24px`, flex, gap 16.
   - 48px white circle with the cash icon in #0B5CAD.
   - Text (17px, line-height 1.5): **`Paiement à la livraison :`** `vous réglez à la réception de votre commande.`

   **2d. Options card**
   - White, radius 24, padding `cardP`, gap 4.
   - Two custom checkboxes (`role="checkbox"`), each 52px tall, 16px/600:
     - Box: 24×24, radius **7**, border 1.5px #C3CEDA when off; #0B5CAD fill and border with a white ✓ when on.
   - Then a 1px #EEF1F4 divider.
   - Then the CGV checkbox. Its hit area is 44px with a −10px margin, aria-label "Accepter les conditions générales de vente". Label: `J'accepte les ` + underlined link `conditions générales de vente` (CGV.dc.html).
   - Error, shown only after a submit attempt without CGV checked: `Cochez cette case pour confirmer la commande.` (14px/600, #C4501A, padding-left 38).

   **2e. OrderSummary aside `Votre commande`**
   - White, radius 24, padding `cardP`, gap 16.
   - Sticky at `top:24px` from 1100 up.
   - Compact lines: thumbnail 64×52, radius 12, background #EEF3FA, padding 6. Name 15px/700; `Réf. {ref} · Qté {qty}` at 14px #5F6368; line total 16px/700.
   - Divider, then:
     - `Sous-total`
     - `Visite technique` / `300 Dhs`, only when that option is checked
     - `Livraison` / `Gratuite` in #1F9D57
   - Divider, then `Total` at 32px/800.
   - Button `Confirmer la commande`: orange 56px pill.
   - Note under it: `Rien à payer maintenant : vous réglez à la livraison.` (14px, #3C4043, centred).

### 3. Behaviour
**Form state and defaults**
- Form state `s.f` defaults to these prefilled values:
  - nom: `Yassine El Amrani`
  - tel: `06 12 34`
  - mail: `''`
  - ville: `Marrakech`
  - adr: `24 rue Ibn Sina, Guéliz`
  - note: `''`
- The default phone is deliberately incomplete, so **the phone error state shows on first load**.

**Phone validation**
- Rule: `/^0[5-7]\d{8}$/` applied to the digits only (all non-digits stripped). It requires 10 digits starting with 05, 06 or 07.
- Invalid state:
  - Input border #C4501A, background **#FFF7F2**, `aria-invalid="true"`.
  - Message with an error icon: `Numéro incomplet : saisissez 10 chiffres, par exemple 06 12 34 56 78.` (14px/600, #C4501A).

**Options and totals**
- `visite`: `Ajouter la visite technique (300 Dhs)`. Adds 300 to the total.
- `devis`: `Je souhaite un devis de pose`. Adds no price; it is only a flag.
- `cgv`: required.
- `total = sub + (visite ? 300 : 0)`. With the demo data: 6 940 Dhs, or 7 240 Dhs with the visit.
- Delivery is always free.
- Not on this page: coupon, city-based fee.

**Submit (`confirm`)**
- If the phone is valid and CGV is checked, it goes to `Confirmation.dc.html`. No order data is passed.
- Otherwise it sets `tried` and shows a toast for 2.4 s:
  - If the phone is invalid: `Vérifiez votre numéro de téléphone`.
  - Otherwise: `Acceptez les conditions générales de vente`.
- Name, address and e-mail are not validated, and no field is marked required.

**Other**
- Cart lines are the static `CARTL`; the page does not read the Panier state.
- `count` is hard-coded to 4, but no header element shows it.
- No query-string states.

### 4. Responsive
**At 390**
- Fields in 1 column.
- Summary sits below the form and is not sticky.
- Header phone shows only the icon.

**At 1440**
- Form fields in 2 columns.
- 420px sticky summary on the right.

### 5. Data
- Lines: `CARTL`, as in Panier. Sous-total 6 940 Dhs.
- Cities (select, in order): Agadir, Béni Mellal, Casablanca, El Jadida, Essaouira, Fès, Kénitra, Marrakech, Meknès, Mohammedia, Ouarzazate, Oujda, Rabat, Safi, Salé, Tanger, Tétouan, Autre ville.

### 6. Fields
Inputs are 52px tall, radius 12, border `1.5px #D3DDE8`, focus border #0B5CAD, padding `0 16px`, text 16px. Labels are 15px/700 with gap 8.

| Label | Type | Placeholder / notes | Required |
|---|---|---|---|
| Nom complet | text, `autocomplete=name` | – | no flag |
| Téléphone | `type=tel`, `inputmode=tel`, `autocomplete=tel`, `aria-describedby="tel-err"` | validated with the regex above | effectively required |
| E-mail `(optionnel)` | `type=email` | placeholder `Pour recevoir le récapitulatif`; spans both columns | optional |
| Ville | custom-styled select | city list above; chevron at right 16 / top 18 | – |
| Adresse | text, `autocomplete=street-address` | placeholder `Rue, quartier, immeuble` | no flag |
| Note pour le livreur `(optionnel)` | textarea, rows 3 | placeholder `Étage, point de repère, horaires`; padding 14/16; vertical resize; spans both columns | optional |
| Visite technique | checkbox | 300 Dhs | optional |
| Devis de pose | checkbox | no price | optional |
| CGV | checkbox | must be checked | required |

---

## Confirmation.dc.html

### 1. Identity
- **Purpose:** order placed / thank-you page.
- **`<title>`:** `Commande confirmée · Climatisation Maroc`.
- **H1:** `Merci, votre commande est enregistrée`.
- **Breadcrumb:** none.
- **Links to:** `Suivi commande.dc.html?ref=CM-2026-01042`, WhatsApp.
- **Header and footer:** the full standard ones (not the reduced checkout header).

### 2. Sections
The content sits in a container with `max-width:980px`, centred, `padding-top:40px`, flex column, gap 32 on mobile and 48 otherwise.

1. **Hero card**
   - White, radius 24, padding `32px 20px` on mobile and `48px 32px` otherwise, centred, gap 16.
   - Icon: 80px circle in **#E3F5EA** with a 40px ✓ in #1F9D57 (stroke 2.6).
   - H1.
   - Reference row: `Référence de commande` (16px, #3C4043), then the badge **`CM-2026-01042`** (22px/800, letter-spacing 0.01em, background #F4F6F8, radius 12, padding `8px 16px`).
   - Buttons, stacked full-width on mobile:
     - `Suivre ma commande`: blue, links to `Suivi commande.dc.html?ref=CM-2026-01042`.
     - `Nous écrire sur WhatsApp`: #25D366, hover `filter:brightness(0.95)`, 20px WhatsApp icon. Opens `wa.me/212666854184?text=Bonjour, je vous écris au sujet de ma commande CM-2026-01042`.

2. **"Et maintenant ?" steps**
   - H2 at `h2Size`, margin-bottom 20.
   - `<ol>` grid: 3 columns from 1100 up, 1 column below; gap 16.
   - Each step: white, radius 20, padding 20. A 48px #E8EFF8 circle with a 24px icon in #0B5CAD. `Étape {n}` at 14px/700 in #0B5CAD, then the title at 17px/700.
   - Steps:
     1. `Nous vous appelons pour confirmer` (phone icon)
     2. `Livraison gratuite` (truck icon)
     3. `Paiement à la réception` (cash icon)

3. **Two-card grid**
   - 2 columns from 1100 up, 1 column below; gap 16.
   - **Card `Récapitulatif`:** compact `CARTL` lines as in Commande, a divider, `Livraison` / `Gratuite`, then `Total` 6 940 Dhs at 32px/800. There is no subtotal row and no visit line.
   - **Card `Adresse de livraison`:** **Yassine El Amrani** (17px), `06 12 34 56 78`, `24 rue Ibn Sina, Guéliz`, `Marrakech`. Then a divider and the cash icon with `Paiement à la livraison` (15px/600).

### 3. Behaviour
- Everything is static. Nothing is carried over from Commande, and the chosen options (visit, devis) are not shown.
- **Reference format:** `CM-YYYY-NNNNN` (example: `CM-2026-01042`).
- No query-string states.

### 4. Responsive
**At 390**
- Everything stacks in one column.
- Hero buttons are full-width and stacked.
- Hero padding is `32px 20px`.

**At 1440**
- Steps in 3 columns.
- Recap and address cards side by side.

### 5. Data
- Order reference CM-2026-01042.
- Customer as listed above.
- Lines from `CARTL`; total 6 940 Dhs.

---

## Suivi commande.dc.html

### 1. Identity
- **Purpose:** order tracking lookup and status.
- **`<title>`:** `Suivre ma commande · Climatisation Maroc`.
- **H1:** `Suivre ma commande`.
- **Breadcrumb:** Accueil › Suivre ma commande.
- **Links to:** WhatsApp (two pre-filled messages). Header and footer are standard.

### 2. Sections
1. **Breadcrumb**, then the H1 (`padding-top:24px`).

2. **Lookup form card**
   - Always rendered (`always:true`).
   - White, radius 24, padding `cardP`, `max-width:640px`, gap 20.
   - Intro text (17px, #3C4043): `Saisissez la référence reçue à la commande et le numéro de téléphone utilisé.`
   - Fields:
     - `Référence de commande`: text, placeholder `CM-2026-01042`.
     - `Téléphone`: `type=tel`, `inputmode=tel`, placeholder `06 12 34 56 78`.
   - Submit button `Suivre ma commande`: blue 56px pill, aligned left.
   - Underlined link `Référence perdue ? Écrivez-nous sur WhatsApp` (15px/700). Message: `Bonjour, je ne retrouve pas la référence de ma commande.`

3. **Result (`showRes`)**
   - `padding-top:32px`, gap 16.

   **3a. Status card**
   - White, radius 24, padding `cardP`, gap 28.
   - Header row:
     - H2 `Commande CM-2026-01042` (28px/700).
     - `Passée le 6 octobre 2026` (15px, #5F6368).
     - Status pill `Confirmée` (15px/700, #0B5CAD on #E8EFF8, radius 999, padding `8px 16px`).

   **3b. StatusTimeline (`<ol>`)**
   - Desktop: 4 columns, each `li` a column, the track horizontal with a 3px line, label padding `0 12px 0 0`.
   - Mobile: 1 column, each `li` a row, the track vertical with a 3px-wide line of min-height 28, label padding `4px 0 20px`.
   - Dot: 36px, border 2.5px.
     - Done: #0B5CAD fill with a white ✓.
     - Active: white fill, #0B5CAD border, 12px blue inner dot, `aria-current="step"`.
     - Pending: white fill, #D5DCE3 border.
   - Connector line: #0B5CAD after a done step, #E3E8EE otherwise. Hidden after the last step.
   - Labels are 17px:
     - Active: weight 800, #1A1A1A.
     - Done: weight 700, #1A1A1A.
     - Pending: weight 700, #7A828B.
   - Sub-text is 14px: #0B5CAD on the active step, #5F6368 otherwise.
   - Steps:
     - `Reçue` / `6 oct. 2026` (done)
     - `Confirmée` / `6 oct. 2026` (active)
     - `Expédiée` / `À venir`
     - `Livrée` / `À venir`

   **3c. Two cards** (2 columns from 1100 up, 1 below)
   - **`Articles`:** the `CARTL` lines and `Total` 6 940 Dhs. No delivery row.
   - **`Adresse de livraison`:**
     - The same customer block as Confirmation.
     - A divider.
     - Green WhatsApp button `Nous écrire sur WhatsApp`. Message: `Bonjour, je vous écris au sujet de ma commande CM-2026-01042`.
     - Text button `Suivre une autre commande` (15px/700, #0B5CAD, underlined).

### 3. Behaviour
- **Default state:** found, so the result shows and the form is prefilled with ref `CM-2026-01042` and tel `06 12 34 56 78`. The form stays visible above the result.
- **`?form=1`:** hides the result and empties both fields.
- **Submit:** `preventDefault`, then sets `found=true`. There is **no validation and no lookup**; any input shows the same hard-coded order.
- **"Suivre une autre commande":** sets `found=false` and clears the fields.
- **Statuses available:** Reçue → Confirmée → Expédiée → Livrée. Only the "Confirmée" state is demonstrated.

### 4. Responsive
**At 390**
- Vertical timeline.
- Cards stacked.

**At 1440**
- Horizontal 4-step timeline.
- Two cards side by side.
- Form card capped at 640px.

---

## Recherche.dc.html

### 1. Identity
- **Purpose:** search results page.
- **`<title>`:** `Recherche · Climatisation Maroc`.
- **H1:** `Résultats pour « {term} »`.
- **Breadcrumb:** Accueil › Recherche.
- **Links to:**
  - Product cards: `Produit LG Dual Inverter.dc.html` for wall units ("Mural"); otherwise `#`.
  - Popular-search chips: `Recherche.dc.html?q=…`.
  - Range chips: Climatisation, Chauffe-eau, Cuivre et gaz, Pieces de rechange.
  - WhatsApp.
- **Header:** standard. The header search input is prefilled with the term until the user edits it (`qEdited`).

### 2. Sections
1. **Breadcrumb.**

2. **Title block**
   - H1 at 34/44/56.
   - Count `{n} produit(s)` at 17px, #5F6368.

3. **Range tabs (when there are results)**
   - `role="tablist"`, aria-label "Gammes", horizontal scroll, gap 8, `padding-top:24px`.
   - Each tab:
     - 44px pill, padding `0 8px 0 18px`, 15px/700.
     - Count bubble: 28px, radius 14, 13px text.
     - Off: white with border #E3E8EE; bubble #F4F6F8.
     - On: #1A1A1A fill, white text; bubble `rgba(255,255,255,0.2)`.
   - Tabs: `Tout` plus each distinct `sub` among the results.

4. **Results grid (ProductCard)**
   - 4 columns on desktop, 2 on tablet, 1 on mobile; gap 16.
   - Card: white, radius 24, padding 20, gap 12. On hover: shadow `0 24px 50px -32px rgba(14,40,70,0.45)` and `translateY(-4px)`.
   - Contents:
     - Badge: 14px/700, outline 1.5px, radius 8, padding `4px 10px`. Discounted items show `−X %` in #C4501A; other items show the brand name in #0B5CAD.
     - Name: 21px/500, clamped to 2 lines.
     - Ref: 15px, #5F6368.
     - Image area: 150px tall.
     - Price: 28px/800.
     - Old price: 15px, #7A828B, struck through.
     - Saving line: 14px/700, #C4501A.
     - Button: 54px, radius 12, border 1.5px #9AA3AD, 17px/700, label `Ajouter au panier`. After adding it shows `Ajouté au panier ✓` with a #1F9D57 fill for 1.8 s. On hover it turns black.

5. **No-result card (`none`)**
   - White, radius 24, padding `cardP`, `max-width:860px`, gap 24.
   - H2 (28px/700): `Aucun produit ne correspond à « {term} »`.
   - Text: `Vérifiez l'orthographe, essayez un terme plus court ou une référence.`
   - `Recherches fréquentes`: chips with #F4F6F8 fill (hover #E8EFF8 / blue text).
   - `Parcourir les gammes`: outline chips with border #D5DCE3.
   - A divider.
   - Row: `Envoyez-nous le nom ou une photo du produit, nous vérifions s'il est disponible.` plus a green button `Demander sur WhatsApp` (message `Bonjour, je cherche : {term}`).
   - The H1 `Résultats pour « … »` and the count "0 produit" still show above the card.

### 3. Behaviour and query-string states
- **Term:** `q` from the URL, trimmed. Defaults to **`cuivre`** when absent.
- **Matching:** case- and accent-insensitive (NFD with diacritics stripped) substring match over `name + kw + ref` across `CAT`.
- **Tabs:** filter by `sub`. A tab that no longer applies resets to `Tout`.
- **Not on this page:** sort, price/brand facets, autocomplete.
- **`?q=cuivre`:** **3 produits**. Tabs: Tout 3, Cuivre 2, Kits duo 1.
  - Cuivre 1/4 Lafarga 15 m: CUIV0005, 495 Dhs, badge "Lafarga", art coilS at 70% width.
  - Cuivre 3/8 Lafarga 15 m: CUIV0006, 750 Dhs, art coilL at 70%.
  - Kit duo 1/4-3/8 20 m: CUIV0018, 1 130 Dhs, art duo at 80%. It matches through `kw:'cuivre'`.
  - The `CUIV…` refs alone would not match "cuivre".
- **`?q=climatiseur%20portable`:** 0 results, so the no-result card shows.
  - Note: no product name contains "climatiseur", so even `?q=climatiseur` returns nothing.

### 4. Responsive
**At 390**
- 1-column grid.
- Tabs scroll horizontally.

**At 1440**
- 4-column grid.

### 5. Data
**`CAT` (the searchable catalogue): all 12 `PROMO` items, plus:**

| name | brand | sub | ref | price | art | width |
|---|---|---|---|---|---|---|
| Cuivre 1/4 Lafarga 15 m | Lafarga | Cuivre | CUIV0005 | 495 | coilS | 70% |
| Cuivre 3/8 Lafarga 15 m | Lafarga | Cuivre | CUIV0006 | 750 | coilL | 70% |
| Kit duo 1/4-3/8 20 m (kw `cuivre`) | Lafarga | Kits duo | CUIV0018 | 1130 | duo | 80% |
| Gaz R410 GS 11,3 kg | GS | Gaz frigorifique | GAZ00042 | 5000 | gaz | 50% |
| Support GT | Alpha | Supports | CLIM00076 | 55 | support | 70% |
| Télécommande universelle | Alpha | Télécommandes | CLIM00080 | 70 | remote | 40% |

**No-result suggestions**
- Popular searches: `Dual Inverter`, `Kit duo`, `Gaz R410`, `Support GT`, `Télécommande`.
- Ranges: Climatisation (Climatisation.dc.html), Chauffe-eau (Chauffe-eau.dc.html), Cuivre et gaz (Cuivre et gaz.dc.html), Pièces de rechange (Pieces de rechange.dc.html).

---

## Promotions.dc.html

### 1. Identity
- **Purpose:** listing of discounted products.
- **`<title>`:** `Promotions · Climatisation Maroc`.
- **H1:** `Promotions`.
- **Breadcrumb:** Accueil › Promotions.
- **Links to:** `Produit LG Dual Inverter.dc.html` for every wall-unit family; `#` for Gainable.
- **Header:** standard. "Promotions" is not shown as active.

### 2. Sections
1. **Breadcrumb**, then the H1. The sub-line (17px, #3C4043) reads `{7} produits en promotion · livraison gratuite partout au Maroc`.

2. **Filter rows**
   - `padding-top:28px`, gap 12.
   - Two horizontally scrolling rows. Each has a 72px label (15px/700), then chips.
   - Chip: 44px pill, padding 0 16, 15px/600, `aria-pressed`.
     - Off: white with border #E3E8EE.
     - On: #1A1A1A fill, white text.
   - `Marque`: Toutes, LG, Carrier, CIAT, Fitco.
   - `Gamme`: Toutes, Mural, Gainable.

3. **Results bar**
   - `padding-top:24px`, space-between.
   - Left: `{n} produit(s)` at 16px/700.
   - Right: `Page X sur Y` at 15px, #5F6368, shown only when there is more than one page.

4. **Grid of product family cards**
   - 3 columns on desktop, 2 on tablet, 1 on mobile; gap 16.
   - Same ProductCard as Recherche, plus:
     - A variant chip row (min-height 34, gap 6). Chips are 34px, radius 8, 13px/700. Selected border #1A1A1A, otherwise #D5DCE3. Each chip has a `title` showing the full name.
     - A "from" line `À partir de` (13px, #5F6368, min-height 16).

5. **Pagination** (when there is more than one page)
   - Centred, `padding-top:32px`.
   - Prev `‹` and next `›`: 44px circles with border #D5DCE3. Opacity is 0.4 when disabled.
   - Page buttons: 44px circles. Current page is #1A1A1A with white text; others are white.

6. **Empty state**
   - White card, radius 24, padding `48px 24px`, centred.
   - H2 (26px/700): `Aucune promotion pour cette sélection`.
   - Blue button `Voir toutes les promotions` resets both filters.

### 3. Behaviour
**Grouping into families**
- `PROMO` is grouped by family name: the name with `" N 000 BTU"` and any trailing ` Blanc` or ` Noir` removed.
- This gives **7 families**, shown 6 per page, so 2 pages: page 1 has the first 6 families, page 2 has LG Gainable Inverter.

**Family card**
- Multi-variant family with nothing selected:
  - Ref shows `{n} puissances`.
  - `À partir de` plus the minimum price.
  - No old price, no saving line.
  - Badge uses the discount of variant 0.
- After picking a variant chip: that variant's ref, price, old price, saving line and badge.
- Chip labels: `{N}K`, plus ` Blanc` / ` Noir` where present.
- "Ajouter au panier" with no variant selected: selects variant 0 and adds it to the cart. The toast uses the full variant name.

**Filters**
- Brand and range filters combine with AND. Changing either resets to page 1.
- Not on this page: sort, price facet.
- No query-string states.

### 4. Responsive
**At 390**
- 1-column grid.
- Filter rows scroll horizontally.

**At 1440**
- 3-column grid.

### 5. Data

**`PROMO` (12 items, all with `brand`, `range`, `sub`)**

| # | name | brand | range | sub | ref | price | was | discount | saving | image |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | LG Dual Inverter 9 000 BTU | LG | Mural | Climatiseurs muraux | D10AWH.NW0 | 5400 | 6200 | −13 % | 800 | img `uploads/clima-cut2.png` |
| 2 | LG Dual Inverter 12 000 BTU | LG | Mural | Climatiseurs muraux | D13AJH.N | 5700 | 6500 | −12 % | 800 | img `uploads/clima-cut2.png` |
| 3 | LG Dual Inverter 18 000 BTU | LG | Mural | Climatiseurs muraux | D19AKH.NK0 | 7600 | 8100 | −6 % | 500 | img `uploads/clima-cut2.png` |
| 4 | LG Dual Inverter 24 000 BTU | LG | Mural | Climatiseurs muraux | D24AKH-N | 8900 | 9500 | −6 % | 600 | img `uploads/clima-cut2.png` |
| 5 | LG Artcool Smart Inverter 18 000 BTU | LG | Mural | Climatiseurs muraux | UA19MKH0.NJ0 | 9900 | 10500 | −6 % | 600 | art mural, dark |
| 6 | Carrier Mural Inverter R32 9 000 BTU | Carrier | Mural | Climatiseurs muraux | 42QHG009D8SC-R32 | 4200 | 5050 | −17 % | 850 | art mural |
| 7 | Carrier Miroir Inverter Noir R32 12 000 BTU | Carrier | Mural | Climatiseurs muraux | 42QHG012D8S-BM | 5600 | 6600 | −15 % | 1000 | art mural, dark |
| 8 | CIAT Mural Inverter 9 000 BTU | CIAT | Mural | Climatiseurs muraux | 38HG09VSA | 3800 | 4700 | −19 % | 900 | art mural |
| 9 | Fitco Mural Inverter 12 000 BTU Blanc | Fitco | Mural | Climatiseurs muraux | FSW12T24PM/N | 4000 | 4900 | −18 % | 900 | art mural |
| 10 | Fitco Mural Inverter 24 000 BTU Noir | Fitco | Mural | Climatiseurs muraux | FSW24T23PM/N | 7000 | 7800 | −10 % | 800 | art mural, dark |
| 11 | LG Gainable Inverter 36 000 BTU | LG | Gainable | Gainables | ABNW36GM2S1.ENWBME | 14200 | 15200 | −7 % | 1000 | art gainable |
| 12 | LG Gainable Inverter 48 000 BTU | LG | Gainable | Gainables | ABNW50LM3S1.ENWBLM | 19800 | 21100 | −6 % | 1300 | art gainable |

**Families, in display order**

| # | family | variant chips | default display |
|---|---|---|---|
| 1 | LG Dual Inverter | 9K, 12K, 18K, 24K | `4 puissances`, à partir de 5 400 Dhs, badge −13 % |
| 2 | LG Artcool Smart Inverter | 18K | single variant |
| 3 | Carrier Mural Inverter R32 | 9K | single variant |
| 4 | Carrier Miroir Inverter Noir R32 | 12K | single variant (keeps "Noir" in the name) |
| 5 | CIAT Mural Inverter | 9K | single variant |
| 6 | Fitco Mural Inverter | 12K Blanc, 24K Noir | `2 puissances`, à partir de 4 000 Dhs |
| 7 | LG Gainable Inverter | 36K, 48K | `2 puissances`, à partir de 14 200 Dhs, page 2 |

---

## 7. Leftovers and abandoned directions (all pages unless noted)

**`never` flags (always false, never rendered)**
- An old round drawer button (☰/✕) in the header.
- A fixed bottom mobile bar with `Appeler` / `WhatsApp` / `Panier {count}`, 64px tall, radius 999.

**Home-page logic copied into every script and computed but unused**
- Data: `FAM`, `NEWS`, `DUCTS`, `SUP`, `TIERS` with the `sizeFor` sizing advisor (surface/sun), the bento `catDef`/`cats` with hero gradient values, `brands`/`brandsRaw` with the marquee, `perks`, `chipsRow`, `fams`, `ducts`, `supplies`, `news`.
- Helpers and constants: `railRef`, `gaiRef`, `marqueeRef`, `duct()`, the `CART`/`CHECK` constants, the `scopes`/`onScope` select, `drawerLinks`, `compact`, `heroMax`.
- `SUGG` and `pc()` appear on pages that never use them.
- `CAT` and `PROMO` are on every page.

**Overridden values**
- In `post()`: `footBottom` is computed as 88 on mobile in `rv()` and then forced to 0.
- In `post()`: `toastBottom` is forced to 24 (it was 84 on mobile).
- `h1Size` is set three times: `rv()` gives 38/52/62, `post()` gives 32/44, and `extra()` gives the final 34/44/56.

**Commande**
- The mobile drawer markup and data are present, but there is no burger button to open it. Only `?drawer=1` would open it.
- `count:4` is set but never shown.
- `logoH` still reacts to scroll even though the header is static.

**Panier**
- Cart line thumbnails use `th()`, which has no `onError` fallback, unlike `pic()`.
- A suggestion added to the cart always gets `href:'Cuivre et gaz.dc.html'`, including the Télécommande.

**Inconsistent naming**
- The mega-menu product is `LG Dual Inverter 12000 BTU` (no space).
- `NEWS` uses `36000 BTU` / `48000 BTU`, while `PROMO` uses `36 000 BTU`.

**Static demo data with no flow between pages**
- Commande, Confirmation and Suivi all use the static `CARTL` and a hard-coded customer and order.
- The Suivi submit performs no lookup.

**Links to `.dc.html` files that are not in the folder**
- Chauffe-eau, Ventilation, Gaines, Pieces de rechange, Froid.
- Produit.dc.html (used with `?f=` / `?ref=` in the unused home data).
- CGU, Informations legales, Securite, Confidentialite, Service apres-vente (footer legal links). `Service.dc.html` and `Livraison et paiement.dc.html` exist but are not linked from these pages.
- Mega-menu brand pages for every brand except LG: Marque Carrier, CIAT, Fitco, Simsek, GS, Lafarga, Alpha, Arfro.

**Images referenced but missing from `uploads/`**
- `pasted-1791221833312-0.png`: the logo.
- `clima-cut2.png`: used by the cart, Promotions and mega menu.
- Mega-menu art: `chauffe-eau-b0352fa9.png`, `ventilateur-cut.png`, `gaines-cut.png`, `cuivre-cut2.png`, `telecommande-cut2.png`.
- `pasted-1791236697258-0.png`.
- The non-`-t` brand logos `logo-*.png`. Only the `-t.png` versions and `New_DZ2.png` exist.
- Remote images on `https://climatisationmaroc.com/prodimg/…` (used in the home `FAM` data).

**Art keys available in `art.js`**
- mural, gainable, cassette, solaire, vent, flex, coilS, coilL, duo, gaz, support, scotch, remote.

## 8. New design tokens (not in the given set)

**Colours**
- **#EEF3FA**: cart and summary thumbnail background.
- **#D5DCE3**: neutral outline for the quantity stepper, outline buttons, chips, pagination, pending timeline dots and the "Plus" button.
- **#D3DDE8**: form input border.
- **#C3CEDA**: unchecked checkbox border.
- **#FFF7F2**: background of an input in error.
- **#E3F5EA**: success circle background on Confirmation.
- **#F1F5FA**: selected item in dropdowns.
- **#C9D3DE**: search box hover border.
- **#E6E9EC**: header bottom hairline (`0 1px 0`).

**Shadows**
- `0 24px 50px -32px rgba(14,40,70,0.45)`: card hover.
- `0 24px 50px -20px rgba(14,40,70,0.4), 0 0 0 1px #E6EBF0`: dropdowns.
- `0 30px 60px -30px rgba(14,40,70,0.45)`: mega menu.
- `0 10px 30px -18px rgba(14,40,70,0.35)`: sticky header.

**Translucent whites**
- `rgba(255,255,255,0.2)`: count bubble on the active tab.
- `rgba(255,255,255,0.14)` and `0.18`: footer.

**Radii**
- **16**: cart line thumbnail.
- **7**: checkbox.
- 2: timeline line.
- 50%: circles.

**Sizes**
- Controls: 44px (min touch size), 52px (inputs), 54px (card button), 56px (primary CTA).
- Text: price 28px/800, total 32px/800, product name 21px/500.
