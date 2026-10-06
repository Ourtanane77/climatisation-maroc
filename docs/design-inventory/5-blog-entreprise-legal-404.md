# Design reference report: Blog, Blog catégorie, Article, À propos, Livraison et paiement, CGV, 404

Files are in `D:\AllProjects\LogicTechnologies\climatisation-maroc\design\`. I read all seven pages in full and modified nothing. Each page has 374–425 lines, and individual lines run to 2.7 KB.

## Shared notes (all 7 files)

**Same as the home page:**
- Lines 1–91 match `Accueil.dc.html` except for the `<title>` and the two points below. This covers the header, mega menu and drawer.
- The footer block matches Accueil byte for byte.
- The script is the home-page script plus an `extra(v)` method. Only the data constants (lines ~61–74) and `extra()` differ between pages; I diffed them and report them per page below.

**Header differences from the home page (all 7 pages):**
1. The promo-bar link "Voir les promotions" goes to `Promotions.dc.html`. On the home page it is `#promotions`.
2. Both search inputs (desktop and the mobile `msOpen` one) have `onKeyDown="{{ onQKey }}"`. Pressing Enter with a non-empty query sends you to `Recherche.dc.html?q=<encoded>`.

**Shared query strings (from `componentDidMount`):**
- `?menu=<clim|eau|vent|gaines|cuivre|pieces>` opens that mega menu after 300 ms.
- `?drawer=1` opens the mobile drawer with the `clim` accordion open. `?drawer=<key>` opens that accordion instead.

**Shared layout values:**
- `main` uses `max-width:{{cmax}}`, and `cmax = W` (the viewport width, so there is effectively no cap).
- Side padding is the gutter: 16 px on mobile, 40 px otherwise. Bottom padding is `secGap`: 40 px mobile, 56 px otherwise.
- `extra()` overrides some values: H1 is 34 / 44 / 56 px (mobile <760 / tablet <1100 / desktop). `h2Size` is 32 / 44. `proPad` is 24 / 48.
- Buttons inside CTA bands stack in a column at full width on mobile and sit in a row otherwise.

**Breadcrumb component (all pages except the 404):**
- Container: `padding-top:24px`, 14 px text, gap 8, wraps.
- Earlier crumbs are `#5F6368`, weight 500. The last crumb is `#1A1A1A`, weight 700, with `href="#"`.
- Separator is `›` in `#9AA3AD`.
- Hover colour is `#0B5CAD`.

**ContactCtaBand (reused on several pages):**
- Panel: `#E8EFF8`, radius 28, padding `proPad`, flex with space-between, wraps, gap 24.
- Heading uses `h2Size`, letter-spacing −0.03em. Text is 17 px `#3C4043`, max-width 620.
- Buttons are 56 px tall pills with 0 28 px padding:
  - WhatsApp: `#25D366`, simpleicons WhatsApp icon, hover `filter:brightness(0.95)`.
  - Orange: `#F4731F`, hover `#D85A17`.
  - Outlined: white, `1.5px solid #1A1A1A`, hover black background with white text.

**ArticleCard (Blog, Catégorie, Article "À lire aussi"):**
- Link card: white, radius 24, overflow hidden.
- Hover: `box-shadow:0 24px 50px -32px rgba(14,40,70,0.45)` and `translateY(-4px)`, transition .35s `cubic-bezier(.2,.7,.2,1)`.
- Image area: `aspect-ratio:16/10`, background `a.bg`, padding 20, art centred.
- Body: padding 18px 20px 22px, gap 10.
  - Category tag: 14 px / 700 / `#0B5CAD` on `#E8EFF8`, radius 8, padding 4px 10px.
  - Title: h3, 20 px / 700 / line-height 1.3 / letter-spacing −0.01em.
  - Reading time: 14 px `#5F6368` with a 16 px clock icon, pushed to the bottom with `margin-top:auto`. Text is "N min de lecture".
- Art rendering (`artOf`), in this order:
  - `scene` draws an inline SVG (`RESTO_SCN`, viewBox 240×160, width 72%, stroke 2.4, paths in `#0B5CAD` and `#F4731F`).
  - `img` draws an `<img>` at `width:a.w||92%` with `drop-shadow(0 14px 18px rgba(14,40,70,0.2))`.
  - Otherwise it uses `AFDraw(a.art)` from `art.js`, in a div at `a.w||78%`, with an optional `dark` variant.

### Master article data (`ART`, identical in Blog, Blog catégorie and Article)

None of the articles has a date or an author anywhere. The Article page header shows a `[DATE]` placeholder.

| id | Title (verbatim) | Category | Reading time | Image bg | Art |
|---|---|---|---|---|---|
| puissance | Quelle puissance de climatiseur pour ma pièce ? | Guides d’achat | 6 | #DCE8F5 | img `uploads/clima-cut2.png`; href `Article puissance climatiseur.dc.html`; excerpt below |
| inverter | Climatiseur Inverter ou On/Off : lequel choisir ? | Guides d’achat | 5 | #E8EFF8 | art `mural` |
| types | Mural, gainable ou cassette : quel climatiseur choisir ? | Guides d’achat | 7 | #FDF0E6 | art `cassette`, w 46% |
| gaz | R32 ou R410A : comprendre les gaz frigorigènes | Installation | 5 | #DCE8F5 | art `gaz`, w 30% |
| conso | Comment réduire la consommation de son climatiseur | Conseils d’utilisation | 4 | #FCE6D6 | art `remote`, w 22% |
| entretien | Entretien d’un climatiseur : ce qu’il faut faire chaque année | Conseils d’utilisation | 5 | #E8EFF8 | art `mural`, dark: true |
| solaire | Chauffe-eau solaire : quelle capacité pour ma famille ? | Guides d’achat | 5 | #FDF0E6 | img `uploads/chauffe-eau-b0352fa9.png`, w 60% |
| cuivre | Quel diamètre de cuivre pour quel climatiseur ? | Installation | 4 | #FCE6D6 | art `duo`, w 52% |
| resto | Climatiser un restaurant : les erreurs à éviter | Professionnels | 6 | #DCE8F5 | `scene: true` (restaurant line drawing) |

- Only `puissance` has an excerpt: "Surface, ensoleillement, étage : la méthode simple pour choisir entre 9 000, 12 000, 18 000 et 24 000 BTU, avec le tableau des puissances."
- Every card without an `href` falls back to `Article puissance climatiseur.dc.html`. Only one article page exists.

**Categories:**
- `CATS` (chips): Tous → `Blog.dc.html`; Guides d’achat → `Blog categorie.dc.html?c=guides`; Conseils d’utilisation → `?c=conseils`; Installation → `?c=installation`; Professionnels → `?c=pros`.
- `CATK` (query key to label): guides → Guides d’achat; conseils → Conseils d’utilisation; installation → Installation; pros → Professionnels.

