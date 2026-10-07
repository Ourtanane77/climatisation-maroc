"""Builds data/excel-additions.json from docs/Produits - Climatisationmaroc.xlsx (owner's list).

`families`: what the website did not have (compared on 2026-10-07 with the catalogue), published
by ExcelAdditionsSeeder with a temporary reference (XLS-…) and flagged « à vérifier »; without an
Excel price they are shown « Prix sur demande » (price 0). `prices`: the Excel price of references
the site already has; the Excel is the price authority (client decision 2026-10-07).
Air-conditioner powers are variants of one family; accessories by size stay separate products
(client decision 4). Run: python scripts/excel-additions.py
"""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]


def ref(*parts: str) -> str:
    return "XLS-" + "-".join(re.sub(r"[^A-Z0-9]+", "", p.upper()) for p in parts if p)


def power(btu: int, price: int | None) -> dict:
    return {"label": f"{btu // 1000} 000 BTU", "power_btu": btu, "price": price, "sku": None}


families = []


def family(name, category, brand, variants, note, art=None, key=None, merge_into=None, slug=None):
    """merge_into: slug of the existing product that gets these variants (no new product page)."""
    for v in variants:
        v["sku"] = v["sku"] or ref(key or name, str(v.get("power_btu") or v.get("label") or ""))
    families.append({"name": name, "slug": slug, "category": category, "brand": brand, "art": art, "note": note, "variants": variants, "merge_into": merge_into})


def single(name, category, brand, price, note, art=None, key=None, slug=None):
    family(name, category, brand, [{"label": None, "power_btu": None, "price": price, "sku": ref(key or name)}], note, art, slug=slug)


X = "Ajouté depuis le fichier Excel du client : référence (XLS-…) à remplacer"

# Air conditioners: powers missing from existing families.
family("Carrier Cassette Inverter R32 (nouvelles puissances)", "climatisation/cassette", "carrier",
       [power(12000, 8500), power(18000, 10250), power(36000, 20700), power(48000, 24600)],
       X + ".", "cassette", key="CARRIER-CASSETTE-R32", merge_into="carrier-cassette-inverter")
family("CIAT Gainable Inverter (nouvelles puissances)", "climatisation/gainable", "ciat",
       [power(12000, 6900), power(36000, 16600), power(48000, 21500), power(60000, 22200)],
       X + ".", "gainable", key="CIAT-GAINABLE", merge_into="ciat-gainable-inverter")
family("CIAT Mural Inverter (nouvelles puissances)", "climatisation/mural", "ciat",
       [power(18000, 5350), power(24000, 6650)],
       X + ".", "mural", key="CIAT-MURAL", merge_into="ciat-mural-inverter")

# Copper SRK (new brand on the site): one product per diameter, like Lafarga.
for d in ["1/4", "3/8", "1/2", "5/8", "3/4", "7/8"]:
    single(f"Cuivre {d} SRK 15 m", "cuivre-et-gaz/cuivre", None, None, X + " et prix à saisir (marque SRK).", "coilL", key=f"CUIVRE-SRK-{d}")

# Ventilation.
for s in ["7/7", "9/9", "12/12", "15/15", "18/18"]:
    single(f"Caisson d'Extraction {s}", "ventilation/ventilateurs-de-gaine", None, None, X + ", prix à saisir ; catégorie à confirmer.", None, key=f"CAISSON-{s}")
for s in ["500*1", "500*2", "600*1", "600*2", "800*1", "1000*1", "1000*2", "1500*1", "2000*1"]:
    label = s.replace("*", " × ")
    single(f"Diffuseur Linéaire {label}", "ventilation/grilles-et-diffuseurs", None, None, X + " et prix à saisir.", None, key=f"DIFF-LIN-{s}")
GRILLES = ["20/10", "30/10", "30/15", "40/10", "40/20", "50/10", "50/15", "50/20", "60/10", "60/15", "60/20", "70/10", "80/10", "80/15", "80/20", "100/10", "100/15", "100/20"]
for kind in ["Simple", "Double"]:
    for s in GRILLES:
        single(f"Grille {kind} {s}", "ventilation/grilles-et-diffuseurs", None, None, X + " et prix à saisir.", None, key=f"GRILLE-{kind}-{s}")
family("Multizone", "ventilation/multizone", None, [{"label": "Ø 250", "power_btu": None, "price": 1470, "sku": ref("MULTIZONE-250")}], X + ".", None, merge_into="multizone")
single("Ventilateur de Gaine Q315 Plastique S&P", "ventilation/ventilateurs-de-gaine", "s-et-p", None, X + " et prix à saisir.", "vent")
for d in ["125", "160"]:
    single(f"Flexible Isolé Aluminium Q{d} Esbo 10 m", "gaines/flexibles-isoles", "esbo", None, X + " et prix à saisir.", "flex", key=f"FLEX-ISOLE-ESBO-{d}")

