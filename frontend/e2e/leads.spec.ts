import { expect, test } from "@playwright/test";
import { E2E, testPhone, waitFormGuard } from "./helpers";

/** Quote request (Demander un devis): the lead is stored and the "Demande envoyée" state shows. */
test("a visitor sends a quote request", async ({ page }) => {
  await page.goto("/demander-un-devis");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.locator("#q-name").fill(`${E2E} Devis`);
  await page.locator("#q-phone").fill(testPhone());
  await page.locator("#q-message").fill("Test automatique de bout en bout : merci d'ignorer cette demande.");
  await waitFormGuard(page);
  await page.getByRole("button", { name: "Envoyer ma demande" }).click();

  await expect(page.getByRole("heading", { name: "Demande envoyée" })).toBeVisible({ timeout: 120_000 });
});