**Category descriptions (`CATX`), verbatim:**
- Guides d’achat: "Puissance, technologie, type d’appareil : les repères pour choisir le bon équipement."
- Conseils d’utilisation: "Réglages, entretien et économies d’énergie au quotidien."
- Installation: "Cuivre, gaz, supports : ce qu’il faut savoir avant la pose."
- Professionnels: "Restaurants, hôtels, bureaux : les points clés d’un projet."

**Leftovers in all 7 files:**
- The `<helmet>` meta description is the home page's on every page: "Climatisation Maroc, boutique d'Ariha Froid à Marrakech depuis 2008. Climatiseurs LG, Carrier, CIAT, Fitco, chauffe-eau, gaines, cuivre et pièces. Livraison gratuite partout au Maroc, paiement à la livraison."
- Each page carries the whole home-page script unused: `FAM`, `NEWS`, `DUCTS`, `SUP`, `TIERS`, bento/cats, hero values, tiers, brand marquee, the `duct()` renderer and so on.
- The `{{ never }}` mobile bottom bar (Appeler / WhatsApp / Panier) is still in the markup.
- `post()` sets `h1Size` for tablet to 32 / 44, but `extra()` always overrides it.

**Links to files that are not in the folder (shared header, drawer, footer):**
- `Chauffe-eau.dc.html`, `Ventilation.dc.html`, `Gaines.dc.html`, `Pieces de rechange.dc.html`, `Froid.dc.html`, `Produit.dc.html?…`
- `Marque <Carrier|CIAT|Fitco|Simsek|GS|Lafarga|Alpha|Arfro>.dc.html`. Only `Marque LG.dc.html` exists.
- Footer legal links `CGU.dc.html`, `Informations legales.dc.html`, `Securite.dc.html`, `Confidentialite.dc.html`, `Service apres-vente.dc.html`. Only `CGV.dc.html` exists, and it serves those pages through `?p=`; see the CGV section.

**Missing images:** the `uploads/` folder holds only `New_DZ2.png` and the nine `logo-*-t.png` files. These are referenced but missing:
- `uploads/clima-cut2.png`, `uploads/chauffe-eau-b0352fa9.png`
- `uploads/pasted-1791221833312-0.png` (the logo), `uploads/ventilateur-cut.png`, `uploads/gaines-cut.png`, `uploads/cuivre-cut2.png`, `uploads/telecommande-cut2.png`, `uploads/pasted-1791236697258-0.png`

**`art.js` keys:** `mural`, `gainable`, `cassette`, `solaire`, `vent`, `flex`, `coilS`, `coilL`, `duo`, `gaz`, `support`, `scotch`, `remote`.

---

## Blog.dc.html

### 1. Purpose, title, H1, breadcrumb, links
- **Purpose:** blog index with one featured guide and a grid of all other articles.
- **`<title>`:** "Conseils et guides climatisation · Climatisation Maroc"
- **H1:** "Conseils et guides climatisation"
- **Breadcrumb:** Accueil (`Accueil.dc.html`) › Blog
- **Links to:** Article puissance climatiseur; Blog categorie (?c=guides, conseils, installation, pros); Demander un devis; WhatsApp.

### 2. Sections, top to bottom
1. **Breadcrumb.**
2. **PageIntro:**
   - Container: `padding-top:24px`, column, gap 12, max-width 820.
   - H1 uses `h1Size` (34 / 44 / 56), line-height 1.05, letter-spacing −0.03em, weight 700, `text-wrap:balance`.
   - Lead text, 19 px / line-height 1.55 / `#3C4043`: "Choisir, installer et entretenir votre climatiseur ou votre chauffe-eau, expliqué simplement."
3. **FeaturedArticle** (`ART[0]`, puissance):
   - Section `padding-top:32px`. The whole card is a link: white, radius 28, overflow hidden, grid.
   - `featCols`: `1fr` below 1100 px, else `minmax(0,1.15fr) minmax(0,1fr)`.
   - Hover: `box-shadow:0 30px 60px -36px rgba(14,40,70,0.45)`.
   - Image panel: bg `#DCE8F5`, `min-height:featImgH` (220 / 300 / 420), padding 32, `<img uploads/clima-cut2.png>` at width 100%, max 560, `drop-shadow(0 20px 26px rgba(14,40,70,0.25))`.
   - Text panel: padding `featPad` (`24px 20px 28px` mobile, `48px` otherwise), gap 16, vertically centred. It contains:
     - Category tag "Guides d’achat".
     - h2 at `featH` (28 / 36 / 44), weight 700, line-height 1.1, letter-spacing −0.025em.
     - Excerpt: 17 px, line-height 1.6, `#3C4043`, max-width 520, clamped to 2 lines.
     - "Lire le guide" pill: 52 px tall, padding 0 24, `#0B5CAD`, white, 16 px / 700, arrow icon.
     - Clock with "6 min de lecture", 15 px `#5F6368`.
4. **CategoryChips plus the article grid:**
   - Section `padding-top:secGap`, column, gap 24. It has a visually hidden h2 "Tous les articles" (`position:absolute;left:-9999px`).
   - **CategoryChips:** `<nav aria-label="Catégories">`, flex, gap 8, horizontal scroll, scrollbar hidden.
     - Each chip: height 44, padding 0 18, radius 999, `border:1.5px solid`, 15 px / 700, no wrap, hover border `#1A1A1A`.
     - Active chip: background, border and text inverted (bg `#1A1A1A`, text `#fff`), `aria-current="page"`. Inactive chip: white, `#E3E8EE` border, `#1A1A1A` text.
     - "Tous" is active here.
   - **ArticleGrid:** `c4` columns (1 col on mobile, 2 below 1100, 4 on desktop), gap 16. Shows `ART.slice(1)`, the 8 non-featured articles, as ArticleCards.
   - **Pagination (static):** centred, gap 8, `padding-top:32px`.
     - Prev "‹" and next "›" buttons are 44 px circles, `1.5px #D5DCE3` border, white, 18 px, disabled, opacity 0.4.
     - The current page "1" is a 44 px black circle, white text, 700, `aria-current="page"`.
5. **ContactCtaBand:**
   - h2 "Besoin d’un conseil ?"
   - Text: "Conseil : 0666-088348, du lundi au samedi de 9h à 19h."
   - Buttons: "Nous écrire sur WhatsApp" → `https://wa.me/212666854184?text=` + encoded "Bonjour, j’ai besoin d’un conseil pour choisir un climatiseur.", and "Demander un devis" (orange) → `Demander un devis.dc.html`.

