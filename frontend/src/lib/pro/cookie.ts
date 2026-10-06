import "server-only";
import { cookies, headers } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";

/** Lifetime of the reseller session; matches the Sanctum token expiry (AuthController::TOKEN_DAYS). */
const MAX_AGE = 60 * 60 * 24 * 30;

async function isHttps(): Promise<boolean> {
  const h = await headers();
  return (h.get("x-forwarded-proto") ?? "").split(",")[0]?.trim() === "https" || process.env.NODE_ENV === "production";
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(AUTH_COOKIE, token, { httpOnly: true, secure: await isHttps(), sameSite: "lax", path: "/", maxAge: MAX_AGE });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(AUTH_COOKIE, "", { httpOnly: true, secure: await isHttps(), sameSite: "lax", path: "/", maxAge: 0 });
}

/** Only same-site paths are accepted as a post-login destination. */
export function safeNext(next: unknown, fallback = "/espace-professionnel/commande-rapide"): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
