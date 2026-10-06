import "server-only";
import { cache } from "react";
import { apiGet, ApiError } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Reseller } from "./types";

/**
 * The logged-in reseller (GET /auth/me with the cm_token cookie), or null. A stale or revoked
 * token reads as logged out; the cookie is cleared on the next logout or login.
 */
export const getReseller = cache(async (): Promise<Reseller | null> => {
  const token = await getToken();
  if (!token) return null;
  try {
    const { user } = await apiGet<{ user: Reseller }>("/auth/me", { token });
    return user;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return null;
    throw e;
  }
});
