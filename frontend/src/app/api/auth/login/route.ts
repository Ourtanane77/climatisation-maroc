import { forward, formResponse, jsonBody } from "@/lib/leads/server";
import { safeNext, setSessionCookie } from "@/lib/pro/cookie";

/**
 * Reseller login: {login, password, next?} → sets the httpOnly cm_token cookie and answers
 * {ok: true, next}. Failures follow the form contract (422 with the design's message).
 */
export async function POST(request: Request): Promise<Response> {
  const body = await jsonBody(request);
  const result = await forward("/auth/login", { login: body.login, password: body.password }, { token: null });
  const token = result.body.token;
  if (result.status !== 200 || typeof token !== "string") return formResponse(result);

  await setSessionCookie(token);
  return Response.json({ ok: true, next: safeNext(body.next) }, { headers: { "Cache-Control": "private, no-store" } });
}