# Accessories.
single("Trappe de Visite 40×40", "pieces-de-rechange/trappes-de-visite", None, 250, X + ".", None, key="TRAPPE-DE-VISITE-40X40", slug="trappe-de-visite-40x40")
single("Bande Grise", "pieces-de-rechange/adhesifs-et-mastics", None, 28, X + ".", None)
# « Bande adhésive 15 m / 50 mm » is the site's CLIM00399 (duplicate removed 2026-10-07): see PRICES/VERIFY.
single("Silicone Alpha", "pieces-de-rechange/adhesifs-et-mastics", "alpha", 30, X + ".", None)

# Excel prices for references the site already has (Dhs, single selling price: no promotion).
# Client decision 2026-10-07: the Excel is the price authority where it gives a price.
PRICES = {
    # LG Gainable Inverter (the 18 000 is ABNW18, not the R32 ZBNW18; ABNW50 is the Excel's 50 000).
    "ABNW12GL5S1.ENWTIME": 7600, "ABNW18GM1S1.ENWBME": 9100, "ABNW24GM1S1.ENWBME": 10700,
    "ABNW30GM1S1.ENWBME": 11400, "ABNW36GM2S1.ENWBME": 15200, "ABNW50LM3S1.ENWBLM": 20800, "ABNW60LM3S1.ENWBLM": 21800,
    # Carrier Gainable Inverter R32.
    "42QSS012DSP": 8300, "42QSV018D8S-R32": 10200, "42QSS024DSP": 12600, "42QSS036DSP": 19300, "42QSS048DSP": 24000, "42QSS060DSP": 26000,
    "42HY24VSA": 11100,          # CIAT Gainable 24 000
    "42QTD024D8S": 12500,        # Carrier Cassette 24 000
    # Carrier Miroir Noir R32 and Carrier Mural Inverter R32.
    "42QHG009D8S-BM": 5300, "42QHG012D8S-BM": 5700, "42QHG018D8S-BM": 8000, "42QHG024D8S-BM": 9700,
    "42QHG009D8SC-R32": 5300, "42QHG012D8SC-R32": 5700, "42QHG018D8SC-R32": 8000, "42QHG024D8SC-R32": 9700,
    "38HG09VSA": 3650, "38HG12VSA": 3950,  # CIAT Mural
    # Fitco Mural Inverter blanc / noir.
    "FSW09T24PM/N": 3750, "FSW12T24PM/N": 4100, "FSW18T24PM/N": 5800, "FSW24T24PM/N": 7100,
    "FSW09T23PM/N": 4100, "FSW12T23PM/N": 4500, "FSW18T23PW/N": 6200, "FSW24T23PM/N": 7400,
    "CHAUFF0060": 10500, "CHAUFF0061": 13900, "CHAUFF0065": 20200,  # Chauffe-eau solaire 200/300/500 L
    # Armaflex 9/6 … 9/22.
    "CLIM00008": 3, "CLIM00003": 3.5, "CLIM00004": 4, "CLIM00005": 4.5, "CLIM00006": 5, "CLIM00007": 5.5,
    "CLIM00012": 65, "CLIM00013": 120,          # Bande perforée 10 / 25 m
    "CLIM00140": 450, "CLIM00141": 500,         # Multizone 160 / 200
    "CLIM00371": 450,                           # Plaque Pipal
    "CLIM00079": 32, "CLIM00072": 15, "CLIM00073": 9,  # Scotch aluminium Alpha, emballage, noir
    "CLIM00097": 250, "CLIM00096": 250, "CLIM00318": 500, "CLIM00317": 550,  # Trappes 60x60 (2), 100x60, 120x60
    "CLIM00124": 35, "CLIM00068": 40,           # Scotch aluminium armé 50 / 75
    "CLIM00399": 50,                            # Bande adhésive (Excel: 15 m / 50 mm)
}

# References to check after the Excel import (flag « à vérifier » with this note).
VERIFY = {
    "CLIM00399": "Fichier Excel : « Bande adhésive 15 m / 50 mm » à 50 Dhs ; le site indiquait 10 m. Vérifier la longueur et le nom.",
}

out = root / "data" / "excel-additions.json"
out.write_text(json.dumps({"source": "docs/Produits - Climatisationmaroc.xlsx", "prices": PRICES, "verify": VERIFY, "families": families}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(len(families), "families,", sum(len(f["variants"]) for f in families), "references ->", out.relative_to(root))
