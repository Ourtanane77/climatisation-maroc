import { forward, jsonBody } from "@/lib/leads/server";

/** Quick-order resolution (logged-in resellers): {lines: [{ref, qty}]} or {paste}. */
export async function POST(request: Request): Promise<Response> {
  const body = await jsonBody(request);
  const { status, body: json } = await forward("/pro/quick-order/resolve", { lines: body.lines, paste: body.paste });
  return Response.json(json, { status, headers: { "Cache-Control": "private, no-store" } });
}
