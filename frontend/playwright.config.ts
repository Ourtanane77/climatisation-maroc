import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a running stack (nginx in front of Next.js and Laravel):
 *   make up && make e2e            (or: cd frontend && npm run test:e2e)
 * E2E_BASE_URL points elsewhere (default http://localhost:8080). The tests place real orders and
 * leads named "E2E Test …"; e2e/global-teardown.ts deletes them (php artisan app:e2e-cleanup).
 * One worker: the tests share the database and the form rate limits.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  // The dev server compiles pages on first visit: allow for it.
  timeout: 180_000,
  expect: { timeout: 30_000 },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    locale: "fr-MA",
    navigationTimeout: 120_000,
    actionTimeout: 30_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      testIgnore: /mobile\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
});
