# Design reference report: pro and B2B pages (6 files)

All files are in `D:\AllProjects\LogicTechnologies\climatisation-maroc\design\`. I read every file in full. "Espace professionnel" was read line by line. The other five were read through a full diff against it, which shows every page-specific line; the remaining lines are identical shared boilerplate.

## Shared notes for all 6 files

**Header and footer**
- The header, mega menu, drawer, footer and toast are byte-identical to the known home version on 5 pages.
- **Commande rapide** is the only exception (see its section).
- None of the 6 pages has a logged-in nav variant. The "Devenir revendeur" nav link stays visible even on Commande rapide.

**Breakpoint logic**
- mobile = W<760, tab = 760–999, tablet = W<1100, midT = 760–1099, desktop = W≥1000.
- gutter: 16 (mobile) / 40.
- secGap: 40 / 56.
- h2Size: 32 / 44.
- `extra()` runs last and overrides `post()`/`rv()`. So the effective H1 size on all 6 pages is 34 / 44 / 56 (mobile / tablet / desktop).

**Breadcrumb**
- `<nav aria-label="Fil d'Ariane">`, padding-top 24, gap 8, 14px, colour #5F6368.
- Last crumb is #1A1A1A at weight 700; the others are weight 500.
- Separator "›" in #9AA3AD.

**Shared query-string states (all pages)**
- `?menu=<clim|eau|vent|gaines|cuivre|pieces>` opens the mega menu.
- `?drawer=1|<key>` opens the mobile drawer.

**Standard component styles**
- **Text inputs:** height 52, radius 12, 1.5px #D3DDE8 border, padding 0 16, 16px text. Focus border #0B5CAD. Error state: border #C4501A, background #FFF7F2.
- **Error message:** 14px/600, #C4501A, with an 18px filled circle-"!" SVG.
- **Selects:** custom chevron, 16px, positioned right 16 / top 18.
- **Buttons:** height 56, padding 0 28, radius 999, 16px/700.
  - Orange: #F4731F, hover #D85A17.
  - Blue: #0B5CAD, hover #084683.
  - Outline: 1.5px #1A1A1A border, hover fills #1A1A1A with white text.
  - White: hover #E8EFF8.
  - WhatsApp: #25D366, hover `filter:brightness(.95)`.
- **FaqAccordion:** white card, radius 24, padding 8px 24px. Question button min-height 64, 18px/700. "+" icon 26px #0B5CAD, rotates 45° when open. Answer 16px/1.6, #3C4043, max-width 760, animated with grid-template-rows 0fr→1fr over .3s. Rows divided by 1px #EEF1F4. **The first item is open by default** (`faqO ?? 0`).

---

## Espace professionnel.dc.html

### 1. Identity and links
- **Purpose:** public landing page for the pro / reseller programme.
- **`<title>`:** "Espace professionnel · Climatisation Maroc"
- **H1:** "Espace professionnel"
- **Breadcrumb:** Accueil (Accueil.dc.html) › Espace professionnel
- **Links to:** Devenir revendeur ×2, Connexion ×2, tel:+212666602599, Marque {LG, Carrier, CIAT, Fitco, Simsek, GS, Lafarga, Alpha, Arfro}.dc.html, plus the shared header/footer links.

### 2. Sections, top to bottom

**Breadcrumb**

**ProHero** (`<section>`)
- Background #0B5CAD, white text, radius 28, margin-top 24.
- Padding: 64 (desktop) / 48px 40px (tablet) / 32px 20px (mobile).
- Grid: `minmax(0,1fr) auto` on desktop, `1fr` below 1100. Gap 32, align centre.
- **Left column (gap 20):**
  - H1: line-height 1.05, letter-spacing −0.03em, weight 700, white.
  - Paragraph: 20px/1.5, #E3ECF7, max-width 600. Text: "Installateurs, revendeurs et projets : vos prix, votre stock et vos commandes au même endroit."
  - Buttons, row on desktop / column on mobile, gap 12:
    - "Devenir revendeur" (orange) → Devenir revendeur.dc.html
    - "Se connecter" (white, hover #E8EFF8) → Connexion.dc.html
- **Right column: phone card** (link to tel:+212666602599)
  - Background rgba(255,255,255,.12), hover .2. Radius 20, padding 20px 24px, gap 16.
  - justify-self: end on desktop, start below 1100.
  - 52px white circle with a #0B5CAD phone icon (Material "phone" path).
  - "Projets et revendeurs" (15px, #E3ECF7)
  - "0666-602599" (28px/800, letter-spacing −0.01em)
  - "Lundi – Samedi, 9h – 19h" (14px, #C9DAEE)

**PerkGrid (benefits)** — no section heading
- Grid c3: 1fr on mobile, `repeat(3,minmax(0,1fr))` otherwise. Gap 16.
- Card: white, radius 20, padding 24, gap 14.
- Icon tile: 52×52, radius 16, #E8EFF8. SVG is 26px, stroke 1.9, two paths: blue #0B5CAD + orange #F4731F.
- H2 20px/700. Text 16px/1.5, #3C4043.

**AudienceCards ("Pour qui ?")**
- H2 "Pour qui ?": h2Size, letter-spacing −0.03em, margin-bottom 24.
- Same c3 grid, gap 16.
- Card: radius 24, padding 28, min-height 260 (200 on mobile), flex column space-between, gap 24.
- Icon tile: 56, white, radius 16, 28px SVG.
- H3 24px/700. Text 16px/1.5, #1A1A1A.

**StepList + QuickOrderPreview ("Comment ça marche")**
- Grid: `minmax(0,5fr) minmax(0,7fr)` on desktop, `1fr` below 1100. Gap 32, align centre.
- **Left: vertical stepper (`<ol>`)**
  - Numbered circles 44px, #0B5CAD, white 18px/800 number.
  - Connector line 2px #DCE5EF, min-height 20, hidden after the last step.
  - Text padding 8px 0 28px. Title 20px/700, description 16px/1.5 #3C4043.
- **Right: `<figure aria-label="Aperçu de la commande rapide">`**
  - Outer: #E8EFF8, radius 28, padding 32 (16 on mobile).
  - Inner: white, radius 20, padding 20, shadow `0 30px 60px -36px rgba(14,40,70,.45)`.
  - Header row: "Commande rapide" (17px/700) and "4 lignes" (14px, #5F6368), bottom border #EEF1F4.
  - Rows use pvCols: `110px minmax(0,1fr) 48px 90px` on desktop, `92px minmax(0,1fr) 72px` on mobile. Gap 12, padding 10 0, 14px.
  - Reference chip: height 36, radius 8, 1.5px #D3DDE8, 700, tabular numbers.
  - Footer: "Total **9 790 Dhs**" (20px strong) and a fake orange pill "Ajouter au panier" (40px high, 14px). The pill is a `<span>`, not interactive.

**BrandLogoGrid ("Nos marques")**
- White card, radius 24, padding 24.
- Grid: 3 / 5 / 9 columns (mobile / tablet / desktop), gap 24, centred.
- Each logo is a link 72px high to `Marque {n}.dc.html`.
- Image `uploads/logo-{n lowercase}-t.png`, sized by equal-area maths:
  - Area A = 4200 (×0.5 on mobile); width = sqrt(A·ar), height = sqrt(A/ar).
  - Max height 60 (44 mobile); max width 140 (96 mobile).

**FaqAccordion ("Questions fréquentes")**

**CtaBand ("Ouvrez votre compte professionnel")**
- Background #FDF0E6, radius 28, padding 48 (24 on mobile). Flex space-between, wrap, gap 24.
- Text block max-width 620.
- Paragraph 17px/1.55, #3C4043.
- Buttons (column and 100% width on mobile):
  - "Devenir revendeur" (orange)
  - "Se connecter" (white with 1.5px #1A1A1A border, hover black)

### 3. Behaviour
- The FAQ toggles one item at a time.
- No forms on this page.
- No page-specific query states.

### 4. Responsive: 390 vs 1440
- **At 390:** hero stacks, with the phone card under the buttons. Buttons are full-column. Perks, audience cards and brands stack (brands in 3 columns).
- **Preview bug at 390:** the mobile preview has 4 cells against 3 grid columns, so the total wraps to a new line.
- **At 1440:** hero is 2 columns. Perks and audience are 3 columns. "Comment ça marche" is 5:7. Brands are in 9 columns.

### 5. Data (verbatim)

**Perks (BEN), icon keys from IC**
1. "Tarifs revendeur" — "Prix professionnels sur tout le catalogue dès la connexion." (tag)
2. "Stock à jour" — "Quantités disponibles dans nos deux magasins de Marrakech." (box)
3. "Commande rapide par référence" — "Saisissez vos références et quantités, le panier se remplit." (list)

**Icon paths (IC; first path blue, second orange)**
- tag: `M3 12V4h8l10 10-8 8z` + circle(7.5,8.5,1.5)
- box: `M3 7l9-4 9 4v10l-9 4-9-4z` + `M3 7l9 4 9-4 M12 11v10`
- list: `M8 6h13 M8 12h13 M8 18h13` + `M3 6h.01 M3 12h.01 M3 18h.01`

**"Pour qui ?" cards (icon key, bg)**
1. "Installateurs" — "Les appareils et le matériel de pose pour vos chantiers." (wrench, #DCE8F5)
2. "Revendeurs" — "LG, Carrier, CIAT et Fitco pour votre magasin." (store, #FCE6D6)
3. "Projets et chantiers" — "Hôtels, bureaux, restaurants : un interlocuteur pour tout le projet." (crane, #E8EFF8)

**Icon paths (PI)**
- wrench: `M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z` + `M19 3v0`
- store: `M4 9l1.5-5h13L20 9 M4 9v11h16V9 M4 9a2.7 2.7 0 0 0 5.3 0a2.7 2.7 0 0 0 5.4 0a2.7 2.7 0 0 0 5.3 0` + `M10 20v-5h4v5`
- crane: `M4 21h16 M6 21V8h4v13 M10 8h10l-3 4` + `M8 4v4 M17 12v3 M15.5 15h3`

**Steps**
1. "Demande d’ouverture de compte" — "Société, ICE, activité et contact."
2. "Validation par notre équipe" — "Nous vous contactons pour valider le compte."
3. "Accès aux tarifs et à la commande rapide" — "Vos prix et le stock s’affichent dès la connexion."

**Quick-order preview rows** (ref, name, qty, line total)

| Ref | Name | Qty | Line total |
|---|---|---|---|
| CUIV0005 | Cuivre 1/4 Lafarga 15 m | ×4 | 1 980 Dhs |
| CUIV0018 | Kit duo 1/4-3/8 20 m | ×2 | 2 260 Dhs |
| GAZ00042 | Gaz R410 GS 11,3 kg | ×1 | 5 000 Dhs |
| CLIM00076 | Support GT | ×10 | 550 Dhs |

Total: 9 790 Dhs.

**QC reference catalogue** (ref: name, public price in Dhs, art key). The same table is used by Commande rapide.

| Ref | Name | Price | Art key |
|---|---|---|---|
| CUIV0005 | Cuivre 1/4 Lafarga 15 m | 495 | coilS |
| CUIV0006 | Cuivre 3/8 Lafarga 15 m | 750 | coilL |
| CUIV0018 | Kit duo 1/4-3/8 20 m | 1130 | duo |
| GAZ00042 | Gaz R410 GS 11,3 kg | 5000 | gaz |
| CLIM00076 | Support GT | 55 | support |
| CLIM00080 | Télécommande universelle | 70 | remote |
| CLIM00319 | Flexible calorifugé Q160 Arfro 10 m | 280 | flex |
| CLIM00320 | Flexible isolé thermique aluminium Q200 10 m | 320 | flex |
| CLIM00323 | Flexible souple Q160 Esbo 10 m | 200 | flex |
| CLIM00377 | Flexible souple Q250 Esbo 10 m | 240 | flex |
| VENT0135 | Flexible souple Q125 Esbo 10 m | 180 | flex |
| VENT0136 | Flexible souple Q200 Esbo 10 m | 220 | flex |
| D13AJH.N | LG Dual Inverter 12 000 BTU | 5700 | mural |
| D10AWH.NW0 | LG Dual Inverter 9 000 BTU | 5400 | mural |
| 38HG09VSA | CIAT Mural Inverter 9 000 BTU | 3800 | mural |

**No pro/reseller price exists anywhere in the data.**

**Logo aspect ratios (LOGOS)**
LG 2.05, Carrier 2.52, CIAT 2.01, Fitco 0.69, Simsek 3.47, GS 1.23, Lafarga 4.64, Alpha 3.09, Arfro 3.38.

**FAQ**
1. **Q:** "Qui peut ouvrir un compte ?"
   **A:** "Les installateurs, revendeurs, bureaux d’études et promoteurs, sur présentation de leur ICE."
2. **Q:** "Comment mon compte est-il validé ?"
   **A:** "Après votre demande, notre équipe vous contacte pour vérifier les informations et activer l’accès."
3. **Q:** "Puis-je commander par téléphone ?"
   **A:** "Oui, au 0666-602599 ou sur WhatsApp, du lundi au samedi de 9h à 19h."

### 6. Forms
None.

---

## Devenir revendeur.dc.html

### 1. Identity and links
- **Purpose:** reseller / pro account application form.
- **`<title>`:** "Devenir revendeur · Climatisation Maroc"
- **H1:** "Devenir revendeur"
- **Breadcrumb:** Accueil › Espace professionnel (Espace professionnel.dc.html) › Devenir revendeur
- **Links to:** CGV.dc.html (consent), Espace professionnel, Climatisation (from the confirmation), tel:+212666602599, WhatsApp. The WhatsApp prefilled text is "Bonjour, je souhaite ouvrir un compte revendeur."

### 2. Sections

**Breadcrumb**

**PageIntro**
- padding-top 24, gap 12, max-width 820.
- H1 at h1Size.
- Paragraph 18px/1.55, #3C4043: "Ouvrez votre compte professionnel pour accéder aux tarifs revendeur, au stock et à la commande rapide."

**FormCard + aside** (section, padding-top 32)
- Grid: `minmax(0,1fr) 400px` on desktop, `1fr` below 1100. Gap 24, align start.

**FormCard (`<form noValidate>`)**
- White, radius 24, padding 32 (20 on mobile), gap 28.
- Two fieldsets. Legends are 24px/700, margin-bottom 16.
- Inner field grid: 2 columns (1fr on mobile), gap 16.
- Labels: 15px/700, gap 8.

**ApplicationConfirmation** (replaces the form when sent; `role="status"`)
- White, radius 24, padding cardP.
- Check icon: 72px circle #E3F5EA with a #1F9D57 check, stroke 2.6.
- H2 32px/700, letter-spacing −0.02em: "Votre demande est enregistrée."
- Paragraph 18px/1.55, #3C4043: "Nous vous contactons pour valider votre compte."
- Buttons:
  - "Retour à l'espace professionnel" (outline) → Espace professionnel.dc.html
  - "Voir le catalogue" (blue) → Climatisation.dc.html

**Aside (PerkList + ContactCard)**
- position: sticky, top 24 on desktop; static below 1100, so it drops below the form.
- **Card 1 — "Votre compte revendeur"**
  - Background #E8EFF8, radius 24, padding 24, gap 20.
  - H2 24px.
  - The same 3 BEN perks as on Espace professionnel, as rows. Icon tile 44, white, radius 14, 22px icon. Title 17px/700, text 15px/1.45 #3C4043.
- **Card 2 — contact**
  - White, radius 24, padding cardP, gap 16.
  - Phone link: 44px circle #E8EFF8 with phone icon; "Projets et revendeurs" (14px #3C4043); "0666-602599" (22px/800).
  - Green WhatsApp button with icon, label "WhatsApp".
  - "Lundi – Samedi, 9h – 19h" (15px, #3C4043).

Lines 125–127 of the base page were removed: there are no brands, FAQ or CTA band on this page.

### 3. Behaviour and states
- **Submit:** `preventDefault`. Validation runs on submit only (`tried`). On success it sets `sent=true` and scrolls to the top.
- **Validated fields:**
  - Société: non-empty.
  - ICE: digits only, length = 15.
  - Téléphone: `/^0[5-7]\d{8}$/` after stripping non-digits.
  - Consent checkbox must be checked.
- **Not validated:** Nom, E-mail, mot de passe. The "8 caractères minimum." is only a hint.
- **Password toggle:** "Afficher" / "Masquer".
- **`?envoye=1`:** shows the confirmation directly (form hidden; the aside stays). Internally the form is prefilled with demo data and consent is ticked.
- **`?erreur=1`:** shows the form prefilled with demo data, `tried=true`, consent ticked:
  - Société "Froid Atlas SARL"
  - ICE "00152874900" (11 digits, so the ICE error shows: "L’ICE comporte 15 chiffres. Vous en avez saisi 11.")
  - Ville Marrakech, Activité Installateur
  - Nom "Hicham Ouali"
  - Tel "06 61 23 45 67" (valid)
  - Mail "contact@froid-atlas.ma"
  - pw "motdepasse"

### 4. Responsive: 390 vs 1440
- **At 1440:** form and a 400px sticky aside sit side by side; fields are 2-up.
- **At 390:** fields are single-column; the aside sits below the form; confirmation buttons stack full-width.
- The intended effect is a full-width submit button on mobile, but the `align-self` value sits inside `style-hover` (see section 7).

### 6. Form fields

**Fieldset "Votre société"**
| Label | Type / attributes | Placeholder or default | Error text |
|---|---|---|---|
| Société | text, `autocomplete=organization`, required | — | "Indiquez le nom de la société." |
| ICE | text, `inputmode=numeric`, tabular numbers, required (15 digits) | placeholder "15 chiffres" | "L’ICE comporte 15 chiffres. Vous en avez saisi {n}." |
| Ville | select | default Marrakech | — |
| Activité | select | default Installateur | — |

- **Ville options:** Agadir, Béni Mellal, Casablanca, El Jadida, Essaouira, Fès, Kénitra, Marrakech, Meknès, Mohammedia, Ouarzazate, Oujda, Rabat, Safi, Salé, Tanger, Tétouan, Autre ville.
- **Activité options:** Installateur, Revendeur, Bureau d’études, Promoteur, Autre.

**Fieldset "Contact et accès"**
| Label | Type / attributes | Notes |
|---|---|---|
| Nom du contact | text, `autocomplete=name` | not validated |
| Téléphone | tel, required | error: "Saisissez 10 chiffres, par exemple 06 12 34 56 78." |
| E-mail | email | not validated |
| Mot de passe souhaité | password, `autocomplete=new-password`, show/hide button | hint "8 caractères minimum." (not enforced) |
| Message (optionnel) | textarea, 3 rows, full width | placeholder "Marques travaillées, volumes, zone d'intervention…" |

**Consent and submit**
- Custom checkbox: `role=checkbox`, 44px hit area, 24px box, radius 7. Border #C3CEDA; checked state is #0B5CAD fill with "✓".
- Label: "J'accepte les [conditions générales de vente]" (link to CGV.dc.html).
- Error: "Cochez cette case pour envoyer la demande."
- Submit: "Envoyer ma demande" (orange).

---

## Connexion.dc.html

### 1. Identity and links
- **Purpose:** pro login, plus a forgot-password flow.
- **`<title>`:** "Connexion · Espace professionnel · Climatisation Maroc"
- **H1:** "Se connecter" (login mode) or "Mot de passe oublié" (forgot mode).
- **Breadcrumb:** none (the crumb nav was removed on this page).
- **Links to:** Devenir revendeur, tel:+212666602599. A successful login redirects to Commande rapide.dc.html.

### 2. Sections

**AuthCard** — centred column
- Wrapper padding: `72px 0 24px` on desktop, `32px 0 16px` on mobile.
- Column max-width 480, gap 16.

**Login form**
- White, radius 24, padding 32/20, gap 20.
- Eyebrow "Espace professionnel" (14px/700, #0B5CAD). H1 34px/700, letter-spacing −0.02em.
- Optional error alert (`role=alert`): background #FDEBDD, radius 14, padding 14px 16px. Text: "**Identifiants incorrects.** Vérifiez votre e-mail ou téléphone et votre mot de passe."
- Field "E-mail ou téléphone": `autocomplete=username`.
- Field "Mot de passe":
  - Inline "Mot de passe oublié ?" link-button in the label row (14px/700, #0B5CAD, underlined).
  - password input, `autocomplete=current-password`, with an Afficher/Masquer toggle.
- Both fields get a #C4501A border when `bad`.
- Submit "Se connecter" (blue).

**Forgot form**
- Same card styling.
- Back button "Retour à la connexion" with a chevron-left icon.
- H1 "Mot de passe oublié".
- Paragraph 16px/1.55, #3C4043: "Indiquez l'e-mail ou le téléphone de votre compte. Nous vous envoyons un lien pour choisir un nouveau mot de passe."
- Field "E-mail ou téléphone".
- Blue button "Recevoir le lien".
- Once sent, the field and button are replaced by a status box: background #E3F5EA, radius 14, padding 16. Text: "**Lien envoyé.** Si un compte correspond à {id}, vous recevez le lien dans quelques minutes."

**SignupPrompt**
- White, radius 20, padding 18px 20px, centred.
- "Pas encore de compte ?" + "Devenir revendeur" (700, underlined).

**Help line**
- 14px, #5F6368: "Besoin d'aide : **0666-602599**" (tel link).

### 3. Behaviour and states
- **Login submit succeeds when:** id is non-empty, password length ≥ 8, and `bad` is false. It then does `location.href = 'Commande rapide.dc.html'`.
- **Otherwise:** sets `bad=true`. Typing in the password field clears `bad`.
- **No real authentication.** No "remember me" option.
- **Forgot submit:** a non-empty id sets `sent`. An empty id does nothing and shows no message.
- **`?oubli=1`:** forgot mode, id prefilled with "contact@froid-atlas.ma".
- **`?erreur=1`:** login mode with the alert showing. id "contact@froid-atlas.ma", password "motdepase".

### 4. Responsive
Only the card padding (20 vs 32) and the wrapper padding change. The card is max 480 at every width.

---

## Commande rapide.dc.html

### 1. Identity and links
- **Purpose:** authenticated quick order by reference.
- **`<title>`:** "Commande rapide · Espace professionnel · Climatisation Maroc"
- **H1:** "Commande rapide par référence"
- **Breadcrumb:** Accueil › Espace professionnel › Commande rapide
- **Links to:** Connexion (logout), "Demander un devis.dc.html?pro=1", WhatsApp. The WhatsApp prefilled text for an unknown reference is "Bonjour, je cherche la référence {REF}".

### 2. Header differences (the only header variant in this set)

**AccountBar pill** (W ≥ 1100), placed in the right cluster before the cart:
- Height 48, padding 0 6 0 16, radius 999, background #F4F6F8.
- 28px #0B5CAD circle with a user icon.
- "[SOCIÉTÉ]" (15px/700) — placeholder.
- White pill "Se déconnecter" (36px high, 14px/700) → Connexion.dc.html.

**Other header changes**
- The WhatsApp phone link in the header is forced off (`showWA=false`) at every width.
- Below 1100 the account row moves under the H1 (see below).

### 3. Sections

**Breadcrumb**

**Title row** (flex space-between, wrap)
- H1 at h1Size.
- Subtitle 16px, #3C4043: "Saisissez une référence et une quantité par ligne. Prix publics affichés, votre tarif revendeur apparaît à côté."
- When W<1100 (`acctRow`): "[SOCIÉTÉ]" (700) + underlined link "Se déconnecter".

**Main grid**
- `minmax(0,1fr) 380px` on desktop, `1fr` below 1100. Gap 24, padding-top 28.

**QuickOrderTable**

*Desktop (W ≥ 1000)*
- White panel, radius 24, padding 20px 32px 24px.
- Header row: Référence / Produit / Prix unitaire / Quantité / Total (right-aligned) / (empty). 13px/700, #5F6368, letter-spacing .02em.
- Columns: `200px minmax(0,1fr) 150px 140px 110px 44px`, grid-area `"ref name unit qty tot rm"`.
- Rows divided by 1px #EEF1F4; row padding 16px 0.

*Below 1000*
- The panel becomes transparent; each row is a white card, radius 18, padding 16, shadow `0 1px 0 #E6EBF0`, gap 10.
- Areas: `"ref ref rm" "name name name" "qty tot tot"`; columns `minmax(0,1fr) auto 44px`.

