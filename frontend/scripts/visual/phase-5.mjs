// Phase 5 pairs (basket, checkout, confirmation, tracking): `node scripts/visual-compare.mjs phase-5`.
// The site states use the design's demo basket (Panier.dc.html CARTL) and customer; the
// confirmation and tracking actions place one real order in the dev database per run.

const SITE = process.env.SITE ?? "http://localhost:8080";
const CART = [
  { sku: "D13AJH.N", qty: 1 },
  { sku: "CUIV0018", qty: 1 },
  { sku: "CLIM00076", qty: 2 },
];
const CUSTOMER = {
  name: "Yassine El Amrani",
  phone: "06 12 34 56 78",
  email: "",
  city: "marrakech",
  address: "24 rue Ibn Sina, Guéliz",
  note: "",
  technical_visit: false,
  installation_quote: false,
  cgv: true,
  website: "",
  _t: 10000,
};

let placed = null;

async function setCart(page, lines) {
  await page.context().addCookies([{ name: "cm_cart", value: encodeURIComponent(JSON.stringify(lines)), url: SITE }]);
}

async function placeOrder(page) {
  if (placed) return placed;
  const res = await page.request.post(`${SITE}/api/orders`, { data: { ...CUSTOMER, lines: CART } });
  if (res.status() !== 201) throw new Error(`order: ${res.status()} ${await res.text()}`);
  placed = await res.json();
  return placed;
}

const pairs = [
  ["panier", "Panier.dc.html", "/panier", "cart", { full: true }],
  ["panier-vide", "Panier.dc.html?vide=1", "/panier", "emptyCart", { full: true }],
  ["commande", "Commande.dc.html", "/commande", "checkout", { full: true }],
  ["commande-erreurs", "Commande.dc.html", "/commande", "checkoutErrors", { full: true }],
  ["confirmation", "Confirmation.dc.html", "/panier", "confirmation", { full: true }],
  ["suivi-form", "Suivi commande.dc.html?form=1", "/suivi-commande", null, { full: true }],
  ["suivi-resultat", "Suivi commande.dc.html", "/suivi-commande", "track", { full: true }],
];

export default pairs;

export const actions = {
  async cart(page) {
    await setCart(page, CART);
    await page.reload({ waitUntil: "networkidle" });
  },
  async checkout(page) {
    await setCart(page, CART);
    await page.goto(`${SITE}/commande`, { waitUntil: "networkidle" });
  },
  async emptyCart(page) {
    await setCart(page, []);
    await page.reload({ waitUntil: "networkidle" });
  },
  async checkoutErrors(page) {
    await setCart(page, CART);
    await page.goto(`${SITE}/commande`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.getByLabel("Nom complet").fill(CUSTOMER.name);
    await page.getByLabel("Téléphone").fill("06 12 34");
    await page.getByLabel("Adresse").fill(CUSTOMER.address);
    await page.getByRole("button", { name: "Confirmer la commande" }).click();
    await page.waitForTimeout(300);
  },
  async confirmation(page) {
    const order = await placeOrder(page);
    await page.goto(`${SITE}/commande/confirmation?ref=${order.reference}&t=${order.accessToken}`, { waitUntil: "networkidle" });
  },
  async track(page) {
    const order = await placeOrder(page);
    await page.goto(`${SITE}/suivi-commande?ref=${order.reference}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500); // hydration: a value typed earlier is reset by React
    await page.getByLabel("Téléphone").fill(CUSTOMER.phone);
    await page.getByRole("button", { name: "Suivre ma commande" }).click();
    await page.getByText(`Commande ${order.reference}`).waitFor();
  },
};