### 3. Behaviour and state
- Chips are plain links to the category page; there is no client-side filtering.
- Pagination does nothing (everything is on one page).
- This page reads no query strings of its own.

### 4. Responsive (390 vs 1440)
- **390:** one column throughout. The featured card stacks with a 220 px image and 28 px title. Chips scroll sideways. The CTA band stacks its buttons at full width.
- **1440:** the featured card is two columns (1.15 / 1) with a 420 px image and 44 px title. The grid has 4 columns, so 8 cards make 2 rows.
- **Tablet:** featured card stacks (300 px image, 36 px title); grid has 2 columns.

### 5. Data
The `ART`, `CATS` and `CATX` tables above. The featured article is puissance; the grid holds the other 8 in `ART` order.

### 6. Forms
Only the header search (Enter goes to `Recherche.dc.html?q=`).

### 7. Leftovers
- Pagination is a dead stub.
- All article links except the featured one go to the single puissance article.
- Plus the shared leftovers listed above.

### 8. New tokens
- `#D5DCE3`: pagination border.
- Radius 28: featured card and CTA band.
- Featured hover shadow `0 30px 60px -36px rgba(14,40,70,0.45)`.

---

## Blog categorie.dc.html (state `?c=guides`)

### 1. Purpose, title, H1, breadcrumb, links
- **Purpose:** blog listing for one category.
- **`<title>` in the file:** "Guides d’achat · Blog · Climatisation Maroc". The script rewrites it once to `<cat> · Blog · Climatisation Maroc`.
- **H1:** the category label (`{{ catT }}`), "Guides d’achat" for `?c=guides`.
- **Lead text:** `CATX[cat]`.
- **Breadcrumb:** Accueil › Blog (`Blog.dc.html`) › {category}.
- **Links to:** Blog, the other category pages, the article page, Demander un devis, WhatsApp.

### 2. Sections
1. **Breadcrumb.**
2. **PageIntro:** same styling as on Blog (max-width 820, 19 px lead).
3. **Listing section** (`padding-top:28px`, gap 24):
   - CategoryChips with the current category active.
   - Count line, 16 px / 700: "N articles", or "1 article" for a single result.
   - ArticleGrid using `c3` columns (1 col mobile, 2 below 1100, 3 on desktop), gap 16.
   - The same static pagination as on Blog.
   - There is no featured block.
4. **ContactCtaBand:** identical to Blog ("Besoin d’un conseil ?").

### 3. Behaviour and query states
`cat = CATK[c] || 'Guides d’achat'`, and the list is `ART.filter(a => a.cat === cat)` in `ART` order. Supported keys:

| `?c=` | Title | Articles | Count |
|---|---|---|---|
| guides (also the default for a missing or unknown key) | Guides d’achat | puissance, inverter, types, solaire | "4 articles" |
| conseils | Conseils d’utilisation | conso, entretien | "2 articles" |
| installation | Installation | gaz, cuivre | "2 articles" |
| pros | Professionnels | resto | "1 article" |

### 4. Responsive
- **390:** one column, chips scroll sideways.
- **1440:** 3 columns.
- **Tablet:** 2 columns.

### 5. Data
The `ART`, `CATK` and `CATX` tables above.

### 7. Leftovers
- Static pagination.
- Card links fall back to the single article page.

### 8. New tokens
None beyond those listed for Blog.

---

## Article puissance climatiseur.dc.html

### 1. Purpose, title, H1, breadcrumb, links
- **Purpose:** buying-guide article with an inline power calculator, a power table, product suggestions, a table of contents, sharing buttons and related articles.
- **`<title>`:** "Quelle puissance de climatiseur pour ma pièce ? · Climatisation Maroc"
- **H1:** "Quelle puissance de climatiseur pour ma pièce ?"
- **Breadcrumb:** Accueil › Blog (`Blog.dc.html`) › Guides d’achat (`Blog categorie.dc.html?c=guides`) › Puissance du climatiseur.
- **Links to:** Blog, Blog categorie, `Produit LG Dual Inverter.dc.html`, `Categorie Climatiseurs muraux.dc.html` (also with `?puissance=<BTU>`), Demander un devis, the article page itself (via "À lire aussi"), WhatsApp and Facebook share links.

### 2. Sections, top to bottom
1. **Breadcrumb.**
2. **ArticleHeader** (`<header>`, `padding-top:24px`, column, gap 16, max-width 900):
   - Category tag "Guides d’achat".
   - H1 using `h1Size`.
   - Meta row, 15 px `#5F6368`, gap `8px 20px`: "[DATE]" placeholder, then a clock icon with "6 min de lecture".
   - No author.
3. **Two-column layout:** `padding-top:32px`, grid `artCols`, gap 56, `align-items:start`.
   - `artCols` is `minmax(0,1fr)` below 1100 px and `minmax(0,720px) 260px` on desktop.
   - **ArticleBody** (`<article>`): max-width 720, column, gap 20.
   - **Toc (desktop):** right column, sticky; see item 6.
