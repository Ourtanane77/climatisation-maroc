// Catalogue listings (agent A): node scripts/visual-compare.mjs phase-4a
const pairs = [
  ["gamme", "Climatisation.dc.html", "/climatisation", null, { full: true }],
  ["categorie", "Categorie Climatiseurs muraux.dc.html", "/climatisation/mural", null, { full: true }],
  ["categorie-comparer", "Categorie Climatiseurs muraux.dc.html?comparer=1", "/climatisation/mural", "pickCompare", {}],
  ["categorie-vide", "Categorie Climatiseurs muraux.dc.html?empty=1", "/climatisation/mural?marque=simsek", null, { clip: 1100 }],
  ["categorie-filtres", "Categorie Climatiseurs muraux.dc.html?filters=1", "/climatisation/mural?filtres=1", null, { only: 390 }],
  ["cuivre", "Cuivre et gaz.dc.html", "/cuivre-et-gaz", "addKit", { full: true }],
  ["promotions", "Promotions.dc.html", "/promotions", null, { full: true }],
  ["recherche", "Recherche.dc.html?q=cuivre", "/recherche?q=cuivre", null, { full: true }],
  ["recherche-vide", "Recherche.dc.html?q=climatiseur%20portable", "/recherche?q=climatiseur%20portable", null, { full: true }],
];

export default pairs;

export const actions = {
  async pickCompare(page) {
    const boxes = page.getByRole("checkbox", { name: /^Comparer/ });
    await page.evaluate(() => localStorage.removeItem("cm_compare"));
    for (let i = 0; i < 3; i++) await boxes.nth(i).click();
    await page.waitForTimeout(300);
  },
  async addKit(page) {
    await page.evaluate(() => (document.cookie = "cm_cart=" + encodeURIComponent(JSON.stringify([{ sku: "CUIV0018", qty: 2 }])) + "; path=/"));
    await page.reload({ waitUntil: "networkidle" });
  },
};
