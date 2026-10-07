// Responsive audit of the front office: every page template at 7 widths, plus key open states.
//
//   node scripts/responsive-audit.mjs [base=http://localhost:8080] [--widths=360,390] [--only=/panier,/] [--no-shots]
//
// Reports, per page and width: horizontal overflow (and the elements sticking out), images wider
// than their box, text under 12 px, tap targets under 24 px (mobile widths, inline text links
// excepted, WCAG 2.5.8 AA minimum 24 px), text clipped without an ellipsis, and fixed bars covering the end of the page.
// Screenshots (full page) go to test-results/responsive/<width>/; the report to
// test-results/responsive/report.json. Exit code 1 when an issue is found.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith("--")) ?? "http://localhost:8080").replace(/\/$/, "");
const opt = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const WIDTHS = (opt("widths") ?? "360,390,768,1024,1280,1440,1920").split(",").map(Number);
// Full-page screenshots at the design widths only (390, 1440) unless --shots=all; --no-shots for none.
const shotWidths = args.includes("--no-shots") ? [] : opt("shots") === "all" ? WIDTHS : [390, 1440];
const CONCURRENCY = Number(opt("concurrency") ?? 4);
const out = path.resolve("test-results/responsive");

const CART = encodeURIComponent(
  JSON.stringify([
    { sku: "D13AJH.N", qty: 2 },
    { sku: "CUIV0018", qty: 1 },
    { sku: "XLS-CUIVRESRK14", qty: 1 },
  ]),
);

/** [name, path, state] — state: a function run before measuring (open a drawer, a sheet…). */
const PAGES = [
  ["home", "/"],
  ["range", "/climatisation"],
  ["listing", "/climatisation/mural"],
  ["listing-few", "/gaines/gaines-circulaires"],
  ["listing-one", "/climatisation/console-armoire"],
  ["dense", "/cuivre-et-gaz"],
  ["dense-sub", "/cuivre-et-gaz/cuivre"],
  ["quote-range", "/froid"],
  ["product", "/produit/lg-dual-inverter"],
  ["product-onrequest", "/produit/cuivre-14-srk-15-m"],
  ["product-simple", "/produit/support-gt"],
  ["brands", "/marques"],
  ["brand", "/marques/lg"],
  ["promotions", "/promotions"],
  ["search", "/recherche?q=lg"],
  ["search-empty", "/recherche?q=zzzz"],
  ["compare", "/comparer?p=D13AJH.N,42QHG012D8SC-R32,FSW12T24PM/N"],
  ["cart", "/panier", "cart"],
  ["cart-empty", "/panier"],
  ["checkout", "/commande", "cart"],
  ["checkout-errors", "/commande", "checkoutErrors"],
  ["tracking", "/suivi-commande"],
  ["blog", "/blog"],
  ["blog-category", "/blog/categorie/guides"],
  ["article", "/blog/quelle-puissance-de-climatiseur-pour-ma-piece"],
  ["calculator", "/calculateur-puissance"],
  ["solutions", "/solutions"],
  ["sector", "/solutions/restaurants"],
  ["services", "/services"],
  ["service", "/services/installation"],
  ["about", "/a-propos"],
  ["delivery", "/livraison-et-paiement"],
  ["contact", "/contact"],
  ["quote", "/demander-un-devis"],
  ["reseller", "/devenir-revendeur"],
  ["login", "/connexion"],
  ["pro", "/espace-professionnel"],
  ["sitemap", "/plan-du-site"],
  ["not-found", "/cette-page-n-existe-pas"],
  ["drawer", "/", "drawer"],
  ["filter-sheet", "/climatisation/mural", "filterSheet"],
];

