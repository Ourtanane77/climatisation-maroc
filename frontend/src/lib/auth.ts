import "server-only";
import { cookies } from "next/headers";

/**
 * Reseller session (backend-for-frontend, docs/plan.md §5 "Auth model"): the Sanctum token lives in
 * the httpOnly `cm_token` cookie, set by the Next route handlers under /api/auth/*. Server
 * components forward it to the API so pro prices are rendered on the server only.
 */
export const AUTH_COOKIE = "cm_token";

export async function getToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE)?.value || null;
}
