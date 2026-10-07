// Accessibility audit (axe-core, WCAG 2.1 A/AA) of every front-office route at 1440 and 390 px,
// including open states (mega menu, mobile drawer, filter sheet, basket with items, checkout errors).
//
//   node scripts/a11y-audit.mjs [site=http://localhost:8080] [--all] [--out=dir]
//
// Prints serious/critical violations grouped by rule (all impacts with --all) and writes the full
// result to <out>/report.json (default test-results/a11y; Playwright test runs empty test-results/). Exit code 1 when serious/critical violations remain.
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const site = args.find((a) => a.startsWith("http")) ?? "http://localhost:8080";
const all = args.includes("--all");
const outDir = args.find((a) => a.startsWith("--out="))?.slice(6) ?? "test-results/a11y";

const CART = encodeURIComponent(
  JSON.stringify([
    { sku: "D13AJH.N", qty: 1 },
    { sku: "CUIV0018", qty: 1 },
  ]),
);

/** [name, path, action?, only width?] */
const ROUTES = [
  ["accueil", "/"],
  ["mega-menu", "/", "megaMenu", 1440],
  ["drawer", "/", "drawer", 390],
  ["gamme", "/climatisation"],
  ["categorie", "/climatisation/mural"],
  ["filtres", "/climatisation/mural", "filters", 390],
  ["liste-rapide", "/cuivre-et-gaz"],
  ["produit", "/produit/lg-dual-inverter"],
  ["rupture", "/produit/lg-dual-inverter?v=D19AKH.NK0"],
  ["marques", "/marques"],
  ["marque", "/marques/lg"],
  ["comparer", "/comparer?p=D13AJH.N,D19AKH.NK0"],
  ["promotions", "/promotions"],
  ["recherche", "/recherche?q=lg"],
  ["recherche-vide", "/recherche?q=zzzz"],
  ["calculateur", "/calculateur-puissance"],
  ["panier-vide", "/panier"],
  ["panier", "/panier", "cart"],
  ["commande", "/commande", "cart"],
  ["commande-erreurs", "/commande", "checkoutErrors"],
  ["suivi", "/suivi-commande"],
  ["devis", "/demander-un-devis"],
  ["contact", "/contact"],
  ["revendeur", "/devenir-revendeur"],
  ["connexion", "/connexion"],
  ["oubli", "/connexion/mot-de-passe-oublie"],
  ["espace-pro", "/espace-professionnel"],
  ["solutions", "/solutions"],
  ["secteur", "/solutions/restaurants"],
  ["services", "/services"],
  ["service", "/services/installation"],
  ["blog", "/blog"],
  ["blog-categorie", "/blog/categorie/guides"],
  ["article", "/blog/quelle-puissance-de-climatiseur-pour-ma-piece"],
  ["a-propos", "/a-propos"],
  ["livraison", "/livraison-et-paiement"],
  ["plan", "/plan-du-site"],
  ["404", "/page-introuvable-test"],
];

const actions = {
  async megaMenu(page) {
    await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Climatisation", exact: true }).last().hover();
    await page.waitForTimeout(500);
  },
  async drawer(page) {
    await page.getByRole("button", { name: "Menu" }).click();
    await page.waitForTimeout(400);
  },
  async filters(page) {
    await page
      .getByRole("button", { name: /Filtres/ })
      .first()
      .click();
    await page.waitForTimeout(400);
  },
  async cart(page, context) {
    await context.addCookies([{ name: "cm_cart", value: CART, url: site }]);
    await page.reload({ waitUntil: "networkidle" });
  },
  async checkoutErrors(page, context) {
    await actions.cart(page, context);
    await page
      .getByRole("button", { name: /Confirmer|Valider|commande/i })
      .last()
      .click();
    await page.waitForTimeout(600);
  },
};

const report = [];
const browser = await chromium.launch();
for (const width of [1440, 390]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  for (const [name, path, action, only] of ROUTES) {
    if (only && only !== width) continue;
    const page = await context.newPage();
    try {
      await page.goto(site + path, { waitUntil: "networkidle", timeout: 120_000 });
      if (action) await actions[action](page, context);
      // The text wordmark stands in for the logo image: logotypes are exempt from contrast (WCAG 1.4.3).
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .exclude('[role="img"][aria-label="Ariha Froid · Climatisation Maroc"]')
        .analyze();
      for (const v of result.violations) {
        report.push({
          page: name,
          width,
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.map((n) => ({ target: n.target.join(" "), summary: n.failureSummary })),
        });
      }
    } catch (e) {
      report.push({ page: name, width, id: "audit-error", impact: "critical", help: String(e).slice(0, 200), nodes: [] });
    }
    await page.close();
  }
  await context.close();
}
await browser.close();

mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 2));
const shown = report.filter((r) => all || r.impact === "serious" || r.impact === "critical");
const byRule = new Map();
for (const r of shown) {
  const entry = byRule.get(r.id) ?? { impact: r.impact, help: r.help, pages: new Set(), nodes: 0, examples: new Set() };
  entry.pages.add(`${r.page}@${r.width}`);
  entry.nodes += r.nodes.length;
  r.nodes.slice(0, 2).forEach((n) => entry.examples.size < 4 && entry.examples.add(n.target));
  byRule.set(r.id, entry);
}
for (const [id, e] of byRule) {
  console.log(`\n${id} [${e.impact}] ${e.help} — ${e.nodes} nodes on ${e.pages.size} page states`);
  console.log(`  pages: ${[...e.pages].slice(0, 12).join(", ")}${e.pages.size > 12 ? ", …" : ""}`);
  for (const ex of e.examples) console.log(`  e.g. ${ex}`);
}
const total = shown.reduce((n, r) => n + r.nodes.length, 0);
console.log(`\n${all ? "All" : "Serious/critical"} violations: ${total} nodes, ${byRule.size} rules.`);
process.exit(total > 0 ? 1 : 0);
