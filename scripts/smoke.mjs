#!/usr/bin/env node
// Smoke test through nginx: checks that each part of the stack answers on its public route.
// Catches routing mistakes the unit tests cannot see (they bypass nginx), such as the
// Livewire hashed script path or the /storage alias.
//
//   node scripts/smoke.mjs [base=http://localhost:8080]
//
// Exit code 1 when a required check fails. sitemap.xml and robots.txt only warn while missing.

const base = (
  process.argv[2] ??
  process.env.SMOKE_BASE_URL ??
  "http://localhost:8080"
).replace(/\/$/, "");
const results = [];

async function check(name, fn, { optional = false } = {}) {
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail });
  } catch (error) {
    results.push({ name, ok: false, optional, detail: error.message });
  }
}

async function get(path, init) {
  const res = await fetch(`${base}${path}`, { redirect: "manual", ...init });
  return { res, text: await res.text() };
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

await check("Front office home (Next.js)", async () => {
  const { res, text } = await get("/");
  expect(res.status === 200, `status ${res.status}`);
  expect(text.includes('lang="fr-MA"'), "html lang fr-MA missing");
  return "200";
});

await check("Laravel health (/up)", async () => {
  const { res } = await get("/up");
  expect(res.status === 200, `status ${res.status}`);
  return "200";
});

await check("API health (/api/v1/health)", async () => {
  const { res, text } = await get("/api/v1/health");
  expect(res.status === 200, `status ${res.status}`);
  expect(JSON.parse(text).status === "ok", "status is not ok");
  return "ok";
});

let livewireScript = null;
await check("Back office login (/admin/login)", async () => {
  const { res, text } = await get("/admin/login");
  expect(res.status === 200, `status ${res.status}`);
  livewireScript =
    text.match(
      /src="([^"]*\/livewire[^"/]*\/livewire(?:\.min)?\.js[^"]*)"/,
    )?.[1] ?? null;
  expect(livewireScript, "no Livewire script tag found");
  return "200";
});

await check("Livewire script (hashed path)", async () => {
  expect(livewireScript, "skipped: no script path");
  const path = livewireScript.startsWith("http")
    ? new URL(livewireScript).pathname + new URL(livewireScript).search
    : livewireScript;
  const { res } = await get(path);
  expect(res.status === 200, `status ${res.status} for ${path}`);
  expect(
    (res.headers.get("content-type") ?? "").includes("javascript"),
    `content-type ${res.headers.get("content-type")}`,
  );
  return path.split("?")[0];
});

await check("Uploaded file (/storage)", async () => {
  const { res, text } = await get(
    "/api/v1/categories/climatisation/mural/products",
  );
  expect(res.status === 200, `products API status ${res.status}`);
  const image = JSON.parse(text)
    .data?.map((p) => p.image)
    .find(Boolean);
  expect(
    image,
    "no product with a downloaded image (run catalog:download-images)",
  );
  const file = await fetch(`${base}${image}`);
  expect(file.status === 200, `status ${file.status} for ${image}`);
  expect(
    (file.headers.get("content-type") ?? "").startsWith("image/"),
    `content-type ${file.headers.get("content-type")}`,
  );
  return image;
});

await check("Revalidation endpoint refuses without secret", async () => {
  const { res } = await get("/api/revalidate", { method: "POST" });
  expect(res.status === 403, `status ${res.status}`);
  return "403";
});

await check("Unpublished page is not served (/cgv)", async () => {
  const { res } = await get("/cgv");
  expect(
    res.status === 404,
    `status ${res.status} (stale front-office cache? see docs/architecture.md)`,
  );
  return "404";
});

for (const path of ["/sitemap.xml", "/robots.txt"]) {
  await check(
    path,
    async () => {
      const { res } = await get(path);
      expect(res.status === 200, `status ${res.status}`);
      return "200";
    },
    { optional: true },
  );
}

let failed = 0;
for (const r of results) {
  const mark = r.ok ? "PASS" : r.optional ? "WARN" : "FAIL";
  if (!r.ok && !r.optional) failed++;
  console.log(`${mark}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
}
console.log(
  `\n${base}: ${results.length - failed} of ${results.length} checks passed or tolerated.`,
);
process.exit(failed ? 1 : 0);