*Cells*
- **Reference input** (combobox)
  - Height 48, 700 weight, uppercase, letter-spacing .02em, placeholder "Ex. CUIV0005".
  - Border #0B5CAD while autocomplete is open. Error: border #C4501A, background #FFF7F2, plus "Référence inconnue."
- **Autocomplete listbox**
  - Absolute top 54, width 420 on desktop / 100% below. Radius 16, padding 6.
  - Up to 5 options, each min-height 52:
    - Thumbnail 44×36, radius 8, #EEF3FA, drawn from the art key.
    - Ref (14px/800) and name (14px #3C4043, ellipsis).
    - Price (14px/700).
  - First option highlighted #F1F5FA. Selection happens on `onMouseDown`.
- **Name cell**, by state:
  - Known reference: product name (16px/600, #1A1A1A).
  - Unknown reference: "Aucun produit pour cette référence" (#C4501A) plus the link "Demander sur WhatsApp".
  - Typing (autocomplete open): "Choisissez une référence dans la liste" (#7A828B).
  - Empty: "—".
  - Below 1000 a known row also shows "{price} / unité" plus a dashed badge "[TARIF REVENDEUR]".
- **Unit price** (desktop only): 16px/700, with the dashed badge "[TARIF REVENDEUR]" underneath.
  - Badge style: 1.5px dashed #9AA3AD border, #5F6368 text, 12px/700, radius 6, padding 2px 8px.
- **Quantity stepper**
  - Height 48, radius 999, 1.5px #D5DCE3. "−" / input (36px wide) / "+". Minimum 1, digits only.
  - Opacity 0.45 when the reference is invalid.
- **Total:** 18px/800, right-aligned.
- **Remove:** 44px circle, #F4F6F8, hover #FDEBDD, ✕ icon.

*Actions row*
- "+ Ajouter une ligne": outline-black pill, 48px high.
- "Coller une liste de références": #D5DCE3 border pill, toggles the paste panel.

*Paste panel*
- Background #F4F6F8, radius 18, padding 16.
- Textarea label: "Une référence et une quantité par ligne". 5 rows; placeholder "CUIV0006 3⏎CLIM00080 5".
- Blue button "Ajouter à la liste".

**FrequentRefs ("Vos références fréquentes")**
- White, radius 24, padding cardP. H2 24px.
- Row layout: thumbnail 52×42 (#EEF3FA, radius 10), ref (14px/800, min-width 104), name, price (15px/700), button 40px high.
  - Ref and name sit side by side on desktop and stack on mobile.
- The button reads "Ajouter", or "+1" with #E8EFF8 background and #0B5CAD border when the reference is already in the list.

**OrderSummary aside ("Récapitulatif")**
- Rendered whenever W ≥ 760, sticky top 88. Below 1100 it drops under the table.
- White, radius 24, padding cardP.
- Rows: "Lignes valides" {n}, "Articles" {n}.
- Error line (#C4501A): "{n} ligne à corriger ne sera pas ajoutée." / "{n} lignes à corriger ne seront pas ajoutées."
- Divider.
- "Total prix public" with a 30px/800 amount.
- "Votre prix" with the "[TARIF REVENDEUR]" badge.
- "Ajouter au panier" (orange).
- "Demander un devis pour cette liste" (outline) → Demander un devis.dc.html?pro=1.

**MobileOrderBar** (mobile only)
- Fixed bottom, white, shadow `0 -12px 32px -16px rgba(14,40,70,.35)`.
- Padding: 12px 16px + safe-area inset.
- Text: "{n} lignes · {n} articles" (13px) and the total (22px/800). Orange "Ajouter au panier" button.
- Footer padding-bottom becomes 96.

Brands, FAQ and CTA band are removed on this page.

### 4. Behaviour
- **Default rows:**

| Row | Ref | Qty | State |
|---|---|---|---|
| r1 | CUIV0005 | 4 | valid |
| r2 | CUIV0018 | 2 | valid |
| r3 | GAZ00042 | 1 | valid |
| r4 | CLIM00076 | 10 | valid |
| r5 | CUIV0099 | 1 | unknown-reference error |
| r6 | CUIV00 | 1 | autocomplete open; `ac='r6'` initially |

  - The r6 matches are CUIV0005, CUIV0006 and CUIV0018.
  - Starting totals: 4 valid lines, 17 articles, 9 790 Dhs, and 1 line to correct.
- **Matching:** a reference matches when its key starts with the input, or its name (uppercased) contains the input. Lookup is case-insensitive and trimmed.
- **Blur:** the autocomplete closes after 120 ms. A non-matching reference then becomes an error.
- **Add row:** adds an empty row and opens autocomplete on it.
- **Paste parsing:** each line is matched with `/^(\S+)[\s;,x×]*(\d+)?/i`. Missing quantity defaults to 1. An existing reference gets its quantity summed; otherwise a new row is added. Unknown references are added and show as errors.
- **Frequent refs:** "Ajouter" adds qty 1 or increments an existing row, and removes empty rows.
- **Add to cart (`toCart`):** only when there is at least one valid line. Adds the item count to the cart and shows a toast "{nLines} lignes ajoutées au panier" (always plural). Invalid lines are skipped. The rows are not cleared.
- **Pro price:** never computed; only the "[TARIF REVENDEUR]" placeholder is shown.
- **No auth guard and no query-string states** beyond the shared ones.

### 5. Data
- **Frequent refs:** CUIV0006, CLIM00080, CLIM00319, VENT0135, D13AJH.N, with names and prices from QC.
- **Catalogue:** the QC table listed under Espace professionnel.

### 6. Responsive: 390 vs 1440
- **At 1440:** the account pill is in the header. The 6-column table sits next to a 380px sticky summary.
- **At 390:**
  - Rows are cards; the account row sits under the H1; the fixed bottom bar replaces the summary aside.
  - The aside is hidden on mobile, so **"Demander un devis pour cette liste" and the error count are not available there**.
  - The frequent-refs ref and name stack.

---

## Solutions professionnelles.dc.html

### 1. Identity and links
- **Purpose:** hub of the B2B sector pages.
- **`<title>`:** "Climatisation professionnelle au Maroc · Ariha Froid"
- **H1:** "Climatisation professionnelle au Maroc"
- **Breadcrumb:** Accueil › Solutions professionnelles
- **Links to:**
  - Restaurants.dc.html (the only real sector page).
  - `Solutions professionnelles.dc.html#{hotel|bureau|shop|ecole|clinique|villa|froid}` — anchors that don't exist on the page.
  - "Demander un devis.dc.html?pro=1", tel:+212666602599.

### 2. Sections

**HubHeader**
- Grid: `minmax(0,1fr) auto` on desktop, `1fr` below 1100. Gap 24px 48px, align end.
- H1, then a paragraph (19px/1.55, #3C4043, max 720): "Hôtels, restaurants, bureaux, commerces : chaque espace a ses contraintes. Ariha Froid étudie, fournit et installe la solution adaptée, partout au Maroc, depuis 2008."
- Buttons (nowrap; column and full-width on mobile):
  - "Demander un devis" (orange) → Demander un devis.dc.html?pro=1
  - "Appeler le 0666-602599" (outline) → tel

**SectorCard grid** (padding-top 40)
- Visually hidden H2 "Secteurs" (`position:absolute; left:-9999px`).
- Grid c4: 1 / 2 / 4 columns, gap 16.
- Card (link): white, radius 24, overflow hidden. Hover lifts by −4px with shadow `0 24px 50px -32px rgba(14,40,70,.45)`.
- Visual area: aspect-ratio 4/3 with the sector bg colour. Content is either the photo (cover) or an SVG scene:
  - viewBox 240×160, stroke 2.4, path 1 blue / path 2 orange, width 78%, max-height 86%.
- Text block: padding 18px 20px 20px. Title 19px/700, tagline 15px #3C4043. Arrow in a 44px #F4F6F8 circle.

**StepList (horizontal), "Comment se déroule un projet"**
- `<ol>` in the c4 grid.
- Cards: white, radius 20, padding 24, gap 12. Number circle 44px blue. H3 19px/700, paragraph 16px/1.5 #3C4043.

**CtaBand (blue)**
- Background #0B5CAD, radius 28, padding 48/24.
- H2 (white): "Parlons de votre projet".
- Paragraph 17px, #E3ECF7: "Projets et revendeurs : 0666-602599, du lundi au samedi de 9h à 19h."
- Buttons:
  - "Demander un devis" (orange) → Demander un devis.dc.html?pro=1
  - "Appeler le 0666-602599" (white, hover #E8EFF8)

### 3. Behaviour
Static page. No states or forms.

### 4. Responsive
- Sector and step grids: 1 column (390) / 2 (tablet) / 4 (1440).
- The header stacks below 1100.

### 5. Data

**Sectors (SECT)** — key, name, tagline, bg, image, href

| Key | Name | Tagline | bg | Image | href |
|---|---|---|---|---|---|
| hotel | Hôtels et riads | Confort silencieux dans chaque chambre | #DCE8F5 | uploads/pasted-1791236697258-0.png (alt = name) | #hotel |
| resto | Restaurants et cafés | Salle fraîche, cuisine ventilée | #FCE6D6 | scene | Restaurants.dc.html |
| bureau | Bureaux et open spaces | Une température stable toute la journée | #E8EFF8 | scene | #bureau |
| shop | Commerces et boutiques | Accueillir vos clients au frais | #FDF0E6 | scene | #shop |
| ecole | Écoles et crèches | Des salles de classe confortables | #DCE8F5 | scene | #ecole |
| clinique | Cliniques et cabinets | Air maîtrisé pour vos patients | #FCE6D6 | scene | #clinique |
| villa | Villas et résidences | Climatisation discrète, pièce par pièce | #E8EFF8 | scene | #villa |
| froid | Chambres froides | Froid commercial pour la conservation | #FDF0E6 | scene | #froid |

**Scene SVG paths (SCN)** — [blue path, orange path]; viewBox 240×160
- **hotel:**
  - `M16 140h208 M36 140v-28h124v28 M36 112V80h22v32 M58 112h102 M64 112v-8a6 6 0 0 1 6-6h28a6 6 0 0 1 6 6v8 M178 140v-30h28v30 M178 122h28`
  - `M96 26h80v18H96z M104 38h64 M114 52l-4 8 M136 52v9 M158 52l4 8 M192 110V96 M184 96h16l-3-10h-10z`
- **resto:**
  - `M16 140h208 M64 104h112 M120 104v36 M100 140h40 M56 140V92 M56 114h18v26 M184 140V92 M184 114h-18v26`
  - `M120 14v22 M106 50a14 14 0 0 1 28 0z M104 92h12v12h-12z M128 96h14v8h-14z M150 22h60v12h-60z M158 40l-4 6 M180 40v7 M202 40l4 6`
- **bureau:**
  - `M16 140h208 M36 100h128 M46 100v40 M154 100v40 M76 100V70h54v30 M96 100h14 M186 140v-22 M174 118h26 M188 118V94h14`
  - `M150 24h70v16h-70z M158 34h54 M166 48l-3 6 M185 48v7 M204 48l3 6 M86 80h34`
- **shop:**
  - `M16 140h208 M36 44h124 M48 44v12 M72 44v12 M96 44v12 M120 44v12 M144 44v12 M40 56l8 40h0l8-40 M64 56l8 46 8-46 M88 56l8 38 8-38 M112 56l8 44 8-44 M136 56l8 40 8-40`
  - `M168 140v-36h52v36 M168 118h52 M180 104V92h28v12`
- **ecole:**
  - `M16 140h208 M50 26h140v62H50z M116 88v10 M124 88v10 M36 122h54 M44 122v18 M82 122v18 M150 122h54 M158 122v18 M196 122v18`
  - `M66 46h56 M66 60h86 M66 72h40 M170 74l10-10`
- **clinique:**
  - `M16 140h208 M36 106h124 M46 106v34 M150 106v34 M36 106V94h40v12 M176 140V96h36v44 M176 112h36`
  - `M194 30v32 M178 46h32 M86 64h60 M116 64v30`
- **villa:**
  - `M16 140h208 M36 140V82l64-46 64 46v58 M80 140v-36h40v36 M52 98h20v18H52z M128 98h20v18h-20z`
  - `M176 140v-36h44v36z M198 122m-11 0a11 11 0 1 0 22 0a11 11 0 1 0-22 0 M90 64h20v12H90z`
- **froid:**
  - `M16 140h208 M56 140V28h128v112 M70 40h100v88H70z M156 76v24`
  - `M120 58v40 M100 78h40 M106 64l28 28 M134 64l-28 28 M114 52l6 6 6-6 M114 104l6-6 6 6`

**Project steps (PSTEPS)**
1. "Visite technique" — "300 Dhs. Un technicien mesure les lieux et vous conseille."
2. "Devis détaillé" — "Appareils, accessoires et pose, ligne par ligne."
3. "Livraison et installation" — "Livraison gratuite et pose par nos techniciens."
4. "Service après-vente" — "Nous restons joignables après la pose."

---

## Restaurants.dc.html (sector template)

### 1. Identity and links
- **Purpose:** sector landing page (template for the other sectors).
- **`<title>`:** "Climatisation pour restaurants et cafés au Maroc · Ariha Froid"
- **H1:** "Climatisation pour restaurants et cafés au Maroc"
- **Breadcrumb:** Accueil › Solutions professionnelles › Restaurants et cafés
- **Links to:**
  - Climatisation.dc.html?type=Cassette, ?type=Gainable
  - Categorie Climatiseurs muraux.dc.html
  - Produit LG Dual Inverter.dc.html; the other products fall back to Climatisation.dc.html
  - Ventilation.dc.html, Gaines.dc.html
  - Solutions professionnelles.dc.html, plus its #hotel / #bureau / #shop / #villa anchors
  - tel:+212666602599
  - WhatsApp, prefilled text "Bonjour, je souhaite un devis de climatisation pour un restaurant."
  - #devis

### 2. Sections

**SectorHero**
- Background #FCE6D6, radius 28, overflow hidden.
- Grid: `1fr 1fr` on desktop, `1fr` below 1100. Min-height 480 on desktop, 0 below.
- **Text column**
  - Padding: 56 (desktop) / `40px 40px 0` (tablet) / `28px 20px 0` (mobile). Gap 20.
  - Eyebrow chip "Solutions professionnelles": 14px/700, #C4501A on white, radius 8, padding 4px 10px.
  - H1.
  - Paragraph 19px/1.55, max 560: "Une salle agréable en plein été, une cuisine bien ventilée, une installation qui se fait oublier."
  - Buttons:
    - "Demander un devis" (orange) → #devis
    - "Commander par WhatsApp" (green, with icon)
- **Art column**
  - The resto SVG scene, stroke 2, max-width 560.
  - Min-height 380 / 280 / 200 (desktop / tablet / mobile).
  - Padding `24px 48px`; `12px 20px 24px` on mobile.

**SectorIntro**
- max-width 860. Paragraph 19px/1.65: "Dans un restaurant, la climatisation travaille dur : la salle se remplit d'un coup, la cuisine dégage de la chaleur et les portes s'ouvrent sans arrêt. Nous choisissons avec vous les appareils, la ventilation et l'emplacement des unités pour que la salle reste agréable sans gêner le service."

**ProblemGrid ("Les contraintes d'un restaurant")**
- Grid c4 (1 / 2 / 4 columns).
- Cards: white, radius 20, padding 24. Icon tile 52, radius 16, background #FDF0E6.
- H3 19px/700. Text 16px/1.5, #3C4043.

**SolutionCards ("Quelle climatisation choisir ?")**
- Grid c3 (1 / 3 columns).
- Link cards: radius 24, padding 24, gap 16, coloured background.
- Art box 170px high. H3 24px/700. Text 16px/1.5.
- CTA text 16px/700, #0B5CAD, with an arrow, at the bottom.

**ProductCard grid ("Produits recommandés")**
- Grid c4.
- Article: white, radius 24, padding 20, gap 12; hover lift.
- Badge: 14px/700, outlined, radius 8.
  - Shows the discount "−N %" in #C4501A when there is an old price.
  - Otherwise shows the brand name in #0B5CAD.
- Name link: 21px/500. Ref: 15px, #5F6368 (hidden when there is no ref).
- Art: 150px high.
- Price 28px/800; old price 15px #7A828B line-through; "Économisez X" 14px/700 #C4501A.
- Button "Ajouter au panier": height 54, radius 12, 1.5px #9AA3AD. Hover is black. When added: #1F9D57 fill and "Ajouté au panier ✓" for 1.8 s, plus a toast.

**RangeTiles ("Ventilation et extraction")**
- Grid c2 (1 / 2 columns).
- Link cards: radius 24, padding 28, min-height 280 (240 on mobile), overflow hidden.
- Text max-width 56% (62% on mobile). H3 26px/700.
- White CTA pill: 48px high.
- Absolutely positioned image: right −4%, bottom −8%, width 42% (46% on mobile), with a drop-shadow.

**StepList ("Comment se déroule un projet")**
Identical to the hub page: same PSTEPS, c4 grid.

**ImageBand**
- Visually hidden H2 "En images".
- Grid c3 of figures: aspect-ratio 4/3, radius 24.
- figcaption: white pill at bottom-left, 14px/700.

**QuoteForm section** (`id="devis"`, scroll-margin-top 96)
- Background #E8EFF8, radius 28, padding 48/24.
- Grid: `minmax(0,1fr) 320px` on desktop, `1fr` below 1100.
- Form card: white, radius 24, padding cardP, gap 20. H2 24px: "Demander un devis pour votre restaurant".
- Fields in 2 columns (1 on mobile) — see section 6.
- **Confirmation** (replaces the form):
  - 64px #E3F5EA circle with a #1F9D57 check.
  - H2 24px: "Demande envoyée".
  - Paragraph 17px: "Nous vous rappelons pour organiser la visite technique."
- **Aside** (padding-top 8 on desktop):
  - H2 24px: "Nous vous rappelons rapidement".
  - Phone link: 48px white circle; "Projets et revendeurs"; "0666-602599" (24px/800).
  - WhatsApp button.
  - "Lundi – Samedi, 9h – 19h".

**FaqAccordion ("Questions fréquentes")**

**Other sectors ("Autres secteurs")**
- Header row: H2 + an underlined link "Tous les secteurs" → Solutions professionnelles.dc.html.
- SectorCard grid (c4) for hotel, bureau, shop and villa.

**StickyQuoteBar**
- Appears once the page is scrolled past 140px, at every width.
- Fixed bottom, white, top shadow, padding 12px {gutter}.
- Text: "Climatisation pour restaurants et cafés" (16px/700, ellipsis) and "Visite technique 300 Dhs · 0666-602599" (14px; hidden on mobile).
- Orange "Demander un devis" → #devis.
- Footer padding-bottom becomes 80 (mobile) / 76 while scrolled.

### 3. Behaviour
- **Quote form validation:** only Téléphone (`/^0[5-7]\d{8}$/`). An error shows after the first submit attempt. Success sets `sent`.
- **No consent checkbox. No query-string states.**
- FAQ: first item open by default.
- Product add-to-cart: increments the header count and shows a toast "{name} ajouté au panier".

### 4. Responsive: 390 vs 1440
- **At 390:** hero stacks (text, then art). Every grid is 1 column. Fields are single-column. The sticky bar shows only the title and the button.
- **At 1440:**
  - Hero is 2 columns at 480px.
  - Constraints, products, steps and other sectors are 4 columns.
  - Solutions and the image band are 3 columns; the vent tiles are 2.
  - The form sits next to a 320px aside.

### 5. Data

**Constraints** (icon keys from RI; first path blue, second orange)
1. "Forte affluence" — "La salle se remplit d’un coup aux heures de service." (crowd: `M8 11a3 3 0 1 0 0-6a3 3 0 1 0 0 6z M2 20a6 6 0 0 1 12 0` + `M17 11a2.5 2.5 0 1 0 0-5 M16 14a5 5 0 0 1 6 6`)
2. "Chaleur de la cuisine" — "Fours et plaques réchauffent l’air en continu." (heat: `M12 3c3 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-3 2-5 1 2 2 2 3 2 0-3-1-5 0-7z` + `M4 21h16`)
3. "Portes souvent ouvertes" — "L’air frais s’échappe à chaque passage." (door: `M5 21V3h10v18 M3 21h18` + `M15 5l5-1v17l-5-2 M12 12h.01`)
4. "Bruit et esthétique en salle" — "Des unités discrètes, peu visibles et silencieuses." (quiet: `M4 9v6h4l5 4V5L8 9z` + `M17 9l4 6 M21 9l-4 6`)

**Recommended solutions** (title, text, art, bg, CTA, href)
1. **Cassette** — "Au plafond, l’air est diffusé sur quatre côtés : adapté aux grandes salles."
   - Art: draw('cassette', 52%). bg #E8EFF8.
   - CTA "Voir les cassettes" → Climatisation.dc.html?type=Cassette
2. **Gainable** — "Invisible, intégré au faux plafond, avec des grilles discrètes."
   - Art: draw('gainable', 100%). bg #FDF0E6.
   - CTA "Voir les gainables" → Climatisation.dc.html?type=Gainable
3. **Mural Inverter** — "Pour une petite salle ou un comptoir, simple à installer."
   - Art: img uploads/clima-cut2.png. bg #DCE8F5.
   - CTA "Voir les climatiseurs muraux" → Categorie Climatiseurs muraux.dc.html

**Recommended products**
| Key | Name | Brand | Ref | Price | Old price | Art | Badge | Savings line | Link |
|---|---|---|---|---|---|---|---|---|---|
| ATNW18GPLS1 | LG Cassette Inverter 18000 BTU | LG | ATNW18GPLS1 | 12 500 Dhs | — | cassette, width 50% | "LG" | — | Climatisation.dc.html |
| ABNW36GM2S1 | LG Gainable Inverter 36000 BTU | LG | ABNW36GM2S1.ENWBME | 14 200 Dhs | 15 200 | gainable | "−7 %" | "Économisez 1 000 Dhs" | Climatisation.dc.html |
| carrier-gain-60 | Carrier Gainable On/Off 60000 BTU | Carrier | (none) | 20 900 Dhs | — | gainable | "Carrier" | — | Climatisation.dc.html |
| D24AKH-N | LG Dual Inverter 24 000 BTU | LG | D24AKH-N | 8 900 Dhs | 9 500 | img uploads/clima-cut2.png | "−6 %" | "Économisez 600 Dhs" | Produit LG Dual Inverter.dc.html |

No stock data and no pro prices.

**Ventilation and extraction tiles**
1. **Ventilation** — "Ventilateurs de gaine pour l’extraction de la cuisine et le renouvellement d’air."
   - CTA "Voir la ventilation" → Ventilation.dc.html
   - Image uploads/ventilateur-cut.png, bg #E8EFF8
2. **Gaines** — "Gaines circulaires et flexibles pour relier les bouches et l’extraction."
   - CTA "Voir les gaines" → Gaines.dc.html
   - Image uploads/gaines-cut.png, bg #FDF0E6

**Image band**
1. "La salle" — bg #FCE6D6, resto scene at 72%.
2. "L’accueil" — bg #DCE8F5, photo uploads/pasted-1791236697258-0.png, alt "Espace d’accueil climatisé".
3. "Le comptoir" — bg #E8EFF8, shop scene at 72%.

**FAQ**
1. **Q:** "Quelle climatisation pour une grande salle ?"
   **A:** "La cassette ou le gainable répartissent l’air dans toute la salle. Le choix dépend du plafond et de la surface : la visite technique permet de trancher."
2. **Q:** "Faut-il traiter la cuisine à part ?"
   **A:** "Oui. La cuisine a besoin d’extraction et de ventilation en plus de la climatisation de la salle."
3. **Q:** "Combien coûte la visite technique ?"
   **A:** "300 Dhs. Le devis détaillé suit la visite."

**Not present on this page:** case studies, figures/statistics, "Guides associés", or an equipment list beyond the items above.

### 6. Quote form fields
| Label | Type | Required / validated | Default or placeholder |
|---|---|---|---|
| Nom | text, `autocomplete=name` | not validated | — |
| Établissement | text, `autocomplete=organization` | not validated | — |
| Téléphone | tel | validated | error: "Saisissez 10 chiffres, par exemple 06 12 34 56 78." |
| E-mail (optionnel) | email | no | — |
| Ville | select | no | default Marrakech; same 18-city list as Devenir revendeur |
| Surface de la salle en m² (optionnel) | number, min 1 | no | — |
| Type de projet | select, full width | no | default "Nouvelle installation" |
| Message (optionnel) | textarea, full width | no | placeholder "Nombre de couverts, cuisine ouverte, terrasse…" |

- **Type de projet options:** Nouvelle installation, Remplacement, Entretien, Fourniture seule.
- **Submit:** "Envoyer ma demande" (orange). No consent text.

---

## 7. Leftovers, abandoned directions, bugs

- **Home-page dead code in every script:** FAM, NEWS, DUCTS, SUP, RANGES-only mega data, TIERS, SCOPES, `sizeFor`, `duct()`, the bento `catDef`, chips, tiers, brand marquee (`brandsLoop`, `marqueeRef` animate), `perks`, and duplicate keys (`brandCols`, `brandGap`, `brandW`, `brandH` defined twice). The Accueil-derived `post()` adjustments (`cats`, `heroShade`, etc.) are also unused on these pages.
- **`never` flags (shared):**
  - A second drawer button in the header.
  - A bottom pill bar with "Appeler / WhatsApp / Panier {count}".
- **Unused constants:**
  - `VILLES` and `RI` in Solutions professionnelles (copied from Restaurants).
  - `sticky:false` in Restaurants.
  - Espace professionnel has a toast element, but nothing on the page adds to the cart.
- **Hub anchors don't exist:** `Solutions professionnelles.dc.html#hotel|bureau|shop|ecole|clinique|villa|froid` — the hub has no element ids, and only Restaurants exists as a real sector page.
- **Linked files missing from the folder:**
  - Chauffe-eau, Ventilation, Gaines, Pieces de rechange, Froid
  - Produit.dc.html (Produit LG Dual Inverter does exist)
  - Marque Carrier / CIAT / Fitco / Simsek / GS / Lafarga / Alpha / Arfro (only Marque LG exists)
  - CGU, Informations legales, Securite, Confidentialite, Service apres-vente
- **Missing upload assets:** uploads/ only holds New_DZ2.png and the `logo-*-t.png` files. Missing:
  - `pasted-1791221833312-0.png` — the site logo
  - `pasted-1791236697258-0.png` — the hotel/accueil photo
  - `clima-cut2.png`, `chauffe-eau-b0352fa9.png`, `ventilateur-cut.png`, `gaines-cut.png`, `cuivre-cut2.png`, `telecommande-cut2.png`
  - `logo-*.png` (non `-t`)
- **Valid art.js keys:** mural, gainable, cassette, solaire, vent, flex, coilS, coilL, duo, gaz, support, scotch, remote.
- **`align-self` placed inside `style-hover` (only applies on hover):**
  - Devenir revendeur submit (`sendAlign`)
  - Restaurants submit (`sendAlign`) and the aside WhatsApp button
  - Commande rapide paste button (also `height:48px`) and the mobile bar button
- **Mobile layout bug:** the Espace professionnel preview on mobile has 4 cells against 3 columns.
- **Logged-in UI is placeholder only:**
  - Commande rapide shows "[SOCIÉTÉ]" and "[TARIF REVENDEUR]".
  - No real pro prices or stock figures appear anywhere, even though the copy promises "Stock à jour".
  - The nav still shows "Devenir revendeur" when logged in.
  - Login is fake: any id plus a password of 8+ characters works.
- **Copy/state inconsistencies:**
  - The Commande rapide toast always says "lignes" (plural).
  - On Connexion, a forgot-password submit with an empty field gives no feedback.
  - Devenir revendeur collects a password but never validates it, nor the e-mail or contact name.

## 8. Design tokens not in the provided set

**Colours**
| Token | Use |
|---|---|
| #D3DDE8 | input border; preview ref chip |
| #D5DCE3 | qty stepper and "Plus"/secondary pill borders |
| #C9D3DE | search hover border |
| #C3CEDA | unchecked checkbox border |
| #DCE5EF | step connector line |
| #F1F5FA | selected listbox item |
| #EEF3FA | product thumbnail bg (autocomplete, frequent refs) |
| #E3F5EA | success circle and success box |
| #FFF7F2 | error field bg |
| #E6E9EC | header hairline shadow |
| #1877F2 / #E4405F | social icon colours (footer data; not rendered) |

Translucent values:
- rgba(255,255,255,.12) / .2 — hero phone card, normal / hover
- rgba(255,255,255,.14) and .18 — footer socials / dividers
- rgba(14,40,70,.45 / .4 / .35) — shadows
- rgba(8,45,92,…) — leftover hero shades

**Radii**
- 28: page heroes, CTA bands, preview figure, devis section
- 16: icon tiles, autocomplete listbox
- 10: password toggle, thumbnails
- 7: checkbox
- 6: dashed "[TARIF REVENDEUR]" badge

**Other sizes**
- Control heights: 52 (inputs), 48 (ref input / qty / pills), 54 (product card button), 56 (main buttons), 44 (icon buttons).
- Shadows: `0 24px 50px -32px rgba(14,40,70,.45)` (card hover), `0 30px 60px -36px` (preview), `0 -12px 32px -16px rgba(14,40,70,.35)` (bottom bars).
- Font sizes: 34 (Connexion H1), 21 (product name, weight 500), 19 (sector card titles), 13 (table header / bar label).
- Font is Figtree 400–800 throughout; no new font.
