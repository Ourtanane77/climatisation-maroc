// Screenshots design pages and the built site at 1440 and 390 for side-by-side review.
//
//   npx http-server ../design -p 5500   (or: python -m http.server 5500 -d ../design)
//   node scripts/visual-compare.mjs <phase> [site=http://localhost:8080] [design=http://localhost:5500] [--only=name,name]
//
// Pairs are listed per phase below, or in scripts/visual/<phase>.mjs (default export: the pairs
// array; optional named export `actions`). Output goes to test-results/visual/<phase>/.
import { chromium } from "@playwright/test";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const only = process.argv
  .find((a) => a.startsWith("--only="))
  ?.slice(7)
  .split(",");
const [phase = "phase-2", site = "http://localhost:8080", design = "http://localhost:5500"] = process.argv.slice(2).filter((a) => !a.startsWith("--"));

/** name → [design page, site path, optional action] */
const PAIRS = {
  "phase-2": [
    ["accueil-top", "Accueil.dc.html", "/", null, { clip: 220 }],
    ["mega-clim", "Accueil.dc.html?menu=clim", "/", "hoverClim", { clip: 620, only: 1440 }],
    ["drawer", "Accueil.dc.html?drawer=1", "/", "openDrawer", { only: 390 }],
    ["footer", "Accueil.dc.html", "/", "footer", {}],
    ["styleguide", null, "/styleguide", null, { full: true }],
  ],
};

const actions = {
  async hoverClim(page) {
    await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Climatisation", exact: true }).last().hover();
    await page.waitForTimeout(400);
  },
  async openDrawer(page) {
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("navigation", { name: "Menu mobile" }).getByRole("button", { name: "Climatisation" }).click();
    await page.waitForTimeout(300);
  },
};

const extra = path.resolve("scripts/visual", `${phase}.mjs`);
if (existsSync(extra)) {
  const mod = await import(pathToFileURL(extra).href);
  PAIRS[phase] = mod.default;
  Object.assign(actions, mod.actions ?? {});
}

const out = path.resolve("test-results/visual", phase);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();

for (const width of [1440, 390]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  for (const [name, designPage, sitePath, action, opts = {}] of PAIRS[phase] ?? []) {
    if (only && !only.includes(name)) continue;
    if (opts.only && opts.only !== width) continue;
    for (const [kind, url] of [
      ["design", designPage && `${design}/${encodeURI(designPage)}`],
      ["site", sitePath && `${site}${sitePath}`],
    ]) {
      if (!url) continue;
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
      await page.waitForTimeout(kind === "design" ? 1500 : 300);
      if (kind === "site" && action && actions[action]) await actions[action](page);
      const file = path.join(out, `${name}-${width}-${kind}.png`);
      if (action === "footer") {
        await page.locator("footer").first().screenshot({ path: file });
      } else if (opts.clip) {
        await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height: opts.clip } });
      } else {
        await page.screenshot({ path: file, fullPage: !!opts.full });
      }
      console.log("✓", path.relative(process.cwd(), file));
      await page.close();
    }
  }
  await context.close();
}
await browser.close();
