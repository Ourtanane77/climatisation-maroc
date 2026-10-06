# Design reference analysis: Demander un devis, Contact, Service (×3), Calculateur puissance, Marque LG

Files are in `D:\AllProjects\LogicTechnologies\climatisation-maroc\design\`. I read all five files in full, including the scripts. Nothing was modified.

## Shared chrome: what differs from the known home version

I diffed every file against `Demander un devis.dc.html`:
- **Lines 1–104** (promo bar, header, mega menu, drawer) are byte-identical, except `<title>`.
- **Footer** is byte-identical.
- **Script** is byte-identical everywhere except the page-specific `extra(v)` method.
- One constants block differs:
  - Devis, Contact and Service declare `VILLES`, `SI` (stroke icon pairs), `STORES` and `SERV`.
  - Calculateur and Marque LG declare `fmt2`, `dh2` and `LOGOAR={lg:2.05,carrier:2.52,ciat:2.01,fitco:0.69,simsek:3.47}` instead.

So header, footer and drawer **do not differ** from the home version on any of these pages. Every page also inherits the shared query params `?menu=<rangeKey>` (opens the mega menu after 300 ms) and `?drawer=1|<key>`.

Common responsive values in `post()`/`extra()`:
- gutter 16 (mobile) / 40
- `secGap` 40 / 56
- `h1Size` 34 / 44 (tablet <1100) / 56
- `h2Size` 32 (mobile) / 44
- `cardP` 20 / 32
- `proPad` 24 / 48

Common Breadcrumb component:
- 14px, colour #5F6368, weight 500.
- Last crumb is #1A1A1A, weight 700.
- Separator is `›` in #9AA3AD, gap 8, padding-top 24.

Other common elements:
- Primary buttons (the "Btn" pattern): 56px tall, radius 999, padding 0 28, 16px/700.
  - Orange #F4731F, hover #D85A17.
  - WhatsApp #25D366, hover brightness .95, with the simpleicons whatsapp icon at 20px.
  - Outline: white with 1.5px #1A1A1A border, hover fills #1A1A1A.
- Phone validation (Devis and Contact): `telOk = /^0[5-7]\d{8}$/` tested on the value after stripping non-digits.
- Field error state: border #C4501A, background #FFF7F2, `aria-invalid`, and a 14px/600 #C4501A message with an 18px filled alert icon.

---

## Demander un devis.dc.html

### 1. Identity
- **Purpose:** project quote-request form, the main lead form.
- **`<title>`:** `Demander un devis · Climatisation Maroc`
- **H1:** `Demander un devis`
- **Intro (18px/1.55, #3C4043, max-width 820):** "Décrivez votre projet de climatisation, nous vous rappelons avec une proposition."
- **Breadcrumb:** Accueil (Accueil.dc.html) › Demander un devis (#)
- **Links out from `<main>`:** `Climatisation.dc.html` (success state), wa.me, `tel:+212666602599`. Everything else comes from the shared chrome.

### 2. Sections, top to bottom
1. **Breadcrumb**
2. **PageIntro**
   - H1 is 56/44/34, line-height 1.05, letter-spacing −0.03em, weight 700. Paragraph as above.
3. **SegmentedToggle "Vous êtes"** (`role=radiogroup`)
   - margin-top 28, inline-flex, padding 4, radius 999, white, inset ring `0 0 0 1.5px #E3E8EE`, gap 4.
   - Buttons are 48px tall, padding 0 24, radius 999, 16px/700.
   - Selected: background #1A1A1A, text white. Unselected: transparent, text #1A1A1A.
   - Options: **Particulier**, **Professionnel**.
