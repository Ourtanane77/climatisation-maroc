// Phase 6 (leads, reseller auth, pro space): `node scripts/visual-compare.mjs phase-6`.
// Pairs: [name, design page, site path, action, options].
const pairs = [
  ["devis", "Demander un devis.dc.html", "/demander-un-devis", null, { full: true }],
  ["devis-pro", "Demander un devis.dc.html?pro=1", "/demander-un-devis?pro=1", null, { clip: 900 }],
  ["devis-erreur", "Demander un devis.dc.html?erreur=1", "/demander-un-devis", "devisErreur", { full: true }],
  ["devis-envoye", "Demander un devis.dc.html?envoye=1", "/demander-un-devis", "devisEnvoye", { full: true }],
  ["contact", "Contact.dc.html", "/contact", null, { full: true }],
  ["espace-pro", "Espace professionnel.dc.html", "/espace-professionnel", null, { full: true }],
  ["revendeur", "Devenir revendeur.dc.html", "/devenir-revendeur", null, { full: true }],
  ["revendeur-erreur", "Devenir revendeur.dc.html?erreur=1", "/devenir-revendeur", "revendeurErreur", { full: true }],
  ["connexion", "Connexion.dc.html", "/connexion", null, { full: true }],
  ["connexion-erreur", "Connexion.dc.html?erreur=1", "/connexion", "connexionErreur", { full: true }],
  ["oubli", "Connexion.dc.html?oubli=1", "/connexion/mot-de-passe-oublie", null, { full: true }],
  ["commande-rapide", "Commande rapide.dc.html", "/espace-professionnel/commande-rapide", "login", { full: true }],
];

export default pairs;

async function fill(page, label, value) {
  await page.getByLabel(label, { exact: true }).first().fill(value);
}

export const actions = {
  async devisErreur(page) {
    await fill(page, "Nom complet", "Karim Benali");
    await fill(page, "Téléphone", "06 61 2");
    await page.getByRole("button", { name: "Envoyer ma demande" }).click();
    await page.waitForTimeout(300);
  },
  async devisEnvoye(page) {
    await fill(page, "Nom complet", "Karim Benali");
    await fill(page, "Téléphone", "06 61 23 45 67");
    await page.waitForTimeout(3100);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/forms/quote"), { timeout: 120_000 }),
      page.getByRole("button", { name: "Envoyer ma demande" }).click(),
    ]);
    await page.getByText("Demande envoyée").first().waitFor();
  },
  async revendeurErreur(page) {
    await fill(page, "Société", "Froid Atlas SARL");
    await fill(page, "ICE", "00152874900");
    await fill(page, "Téléphone", "06 61 23 45 67");
    await page.getByRole("button", { name: "Envoyer ma demande" }).click();
    await page.waitForTimeout(300);
  },
  async connexionErreur(page) {
    await fill(page, "E-mail ou téléphone", "contact@froid-atlas.ma");
    await page.locator("#password").fill("motdepase");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.getByText("Identifiants incorrects.").first().waitFor({ timeout: 120_000 });
  },
  async login(page) {
    const url = page.url();
    await page.goto(new URL("/connexion", url).href);
    await fill(page, "E-mail ou téléphone", "contact@froid-atlas.ma");
    await page.locator("#password").fill(process.env.RESELLER_PASSWORD ?? "change-me-reseller");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL(/commande-rapide/, { timeout: 120_000 });
    await page.waitForLoadState("networkidle");
  },
};