const only = opt("only")?.split(",");
const NEEDS_CART = new Set(["cart", "checkoutErrors"]);
const STATES = {
  // The basket cookie is set before navigation (see NEEDS_CART).
  async cart() {},
  async checkoutErrors(page) {
    await STATES.cart(page);
    const submit = page.getByRole("button", { name: /Confirmer|Valider|commande/i }).last();
    if (await submit.count()) await submit.click({ trial: false }).catch(() => {});
    await page.waitForTimeout(600);
  },
  async drawer(page, width) {
    if (width >= 760) return "skip"; // burger menu below 760 px only
    await page.getByRole("button", { name: "Menu" }).click();
    await page.waitForTimeout(400);
  },
  async filterSheet(page, width) {
    if (width >= 1100) return "skip";
    const button = page.getByRole("button", { name: /Filtres/ }).first();
    if (!(await button.count())) return "skip";
    await button.click();
    await page.waitForTimeout(400);
  },
};

/** Runs in the page: returns the issues found at this width. */
function measure(mobile) {
  const issues = [];
  const doc = document.documentElement;
  const vw = doc.clientWidth;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0.05;
  };
  const describe = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cls = typeof el.className === "string" ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}` : "";
    const text = (el.innerText || el.getAttribute("aria-label") || el.alt || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return `${el.tagName.toLowerCase()}${id}${cls}${text ? ` "${text}"` : ""}`;
  };
  // Inside a horizontally scrolling or clipping box, sticking out is intended (rails, chip rows).
  const clippedByAncestor = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true;
    }
    return false;
  };

  if (doc.scrollWidth > vw + 1) {
    const offenders = [...document.body.querySelectorAll("*")]
      .filter((el) => visible(el) && el.getBoundingClientRect().right > vw + 1 && !clippedByAncestor(el))
      .slice(0, 6)
      .map(describe);
    issues.push({ type: "overflow", detail: `page ${doc.scrollWidth}px > ${vw}px`, offenders });
  }

  for (const img of document.querySelectorAll("img")) {
    if (!visible(img) || !img.parentElement || clippedByAncestor(img)) continue;
    const r = img.getBoundingClientRect();
    const p = img.parentElement.getBoundingClientRect();
    if (r.width > p.width + 2 && r.right > vw + 1) issues.push({ type: "image", detail: describe(img) });
  }

  const small = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    if (!visible(el) || el.closest("[aria-hidden='true'], .sr-only, svg, [role='img']")) continue;
    if (parseFloat(getComputedStyle(el).fontSize) < 12) small.push(describe(el));
  }
  if (small.length) issues.push({ type: "small-text", detail: `${small.length} element(s) < 12px`, offenders: small.slice(0, 6) });

  if (mobile) {
    const tiny = [];
    for (const el of document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, [role=button], summary, label:has(input)")) {
      if (!visible(el) || el.closest("[aria-hidden='true'], .sr-only, .sr-only-focusable")) continue;
      // Inline links inside running text are exempt (WCAG 2.5.8): an inline link next to text.
      const inSentence = [...(el.parentElement?.childNodes ?? [])].some((n) => n !== el && n.nodeType === 3 && n.textContent.trim());
      if (el.tagName === "A" && getComputedStyle(el).display === "inline" && (inSentence || el.closest("p, li, dd, td, figcaption"))) continue;
      // WCAG 2.5.8 (AA): at least 24 × 24 px.
      const r = el.getBoundingClientRect();
      if (r.height < 24 || r.width < 24) tiny.push(`${describe(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    if (tiny.length) issues.push({ type: "tap-target", detail: `${tiny.length} target(s) too small`, offenders: tiny.slice(0, 8) });
  }

  const clipped = [];
  for (const el of document.body.querySelectorAll("h1, h2, h3, h4, p, a, button, span, li, label, dt, dd")) {
    if (!visible(el) || el.closest("[aria-hidden='true']")) continue;
    const s = getComputedStyle(el);
    if (!/(hidden|clip)/.test(s.overflow + s.overflowX)) continue;
    if (s.textOverflow === "ellipsis" || s.webkitLineClamp !== "none" || s.whiteSpace === "nowrap") continue;
    if (el.scrollWidth <= el.clientWidth + 2 || !el.textContent.trim()) continue;
    // Only text that is really cut counts (decorative images bleeding out of a tile do not).
    const box = el.getBoundingClientRect();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let cut = false;
    for (let node = walker.nextNode(); node && !cut; node = walker.nextNode()) {
      if (!node.textContent.trim() || node.parentElement.closest("[aria-hidden='true']")) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      cut = [...range.getClientRects()].some((r) => r.width > 0 && (r.right > box.right + 1 || r.left < box.left - 1));
    }
    if (cut) clipped.push(describe(el));
  }
  if (clipped.length) issues.push({ type: "clipped-text", detail: `${clipped.length} element(s)`, offenders: clipped.slice(0, 6) });

  // A fixed bottom bar must leave room for the end of the page (footer reachable).
  const bars = [...document.querySelectorAll("body *")].filter((el) => {
    const s = getComputedStyle(el);
    return s.position === "fixed" && visible(el) && el.getBoundingClientRect().bottom >= innerHeight - 1 && el.getBoundingClientRect().height < innerHeight / 2;
  });
  if (bars.length) {
    const h = Math.max(...bars.map((b) => b.getBoundingClientRect().height));
    const padding = parseFloat(getComputedStyle(document.body).paddingBottom) + parseFloat(getComputedStyle(doc).paddingBottom || "0");
    const footer = document.querySelector("footer");
    const footerPad = footer ? parseFloat(footer.style.paddingBottom || "0") : 0;
    if (h > 0 && padding + footerPad < h - 4)
      issues.push({
        type: "sticky-cover",
        detail: `fixed bar ${Math.round(h)}px, page reserves ${Math.round(padding + footerPad)}px`,
        offenders: bars.slice(0, 2).map(describe),
      });
  }
  return issues;
}

