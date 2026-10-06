// Screenshots of the Filament back office (review aid, not a test).
//   node scripts/admin-screens.mjs [base=http://localhost:8080] [email] [password]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const [base = "http://localhost:8080", email = "admin@climatisationmaroc.test", password = "change-me-admin"] = process.argv.slice(2);
const out = "test-results/visual/admin";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(`${base}/admin/login`);
await page.locator('[id="form.email"]').fill(email);
await page.locator('[id="form.password"]').fill(password);
await page.getByRole("button", { name: "Connexion" }).click();
await page.waitForURL(`${base}/admin`);

const shots = [
  ["dashboard", "/admin"],
  ["products", "/admin/products"],
  ["products-a-verifier", "/admin/products?filters[a_verifier][isActive]=true"],
  ["product-variants", "/admin/products/1/edit?tab=variantes::data::tab"],
  ["categories", "/admin/categories"],
  ["order", "/admin/orders/1"],
  ["leads", "/admin/leads"],
  ["settings", "/admin/manage-general-settings"],
];
for (const [name, path] of shots) {
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: false });
  console.log("✓", name);
}
await browser.close();
