import { expect, test } from "@playwright/test";
import { E2E, settle, testPhone, waitFormGuard } from "./helpers";

/**
 * Range → category → filter → product → variant → basket → checkout (errors, then a valid order)
 * → confirmation → tracking. Cash on delivery: the order is real and deleted by the teardown.
 */
test("a visitor orders an air conditioner and tracks the order", async ({ page, context }) => {
  await context.clearCookies();
  const phone = testPhone();

  // Range page, then the wall-unit category.
  await page.goto("/climatisation");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.locator('main a[href="/climatisation/mural"]').first().click();
  await expect(page).toHaveURL(/\/climatisation\/mural/);

  // Brand filter (real link, the facet count narrows the grid).
  await page.getByRole("complementary", { name: "Filtres" }).getByRole("checkbox", { name: /^LG\b/ }).click();
  await expect(page).toHaveURL(/marque=lg/);

  // Product page, 12 000 BTU variant.
  await page.getByRole("link", { name: "LG Dual Inverter", exact: true }).first().click();
  await expect(page).toHaveURL(/\/produit\/lg-dual-inverter/);
  // Retried: on the dev server the first click can land before the page is hydrated.
  const variant = page.locator('[aria-labelledby="variant-label"]').getByRole("button", { name: /12\s000 BTU/ });
  await expect(async () => {
    await variant.click();
    await expect(page).toHaveURL(/v=D13AJH\.N/, { timeout: 3_000 });
  }).toPass({ timeout: 60_000 });
  await expect(variant).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Ajouter au panier" }).first().click();
  await expect(page.getByRole("button", { name: "Ajouté au panier" }).first()).toBeVisible();

  // Basket: quantity 1 → 2, re-quoted by the server.
  await page.goto("/panier");
  await expect(page.getByText("D13AJH.N").first()).toBeVisible();
  const stepper = page.getByRole("group", { name: /^Quantité · / }).first();
  await stepper.getByRole("button", { name: "Augmenter la quantité" }).click();
  const qty = stepper.getByRole("textbox");
  if (await qty.count()) await expect(qty).toHaveValue("2");
  else await expect(stepper).toContainText("2");
  await expect.poll(async () => decodeURIComponent((await context.cookies()).find((c) => c.name === "cm_cart")?.value ?? "")).toContain('"qty":2');
  await page.getByRole("link", { name: "Passer la commande" }).first().click();
  await expect(page).toHaveURL(/\/commande$/);

  // Checkout: empty form is refused with the design's messages.
  await page.getByRole("button", { name: "Confirmer la commande" }).click();
  await expect(page.locator("#co-cgv-error")).toBeVisible();
  await expect(page).toHaveURL(/\/commande$/);

  // Valid order (filled again if a dev Fast Refresh clears the form; submitted once).
  const cgv = page.getByRole("checkbox", { name: "Accepter les conditions générales de vente" });
  await settle(
    async () => {
      await page.locator("#co-name").fill(`${E2E} Achat`);
      await page.locator("#co-tel").fill(phone);
      await page.locator("#co-city").selectOption("marrakech");
      await page.locator("#co-adr").fill("12 rue du Test, Guéliz");
      if ((await cgv.getAttribute("aria-checked")) !== "true") await cgv.click();
    },
    async () => {
      await waitFormGuard(page);
      await expect(page.locator("#co-name")).toHaveValue(`${E2E} Achat`, { timeout: 1_000 });
      await expect(page.locator("#co-tel")).toHaveValue(phone, { timeout: 1_000 });
      await expect(cgv).toHaveAttribute("aria-checked", "true", { timeout: 1_000 });
    },
  );
  await page.getByRole("button", { name: "Confirmer la commande" }).click();

  await expect(page).toHaveURL(/\/commande\/confirmation\?ref=CM-\d{4}-\d{5}/, { timeout: 120_000 });
  const reference = new URL(page.url()).searchParams.get("ref")!;
  await expect(page.getByText(reference).first()).toBeVisible();

  // The basket cookie is cleared after the order.
  const cart = (await context.cookies()).find((c) => c.name === "cm_cart");
  expect(!cart || cart.value === "" || cart.value === "%5B%5D" || cart.value === "[]").toBeTruthy();

  // Tracking by reference and phone.
  await page.goto("/suivi-commande");
  await settle(
    async () => {
      await page.locator("#tr-ref").fill(reference);
      await page.locator("#tr-tel").fill(phone);
    },
    async () => {
      await waitFormGuard(page);
      await expect(page.locator("#tr-ref")).toHaveValue(reference, { timeout: 1_000 });
    },
  );
  await page.getByRole("button", { name: "Suivre ma commande" }).click();
  await expect(page.getByRole("heading", { name: `Commande ${reference}` })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: /^Reçue/ })).toBeVisible();
});
