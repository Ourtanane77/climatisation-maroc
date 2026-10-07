import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Called by Laravel after a back-office change (App\Support\Frontend\Revalidator). Expires the
 * given cache tags immediately ({ expire: 0 }): an unpublished page must stop being served at
 * once, and Next never replaces a cached 200 with the API's 404 on its own.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as { tags?: unknown };
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string" && t.length > 0) : ["api"];
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: tags });
}
