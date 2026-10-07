import { execSync } from "node:child_process";
import path from "node:path";

/**
 * Deletes the orders and leads the suite created ("E2E Test …") from the dev database.
 * E2E_CLEANUP_CMD overrides the command (e.g. in CI); E2E_CLEANUP=0 skips it.
 */
export default function globalTeardown() {
  if (process.env.E2E_CLEANUP === "0") return;
  const command = process.env.E2E_CLEANUP_CMD ?? "docker compose exec -T php php artisan app:e2e-cleanup";
  try {
    const out = execSync(command, { cwd: path.resolve(__dirname, "..", ".."), encoding: "utf8", stdio: "pipe" });
    console.log(`[e2e cleanup] ${out.trim()}`);
  } catch (error) {
    console.warn(`[e2e cleanup] failed: ${(error as Error).message}`);
  }
}
