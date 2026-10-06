"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Client side of the form contract (see lib/leads/server.ts): posts to a Next route handler and
 * returns `ok`, field `errors` or a general `message`.
 */
export type FormErrors = Record<string, string[]>;
export type SubmitResult = { ok: true; data: Record<string, unknown> } | { ok: false; errors: FormErrors; message: string };

export const NETWORK_ERROR = "L’envoi n’a pas abouti. Réessayez ou appelez-nous.";

export async function submitForm(endpoint: string, body: Record<string, unknown> | FormData): Promise<SubmitResult> {
  try {
    const isForm = body instanceof FormData;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: isForm ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
      body: isForm ? body : JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.ok) return { ok: true, data: json };
    return {
      ok: false,
      errors: (json.errors as FormErrors | undefined) ?? {},
      message: typeof json.message === "string" ? json.message : NETWORK_ERROR,
    };
  } catch {
    return { ok: false, errors: {}, message: NETWORK_ERROR };
  }
}

/** First message for a field, if any. */
export function fieldError(errors: FormErrors, field: string): string | null {
  return errors[field]?.[0] ?? null;
}

/**
 * Anti-spam fields expected by the API: the honeypot `website` (rendered by <Honeypot/>) and `_t`,
 * the milliseconds since the form was shown.
 */
export function useFormTimer() {
  const shownAt = useRef<number | null>(null);
  useEffect(() => {
    shownAt.current = performance.now();
  }, []);
  return useCallback(
    (form: HTMLFormElement | null) => ({
      website: (form?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "",
      _t: Math.round(performance.now() - (shownAt.current ?? performance.now())),
      source_url: typeof window !== "undefined" ? window.location.href : undefined,
    }),
    [],
  );
}
