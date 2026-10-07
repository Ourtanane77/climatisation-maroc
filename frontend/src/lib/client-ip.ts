/**
 * The visitor's IP as seen by nginx, forwarded to the API for rate limits. `X-Real-IP` is set by
 * nginx itself ($remote_addr), so the visitor cannot forge it; failing that, the LAST address of
 * `X-Forwarded-For` (the one nginx appended). The first entry is whatever the client sent and
 * must never be trusted: a forged private address would bypass the API's rate limits.
 */
export function clientIpFrom(h: Pick<Headers, "get">): string | null {
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  const chain =
    h
      .get("x-forwarded-for")
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  return chain.at(-1) ?? null;
}