4. **Two-column section** (padding-top 24, gap 24, align start)
   - Columns: `minmax(0,1fr) 400px` on desktop (≥1100); `1fr` below 1100.
   - **FormCard (left)**, a `<form noValidate>`:
     - white, radius 24, padding `cardP`, flex column, gap 24.
     - Field grid: `repeat(2,minmax(0,1fr))` on desktop/tablet, `1fr` on mobile, gap 16.
     - All fields are listed in section 6.
   - **SuccessCard** (replaces the form when sent): see section 3.
   - **Aside** (`position: sticky; top: 24` on desktop, static below 1100), flex column, gap 16:
     - **ContactChannels card "Nous vous rappelons rapidement"**
       - Card: background #E8EFF8, radius 24, padding 24, gap 16. H2 is 24px/700, letter-spacing −0.01em.
       - Phone row: 44px white circle with a #0B5CAD filled phone icon. Label "Projets et revendeurs" (14px #3C4043) above the number **0666-602599** (22px/800), linked to `tel:+212666602599`.
       - Green WhatsApp button "WhatsApp" with prefilled text "Bonjour, je souhaite un devis pour un projet de climatisation."
       - "Lundi – Samedi, 9h – 19h" (15px #3C4043).
     - **StepList card "Comment ça se passe"** (vertical timeline)
       - Card: white, radius 24, padding `cardP`. H2 24px, margin-bottom 12.
       - Step number: 36px #0B5CAD circle, white 15px/800.
       - Connector: 2px #DCE5EF line, min-height 16, hidden after the last step.
       - Step title 17px/700; text 15px #3C4043, line-height 1.45.
       - Steps:
         1. **Demande** — "Vous décrivez votre projet, nous vous rappelons."
         2. **Visite technique** — "300 Dhs. Un technicien mesure et conseille."
         3. **Devis détaillé** — "Appareil, matériel et pose, poste par poste."

### 3. Behaviour and state
- **Particulier/Professionnel toggle**
  - The state is `s.who`. With no state set, `?pro=1` defaults it to Professionnel. Inbound links using this exist: `Commande rapide` and `Solutions professionnelles` link to `?pro=1`.
  - Professionnel only inserts the **Société** field after Nom complet. Nothing else changes.
- **Defaults when there is no query string:** ville=Marrakech, projet=Nouvelle installation, espace=Maison.
- **Submit (`send`)**
  - Calls `preventDefault`.
  - If `nom.trim()` is non-empty and `telOk(tel)` passes: sets `sent=true` and scrolls to top.
  - Otherwise sets `tried=true`, which shows inline errors.
  - There is no network call.
- **File upload:** a visually hidden `<input type=file accept="image/*,.pdf">` inside a dashed label. On change, the sub-label shows the file name (default "Image ou PDF").
- **Success state** (`form` hidden, `sent` shown, `role=status`)
  - Card: white, radius 24, padding `cardP`, gap 16, aligned to the start.
  - Check icon: 72px circle, background #E3F5EA, #1F9D57 check at 36px, stroke 2.6.
  - H2 "**Demande envoyée**" (32px/700, letter-spacing −0.02em).
  - Body (17px/1.55 #3C4043, max-width 560): "Merci {nom}. Nous vous rappelons au {tel} pour parler de votre projet et, si besoin, organiser la visite technique."
  - Buttons: "Nous écrire sur WhatsApp" (green, same prefilled text) and "Voir les climatiseurs" (outline, to `Climatisation.dc.html`). Laid out as a row, or a full-width column on mobile.
  - Text button "Faire une autre demande" (15px/700 #0B5CAD, underlined, min-height 44). It resets to `{nom:'',tel:'',ville:'Marrakech'}` with `sent=false` and `tried=false`.
- **Query-string states**
  - `?envoye=1`: shows the success state directly. Prefill is `{nom:'Karim Benali', tel:'06 61 23 45 67', ville:'Marrakech'}`, so the text reads "Merci Karim Benali. Nous vous rappelons au 06 61 23 45 67 …". The aside is still shown. `Toutes les pages` links to this state.
  - `?erreur=1`: sets `tried=true` and prefills `{nom:'Karim Benali', tel:'06 61 2', ville:'Marrakech', projet:'Nouvelle installation', espace:'Appartement', surf:'40'}`. The phone error is visible.
  - `?pro=1`: Professionnel is preselected.

### 4. Responsive (390 vs 1440)
- **1440:**
  - H1 56px.
  - Form and aside sit side by side (aside 400px, sticky).
  - Two-column field grid.
  - Success buttons in a row.
- **390:**
  - H1 34px.
  - Single column; the aside drops under the form and is static.
  - Field grid is one column.
  - `cardP` is 20.
  - Success buttons stack full width.
- Tablet (760–1099) is also a single outer column, with a two-column field grid and H1 44.

### 5. Data
- **Cities list (`VILLES`, in order):** Agadir, Béni Mellal, Casablanca, El Jadida, Essaouira, Fès, Kénitra, Marrakech, Meknès, Mohammedia, Ouarzazate, Oujda, Rabat, Safi, Salé, Tanger, Tétouan, Autre ville.
- **Project types:** Nouvelle installation, Remplacement, Entretien, Fourniture seule.
- **Space types:** Maison, Appartement, Bureau, Commerce, Restaurant, Hôtel, Autre.
- **Phone shown:** 0666-602599 (Projets et revendeurs).
- **Hours:** Lundi – Samedi, 9h – 19h.
- **Visite technique price:** 300 Dhs.

### 6. Form fields
**Shared input style:**
- height 52, radius 12, border 1.5px #D3DDE8, padding 0 16, font 16, focus border #0B5CAD.
- Labels are 15px/700, with gap 8 between label and input.
- "(optionnel)" is 500 weight, #5F6368.

| # | Label | Type / attributes | Required / validation |
|---|---|---|---|
| 1 | Nom complet | text, `autocomplete=name` | Required (non-blank). Error: "Indiquez votre nom." (span `#e-nom`, but the input has no `aria-describedby`) |
| 2 | Société (Pro only) | text, `autocomplete=organization` | Optional, not validated |
| 3 | Téléphone | `type=tel`, `inputmode=tel`, `autocomplete=tel`, `aria-describedby=e-tel` | Required, `/^0[5-7]\d{8}$/`. Error: "Numéro incomplet : saisissez 10 chiffres, par exemple 06 12 34 56 78." |
| 4 | E-mail (optionnel) | `type=email` | Not validated |
| 5 | Ville | `<select>` from VILLES, custom chevron at right:16 / top:18, padding-right 44 | Default Marrakech |
| 6 | Surface en m² (optionnel) | number, `inputmode=numeric`, min 1, placeholder "Par exemple 25" | — |
| 7 | Type de projet | chip buttons with `aria-pressed` | Default Nouvelle installation |
| 8 | Type d'espace | chip buttons | Default Maison |
| 9 | Message | textarea, rows 4, padding 14 16, resize vertical, placeholder "Nombre de pièces, appareil souhaité, délais…" | — |
| 10 | Joindre un plan ou une photo (optionnel) | file, `accept image/*,.pdf` | sub-label "Image ou PDF", or the file name |

- **Chips:** 44px tall, padding 0 16, radius 999, border 1.5px, 15px/600.
  - Selected: background #1A1A1A, text white, border #1A1A1A.
  - Unselected: white, border #D5DCE3, hover border #1A1A1A.
- **Upload tile:** min-height 64, padding 12 16, radius 16, 1.5px dashed #B9C6D4, background #F7F9FB, hover border #0B5CAD. Icon tile is 44px, radius 12, #E8EFF8, with a #0B5CAD paperclip.
- **Submit:** "Envoyer ma demande", orange, 56px.
- **Not present:** no honeypot, no consent or RGPD text, no budget field.

### 7. Leftovers and bugs
- The submit button has `align-self:{{ sendAlign }}` inside **`style-hover`**, not `style`. As a flex-column child it is full width by default and snaps to `flex-start` on hover on desktop.
- "Faire une autre demande" wipes `projet`/`espace`. With `?envoye=1` there are no preset chips afterwards, so no chip is selected.
- The whole home-page dataset sits unused in the script: FAM, NEWS, DUCTS, SUP, RANGES-driven `cats` bento, brands marquee, home calculator `sizeFor`/`TIERS`, perks, heroShade, chipsRow.
- The `SERV` and `STORES` constants are also present here, unused.
- `never` flag:
  - a second drawer button
  - a mobile bottom sticky bar (Appeler / WhatsApp / Panier {count}), never rendered.
- `rv()` sets `footBottom` to 88 on mobile, but `post()` overrides it to 0.

---

## Contact.dc.html

### 1. Identity
- **Purpose:** stores, map, phone numbers by need, and a general message form.
- **`<title>`:** `Contact et magasins · Climatisation Maroc`
- **H1:** `Contact et magasins`
- **Breadcrumb:** Accueil › Contact
- **Links out from `<main>`:**
  - `Demander un devis.dc.html` (inline link "la demande de devis", underlined, 700)
  - wa.me
  - Google Maps directions and search
  - tel: links, mailto
  - socials (`#`)

### 2. Sections
1. **Breadcrumb**
2. **TitleRow**
   - flex, space-between, align flex-end, wraps, gap 16 32.
   - H1 on the left.
   - Right side: green button "Nous écrire sur WhatsApp" (plain `https://wa.me/212666854184`, no text), then 4 social circles.
   - Social circles: **44px, brand-coloured backgrounds**, white simpleicons, hover brightness .92. This differs from the footer's translucent white.
     - Facebook #1877F2
     - Instagram #E4405F
     - TikTok #1A1A1A
     - WhatsApp #25D366
   - Facebook, Instagram and TikTok use `href="#"`.
3. **StoreCard + MapCard section** (padding-top 32, gap 16, stretch)
   - Columns: `minmax(0,5fr) minmax(0,7fr)` on desktop; `1fr` below 1100.
   - **Left column: 2× StoreCard** (flex column, gap 16, each `flex:1`)
     - white, radius 24, padding `cardP`, gap 14.
     - Header: 36px orange #F4731F teardrop pin (`border-radius:50% 50% 50% 0`, rotated −45°) with the white number 1 or 2 at 15px/800, then H2 store name at 24px/700.
     - `<address>` 17px/1.5.
     - "Lundi – Samedi, 9h – 19h" 15px #3C4043.
     - Outline button "**Itinéraire**" with a navigation-arrow icon, linking to `https://www.google.com/maps/dir/?api=1&destination=<encoded address>` (`target=_blank`).
   - **Right: MapCard**
     - radius 24, background #DCE8F5, min-height 480 (desktop) / 360 (mobile).
     - OpenStreetMap iframe, title "Carte de Marrakech avec nos deux magasins", `src=https://www.openstreetmap.org/export/embed.html?bbox=-8.07%2C31.59%2C-7.95%2C31.67&layer=mapnik`, lazy loaded.
     - Overlay legend card: left/right/bottom 16, max-width 420, white, radius 18, padding 14 16, shadow `0 20px 40px -24px rgba(14,40,70,.5)`.
     - The legend lists both stores: 26px orange circle with the number, then "**{n}** · {a}" at 15px. Each links to `https://www.google.com/maps/search/?api=1&query=<encoded address>`.
4. **ContactChannels "Contact selon votre besoin"** (H2 `h2Size`, margin-bottom 24)
   - Grid: 4 columns on desktop, 2 on tablet, 1 on mobile, gap 16.
   - Each card is an `<a href="tel:">`: white, radius 20, padding 20, gap 14. Hover lifts by 3px with shadow `0 24px 50px -32px rgba(14,40,70,.45)`.
   - Icon tile: 48px, radius 14, #E8EFF8. Two-tone stroke: #0B5CAD primary, #F4731F secondary.
   - Title 17/700; description 15px #3C4043; number 22px/800 #0B5CAD, pushed to the bottom with `margin-top:auto`.
   - Under the grid: a row (gap 12 32, 16px) with "Fixe **0524-306850**" (`tel:+212524306850`) and "E-mail **ecom@arihafroid.com**" (mailto). Labels #5F6368, min-height 44.
5. **"Écrivez-nous" section** (gap 24)
   - Columns: `minmax(0,4fr) minmax(0,8fr)` on desktop; `1fr` below 1100.
   - Left: H2 "Écrivez-nous" and the text (17px #3C4043, max-width 420): "Une question sur un produit, une commande ou une facture. Pour un projet, utilisez plutôt la demande de devis." The phrase "la demande de devis" links to the Devis page.
   - Right: **FormCard**, white, radius 24, padding `cardP`, grid of 2 columns (1 on mobile), gap 16.

### 3. Behaviour
- **Submit:** if `telOk(tel)` passes, sets `cSent=true`; otherwise sets `cTried=true`. Nom is **not** validated here. No network call.
- **Success state** (replaces the form):
  - Horizontal card, white, radius 24.
  - 56px #E3F5EA circle with a #1F9D57 check.
  - "**Message envoyé**" (20px strong).
  - "Nous vous répondons du lundi au samedi, de 9h à 19h." (16px #3C4043)
- No page-specific query-string states.

### 4. Responsive
- **1440:**
  - Stores (5fr) sit beside the map (7fr, ≥480 tall).
  - Need cards in 4 columns.
  - Form intro (4fr) beside the form (8fr); form fields in 2 columns.
- **390:**
  - Everything stacks: stores, then the map (360 tall), then need cards in 1 column, then intro, then form in 1 column.
  - H1 34. The WhatsApp and social row wraps under the H1.

### 5. Data
- **Stores (`STORES`):**
  1. **Magasin Sakar**, "Lot Sakar Villa 107, Marrakech 40070" (key "1")
  2. **Magasin Al Manar**, "Magasin 60-2, Imm 50 Al Manar, Marrakech 40100" (key "2")
- **Hours:** Lundi – Samedi, 9h – 19h.
- **Phones by need:**

| Need | Description | Number | Link | Icon |
|---|---|---|---|---|
| Ventes | Commander, disponibilité, livraison | 0666-854184 | tel:+212666854184 | cart |
| Conseil | Choisir un appareil, une puissance | 0666-088348 | tel:+212666088348 | chat |
| Projets et revendeurs | Devis, chantiers, tarifs revendeur | 0666-602599 | tel:+212666602599 | handshake |
| Service facturation | Factures et paiements | 0666-661882 | tel:+212666661882 | receipt |

- **Also:** Fixe 0524-306850; E-mail ecom@arihafroid.com.
- **Map:** OSM bbox lon −8.07 to −7.95, lat 31.59 to 31.67 (Marrakech). There are no explicit store coordinates; pins only appear in the legend card.

### 6. Form fields
| Label | Type / attributes | Required / validation |
|---|---|---|
| Nom | text, `autocomplete=name` | Not validated |
| Téléphone | tel | Required, `telOk`. Error: "Saisissez 10 chiffres, par exemple 06 12 34 56 78." |
| E-mail (optionnel) | email | — |
| Sujet | select | Default "Question sur un produit" |
| Message | textarea, rows 4, full row | — |

- **Sujet options:** Question sur un produit, Suivi de commande, Facturation, Service après-vente, Autre.
- **Submit:** "**Envoyer le message**", **blue** #0B5CAD, hover #084683, 56px. This differs from Devis, which uses an orange submit.
- No honeypot and no consent text.

### 7. Leftovers and bugs
- The submit button's `grid-column:1 / -1; justify-self:{{ sendAlign }}` is in **`style-hover`**, so by default it sits in a single grid cell.
- The Itinéraire button's `align-self:flex-start; height:48px; padding:0 20px` is also in `style-hover`, so it is full width at 56px and shrinks on hover.
- Unused constants and helpers: `SERV`, `VILLES`, `chips`, and the entire home dataset (same list as on Devis). `never` bottom bar.
- `cTel` error `<span id="c-tel">` exists, but the input has no `aria-describedby`.

---

## Service.dc.html

**Shared structure for all three variants.**

- **Variant selection:** `?s=` must be a key of `SERV`. Any other value or none gives `installation`. Inbound links: `?s=sav` from À propos, Livraison et paiement and Toutes les pages; `?s=visite` from Toutes les pages.
- **Static `<title>`:** `Installation de climatisation · Climatisation Maroc`. On first render the script overwrites `document.title` to `{sv.h1} · Climatisation Maroc`.
- **Breadcrumb:** Accueil › Services (`Service.dc.html`, no hub page exists) › {sv.t}.

**Sections, in order:**

1. **ServiceHero**
   - margin-top 24, background #E8EFF8, **radius 28**, overflow hidden, grid, align center.
   - Columns: `minmax(0,1.1fr) minmax(0,0.9fr)` on desktop (≥1100) with min-height 440; `1fr` below 1100 with min-height 0.
   - Text column padding: 56 (desktop) / `40px 40px 8px` (tablet) / `28px 20px 8px` (mobile), gap 20.
   - Eyebrow tag "Service · {t}": white, radius 8, padding 4 10, 14px/700 #0B5CAD.
   - H1 `sv.h1`.
   - Paragraph `sv.x`: 19px/1.55, #1A1A1A, max-width 560.
   - Buttons (row, or column on mobile, gap 12, padding-top 4):
     - Orange "**Demander un devis**", to `Demander un devis.dc.html`.
     - Green "**Commander par WhatsApp**" with variant-specific text.
   - Art column: `uploads/clima-cut2.png`, width 100%, max 640, drop-shadow `0 24px 30px rgba(14,40,70,.25)`.
     - Min-height 300 (desktop) / 240 (tablet) / 160 (mobile).
     - Padding `24px 40px`, or `0 20px 28px` on mobile.
     - The same image is used for every variant.
2. **"Ce qui est inclus"** (IncludedGrid)
   - Columns `c4`: 4 on desktop, 2 on tablet, 1 on mobile; gap 16.
   - Card: white, radius 20, padding 24, gap 16.
   - Icon tile: 52px, **radius 16**, #E8EFF8, two-tone 26px icon (#0B5CAD and #F4731F).
   - Title H3 18px/700.
3. **"Comment ça se passe"** (StepList, horizontal cards)
   - `<ol>` grid `c4`, gap 16.
   - `li`: white, radius 20, padding 24, gap 12.
   - 44px #0B5CAD number circle, 18px/800.
   - H3 19px/700; paragraph 16px/1.5 #3C4043.
4. **PriceCard band "Tarifs"**
   - background #FDF0E6, radius 24, padding `proPad` (48 / 24), gap 16, align center.
   - Grid: `minmax(0,1fr)` for the H2 plus one `minmax(0,1fr)` per price. Mobile is `1fr`.
   - Each price card: white, radius 18, padding 20 24, label 16px #3C4043, value **30px/800**.
5. **"Matériel d'installation"** (ProductCard mini). Hidden when `s=sav` (`showRel = key !== 'sav'`).
   - Grid `c4`, gap 16.
   - Card: white, radius 24, padding 20, gap 12, hover lift −4px with shadow.
   - Name H3 18px/500, min-height 47.
   - "Réf. X" 15px #5F6368.
   - Art: 140px tall, an `AFDraw` key with a width.
   - Price 26px/800.
   - Button "Ajouter au panier": 54px, radius 12, border 1.5px #9AA3AD, 17px/700, hover filled #1A1A1A.
     - After a click it turns green #1F9D57 and reads "Ajouté au panier ✓" for 1.8 s.
     - The cart count goes up by 1.
     - A toast "{name} ajouté au panier" shows for 2.2 s: #1A1A1A pill at the bottom, 24px up.
6. **FaqAccordion "Questions fréquentes"**
   - Container: white, radius 24, padding 8 24.
   - Question: an H3 containing a button, min-height 64, 18px/700, padding 12 0.
   - "+" at 26px/400 #0B5CAD, rotates 45° when open.
   - Answer opens with a `grid-template-rows` 0fr→1fr animation (.3s); text 16px/1.6 #3C4043, max-width 760, margin-bottom 20.
   - Divider: 1px #EEF1F4.
   - **Item 0 is open by default.** Only one item is open at a time; clicking the open one closes it (`faqO=-1`).
7. **CTA band "Parlons de votre projet"**
   - background #0B5CAD, white text, **radius 28**, padding `proPad`, flex space-between, wraps.
   - H2 in white.
   - Paragraph (17px #E3ECF7): "Projets et revendeurs : 0666-602599, du lundi au samedi de 9h à 19h."
   - Buttons:
     - Orange "Demander un devis".
     - White "**Appeler le 0666-602599**" (`tel:+212666602599`, hover #E8EFF8).
   - Laid out as a row, or a full-width column on mobile.

**Matériel d'installation items** (`REL`, the same for installation and visite):

| Name | Ref | Price | Art key | Art width |
|---|---|---|---|---|
| Kit duo 1/4-3/8 20 m | Réf. CUIV0018 | 1 130 Dhs | duo | 80% |
| Support GT | Réf. CLIM00076 | 55 Dhs | support | 70% |
| Cuivre 1/4 Lafarga 15 m | Réf. CUIV0005 | 495 Dhs | coilS | 62% |
| Cuivre 3/8 Lafarga 15 m | Réf. CUIV0006 | 750 Dhs | coilL | 62% |

These are drawn art only (`pic(null, …)`). There are no product links from these cards.

**Responsive:**
- **1440:** hero has 2 columns (text 1.1fr, image 0.9fr), min-height 440, H1 56. Included, steps and matériel grids have 4 columns. Tarifs band shows the H2 and price cards in one row. CTA buttons in a row.
- **390:** hero is a single column with text above a 160px image, H1 34, buttons stacked. All grids are 1 column. The Tarifs band stacks. CTA buttons are full width.

### Variant: Installation (default, also any invalid `?s`)
- **t:** Installation
- **Runtime title:** "Installation de climatisation par nos techniciens · Climatisation Maroc"
- **H1:** Installation de climatisation par nos techniciens
- **Intro:** "Pose, raccordement et mise en service de votre climatiseur par l’équipe Ariha Froid."
- **WhatsApp text:** "Bonjour, je souhaite une installation de climatisation."
- **Inclus (icon):**
  - Pose de l’unité intérieure et extérieure (unit)
  - Raccordement cuivre et électrique (pipe)
  - Mise en service et test (test)
  - Conseils d’utilisation (chat)
- **Steps:**
  1. Visite technique — "300 Dhs. Un technicien mesure et conseille."
  2. Devis — "Le prix de la pose selon votre chantier."
  3. Installation — "Pose, raccordement et mise en service."
  4. Service après-vente — "Nous restons joignables après la pose."
- **Tarifs:** Pose → **Sur devis**; Visite technique → **300 Dhs**. Desktop grid has 3 columns.
- **Matériel d'installation:** shown.
- **FAQ:**
  - **Combien coûte la pose ?** — La pose est sur devis : le prix dépend de l’appareil, de la distance entre les unités et de l’accès. Demandez un devis, nous vous rappelons.
  - **Faut-il une visite technique ?** — Elle est conseillée pour choisir la bonne puissance et l’emplacement des unités. Elle coûte 300 Dhs.
  - **Le matériel d’installation est-il inclus ?** — Non. Le kit duo cuivre, le support et les accessoires sont vendus séparément, voir ci-dessus.

### Variant: Visite technique (`?s=visite`)
- **t:** Visite technique
- **Runtime title:** "Visite technique avant installation · Climatisation Maroc"
- **H1:** Visite technique avant installation
- **Intro:** "Un technicien se déplace, mesure la pièce et vous conseille la bonne puissance."
- **WhatsApp text:** "Bonjour, je souhaite une visite technique (300 Dhs)."
- **Inclus:**
  - Mesure de la pièce (ruler)
  - Choix de la puissance (bolt)
  - Emplacement des unités (pin)
  - Liste du matériel (list)
- **Steps:**
  1. Demande — "Par téléphone, WhatsApp ou formulaire."
  2. Visite technique — "300 Dhs, chez vous ou sur le chantier."
  3. Devis — "Appareil, matériel et pose."
  4. Installation — "Par nos techniciens."
- **Tarifs:** Visite technique → **300 Dhs**. Desktop grid has 2 columns.
- **Matériel d'installation:** shown, with the same 4 items.
- **FAQ:**
  - **Combien coûte la visite ?** — 300 Dhs.
  - **Que se passe-t-il après la visite ?** — Nous vous envoyons un devis avec l’appareil conseillé, le matériel et la pose.

### Variant: Service après-vente (`?s=sav`)
- **t:** Service après-vente
- **Runtime title:** "Service après-vente · Climatisation Maroc"
- **H1:** Service après-vente
- **Intro:** "Une panne ou une question après l’achat : nos techniciens vous répondent."
- **WhatsApp text:** "Bonjour, je souhaite une intervention du service après-vente."
  - The button label is still "Commander par WhatsApp", which reads oddly for after-sales.
- **Inclus:**
  - Diagnostic (wrench)
  - Réparation (gear)
  - Pièces de rechange (box)
  - Conseil par téléphone (phone)
- **Steps:**
  1. Contact — "Appelez-nous ou écrivez sur WhatsApp."
  2. Diagnostic — "Nous identifions la panne."
  3. Devis — "Si une intervention est nécessaire."
  4. Intervention — "Par nos techniciens."
- **Tarifs:** Intervention → **Sur devis**. Desktop grid has 2 columns.
- **Matériel d'installation:** **hidden**.
- **FAQ (1 item):**
  - **Comment joindre le service après-vente ?** — Au 0666-854184 ou sur WhatsApp, du lundi au samedi de 9h à 19h.

### Service: leftovers and notes
- The breadcrumb "Services" points back to `Service.dc.html`; there is no services hub.
- The footer legal link "Service après-vente" points to the **non-existent** `Service apres-vente.dc.html`, not `Service.dc.html?s=sav`.
- There is no "Autres services" cross-link block between the three variants.
- No form on the page; all conversion goes to Devis, WhatsApp or tel.
- Same unused home dataset and `never` bar as the other pages. `VILLES`, `STORES` and `chips` are unused.
- The hero image `uploads/clima-cut2.png` has no fallback and is **not present** in `uploads/`.

---

## Calculateur puissance.dc.html

### 1. Identity
- **`<title>`:** `Quelle puissance de climatiseur pour votre pièce ? · Climatisation Maroc`
- **H1 (max-width 900):** "Quelle puissance de climatiseur pour votre pièce ?"
- **Breadcrumb:** Accueil › Climatisation (Climatisation.dc.html) › Calculateur de puissance
- **Links out:**
  - `Categorie Climatiseurs muraux.dc.html?puissance=N`
  - `Climatisation.dc.html?type=Gainable`
  - `Produit LG Dual Inverter.dc.html`
  - `Article puissance climatiseur.dc.html`
  - `Demander un devis.dc.html`
  - wa.me

### 2. Sections
1. **Breadcrumb** and **H1**
2. **CalculatorForm + ResultCard** (padding-top 28, gap 24, align start)
   - Columns: `minmax(0,1fr) 440px` on desktop; `1fr` below 1100.
   - **CalculatorForm**: white, radius 24, padding `cardP`, gap 28.
     - **Surface row**
       - Label "Surface de la pièce" (16/700).
       - Stepper pill: 48px tall, radius 999, border 1.5px #D5DCE3. "−" and "+" buttons are 44px with aria-labels Diminuer / Augmenter. Value text "18 m²" at 15/700.
       - Range slider `#surf`: min 8, max 60, step 1, `accent-color:#0B5CAD`, height 32.
       - End labels "8 m²" and "60 m²" (13px #5F6368).
     - **4 radio groups** (`role=radiogroup`)
       - Title 16/700.
       - Option grid has one column per option, except on mobile when there are more than 3 options, which gives 2 columns.
       - Option button: min-height 52, padding 6 10, **radius 14**, border **2px**, 15px/700. Selected: border #0B5CAD, background #E8EFF8. Unselected: border #E3E8EE, white.
       - Optional sub-label: 12px/600 #5F6368.
   - **Aside** (`aria-live=polite`; sticky top 88 on desktop, static below 1100), gap 16:
     - **ResultCard**
       - background #0B5CAD, white text, radius 24, padding `cardP`, gap 10.
       - "Puissance conseillée" (16px #E3ECF7).
       - Result value at **60px** (desktop) / **44px** (mobile), weight 800, letter-spacing −0.03em, line-height 1.
       - Explanation paragraph (16px #E3ECF7).
       - White CTA button (hover #E8EFF8, nowrap, margin-top 10).
     - **MatchList** (recommended products)
       - white, radius 24, padding 8 20.
       - Each row is a link, padding 12 0, divider 1px #EEF1F4.
       - Thumbnail: 76×56, radius 12, background **#EEF3FA**, padding 6.
       - Name 15px/600; price 17px/800, nowrap. Hover text #0B5CAD.
3. **Info section** (gap 24 48)
   - Columns: 2 equal on desktop; 1 below 1100.
   - **TierTable "Tableau des puissances"**
     - Wrapper: white, radius 20, overflow hidden.
     - `<table>` at 17px. Header row background #F4F6F8, `th` 15px #3C4043, padding 14 20.
     - Rows have a top border 1px #EEF1F4. The row matching the current result gets background **#E8EFF8**. Row headers are 800 weight.
   - **Explainer "Comment l'estimation est calculée"**
     - Body (17px/1.7, max 620): "Le point de départ est de 600 BTU par m². Le besoin augmente pour une hauteur sous plafond haute, une pièce très ensoleillée, un dernier étage ou une cuisine ouverte, et diminue légèrement pour une pièce peu exposée. Le résultat est arrondi à la puissance disponible juste au-dessus."
     - Link "**Lire le guide complet sur la puissance**" to `Article puissance climatiseur.dc.html`.
     - Note box (background #FDF0E6, radius 18, padding 16 20, 16px): "Estimation indicative. Un technicien peut confirmer lors d'une visite technique (300 Dhs)."
4. **CTA band "Besoin d’aide pour choisir ?"**
   - background #E8EFF8, radius 28, padding `proPad`.
   - Paragraph: "Conseil : 0666-088348, du lundi au samedi de 9h à 19h."
   - Green "Nous écrire sur WhatsApp" with text "Bonjour, j’ai besoin d’aide pour choisir la puissance de mon climatiseur." (this second assignment overrides the generic "j’ai besoin d’un conseil.").
   - Orange "Demander un devis".

### 3. Calculator logic (exact)
**Inputs and defaults:**

| State key | Input | Default | Options |
|---|---|---|---|
| `cs` | surface | 18 | clamp 8–60 |
| `ch` | Hauteur sous plafond | Standard | **Standard** (sub "Jusqu’à 2,5 m"), **Haute** (sub "Plus de 2,5 m") |
| `ce` | Exposition | Normale | Peu ensoleillée, Normale, Très ensoleillée |
| `ct` | Dernier étage | Non | Non, Oui |
| `cp` | Type de pièce | Salon | Chambre, Salon, Bureau, Cuisine ouverte |

**Factor:**
```
f = (haut==='Haute' ? 1.2 : 1)
  * (expo==='Très ensoleillée' ? 1.15 : expo==='Peu ensoleillée' ? 0.9 : 1)
  * (top==='Oui' ? 1.15 : 1)
  * (piece==='Cuisine ouverte' ? 1.2 : 1)
need = surf * 600 * f
tiers = [9000, 12000, 18000, 24000]
i = first index with need <= tier, else 4
```
- Chambre, Salon and Bureau all use factor 1.
- **Labels:** `['9 000 BTU','12 000 BTU','18 000 BTU','24 000 BTU','30 000 BTU et plus'][i]`.
- **Explanation text:** "Pour {surf} m²[, avec {reasons joined ', '}] : besoin estimé d’environ {round(need/100)*100, fr-FR} BTU."
  - Reasons, in order: plafond haut, pièce très ensoleillée, dernier étage, cuisine ouverte, pièce peu exposée.
  - Default output: "Pour 18 m² : besoin estimé d’environ 10 800 BTU." The result is 12 000 BTU.
- **CTA:**
  - For i < 4: "Voir les climatiseurs {lab}", linking to `Categorie Climatiseurs muraux.dc.html?puissance={9000|12000|18000|24000}`.
  - For i = 4: "Voir les gainables", linking to `Climatisation.dc.html?type=Gainable`.
- **Table:** the matching row is highlighted.
- **No query-string states.** `P` is read but unused.

**Matched products per tier** (`MP`). Link rule: entries that have an image go to `Produit LG Dual Inverter.dc.html`; all others go to `Categorie Climatiseurs muraux.dc.html`, even gainables and cassettes.

| Tier | Products |
|---|---|
| 0 (9 000) | LG Dual Inverter 9 000 BTU — 5 400 Dhs (img uploads/clima-cut2.png); Carrier Mural Inverter R32 9 000 BTU — 4 200 (art mural); CIAT Mural Inverter 9 000 BTU — 3 800 (mural) |
| 1 (12 000) | LG Dual Inverter 12 000 BTU — 5 700 (img); Carrier Miroir Inverter Noir R32 12 000 BTU — 5 600 (mural, dark); Fitco Mural Inverter 12 000 BTU Blanc — 4 000 (mural) |
| 2 (18 000) | LG Dual Inverter 18 000 BTU — 7 600 (img); LG Artcool Smart Inverter 18 000 BTU — 9 900 (mural, dark); LG Cassette Inverter 18000 BTU — 12 500 (art cassette) |
| 3 (24 000) | LG Dual Inverter 24 000 BTU — 8 900 (img); Fitco Mural Inverter 24 000 BTU Noir — 7 000 (mural, dark) |
| 4 (30 000+) | LG Gainable Inverter 36000 BTU — 14 200 (gainable); LG Gainable Inverter 48000 BTU — 19 800 (gainable); Carrier Gainable On/Off 60000 BTU — 20 900 (gainable) |

**Tier table (verbatim):**
- 9 000 BTU — Jusqu'à 15 m²
- 12 000 BTU — Jusqu'à 20 m²
- 18 000 BTU — Jusqu'à 30 m²
- 24 000 BTU — Jusqu'à 40 m²
- 30 000 BTU et plus — Au-delà de 40 m²

### 4. Responsive
- **1440:** form on the left, sticky 440px result column on the right. Table and explainer side by side. Result value 60px.
- **390:** single column (form, then result, then match list, then table, then explainer). "Type de pièce" options in a 2×2 grid. Result value 44px. CTA buttons full width.

### 6. Forms
No submit. It is a live calculator only.

### 7. Leftovers
- The shared script still contains the **home-page mini calculator**, which is not used here:
  - `sizeFor(s, sun)`: index from s≤15, ≤20, ≤30, ≤40, else 4. Sun `'fort'` bumps one tier (max 4) and labels it "Conseillé · soleil".
  - Home `TIERS` sub-labels.
  - Sun options faible / moyen / fort ("Peu de soleil" / "Ensoleillée" / "Très ensoleillée").
  - `seeHref='Climatisation.dc.html?type=Mono%20split&puissance=N'`.
  - It uses different link targets and a sun-bump model instead of multipliers. **The two calculator formulas disagree**; the Calculateur page's multiplier model is the authoritative one here.
- Unused helpers: `pill`, `toastIt`, `logo`, `fmt2`, `dh2`, `c3`, `c4`.
- Prices disagree with Marque LG ("LG Artcool" is 9 900 here; LG page says from 7 900).

---

## Marque LG.dc.html

### 1. Identity
- **`<title>`:** `Climatiseurs LG au Maroc · Distributeur officiel · Climatisation Maroc`
- **H1:** "Climatiseurs LG au Maroc"
- **Breadcrumb:** Accueil › Marques (`Accueil.dc.html#marques`; that anchor exists on Accueil) › LG
- **Links out:**
  - `Produit LG Dual Inverter.dc.html`
  - `Climatisation.dc.html`
  - `Marque Carrier.dc.html`, `Marque CIAT.dc.html`, `Marque Fitco.dc.html`, `Marque Simsek.dc.html` (none of these exist)
  - `Demander un devis.dc.html`
  - wa.me

### 2. Sections
1. **BrandHero**
   - margin-top 24, **white**, radius 28, gap 24 48.
   - Padding: 48 (desktop and tablet) / `24px 20px` (mobile).
   - Columns: `minmax(0,1.1fr) minmax(0,0.9fr)` on desktop; `1fr` below 1100.
   - Text column (gap 18):
     - LG logo `uploads/logo-lg-t.png`, sized from area with aspect ratio 2.05: A=4200, max-height 56, max-width 140 (about 93×45) on desktop; A=2600, max-height 40 (about 73×36) on mobile.
     - Badge "**Distributeur officiel**": 14px/700 #0B5CAD on #E8EFF8, radius 8, padding 5 12.
     - H1.
     - Paragraph (19px/1.55 #3C4043, max 620).
   - Art box (`aria-hidden`): #DCE8F5, radius 24, min-height 300 (desktop) / 180 (mobile), padding 24. Image `uploads/clima-cut2.png`, max 520, drop-shadow.
   - **No stats are present** on this page (no figures or counters).
2. **FilterPills** (sticky)
   - Wrapper: padding-top 32, `position:sticky; top: 64` when the header is in its scrolled state (`s.sy`), otherwise 0. z-index 5, background #F4F6F8, padding-bottom 12, margin-bottom −12.
   - Pills scroll horizontally with no scrollbar: 44px tall, padding 0 18, radius 999, border 1.5px, 15/700.
   - Selected: #1A1A1A with white text. Unselected: white with border #E3E8EE; hover border #1A1A1A.
   - Options: **Tous, Mural, Gainable, Cassette**. State `rg`, default Tous. The filter hides the other groups; it does not scroll.
3. **Product groups** (one per range)
   - Each group is `<section id={mural|gainable|cassette}>`, padding-top 48 (desktop) / 32 (mobile), `scroll-margin-top` 140.
   - Heading row: H2 plus a count "N gammes" or "1 gamme" (16px #5F6368).
   - Grid `c3`: 3 columns on desktop, 2 on tablet, 1 on mobile; gap 16.
   - **ProductCard (brand variant)**
     - white, radius 24, padding 20, gap 12, hover lift −4 with shadow.
     - Outline badge "LG": #0B5CAD text with a 1.5px #0B5CAD border, radius 8, padding 4 10, 14/700.
     - Name link: 21px/500, letter-spacing −0.01em.
     - Ref line (15 #5F6368), only shown when a ref exists.
     - Art link: 150px tall.
     - "À partir de" (13px #5F6368, min-height 16).
     - Price 28px/800.
     - Old-price slot: 15 #7A828B, line-through. Empty here.
     - Saving slot: 14/700 #C4501A. Empty here.
     - Button "**Voir le produit**" (link): 54px, radius 12, border #9AA3AD, hover dark. There is **no add-to-cart** on this page.
4. **"Les technologies LG"** (FeatureGrid)
   - Grid `c4`: 4 / 2 / 1 columns.
   - Card: white, radius 20, padding 24, gap 14.
   - Icon tile: 52px, radius 16, #E8EFF8, two-tone icon.
   - H3 19/700; paragraph 16px/1.5 #3C4043.
5. **"Autres marques"** (BrandTiles)
   - Grid: 4 columns on desktop and tablet; 2 on mobile; gap 16.
   - Tile is a link: white, radius 20, height 150 (desktop) / 120 (mobile), centred logo plus a 14px #5F6368 category caption. Hover lift −3.
   - Logo sizing: A=3800 (desktop) / 2400 (mobile), max-height 56 / 40, max-width 150 / 110.
6. **CTA band "Un projet avec du LG ?"**
   - background #E8EFF8, radius 28, padding `proPad`.
   - Paragraph: "Conseil et devis au 0666-088348, du lundi au samedi de 9h à 19h."
   - Green "Nous écrire sur WhatsApp" with text "**Bonjour, je cherche un climatiseur LG.**"
   - Orange "Demander un devis".

### 3. Behaviour
- Only the range filter pills (`rg` state) are interactive on this page.
- No query-string states.

### 4. Responsive
- **1440:** hero has 2 columns. Product grids have 3 columns. Technologies have 4 columns. Other-brand tiles have 4 columns at 150px.
- **390:** hero stacks with a 180px art box. All grids are 1 column, except brand tiles at 2 columns and 120px. Pills scroll horizontally. H1 34.

### 5. Data
- **Brand intro:** "Ariha Froid est distributeur officiel LG au Maroc. Muraux, gainables et cassettes Inverter, livrés gratuitement partout au Maroc et posés par nos techniciens sur devis."
- **Groups and products:**

| Group (id) | Count text | Name | Price | Ref | Art / image | Link |
|---|---|---|---|---|---|---|
| Mural (mural) | 3 gammes | LG Dual Inverter | À partir de 5 400 Dhs | "9 000 à 24 000 BTU" (shown in the ref slot) | img uploads/clima-cut2.png | Produit LG Dual Inverter.dc.html |
| Mural | | LG Artcool Smart Inverter | À partir de 7 900 Dhs | — | art mural, dark | Climatisation.dc.html |
| Mural | | LG Jetcool Inverter R32 | À partir de 4 500 Dhs | — | art mural | Climatisation.dc.html |
| Gainable (gainable) | 1 gamme | LG Gainable Inverter | À partir de 7 800 Dhs | — | art gainable | Climatisation.dc.html |
| Cassette (cassette) | 1 gamme | LG Cassette Inverter 18000 BTU | 12 500 Dhs (no "à partir de") | ATNW18GPLS1 | art cassette, width 52% | Climatisation.dc.html |

- **Technologies:**

| Title | Text | Icon |
|---|---|---|
| Dual Inverter | Le compresseur ajuste sa vitesse : moins de bruit, jusqu’à 70 % d’électricité en moins. | fan |
| Tropical T3 | Conçu pour fonctionner par fortes chaleurs. | unit |
| Wi-Fi ThinQ | Pilotez le climatiseur depuis votre téléphone avec LG ThinQ. | list |
| Fonctionnement silencieux | Un appareil discret, de jour comme de nuit. | snow |

- **Other brands:**
  - Carrier — Climatisation
  - CIAT — Climatisation
  - Fitco — Climatisation
  - Simsek — Chauffe-eau
  - Each links to `Marque {n}.dc.html`.
- **FAQ:** none on this page.

### 7. Leftovers
- `Marque Carrier/CIAT/Fitco/Simsek.dc.html` do not exist in the folder.
- Product links other than Dual Inverter fall back to `Climatisation.dc.html`.
- `pillTop` uses 64 when scrolled, even while the header is hidden (translated −110%), which leaves a gap.
- Price inconsistency: Artcool is "from 7 900" here but 9 900 (18 000 BTU) in the shared FAM and the calculator.
- Unused: `toastIt`, `fmt2`, `dh2`, and the home dataset.

---

## Cross-file leftovers and broken links

- **`never` flag** (always false) on every page:
  - a duplicate drawer button in the header
  - a mobile bottom sticky bar (Appeler `tel:+212666854184` / WhatsApp / "Panier {count}").
- **Linked `.dc.html` files missing from the folder** (all from the shared chrome or these pages):
  - Ranges: `Chauffe-eau`, `Ventilation`, `Gaines`, `Pieces de rechange`, `Froid`
  - `Produit.dc.html` (generic product, used by the home dataset)
  - Brands: `Marque Carrier`, `Marque CIAT`, `Marque Fitco`, `Marque Simsek`, `Marque GS`, `Marque Lafarga`, `Marque Alpha`, `Marque Arfro`
  - Legal: `CGU`, `Informations legales`, `Securite`, `Confidentialite`
  - `Service apres-vente`
- **Missing assets:** `uploads/` contains only `New_DZ2.png` and nine `logo-*-t.png` files. These are absent:
  - `uploads/pasted-1791221833312-0.png` (the site logo)
  - `uploads/clima-cut2.png` (Service hero, LG hero, calculator thumbnails)
  - the rest of the home art images
- **Hover-only layout properties** (the `style-hover` bugs): Devis submit, Contact submit, Contact Itinéraire button.
- **No Devis budget field.** No cross-service "Autres services" block on Service. No "Guides associés" block, except the single calculator link to the article.

## New design tokens (not in the given set)

**Colours:**
- #D3DDE8 — input border
- #FFF7F2 — error field background
- #E3F5EA — success circle background
- #B9C6D4 — upload dashed border
- #F7F9FB — upload background
- #DCE5EF — vertical step connector
- #D5DCE3 — chip and pill unselected border, stepper border
- #C9D3DE — search hover border (shared header)
- #F1F5FA — selected dropdown row (shared)
- #E6E9EC — header bottom hairline shadow
- #EEF3FA — calculator match thumbnail background
- Contact social backgrounds: #1877F2 (Facebook), #E4405F (Instagram)
- Shadow tints use `rgba(14,40,70,…)`

**Radii:**
- **16** — upload tile and 52px icon tiles
- **28** — hero and CTA bands (Service, LG, Calculateur)
- Teardrop pin `50% 50% 50% 0`

**Type sizes:**
- 60 / 44 — calculator result
- 30 — price-card value
- 32 — success H2
- 21 — LG product name
- 12 — option sub-label

**Borders:**
- 2px on calculator option buttons; everything else uses 1.5px.

The font stays Figtree 400–800.
