import type { Link, SiteNavigation } from "@/lib/types";

/**
 * llms.txt (llmstxt.org) of one storefront: what the site is and where things are, for AI
 * assistants and search engines. Built only from real data: the site's own name and description,
 * and the navigation API (published categories and pages, contact details from Réglages). Each
 * storefront serves its own file with its own absolute URLs.
 */
export function buildLlmsTxt(nav: SiteNavigation, site: { name: string; description: string }, url: (path: string) => string): string {
  const link = (l: Link) => `- [${l.label}](${url(l.href)})`;
  const unique = (links: Link[]) => links.filter((l, i) => links.findIndex((o) => o.href === l.href) === i);
  const out: string[] = [`# ${site.name}`, "", `> ${site.description}`, ""];

  if (nav.footer.about) out.push(nav.footer.about, "");

  const catalogue = nav.ranges.map((r) => ({ label: r.label, href: r.href }));
  if (catalogue.length > 0) {
    out.push("## Catalogue", "", ...unique([...catalogue, nav.promotions]).map(link), "");
  }
  for (const range of nav.ranges) {
    const subs = range.mega?.subs ?? [];
    if (subs.length > 0) out.push(`### ${range.label}`, "", ...unique(subs).map(link), "");
  }
  for (const column of nav.footer.columns) {
    if (column.links.length > 0) out.push(`## ${column.title}`, "", ...unique(column.links).map(link), "");
  }
  if (nav.footer.legal.length > 0) out.push("## Informations légales", "", ...unique(nav.footer.legal).map(link), "");

  const contact: string[] = [];
  if (nav.salesPhone?.display) contact.push(`- ${nav.salesPhone.label || "Ventes"} : ${nav.salesPhone.display}`);
  for (const p of nav.footer.phones) {
    if (p.display && p.display !== nav.salesPhone?.display) contact.push(`- ${p.label} : ${p.display}`);
  }
  if (nav.whatsapp?.display) contact.push(`- WhatsApp : ${nav.whatsapp.display}`);
  for (const s of nav.footer.stores) contact.push(`- ${s.name} : ${s.address}`);
  if (nav.footer.hours) contact.push(`- Horaires : ${nav.footer.hours}`);
  if (contact.length > 0) out.push("## Contact", "", ...contact, "");

  out.push("## Optional", "", `- [Plan du site](${url("/sitemap.xml")})`, "");
  return out.join("\n");
}
