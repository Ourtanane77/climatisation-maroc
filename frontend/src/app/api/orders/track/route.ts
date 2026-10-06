import { apiForward } from "@/lib/commerce/server";

/** Order tracking lookup (Suivre ma commande): forwards {reference, phone} to the API. */
export async function POST(request: Request) {
  const input = (await request.json().catch(() => null)) as { reference?: unknown; phone?: unknown } | null;
  const { status, body } = await apiForward("POST", "/orders/track", {
    reference: typeof input?.reference === "string" ? input.reference : "",
    phone: typeof input?.phone === "string" ? input.phone : "",
  });
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}
