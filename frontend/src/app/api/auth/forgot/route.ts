import { forward, formResponse, jsonBody } from "@/lib/leads/server";

/** "Recevoir le lien": {login} (e-mail or phone). Always {ok: true} for an existing or unknown account. */
export async function POST(request: Request): Promise<Response> {
  const body = await jsonBody(request);
  return formResponse(await forward("/auth/forgot", { login: body.login }, { token: null }));
}
