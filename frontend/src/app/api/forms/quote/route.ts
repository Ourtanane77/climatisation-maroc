import { forward, formResponse, jsonBody } from "@/lib/leads/server";

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Demander un devis. Multipart (optional `attachment`, image or PDF ≤ 10 MB) or JSON.
 * Contract: lib/leads/server.ts.
 */
export async function POST(request: Request): Promise<Response> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("multipart/form-data")) {
    return formResponse(await forward("/leads/quote", await jsonBody(request)));
  }

  const form = await request.formData().catch(() => null);
  if (!form) return formResponse({ status: 422, body: { errors: {} } });
  const file = form.get("attachment");
  if (file instanceof File && file.size > MAX_BYTES) {
    return formResponse({ status: 422, body: { errors: { attachment: ["Le fichier dépasse 10 Mo."] } } });
  }
  if (file instanceof File && file.size === 0) form.delete("attachment");
  return formResponse(await forward("/leads/quote", form));
}