const browser = await chromium.launch();
const report = {};
let total = 0;

async function audit(context, width, [name, route, state]) {
  const page = await context.newPage();
  let issues;
  try {
    for (let attempt = 0; ; attempt++) {
      // "load", not "networkidle": the dev server keeps a live connection open (hot reload).
      const res = await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 120_000 });
      if (res && res.status() < 500) break;
      if (attempt === 2) throw new Error(`HTTP ${res?.status()}`);
      await page.waitForTimeout(3000);
    }
    await page.waitForTimeout(800);
    if (state && (await STATES[state](page, width)) === "skip") return;
    await page.waitForTimeout(300);
    issues = await page.evaluate(measure, width < 760);
    if (shotWidths.includes(width)) await page.screenshot({ path: path.join(out, String(width), `${name}.png`), fullPage: true });
  } catch (e) {
    issues = [{ type: "error", detail: String(e.message ?? e).slice(0, 200) }];
  } finally {
    await page.close();
  }
  if (issues?.length) {
    report[`${width} ${name}`] = issues;
    total += issues.length;
    console.log(`✗ ${width} ${name}: ${issues.map((i) => `${i.type} (${i.detail})`).join("; ")}`);
  }
}

for (const width of WIDTHS) {
  mkdirSync(path.join(out, String(width)), { recursive: true });
  const todo = PAGES.filter(([name, route]) => !only || only.includes(route) || only.includes(name));
  // One browser context per worker (cookies differ between pages: the basket states).
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      for (let item = todo.shift(); item; item = todo.shift()) {
        await context.clearCookies();
        if (NEEDS_CART.has(item[2])) await context.addCookies([{ name: "cm_cart", value: CART, url: base }]);
        await audit(context, width, item);
      }
      await context.close();
    }),
  );
  console.log(`· ${width} done`);
}
await browser.close();
writeFileSync(path.join(out, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
const byWidth = Object.fromEntries(
  WIDTHS.map((w) => [
    w,
    Object.entries(report)
      .filter(([k]) => k.startsWith(`${w} `))
      .reduce((n, [, v]) => n + v.length, 0),
  ]),
);
console.log(`\n${total} issue(s). Per width: ${JSON.stringify(byWidth)}. Report: test-results/responsive/report.json`);
process.exit(total ? 1 : 0);
