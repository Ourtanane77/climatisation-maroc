# Grouping `data/catalog.json` into families: proposal for review

`data/catalog.json` holds 106 rows, one per SKU. They are grouped into
**families** (products) with **variants**.

The rules below are what the phase 3 seeder will implement. They are
configured in `backend/config/catalog_grouping.php`.

## Rules

1. **Family name.** The row name is stripped of:
   - its power (`9 000 BTU`);
   - for climatiseurs only, its colour (`Blanc` / `Noir`);
   - for the chauffe-eau, its capacity (`300 L`);
   - for the ventilateurs Nanyo, Multizone and Flexible souple Esbo, its
     diameter (`Q160`), plus the motor code (`DPT…`).
2. **Same family** means the same stripped name and the same brand.
3. **Variant label.** Built from what was stripped: `12 000 BTU`,
   `9 000 BTU · Blanc`, `300 L`, `Ø 160`.
4. **Prices.** `price` is stored as the regular price and `promo_price` as
   the selling price when set. The card's "À partir de" is computed from the
   variants.
5. **Variant identity.** Each variant keeps its own `legacy_id`, so every old
   product URL 301-redirects to `/produit/<family>?v=<sku>`.

## Families with variants (17)

| Family | Brand | Variants (label, SKU, price, promo) |
|---|---|---|
| LG Dual Inverter | LG | 9 000 D10AWH.NW0 6 200/5 400 · 12 000 D13AJH.N 6 500/5 700 · 18 000 D19AKH.NK0 8 100/7 600 · 24 000 D24AKH-N 9 500/8 900 |
| LG Artcool Smart Inverter | LG | 9 000 UA11MJH0.NJ0 8 700/7 900 · 12 000 UA13MUH0.MJO 8 950/8 200 · 18 000 UA19MKH0.NJ0 10 500/9 900 · 24 000 UA24MKH0.NJ0 11 600/10 900 |
| Carrier Mural Normal ON/OFF 410A | Carrier | 9 000 42QH009NP 4 500 · 12 000 42QHA012NP 4 800 · 18 000 42QHA018NP 6 800 · 24 000 42QHA024NP 8 800/8 100 |
| Carrier Mural Inverter R32 | Carrier | 9 000 42QHG009D8SC-R32 5 050/4 200 · 12 000 42QHG012D8SC-R32 5 550/4 800 · 18 000 …018… 7 000/6 200 · 24 000 …024… 9 200/7 900 |
| Carrier Miroir Inverter Noir R32 | Carrier | 9 000 42QHG009D8S-BM 6 200/5 200 · 12 000 …012… 6 600/5 600 · 18 000 …018… 8 600/7 700 · 24 000 …024… 10 300/9 500 |
| Fitco Mural Inverter | Fitco | 8 variants, power × colour: Blanc 9/12/18/24 000 (FSW09/12/18/24T24PM/N) and Noir 9/12/18/24 000 (FSW09/12/24T23PM/N, FSW18T23PW/N) |
| Fitco Mural Normal R410 | Fitco | 9 000 FSW09T24EW/N 3 800 · 18 000 FSW18T24EW/N 5 900/5 300 · 24 000 FSW24-A24F10E/N 6 900/6 200 |
| CIAT Mural Inverter | CIAT | 9 000 38HG09VSA 4 700/3 800 · 12 000 38HG12VSA 4 900/4 000 |
| LG Gainable Inverter | LG | 12 000 · 24 000 · 30 000 · 36 000 · 48 000 · 60 000 (ABNW…) |
| Carrier Gainable Normal ON/OFF 410A | Carrier | 48 000 42QSS048NS-1 19 500 · 60 000 42QSS060NS-1 20 900 |
| Carrier Gainable Inverter | Carrier | 12 000 42QSS012DSP 8 200/7 500 · 36 000 42QSS036DSP 18 950/17 400 |
| Fitco Gainable Normal ON/OFF R410 | Fitco | 18 000 FDT18-HWN1Q/N 6 900 · 24 000 FDT24-HWN1Q/N 7 900 |
| CIAT Gainable Inverter | CIAT | 18 000 42HY48VSA 9 100 · 24 000 42HY24VSA 11 900 |
| Chauffe-eau Solaire Simsek Circuit Fermé | Simsek | 200 L CHAUFF0060 10 500 · 300 L CHAUFF0061 13 200 · 500 L CHAUFF0065 19 700 |
| Ventilateur de Gaine Nanyo Galvanisé | Nanyo | Ø 100 / 125 / 160 / 200 / 315 (VENT0159–0163) 525 → 1 130 |
| Multizone | (none) | Ø 160 CLIM00140 500 · Ø 200 CLIM00141 600 |
| Flexible Souple Esbo 10 m | Esbo | Ø 125 / 160 / 200 / 250 (180 → 240) |

