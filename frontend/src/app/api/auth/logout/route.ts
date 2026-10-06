import { getToken } from "@/lib/auth";
import { forward } from "@/lib/leads/server";
import { clearSessionCookie } from "@/lib/pro/cookie";

/**
 * Logout: revokes the token and clears the cookie. A plain HTML form post (AccountBar
 * "Se déconnecter") is redirected to /connexion; a fetch gets {ok: true}.
 */
export async function POST(request: Request): Promise<Response> {
  const token = await getToken();
  if (token) await forward("/auth/logout", {}, { token });
  await clearSessionCookie();

  const isForm = (request.headers.get("content-type") ?? "").includes("application/x-www-form-urlencoded");
  if (isForm) return new Response(null, { status: 303, headers: { Location: "/connexion" } });
  return Response.json({ ok: true });
}
