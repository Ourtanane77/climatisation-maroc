import "server-only";
import { headers } from "next/headers";
import { getToken } from "@/lib/auth";

/**
 * Backend-for-frontend for the forms (devis, contact, secteur, alerte stock, revendeur) and the
 * reseller session: forwards to the Laravel API with the visitor's IP (rate limits) and, when
 * logged in, the reseller token. Responses follow one contract for every form:
 *   200 {ok: true} · 422 {errors: {field: [message]}, message} · 429/500 {message}.
 */

export const API_BASE = `${(process.env.API_INTERNAL_URL ?? "http://localhost:8080").replace(/\/$/, "")}/api/v1`;

export const GENERIC_ERROR = "L’envoi n’a pas abouti. Réessayez ou appelez-nous.";
export const TOO_MANY = "Trop de tentatives. Patientez une minute avant de réessayer.";

/** First address of X-Forwarded-For (set by nginx), i.e. the visitor. */
export async function visitorIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}

export interface Forwarded {
  status: number;
  body: Record<string, unknown>;
}

/** POST to the API (JSON object or FormData) and return its status and JSON body. */
export async function forward(path: string, body: Record<string, unknown> | FormData, { token }: { token?: string | null } = {}): Promise<Forwarded> {
  const ip = await visitorIp();
  const auth = token === undefined ? await getToken() : token;
  const isForm = body instanceof FormData;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
        ...(ip ? { "X-Forwarded-For": ip } : {}),
      },
      body: isForm ? body : JSON.stringify(body),
      cache: "no-store",
    });
    return { status: res.status, body: ((await res.json().catch(() => ({}))) ?? {}) as Record<string, unknown> };
  } catch {
    return { status: 502, body: {} };
  }
}

/** Maps an API answer to the form contract. */
export function formResponse({ status, body }: Forwarded): Response {
  const noStore = { "Cache-Control": "private, no-store" };
  if (status >= 200 && status < 300) return Response.json({ ok: true }, { headers: noStore });
  if (status === 422) {
    return Response.json({ errors: body.errors ?? {}, message: body.message ?? GENERIC_ERROR }, { status: 422, headers: noStore });
  }
  if (status === 429) return Response.json({ message: TOO_MANY }, { status: 429, headers: noStore });
  return Response.json({ message: GENERIC_ERROR }, { status: 500, headers: noStore });
}

/** Reads a JSON object body; anything else becomes an empty object (the API then validates). */
export async function jsonBody(request: Request): Promise<Record<string, unknown>> {
  const data = await request.json().catch(() => null);
  return data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, unknown>) : {};
}

/** Route handler for a JSON form: forwards the body to `path`. */
export function jsonFormHandler(path: string) {
  return async function POST(request: Request): Promise<Response> {
    return formResponse(await forward(path, await jsonBody(request)));
  };
}
