import { expect, test } from "@playwright/test";
import { settle } from "./helpers";

/**
 * Reseller space: log in as the demo reseller (DemoSeeder, development only), paste references in
 * the quick order, add them to the basket, log out. Skipped without E2E_RESELLER_PASSWORD (the
 * value of SEED_RESELLER_PASSWORD; `make e2e` passes the dev default).
 */
const login = process.env.E2E_RESELLER_LOGIN ?? "contact@froid-atlas.ma";
const password = process.env.E2E_RESELLER_PASSWORD;

test("a validated reseller orders by reference", async ({ page, context }) => {
  test.skip(!password, "E2E_RESELLER_PASSWORD is not set");
  await context.clearCookies();

  // The quick order is protected: logged-out visitors are sent to the login page.
  await page.goto("/espace-professionnel/commande-rapide");
  await expect(page).toHaveURL(/\/connexion/);

  await page.locator("#login").fill(login);
  await page.locator("#password").fill(password!);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/espace-professionnel\/commande-rapide/, { timeout: 120_000 });
  await expect(page.getByRole("button", { name: "Se déconnecter" }).first()).toBeVisible();

  // Paste two known references (one with a quantity) and one unknown.
  const pasteBox = page.getByRole("textbox", { name: /Une référence et une quantité par ligne/ });
  await settle(
    async () => {
      if (!(await pasteBox.isVisible())) await page.getByRole("button", { name: "Coller une liste de références" }).click({ timeout: 5_000 });
      await pasteBox.fill("CUIV0018 2\nCLIM00076 3\nINCONNU999 1", { timeout: 5_000 });
      await page.getByRole("button", { name: "Ajouter à la liste" }).click({ timeout: 5_000 });
    },
    () => expect(page.getByText(/ligne à corriger ne sera pas ajoutée/)).toBeVisible({ timeout: 10_000 }),
    120_000,
  );

  await page.getByRole("button", { name: "Ajouter au panier" }).first().click();
  await expect
    .poll(async () => decodeURIComponent((await context.cookies()).find((c) => c.name === "cm_cart")?.value ?? ""))
    .toMatch(/CUIV0018.*CLIM00076|CLIM00076.*CUIV0018/);

  // Logout ends the session and the quick order is protected again.
  await page.getByRole("button", { name: "Se déconnecter" }).first().click();
  await expect(page).toHaveURL(/\/connexion/);
  expect((await context.cookies()).some((c) => c.name === "cm_token" && c.value)).toBeFalsy();
});
