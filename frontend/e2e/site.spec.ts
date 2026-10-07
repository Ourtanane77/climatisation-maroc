import { expect, test } from "@playwright/test";

/** Unpublished and unknown pages answer 404 with the design's « Page introuvable ». */
test("unpublished and unknown pages are not found", async ({ page }) => {
  for (const path of ["/cgv", "/une-page-qui-n-existe-pas", "/produit/produit-inexistant", "/climatisation/type-inexistant"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
  }
  await expect(page.getByText("Cette page n'existe pas", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "Retour à l'accueil" })).toBeVisible();
});

/** The back office answers through nginx and asks for a login. */
test("the back office login page renders", async ({ page }) => {
  const response = await page.goto("/admin/login");
  expect(response?.status()).toBe(200);
  await expect(page.locator('[id="form.email"]')).toBeVisible();
});
