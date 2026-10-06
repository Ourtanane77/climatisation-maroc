/** Container health check (docker-compose.prod.yml). */
export function GET() {
  return Response.json({ status: "ok" });
}