4. **ArticleBody** contents, in order:
   - **Callout "En bref"** (`<aside aria-label="En bref">`):
     - White, radius 20, padding 24px 28px, `box-shadow:inset 0 0 0 1.5px #DCE5EF`, gap 12.
     - h2 "En bref" at 20 px / 700.
     - List items at 18 px, line-height 1.7:
       - "Comptez environ 600 BTU par m² de pièce."
       - "12 000 BTU couvrent une pièce jusqu'à 20 m²."
       - "Prenez la puissance au-dessus si la pièce est très ensoleillée ou sous le toit."
   - **Toc (mobile and tablet only, `mobToc`):** collapsible card, white, radius 20.
     - Toggle button: min-height 56, padding 0 20, 17 px / 700 "Sommaire", chevron rotates 180°. Closed by default.
     - Links: min-height 40, padding 6px 0 6px 14px, 3 px left border, 15 px.
   - **Body paragraphs:** 18 px, line-height 1.75, `#1A1A1A`.
   - **Body h2:** `ah2` (28 / 34), weight 700, letter-spacing −0.02em, line-height 1.15, margin-top 48, `scroll-margin-top:110px`.
   - **Body h3:** 21 px / 700, line-height 1.3, margin-top 12.
   - **Full text, verbatim:**
     - P: "La puissance d'un climatiseur se mesure en BTU. Trop faible, l'appareil tourne sans arrêt sans jamais rafraîchir la pièce. Trop forte, il coûte plus cher à l'achat et refroidit par à-coups. Bonne nouvelle : pour une pièce d'habitation, le calcul tient en une ligne."
     - H2 `#regle`: "La règle simple : 600 BTU par m²"
     - P: "Multipliez la surface de la pièce par 600. Une chambre de 15 m² demande environ 9 000 BTU, un salon de 20 m² environ 12 000 BTU. Cette règle vaut pour une hauteur sous plafond classique, autour de 2,5 m, et une exposition moyenne."
     - **Figure:**
       - Panel: bg `#DCE8F5`, radius 20, `aspect-ratio:16/8`, padding 24. Image `uploads/clima-cut2.png` at 86% width, alt "Climatiseur mural LG Dual Inverter", `drop-shadow(0 18px 22px rgba(14,40,70,0.22))`.
       - Figcaption (15 px `#5F6368`): "Un climatiseur mural LG Dual Inverter. La puissance figure dans le nom du modèle : 9 000, 12 000, 18 000 ou 24 000 BTU."
     - **InlineCalculator** `#calcul`; layout and logic in section 3.
     - H2 `#tableau`: "Tableau des puissances"
     - P: "Les correspondances ci-dessous valent pour une pièce à exposition moyenne."
     - **PowerTable:**
       - Wrapper: white, radius 20, ring `0 0 0 1px #E6EBF0`. Table at 17 px.
       - Header row: bg `#F4F6F8`, cells 15 px / 700 / `#3C4043`, padding 14px 20px. Columns: "Puissance" | "Surface de la pièce".
       - Body rows: `border-top:1px #EEF1F4`. Row header weight 800, no wrap.
       - The row matching the calculator result gets bg `#E8EFF8`; the rest are white.
       - Rows:
         - 9 000 BTU | Jusqu’à 15 m²
         - 12 000 BTU | Jusqu’à 20 m²
         - 18 000 BTU | Jusqu’à 30 m²
         - 24 000 BTU | Jusqu’à 40 m²
         - 30 000 BTU et plus | Au-delà de 40 m²
     - H2 `#au-dessus`: "Quand prendre la puissance au-dessus"
     - P: "Certaines pièces chauffent plus que d'autres. Dans ces cas, choisissez la puissance supérieure à celle du tableau."
     - H3 "Pièce très ensoleillée", then P: "Grandes baies vitrées, façade plein sud ou ouest : le soleil de l'après-midi ajoute beaucoup de chaleur."
     - H3 "Dernier étage", then P: "Sous un toit ou une terrasse, le plafond accumule la chaleur toute la journée et la restitue le soir."
     - H3 "Cuisine ouverte", then P: "Si le salon donne sur la cuisine, la cuisson réchauffe l'ensemble de l'espace. Comptez la surface totale."
     - H3 "Grande hauteur sous plafond", then P: "Au-delà de 2,5 m, le volume d'air à refroidir augmente. Un riad ou une villa avec double hauteur demande plus de puissance."
     - **Callout "Astuce" (tip variant):**
       - Panel: bg `#FDF0E6`, radius 20, padding 20px 24px, gap 16.
       - Icon: 44 px white circle with an orange (`#F4731F`) lightbulb.
       - Strong "Astuce" at 17 px, then text at 17 px / line-height 1.65: "Hésitez entre deux puissances ? Avec un modèle Inverter, la puissance supérieure reste économe : l'appareil ralentit une fois la température atteinte."
     - P: "Pour une pièce de 15 à 20 m², ces deux modèles 12 000 BTU sont parmi les plus demandés :"
     - **InlineProductCard ×2:**
       - Grid `pcCols` (1 col mobile, else 2 cols), gap 12.
       - Card: white, radius 20, padding 16, flex row, gap 16, ring `0 0 0 1px #E6EBF0`.
       - Thumbnail link: 110×84, radius 14, bg `#EEF3FA`, padding 8.
       - Name: 16 px / 700, link, hover `#0B5CAD`.
       - Price 22 px / 800, followed by the old price at 14 px `#7A828B`, struck through.
       - Add button: height 40, padding 0 14, radius 999, `1.5px` border.
       - Products:
         1. "LG Dual Inverter 12 000 BTU": 5 700 Dhs, was 6 500 Dhs, img `uploads/clima-cut2.png`, link `Produit LG Dual Inverter.dc.html`. The ref is not shown; home-page data gives D13AJH.N.
         2. "Fitco Mural Inverter 12 000 BTU": 4 000 Dhs, was 4 900 Dhs, drawn art `mural`, link `Categorie Climatiseurs muraux.dc.html`. The ref is not shown; home-page data gives FSW12T24PM/N.
     - H2 `#inverter`: "Inverter ou On/Off"
     - P: "Un climatiseur On/Off fonctionne à pleine puissance puis s'arrête, et ainsi de suite. Un modèle Inverter fait varier la vitesse de son compresseur : il refroidit vite, puis maintient la température en douceur."
     - P: "Résultat : moins de bruit, une température plus stable et une consommation réduite. Pour une pièce occupée tous les jours, l'Inverter est le meilleur choix. L'On/Off reste une option économique à l'achat pour une pièce utilisée de temps en temps."
     - **ShareBar:**
       - `border-top:1px #DCE5EF`, margin-top 32, padding-top 24, gap 12, wraps.
       - Label "Partager", 16 px / 700.
       - Buttons are 44 px tall pills, padding 0 16, 15 px / 700:
         - "WhatsApp": `#25D366`, link `https://wa.me/?text=` + encoded "Quelle puissance de climatiseur pour ma pièce ? <url>".
         - "Facebook": `#1877F2`, link `https://www.facebook.com/sharer/sharer.php?u=<url>`.
         - "Copier le lien": white, `1.5px #D5DCE3` border.
       - `url` is the page URL with the query string removed.
5. **Toc (desktop only, `deskToc` = W ≥ 1100):**
   - `<nav>` sticky at `top:110px`, column, gap 4.
   - Label "SOMMAIRE": 13 px / 700, letter-spacing .04em, `#5F6368`.
   - Links: min-height 40, padding 6px 0 6px 14px, `border-left:3px`. Active link is `#0B5CAD` border and text at 700, with `aria-current="location"`. Inactive is `#DCE5EF` border, `#3C4043` text, 500.
   - Entries:
     - "La règle simple : 600 BTU par m²"
     - "Tableau des puissances"
     - "Quand prendre la puissance au-dessus"
     - "Inverter ou On/Off"
   - Below them, a calculator shortcut card (link to `#calcul`): bg `#E8EFF8`, radius 16, padding 16. "Calculateur" in strong 15 px, then "Votre puissance en deux réglages" at 14 px `#3C4043`.
6. **Related articles ("À lire aussi"):**
   - Section `padding-top:secGap`, h2 at `h2Size`, margin-bottom 24.
   - Grid `c3` (1 / 2 / 3 columns), gap 16.
   - Three ArticleCards: inverter, types, conso. All three link to the puissance article (fallback).
