import { cookies } from "next/headers";
import { CART_COOKIE, VISIT_COOKIE } from "@/lib/cart/cookie";
import { apiForward } from "@/lib/commerce/server";

/**
 * Places the order: forwards the checkout form to POST /api/v1/orders (the API re-prices the
 * basket) and empties the basket and visit cookies once the order is recorded.
 */
export async function POST(request: Request) {
  const input = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!input) return Response.json({ message: "Requête invalide." }, { status: 400 });

  const { status, body } = await apiForward<{ reference?: string; accessToken?: string }>("POST", "/orders", input);
  if (status === 201) {
    const jar = await cookies();
    jar.delete(CART_COOKIE);
    jar.delete(VISIT_COOKIE);
  }
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}
