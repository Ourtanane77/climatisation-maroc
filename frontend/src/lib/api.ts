import "server-only";

/**
 * Server-side client for the Laravel API (/api/v1). Runs inside the Next.js server only:
 * it talks to nginx over the internal network and forwards the reseller token when present.
 */

const API_BASE = `${(process.env.API_INTERNAL_URL ?? "http://localhost:8080").replace(/\/$/, "")}/api/v1`;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
  }
}

interface ApiOptions {
  /** Cache tags for on-demand revalidation (Laravel calls /api/revalidate on save). */
  tags?: string[];
  /** Seconds before background revalidation; false = no time-based revalidation. */
  revalidate?: number | false;
  /** Sanctum token of a logged-in reseller: responses become private (pro prices). */
  token?: string | null;
  init?: RequestInit;
}

export async function apiGet<T>(path: string, { tags, revalidate = 300, token, init }: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...(token ? { cache: "no-store" as const } : { next: { tags, revalidate } }),
  });
  if (!res.ok) {
    throw new ApiError(res.status, `GET ${path} → ${res.status}`, await res.json().catch(() => undefined));
  }
  return (await res.json()) as T;
}