7. **ContactCtaBand:**
   - h2 "Besoin d’aide pour choisir ?"
   - Text: "Conseil : 0666-088348, du lundi au samedi de 9h à 19h."
   - Same buttons as Blog, with the same WhatsApp text.

### 3. Behaviour and state
**InlineCalculator:**
- Box: bg `#0B5CAD`, white text, radius 24, padding `calcPad` (20 / 28), gap 18, `scroll-margin-top:110px`.
- h3 "Calculez votre puissance", 22 px.
- Input grid `calcCols`: `1fr` on mobile, else `200px minmax(0,1fr)`, gap 12.
- **"Surface de la pièce"** stepper:
  - Label 15 px / 700. Field: white, height 52, radius 12.
  - "−" and "+" buttons are 48 px. The input is centred, 18 px / 800, `inputmode="numeric"`, with an "m²" unit.
  - Default 18. The value is clamped to 8–60.
- **"Ensoleillement"** radio group with "Peu de soleil", "Ensoleillée" (default) and "Très ensoleillée":
  - Buttons: height 52, radius 12, `1.5px` border, 15 px / 700.
  - Selected: white background and border, `#0B5CAD` text. Unselected: transparent, `rgba(255,255,255,0.45)` border, white text.
- **Result card:** white, radius 18, padding 18px 20px.
  - "Puissance conseillée :" (15 px `#3C4043`), then the value at 30 px / 800, then a 14 px note.
  - Orange CTA, 56 px tall.
- **Logic** (`sizeFor`):
  - Tier index from surface: ≤15 → 0, ≤20 → 1, ≤30 → 2, ≤40 → 3, else 4.
  - "Très ensoleillée" bumps the tier by one, capped at 4. "Peu de soleil" behaves the same as "Ensoleillée".
  - Value shown: the tier label, with "30 000 +" rendered as "30 000 BTU et plus".
  - Note: "Puissance relevée d’un cran pour une pièce très ensoleillée." when the tier was bumped, otherwise "Pour {surface} m² · {jusqu’à NN m² | au-delà de 40 m²}." in lowercase. The default reads "18 000 BTU" / "Pour 18 m² · jusqu’à 30 m²."
  - CTA for tiers 0–3: "Voir les climatiseurs {9 000 BTU|…}" → `Categorie Climatiseurs muraux.dc.html?puissance={9000|12000|18000|24000}`.
  - CTA for tier 4: "Demander conseil" → `Demander un devis.dc.html`.
  - The power table highlights the matching row live.

**Toc scroll-spy:**
- On scroll, the active id is the last heading in (`regle`, `tableau`, `au-dessus`, `inverter`) whose top is above 160 px.
- Clicking a link smooth-scrolls to the element top minus 100 px.
- The highlight only shows on desktop; in the mobile Toc every link is inactive.
- The mobile Toc does not close after a click (the CGV one does).

**Add to cart:**
- The button changes to "Ajouté ✓" with green fill and border `#1F9D57` for 1.8 s.
- The cart count goes up by one.
- A toast shows "{name} ajouté au panier" for 2.2 s.

**Copy link:** label changes to "Lien copié" for 2 s.

No page-specific query strings.

### 4. Responsive (390 vs 1440)
- **390:** single column; Toc becomes the collapsible "Sommaire" card under "En bref"; body h2 28 px; calculator padding 20 with stacked inputs; product cards stacked; related articles 1 column.
- **1440:** 720 px article column plus a 260 px sticky Toc with the calculator shortcut; body h2 34 px; calculator inputs `200px | 1fr`; products 2 columns; related articles 3 columns.
- **Tablet:** single column with the mobile Toc, but products in 2 columns.

### 5. Data
All of it is listed above. The 6 min reading time and the "Guides d’achat" category are hard-coded.

### 7. Leftovers
- `tbl` array is computed but unused; the table markup is hard-coded.
- The orange CTA's hover style changes its size (`height:52px;padding:0 22px`), which looks like a copy-paste artefact.
- `[DATE]` placeholder, no author.
- "À lire aussi" cards all link to the same article.
- The Fitco product links to a category page, not a product.

### 8. New tokens
- Colours: `#DCE5EF` (inset rings, TOC rail, divider), `#EEF3FA` (product thumbnail bg), `#D5DCE3`, `#1877F2` (Facebook), `rgba(255,255,255,0.45)`.
- Radius 16 (calculator shortcut card), radius 28 (CTA band).

---

## A propos.dc.html

### 1. Purpose, title, H1, breadcrumb, links
- **Purpose:** company page.
- **`<title>`:** "À propos · Ariha Froid · Climatisation Maroc"
- **H1:** "Ariha Froid, la climatisation à Marrakech depuis 2008"
- **Breadcrumb:** Accueil › À propos
- **Links to:** Climatisation, Service (and `Service.dc.html?s=sav`), Solutions professionnelles, `Marque <brand>.dc.html` ×9 (only LG exists), Google Maps directions, Contact, Demander un devis.

### 2. Sections, top to bottom
1. **Breadcrumb.**
2. **AboutHero:**
   - `margin-top:24px`, bg `#0B5CAD`, white, radius 28, padding `heroPad` (`32px 20px` / `48px 40px` / `56px`).
   - Grid `heroCols`: `1fr` below 1100, else `minmax(0,1.2fr) minmax(0,0.8fr)`; gap 32.
   - Left: H1 (white) and lead text (19 px, `#E3ECF7`, max-width 600): "Un fournisseur de climatisation et de froid, deux magasins à Marrakech et une boutique en ligne qui livre partout au Maroc."
   - Right: photo slot, `rgba(255,255,255,0.12)`, radius 24, `min-height:slotH` (180 / 300). It shows a white chip "[PHOTO MAGASIN]" (15 px / 700, `#0B5CAD`, radius 8, padding 6px 12px).
3. **Intro paragraph:** `padding-top:secGap`, max-width 860, 21 px / line-height 1.6. Text: "Climatisation Maroc est la boutique en ligne d'Ariha Froid, fournisseur de climatisation et de froid à Marrakech depuis 2008. Nous vendons et installons tous types de systèmes de climatisation, pour les professionnels comme pour les particuliers, à Marrakech et dans les autres villes du Maroc."
4. **ServiceCards, "Ce que nous faisons":**
   - Grid `c4` (1 / 2 / 4 columns), gap 16.
   - Each card is a link: white, radius 20, padding 24, gap 14. Hover: shadow plus `translateY(-3px)`.
   - Icon tile: 52 px, radius 16, `#E8EFF8`, two-tone 26 px SVG (`#0B5CAD` and `#F4731F` strokes).
   - h3 19 px; text 16 px `#3C4043`.

