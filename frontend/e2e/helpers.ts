import { expect, type Page } from "@playwright/test";

/** Name prefix of everything the suite creates (deleted by `php artisan app:e2e-cleanup`). */
export const E2E = "E2E Test";

/** Form posts are refused when the form was open less than 3 s (`_t`, docs/architecture.md). */
export async function waitFormGuard(page: Page) {
  await page.waitForTimeout(3_500);
}

/** A valid Moroccan mobile number, different per run so the per-phone rate limit is not shared. */
export function testPhone(): string {
  return `06${String(Date.now()).slice(-8)}`;
}

/**
 * Runs `fill` until `check` passes. On the dev server a Fast Refresh (a file edited while the tests
 * run) remounts client components and clears what was typed; production never does.
 */
export async function settle(fill: () => Promise<void>, check: () => Promise<void>, timeout = 60_000) {
  await expect(async () => {
    await fill();
    await check();
  }).toPass({ timeout });
}
