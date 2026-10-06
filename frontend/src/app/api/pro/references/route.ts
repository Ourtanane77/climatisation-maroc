import { getToken } from "@/lib/auth";
import { API_BASE } from "@/lib/leads/server";

/** Quick-order autocomplete (logged-in resellers): GET ?q= → up to 5 references. */
export async function GET(request: Request): Promise<Response> {
  const token = await getToken();
  if (!token) return Response.json({ data: [] }, { status: 401 });
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const res = await fetch(`${API_BASE}/pro/references?q=${encodeURIComponent(q.slice(0, 64))}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);
  const body = res ? await res.json().catch(() => ({ data: [] })) : { data: [] };
  return Response.json(body, { status: res?.status ?? 502, headers: { "Cache-Control": "private, no-store" } });
}
