import { expect, test } from "@playwright/test";

/** Phone width (390 px): the menu drawer and the category filter sheet open and close. */
test("the mobile drawer opens with the ranges", async ({ page }) => {
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await expect(async () => {
    await menu.click();
    await expect(page.getByRole("navigation", { name: "Menu mobile" })).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout: 60_000 });
  const drawer = page.getByRole("navigation", { name: "Menu mobile" });
  await drawer.getByRole("button", { name: "Climatisation" }).click();
  await expect(drawer.getByRole("link", { name: /Mural|Mono split/ }).first()).toBeVisible();
});

test("the mobile filter sheet opens on a category page", async ({ page }) => {
  await page.goto("/climatisation/mural");
  const open = page.getByRole("button", { name: "Filtres", exact: true });
  await expect(async () => {
    await open.click();
    await expect(page.getByRole("dialog", { name: "Filtres" })).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout: 60_000 });
  const sheet = page.getByRole("dialog", { name: "Filtres" });
  await expect(sheet.getByRole("checkbox", { name: /^LG\b/ })).toBeVisible();
  await sheet.getByRole("button", { name: "Fermer" }).click();
  await expect(sheet).toBeHidden();
});