| Title | Text | Icon | Link |
|---|---|---|---|
| Vente en ligne | Climatiseurs, chauffe-eau, ventilation, cuivre et pièces, livrés partout au Maroc. | cart | Climatisation.dc.html |
| Installation | Pose et mise en service par nos techniciens, sur devis. | wrench | Service.dc.html |
| Service après-vente | Diagnostic, réparation et pièces de rechange. | sav | Service.dc.html?s=sav |
| Projets professionnels | Hôtels, restaurants, bureaux : étude, fourniture et installation. | crane | Solutions professionnelles.dc.html |

5. **Commitments, "Nos engagements" (a ReassuranceBar variant):**
   - Panel: `#FDF0E6`, radius 28, padding `proPad`. Grid `c4`, gap 16.
   - Items: white, radius 20, padding 20, row, gap 14. Icon is a 48 px circle on `#FDF0E6`; text 17 px / 700.
   - Items:
     - "Livraison gratuite partout au Maroc" (truck)
     - "Paiement à la livraison" (cash)
     - "Solutions clés en main sous 48 h ouvrées" (clock)
     - "Marques officielles" (badge)
6. **BrandLogos, "Nos marques":**
   - White panel, radius 24, padding 24. Grid `brCols` (3 / 5 / 9 columns), gap 24px 16px, items centred.
   - Each logo links to `Marque X.dc.html` with `aria-label`, min-height 72.
   - Image `uploads/logo-<x>-t.png`, sized by equal area: A = 2400 on mobile, 4000 otherwise; max height 40 / 54; max width 96 / 130.
   - Aspect ratios: lg 2.05, carrier 2.52, ciat 2.01, fitco 0.69, simsek 3.47, gs 1.23, lafarga 4.64, alpha 3.09, arfro 3.38.
   - Order: LG, Carrier, CIAT, Fitco, Simsek, GS, Lafarga, Alpha, Arfro.
   - LG only shows the tag "Distributeur officiel" (12 px / 700, `#0B5CAD`).
7. **StoreCards, "Nos magasins à Marrakech":**
   - Grid `c2` (1 col on mobile, else 2), gap 16.
   - Card: white, radius 24. Photo slot `aspect-ratio:16/7` with a coloured bg and placeholder chip. Body padding 24, gap 10.
   - h3 22 px; `<address>` 17 px; hours "Lundi – Samedi, 9h – 19h" at 15 px `#3C4043`.
   - "Itinéraire" outlined button (56 px), opens in a new tab: `https://www.google.com/maps/dir/?api=1&destination=<encoded address>`.
   - Stores:
     - **Magasin Sakar:** "Lot Sakar Villa 107, Marrakech 40070", bg `#DCE8F5`, slot "[PHOTO MAGASIN]".
     - **Magasin Al Manar:** "Magasin 60-2, Imm 50 Al Manar, Marrakech 40100", bg `#FCE6D6`, slot "[PHOTO ÉQUIPE]".
8. **ContactCtaBand:**
   - h2 "Parlons de votre projet"
   - Text: "Ventes : 0666-854184 · Projets et revendeurs : 0666-602599"
   - Buttons: "Nous contacter" (outlined) → `Contact.dc.html`; "Demander un devis" (orange) → `Demander un devis.dc.html`.

### 3. Behaviour
Hover effects only. No query states. There is **no Timeline and no StatGrid**: the only history figure is "depuis 2008".

### 4. Responsive
- **390:** hero stacks with a 180 px slot and 32px 20px padding; every grid is one column except brands (3 columns); CTA buttons stack.
- **1440:** hero is two columns with a 300 px slot; services and commitments 4 columns; brands 9 in one row; stores 2 columns.
- **Tablet:** hero stacks with 48/40 padding; services and commitments 2 columns; brands 5 columns.

### 7. Leftovers
- `faqs()` helper defined, unused.
- `LEGAL` object defined, unused (same as in CGV).
- `waHref` set to `wa('')`, unused.
- `c3` and `cardP` unused.
- Photo placeholders still in place.
- The "Itinéraire" hover style changes its size (`align-self`, height 48, padding, margin-top), which looks like an artefact.

### 8. New tokens
- `rgba(255,255,255,0.12)` (hero photo slot).
- Radius 16 (icon tile) and radius 28.
- Hero lead colour `#E3ECF7` is already in the token set.

---

## Livraison et paiement.dc.html

### 1. Purpose, title, H1, breadcrumb, links
- **Purpose:** delivery and payment information page.
- **`<title>`:** "Livraison et paiement · Climatisation Maroc"
- **H1:** "Livraison et paiement"
- **Breadcrumb:** Accueil › Livraison et paiement
- **Links to:** `Service.dc.html?s=sav`, `Suivi commande.dc.html`.

### 2. Sections
1. **Breadcrumb.**
2. **PageIntro:**
   - Max-width 820, lead 19 px.
   - Text: "Vous commandez en ligne ou par WhatsApp, nous livrons gratuitement partout au Maroc et vous payez à la réception."
3. **BigPromiseCards:**
   - Section `padding-top:32px`. Grid `c3`: 1 column on mobile, 3 columns otherwise (this page has no tablet step). Gap 16.
   - Card: coloured bg, radius 28, padding `bigP` (24 / 32), `min-height:bigH` (0 on mobile / 300), column with space-between, gap 24.
   - Icon tile: 64 px, radius 20, white, two-tone 32 px SVG.
   - h2 at `bigFs` (24 / 28), weight 700, letter-spacing −0.02em. Text 16 px.

| Title | Text | Icon | Bg |
|---|---|---|---|
| Livraison gratuite partout au Maroc | Pour toutes les commandes, dans toutes les villes. | truck | #DCE8F5 |
| Paiement à la livraison | Vous réglez à la réception de votre commande. Rien à payer en ligne. | cash | #FCE6D6 |
| Installation par nos techniciens (sur devis) | Pose, raccordement et mise en service. Visite technique : 300 Dhs. | wrench | #E8EFF8 |

4. **Steps, "Comment se passe une commande"** (`<ol>`):
   - Grid `c4` (1 / 2 / 4 columns), gap 16.
   - Item: white, radius 20, padding 24, gap 12. Number badge is a 44 px circle, `#0B5CAD`, white, 18 px / 800.
   - h3 19 px; text 16 px `#3C4043`.
   - Steps:
     1. "Commande en ligne ou par WhatsApp": "Ajoutez vos produits au panier ou écrivez-nous au 0666-854184."
     2. "Appel de confirmation": "Nous vous appelons pour confirmer la commande et l’adresse."
     3. "Livraison": "Gratuite, à l’adresse indiquée."
     4. "Paiement à la réception": "Vous réglez au livreur à la réception."