## Single products (45)

These stay as one family with one variant each:
- LG Jetcool Inverter R32.
- The plastic duct fans (Superkool Q100 and Q125, unbranded Q160, S&P Q100).
- Flexible calorifugé Arfro Q160 and Flexible isolé aluminium Q200.
- All 38 *pièces de rechange*.

**Optional extra grouping (your call).** These singles differ only by size:

| Proposed family | Sizes |
|---|---|
| Trappe de visite en plâtre | 100/60, 120/60 |
| Bande perforée | 10 m, 25 m |
| Scotch aluminium Alpha 35 ml | 50, 70 |
| Scotch aluminium armé 30 ml | 50, 75 |
| Colle PVC | 125 ml, 0,5 kg, 1 kg |
| Flexible Isogris | Q13 25 m Blanc, Q13 50 m, Q16 50 m, Q20 30 m Blanc |

**Default: keep them as singles**, as on the live site, unless you confirm.

## Data anomalies to check

1. **CIAT Gainable Inverter, SKU `42HY48VSA`.** It is named 18 000 BTU, but the
   reference reads 48, and it costs less than the 24 000 one. Is it a 48 000?
2. **Fitco Mural Inverter 18 000 Noir, SKU `FSW18T23PW/N`.** The other Noir
   SKUs end in `PM/N`; `PW` usually means white.
3. **LG Artcool 12 000, SKU `UA13MUH0.MJO`.** The suffix ends in the letter O,
   where the siblings end in `NJ0` (zero).
4. **Carrier Mural Normal ON/OFF 9 000, SKU `42QH009NP`.** The siblings use the
   `42QHA…` pattern.
5. **Unbranded rows.** 32 rows have `brand_slug: null` (Multizone, most
   pièces). They will have no brand.
6. **Category mapping.** The catalog's categories follow the old site. The new
   URLs follow the design and the brief.

   | Old category | New URL |
   |---|---|
   | `mono-split` | `/climatisation/mural` (H1 "Climatiseurs muraux"; the design page) |
   | `gainable` | `/climatisation/gainable` |
   | `cassette` | `/climatisation/cassette` |
   | `console-armoire` | `/climatisation/console-armoire` |
   | `chauffe-eau-*` | `/chauffe-eau/*` |
   | `ventilation` | `/ventilation`, split by name into ventilateurs-de-gaine and multizone |
   | `gaines-circulaires` | `/gaines`, split into flexibles-souples and flexibles-isoles |
   | `accessoires`, `cuivre`, `gaz-frigorifique` | `/cuivre-et-gaz` and children |
   | `grilles` | `/ventilation/grilles-et-diffuseurs` |
   | `pieces-de-rechange` | `/pieces-de-rechange`, split by name into telecommandes, supports, adhesifs-et-mastics, trappes-de-visite, outillage; anything unmatched stays at range level |
   | `froid` | `/froid` |

   The old categories' `legacy_id`s are kept for redirects.

## Design-only items (seeded with `needs_verification`)

These come from the design files and are not in the catalog. They are seeded
with a "à vérifier" flag shown in the back office.

- **LG Cassette Inverter 18000 BTU.** ATNW18GPLS1, 12 500 Dhs.
- **Cuivre et gaz list (13 items).**

  | Item | Ref | Price |
  |---|---|---|
  | Cuivre 1/4 Lafarga 15 m | CUIV0005 | 495 |
  | Cuivre 3/8 Lafarga 15 m | CUIV0006 | 750 |
  | Cuivre 1/2 15 m | CUIV0007 | 1 050 |
  | Cuivre 5/8 Lafarga 15 m | CUIV0008 | 1 350 |
  | Cuivre 3/4 15 m | CUIV0009 | 1 875, out of stock |
  | Kit duo 1/4-3/8 20 m | CUIV0018 | 1 130 |
  | Kit duo 1/4-1/2 20 m | CUIV0017 | 1 280 |
  | Kit duo 5/8-3/8 20 m | CUIV0048 | 2 100 |
  | Armaflex 9/6 | CLIM00008 | 3,50 |
  | Armaflex 9/12 | CLIM00004 | 4,50 |
  | Gaz R410 GS 11,3 kg | GAZ00042 | 5 000 |
  | Gaz R407 GS 11,3 kg | GAZ00045 | 3 800 |
  | Gaz R22 13,6 kg | GAZ00044 | 3 750 |
- **Diffuseurs / grilles.** The design shows no grille product with a
  reference or price, so none are seeded. The category exists and is empty
  (hidden while empty).

Items that appear in both the design and the catalog use the catalog values:
Support GT CLIM00076 at 55, and Télécommande universelle CLIM00080 at 70
(catalog name "Télécommande Universelle 1 000").
