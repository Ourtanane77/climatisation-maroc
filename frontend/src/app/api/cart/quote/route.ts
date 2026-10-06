import { apiForward } from "@/lib/commerce/server";
import type { Quote } from "@/lib/commerce/types";

/**
 * Re-quotes the basket (Panier, Commande): forwards to POST /api/v1/cart/quote with the reseller
 * token, so the prices shown are always the server's.
 */
export async function POST(request: Request) {
  const input = (await request.json().catch(() => null)) as { lines?: unknown; options?: unknown } | null;
  const lines = Array.isArray(input?.lines) ? input.lines.slice(0, 100) : [];
  const { status, body } = await apiForward<Quote>("POST", "/cart/quote", { lines, options: input?.options ?? {} });
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}