5. **InfoCards ×2:**
   - Grid `c2` (1 / 2 columns), gap 16. Card: white, radius 24, padding `cardP` (20 / 32), gap 14; h2 at 28 px.
   - Placeholder chip style: `1.5px dashed #9AA3AD`, 14 px / 700, `#3C4043`, radius 8.
   - **"Délais de livraison":** "Le délai dépend de votre ville. Il vous est confirmé lors de l'appel de confirmation." followed by the placeholder chip "[DÉLAI PAR VILLE]".
   - **"Retours et garantie":** placeholder chip "[CONDITIONS DE RETOUR]", then the link "Contacter le service après-vente →" to `Service.dc.html?s=sav` (16 px / 700, min-height 44).
6. **FaqAccordion, "Questions fréquentes":**
   - White panel, radius 24, padding 8px 24px.
   - Question button: min-height 64, 18 px / 700, left-aligned, padding 12px 0.
   - Toggle: "+" at 26 px / 400 / `#0B5CAD`, rotates 45° when open.
   - Answer: 16 px / line-height 1.6 / `#3C4043`, max-width 760, margin-bottom 20. It opens by animating `grid-template-rows` from 0fr to 1fr over .3s.
   - Items are separated by `1px #EEF1F4` (none after the last).
   - Q&A, verbatim:
     1. **La livraison est-elle vraiment gratuite ?** Oui, la livraison est gratuite partout au Maroc.
     2. **Comment payer ?** Vous payez à la livraison, à la réception de votre commande.
     3. **L’installation est-elle comprise ?** Non. La pose est réalisée par nos techniciens sur devis. La visite technique coûte 300 Dhs.
     4. **Comment suivre ma commande ?** Avec la référence reçue à la commande et votre numéro de téléphone, sur la page Suivre ma commande.
   - Below the panel (margin-top 20): "Vous avez déjà commandé ?" (17 px) and a "Suivre ma commande" button (`#0B5CAD`, 56 px, hover `#084683`) → `Suivi commande.dc.html`.

### 3. Behaviour
- The accordion allows one open item at a time. The first item is open by default (`faqO ?? 0`). Clicking the open item sets it to −1, closing all.
- No query states.

### 4. Responsive
- **390:** one column everywhere; promise cards have no minimum height and 24 px titles.
- **1440:** promise cards 3 columns at 300 px minimum height with 28 px titles; steps 4 columns; info cards 2 columns with 32 px padding.

### 5. Data notes
- There are **no delivery zones, delivery times or fee tables**. Delivery is free everywhere and times are a placeholder.
- The only payment method is cash on delivery ("Paiement à la livraison" / "au livreur").
- Technical visit: 300 Dhs.
- WhatsApp/sales number: 0666-854184.

### 7. Leftovers
- Placeholders `[DÉLAI PAR VILLE]` and `[CONDITIONS DE RETOUR]`.
- `LEGAL`, `logo()` and `XI` entries are unused.
- `waHref` is unused.
- The "Suivre ma commande" hover sets `height:52px`.

### 8. New tokens
- Dashed placeholder border `#9AA3AD` (existing colour, new style).
- Radius 28; radius 20 on the icon tile.

---

## CGV.dc.html (legal page template)

### 1. Purpose, title, H1, breadcrumb, links
- **Purpose:** one template serving 5 legal pages, selected with `?p=`.
- **`<title>` in the file:** "Conditions générales de vente · Climatisation Maroc". The script rewrites it once to `{L.t} · Climatisation Maroc`.
- **H1:** `{{ lt }}`, the page title.
- **Below the H1:** "Dernière mise à jour : [DATE]" (15 px `#5F6368`).
- **Breadcrumb:** Accueil › {page title}.

### 2. Sections
1. **Breadcrumb.**
2. **Header:** `padding-top:24px`, gap 12, max-width 900.
3. **Layout grid:** `lgCols` is `260px minmax(0,720px)` on desktop and one column below 1100; gap 56; `padding-top:32px`. The **Toc / LegalNav is on the left** here (on the Article page it is on the right).
   - **Desktop Toc:**
     - Sticky at `top:110px`, `max-height:calc(100vh - 140px)`, scrolls on overflow.
     - "SOMMAIRE" label.
     - Links: min-height 38, gap 10, padding 4px 0 4px 14px, 3 px left border, same active/inactive colours as the Article Toc.
     - Each link starts with its number (min-width 20, tabular numerals, `#9AA3AD`).
   - **Article column** (max-width 720, gap 16):
     - **Mobile Toc:** collapsible "Sommaire" card, white, radius 20, margin-bottom 8. Links are 44 px rows with `border-top:1px #EEF1F4` and the number in `#9AA3AD`.
     - **Intro paragraph** (18 px), the same for every `p` value: "Les présentes conditions s'appliquent aux commandes passées sur Climatisation Maroc, boutique en ligne de la société Ariha Froid, Marrakech."
     - **One section per article:** `id="article-N"`, `scroll-margin-top:110px`, padding-top 24, gap 12. h2 is "Article N · {title}" at `ah2` (22 / 26), weight 700, letter-spacing −0.015em. It is followed by **two `[TEXTE JURIDIQUE]` placeholder paragraphs** (18 px / line-height 1.75 / `#5F6368`). **There is no real legal text in the file.**
     - **"Autres pages légales":** margin-top 40, `border-top:1px #DCE5EF`, padding-top 24. Label 16 px / 700. Chips: min-height 44, padding 0 18, radius 999, white, `1.5px #E3E8EE` border, 15 px / 700, hover border `#1A1A1A`.

### 3. States (`?p=`; a missing or unknown key falls back to `cgv`)

| key | Title | URL | Articles, numbered from 1 |
|---|---|---|---|
| cgv (default) | Conditions générales de vente | CGV.dc.html | 1 Objet · 2 Produits et disponibilité · 3 Commandes · 4 Prix · 5 Paiement à la livraison · 6 Livraison · 7 Installation et visite technique · 8 Rétractation et retours · 9 Garantie · 10 Service après-vente · 11 Données personnelles · 12 Droit applicable et litiges |
| cgu | Conditions générales d’utilisation | CGV.dc.html?p=cgu | 1 Objet · 2 Accès au site · 3 Compte professionnel · 4 Propriété intellectuelle · 5 Responsabilité · 6 Liens externes · 7 Modification des conditions |
| legal | Informations légales | CGV.dc.html?p=legal | 1 Éditeur du site · 2 Hébergement · 3 Directeur de la publication · 4 Contact |
| secu | Sécurité | CGV.dc.html?p=secu | 1 Protection des données · 2 Paiement · 3 Comptes et mots de passe · 4 Signaler un problème |
| conf | Politique de confidentialité | CGV.dc.html?p=conf | 1 Données collectées · 2 Utilisation des données · 3 Durée de conservation · 4 Partage des données · 5 Cookies · 6 Vos droits · 7 Contact |

