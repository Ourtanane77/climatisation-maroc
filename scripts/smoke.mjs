#!/usr/bin/env node
// Smoke test through nginx: checks that each part of the stack answers on its public route.
// Catches routing mistakes the unit tests cannot see (they bypass nginx), such as the
// Livewire hashed script path or the /storage alias.
//
//   node scripts/smoke.mjs [base=http://localhost:8080] [arfro=<derived>]
//
// The second storefront (Arfro) is checked too: by default http://arfro.localhost:<port> when the
// base is localhost (sent to the base with that Host header, so no DNS entry is needed), otherwise
// pass its URL (e.g. https://arfro.com) or set SMOKE_ARFRO_URL; "none" skips it.
//
// Exit code 1 when a required check fails. sitemap.xml and robots.txt only warn while missing.

import http from "node:http";
import https from "node:https";

const base = (
  process.argv[2] ??
  process.env.SMOKE_BASE_URL ??
  "http://localhost:8080"
).replace(/\/$/, "");
const baseUrl = new URL(base);
const isLocal = ["localhost", "127.0.0.1"].includes(baseUrl.hostname);
const arfroArg =
  process.argv[3] ??
  process.env.SMOKE_ARFRO_URL ??
  (isLocal ? `http://arfro.localhost${baseUrl.port ? `:${baseUrl.port}` : ""}` : null);
const arfro =
  arfroArg && arfroArg !== "none" ? arfroArg.replace(/\/$/, "") : null;
const results = [];

async function check(name, fn, { optional = false } = {}) {
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail });
  } catch (error) {
    results.push({
      name,
      ok: false,
      optional: optional || error.warn === true,
      detail: error.message,
    });
  }
}

function warn(message) {
  return Object.assign(new Error(message), { warn: true });
}

async function get(path, init) {
  const res = await fetch(`${base}${path}`, { redirect: "manual", ...init });
  return { res, text: await res.text() };
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

// GET on another storefront. fetch() cannot override Host, so *.localhost hosts (which Node does
// not resolve on every system) are requested from the base address with a Host header.
function siteGet(siteBase, path) {
  const target = new URL(`${siteBase}${path}`);
  const viaBase = target.hostname.endsWith(".localhost");
  const connect = viaBase ? baseUrl : target;
  const client = connect.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(
      {
        hostname: connect.hostname,
        port: connect.port || undefined,
        path: target.pathname + target.search,
        method: "GET",
        headers: { host: target.host },
        timeout: 120000,
      },
      (res) => {
        let text = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () => resolve({ status: res.statusCode, text }));
      },
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    req.end();
  });
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

await check("Unpublished page is not served (/confidentialite)", async () => {
  const { res } = await get("/confidentialite");
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

// ---- Second storefront (Arfro): own Next.js instance behind the same nginx and API. ----
if (arfro) {
  const arfroHost = new URL(arfro).host;
  const cmHost = baseUrl.host;

  await check(`Arfro home (${arfroHost})`, async () => {
    const { status, text } = await siteGet(arfro, "/");
    expect(status === 200, `status ${status} (is next-arfro running?)`);
    expect(text.includes('lang="fr-MA"'), "html lang fr-MA missing");
    return "200";
  });

  await check(`Arfro API health (${arfroHost}/api/v1/health)`, async () => {
    const { status, text } = await siteGet(arfro, "/api/v1/health");
    expect(status === 200, `status ${status}`);
    expect(JSON.parse(text).status === "ok", "status is not ok");
    return "ok";
  });

  for (const path of ["/robots.txt", "/sitemap.xml"]) {
    await check(`Arfro ${path} uses ${arfroHost}`, async () => {
      const { status, text } = await siteGet(arfro, path);
      if (status === 404) throw warn("404");
      expect(status === 200, `status ${status}`);
      expect(text.includes(`//${arfroHost}`), `no URL on ${arfroHost}`);
      expect(
        arfroHost === cmHost || !text.includes(`//${cmHost}/`),
        `lists URLs of ${cmHost}`,
      );
      return "200";
    });
  }
} else {
  results.push({
    name: "Arfro storefront",
    ok: false,
    optional: true,
    detail: "skipped: pass its URL as second argument or SMOKE_ARFRO_URL",
  });
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
