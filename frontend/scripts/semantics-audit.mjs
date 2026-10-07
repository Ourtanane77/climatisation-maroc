// Semantic audit of the server-rendered HTML of every sitemap URL (plus key routes): one h1,
// no skipped heading level, landmarks (header, main, footer, labelled navs), breadcrumb with
// BreadcrumbList JSON-LD on inner pages, lang="fr-MA".
//   node scripts/semantics-audit.mjs [base=http://localhost:8080]
const base = (process.argv[2] ?? "http://localhost:8080").replace(/\/$/, "");
const xml = await (await fetch(`${base}/sitemap.xml`)).text();
const urls = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))];
for (const extra of ["/panier", "/comparer", "/recherche?q=lg", "/suivi-commande", "/connexion", "/page-inexistante"]) urls.push(extra);

const problems = [];
let checked = 0;
async function audit(path) {
  const res = await fetch(base + encodeURI(path));
  const html = await res.text();
  checked++;
  const issues = [];
  const body = html.replace(/<script[\s\S]*?<\/script>/g, "");
  const h1 = (body.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) issues.push(`${h1} h1`);
  const levels = [...body.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) {
      issues.push(`heading jump h${levels[i - 1]}→h${levels[i]}`);
      break;
    }
  }
  if (!/<html[^>]*lang="fr-MA"/.test(html)) issues.push("lang");
  if (!/<main[\s>]/.test(body)) issues.push("no main");
  if (!/<header[\s>]/.test(body)) issues.push("no header");
  if (!/<footer[\s>]/.test(body)) issues.push("no footer");
  if (/<nav(?![^>]*aria-label)[\s>]/.test(body)) issues.push("nav without aria-label");
  const inner = path !== "/" && res.status === 200 && !/\/(panier|commande)/.test(path);
  if (inner && !/aria-label="Fil d(?:'|’|&#x27;|&#39;)Ariane"/.test(body)) issues.push("no breadcrumb");
  if (inner && !html.includes('"BreadcrumbList"')) issues.push("no BreadcrumbList");
  if (issues.length) problems.push(`${path} (${res.status}): ${issues.join(", ")}`);
}

const queue = [...urls];
while (queue.length) await Promise.all(queue.splice(0, 4).map((p) => audit(p).catch((e) => problems.push(`${p}: ${e.message}`))));
console.log(`audited ${checked} pages; with issues: ${problems.length}`);
for (const p of problems) console.log(`  - ${p}`);