- **"Autres pages légales" chips:** the four other pages. On CGV they are, in order, CGU, Informations légales, Sécurité, Politique de confidentialité. On any other page, the remaining non-CGV pages come first and CGV is appended last.
- **Scroll-spy:** the active article is the last `article-N` whose top is above 160 px. It is highlighted on desktop only.
- **Clicking a Toc link:** smooth-scrolls to the element top minus 100 px and closes the mobile Toc.

### 4. Responsive
- **390:** one column; collapsible numbered Sommaire at the top of the article; h2 22 px.
- **1440:** 260 px sticky left Toc plus a 720 px text column; h2 26 px.

### 7. Leftovers and inconsistencies
- All legal body text is `[TEXTE JURIDIQUE]`; the date is `[DATE]`.
- The CGV intro sentence is shown on every page, including CGU, Sécurité and the others.
- The footer's legal links point to `CGU.dc.html`, `Informations legales.dc.html`, `Securite.dc.html`, `Confidentialite.dc.html` and `Service apres-vente.dc.html`, none of which exist, instead of `CGV.dc.html?p=…`. "Service après-vente" has no `LEGAL` entry at all.
- `does`/`engs`/`logo()` scaffolding inherited from À propos is unused.

### 8. New tokens
`#DCE5EF`; tabular numerals.

---

## Page introuvable.dc.html (404)

### 1. Purpose, title, H1, breadcrumb, links
- **Purpose:** 404 page.
- **`<title>`:** "Page introuvable · Climatisation Maroc"
- **H1:** "Cette page n'existe pas ou a été déplacée"
- **Breadcrumb:** none.
- **Links to:** Accueil, `Categorie Climatiseurs muraux.dc.html`, Climatisation, Chauffe-eau, Ventilation, Gaines, Cuivre et gaz, Pieces de rechange, Recherche, WhatsApp.

### 2. Sections
1. **NotFoundHero:**
   - Centred column, padding `nfPad` (`40px 0 32px` / `72px 0 48px`), gap 20.
   - "404" numeral (`aria-hidden`): `nfFs` (112 / 200 px), weight 800, letter-spacing −0.06em, line-height 0.9, `#0B5CAD`, with the middle "0" in `#F4731F`.
   - H1: `nfH1` (26 / 36), weight 700, letter-spacing −0.025em, max-width 640.
   - **Search form** (`role="search"`):
     - Full width up to 560, height 56, radius 999, `1.5px #D3DDE8` border, white, padding 0 6px 0 20px.
     - Input placeholder "Rechercher un produit ou une référence", `aria-label` "Rechercher", 16 px.
     - Submit: 44 px `#0B5CAD` circle with a white magnifier icon.
   - **Buttons:** "Retour à l'accueil" (blue `#0B5CAD`, hover `#084683`) → `Accueil.dc.html`; "Voir les climatiseurs" (outlined black) → `Categorie Climatiseurs muraux.dc.html`.
2. **RangeTiles, "Nos gammes":**
   - h2 20 px / 700, centred, margin-bottom 16.
   - Grid `rgCols` (2 / 3 / 6 columns), gap 12.
   - Tile: link, coloured bg, radius 20, padding 16, height `rgH` (120 / 150), overflow hidden, hover `brightness(0.97)`.
   - Label 16 px / 700. Product image is absolute (right −6%, bottom −8%) with `drop-shadow(0 10px 14px rgba(14,40,70,0.2))`.

| Label | Link | Bg | Image | Width |
|---|---|---|---|---|
| Climatisation | Climatisation.dc.html | #DCE8F5 | uploads/clima-cut2.png | 90% |
| Chauffe-eau | Chauffe-eau.dc.html | #FCE6D6 | uploads/chauffe-eau-b0352fa9.png | 56% |
| Ventilation | Ventilation.dc.html | #E8EFF8 | uploads/ventilateur-cut.png | 62% |
| Gaines | Gaines.dc.html | #FDF0E6 | uploads/gaines-cut.png | 70% |
| Cuivre et gaz | Cuivre et gaz.dc.html | #FCE6D6 | uploads/cuivre-cut2.png | 62% |
| Pièces de rechange | Pieces de rechange.dc.html | #DCE8F5 | uploads/telecommande-cut2.png | 28% |

3. **WhatsApp help link:**
   - `padding-top:40px`, centred. 44 px `#25D366` circle icon.
   - Text (17 px): "Vous cherchez un produit précis ? **Écrivez-nous sur WhatsApp**"
   - Link: `https://wa.me/212666854184?text=` + encoded "Bonjour, je cherche un produit sur votre site." Hover colour `#0B5CAD`.

### 3. Behaviour
- Search keeps the query in state (`nq`). On submit it prevents the default action and, if the trimmed query is non-empty, goes to `Recherche.dc.html?q=<encoded>`.
- No query-string states. The page does not echo the bad URL and shows no suggested search results.

### 4. Responsive
- **390:** "404" at 112 px, H1 26 px; buttons stacked at full width; tiles in 2 columns × 3 rows at 120 px.
- **1440:** "404" at 200 px, H1 36 px; buttons side by side; 6 tiles in one row at 150 px.
- **Tablet:** 3 columns.

### 7. Leftovers
- Four of the six range tiles link to pages that do not exist: Chauffe-eau, Ventilation, Gaines, Pieces de rechange.
- `LEGAL`, `faqs`, `logo` and `XI` are unused.

### 8. New tokens
`#D3DDE8` (404 search border).

---

## Consolidated new tokens (not in the given set)

**Colours:**
- `#D5DCE3`: pagination, share and copy borders.
- `#DCE5EF`: "En bref" inset ring, inactive Toc rail, share and legal dividers.
- `#EEF3FA`: inline product thumbnail background.
- `#D3DDE8`: 404 search border.
- `#1877F2`: Facebook share; also used for footer social icons.
- `rgba(255,255,255,0.12)`: À propos hero photo slot.
- `rgba(255,255,255,0.45)`: unselected calculator sun buttons.

**Radii:** 28 (featured card, every CTA band, À propos hero, promise cards, engagements panel); 16 (À propos icon tile, Article calculator shortcut card).

**Shadows:** featured card hover `0 30px 60px -36px rgba(14,40,70,0.45)`.

**Font:** Figtree weights 400–800 throughout. Font sizes worth noting: 200 / 112 px for the 404 numeral, 21 px for the À propos intro, 30 px / 800 for the calculator result.
