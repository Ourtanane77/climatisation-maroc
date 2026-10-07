// Internal-link audit: crawls the server-rendered HTML from / following <a href> only, then lists
// the sitemap URLs and key routes that no page links to (an orphan page cannot be found by
// visitors or search engines). Client-only menus (mobile drawer) are not counted.
//   node scripts/crawl-links.mjs [base=http://localhost:8080] [--max=600]
const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith("--")) ?? "http://localhost:8080").replace(/\/$/, "");
const max = Number(args.find((a) => a.startsWith("--max="))?.slice(6) ?? 600);
const origin = new URL(base).origin;

const skip = /^\/(api|admin|storage|_next|design|brand|livewire)(\/|$)/;
function norm(href) {
  try {
    const u = new URL(href.replace(/&amp;/g, "&"), base);
    if (u.origin !== origin || skip.test(u.pathname)) return null;
    return decodeURI(u.pathname.replace(/\/$/, "") || "/");
  } catch {
    return null;
  }
}

const linkedFrom = new Map();
const visited = new Set();
const queue = ["/"];
const broken = [];

async function visit(path) {
  try {
    const res = await fetch(base + encodeURI(path), { redirect: "manual" });
    if (res.status >= 300 && res.status < 400) return;
    if (res.status >= 400) {
      broken.push(`${path} (${res.status}) linked from ${linkedFrom.get(path)}`);
      return;
    }
    const html = await res.text();
    for (const m of html.matchAll(/<a\b[^>]*\shref="([^"#][^"]*)"/g)) {
      const p = norm(m[1]);
      if (!p) continue;
      if (!linkedFrom.has(p)) linkedFrom.set(p, path);
      if (!visited.has(p) && !queue.includes(p)) queue.push(p);
    }
  } catch (e) {
    broken.push(`${path} (${e.message})`);
  }
}

while (queue.length && visited.size < max) {
  const batch = queue.splice(0, 4).filter((p) => !visited.has(p));
  batch.forEach((p) => visited.add(p));
  await Promise.all(batch.map(visit));
}

const xml = await (await fetch(`${base}/sitemap.xml`)).text();
const sitemap = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => norm(m[1])).filter(Boolean);
const key = [
  "/comparer",
  "/calculateur-puissance",
  "/plan-du-site",
  "/suivi-commande",
  "/blog",
  "/marques",
  "/solutions",
  "/services",
  "/promotions",
  "/espace-professionnel",
  "/devenir-revendeur",
  "/livraison-et-paiement",
  "/a-propos",
  "/contact",
  "/demander-un-devis",
];
const targets = [...new Set([...sitemap, ...key])].sort();
const missing = targets.filter((t) => !linkedFrom.has(t));
console.log(`crawled ${visited.size} pages; targets ${targets.length}; linked ${targets.length - missing.length}; NOT linked ${missing.length}`);
for (const m of missing) console.log(`  - ${m}`);
if (broken.length) {
  console.log(`broken internal links: ${broken.length}`);
  for (const b of broken.slice(0, 40)) console.log(`  ! ${b}`);
}
