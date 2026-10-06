import { forward, formResponse, jsonBody } from "@/lib/leads/server";

/** New password from the e-mailed link: {token, email, password}. */
export async function POST(request: Request): Promise<Response> {
  const body = await jsonBody(request);
  return formResponse(await forward("/auth/reset", { token: body.token, email: body.email, password: body.password }, { token: null }));
}
