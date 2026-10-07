import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/content/blocks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { cn } from "@/lib/cn";
import { getSiteMap } from "@/lib/content/api";
import type { SiteMapData, SiteMapLink } from "@/lib/content/types";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Plan du site", path: "/plan-du-site" });

interface Item extends SiteMapLink {
  quote?: boolean;
  sub?: SiteMapLink[];
}
interface Group {
  title: string;
  items: Item[];
}

/**
 * The six groups of the "Plan du site" board (design/Plan du site.dc.html). Catalogue and content
 * entries come from the API (active categories, published pages only); fixed routes are listed here.
 */
function groups(m: SiteMapData): Group[] {
  const page = (kind: string) => m.pages.filter((p) => p.kind === kind);
  return [
    {
      title: "Catalogue",
      items: [
        ...m.ranges.map((r) => ({ title: r.title, href: r.href, quote: r.quoteOnly, sub: r.children })),
        { title: "Promotions", href: "/promotions" },
        { title: "Marques", href: "/marques" },
        ...(m.cities.length ? [{ title: "Climatisation par ville", href: m.cities[0].href, sub: m.cities }] : []),
      ],
    },
    {
      title: "Services",
      items: [...m.services.map((s) => ({ ...s, quote: s.href.endsWith("/installation") })), ...page("delivery")],
    },
    {
      title: "Guides",
      items: [
        { title: "Calculateur de puissance", href: "/calculateur-puissance" },
        ...(m.articles.length ? [{ title: "Blog", href: "/blog", sub: m.blogCategories }] : []),
        ...m.articles,
      ],
    },
    {
      title: "Professionnels",
      items: [
        { title: "Espace professionnel", href: "/espace-professionnel" },
        { title: "Devenir revendeur", href: "/devenir-revendeur" },
        { title: "Connexion", href: "/connexion" },
        { title: "Commande rapide par référence", href: "/espace-professionnel/commande-rapide" },
        { title: "Solutions professionnelles", href: "/solutions", sub: m.sectors },
      ],
    },
    {
      title: "Achat",
      items: [
        { title: "Panier", href: "/panier" },
        { title: "Suivre ma commande", href: "/suivi-commande" },
        {
          title: "Demander un devis",
          href: "/demander-un-devis",
          quote: true,
          sub: [
            { title: "Particulier", href: "/demander-un-devis" },
            { title: "Professionnel", href: "/demander-un-devis?pro=1" },
          ],
        },
      ],
    },
    {
      title: "Entreprise",
      items: [...page("about"), { title: "Nos magasins et contact", href: "/contact" }, ...page("legal"), ...page("other")],
    },
  ];
}

export default async function SiteMapPage() {
  const data = await getSiteMap();

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Plan du site" }]} />
      <div className="rounded-28 mt-6 flex flex-col gap-10 bg-white p-6 md:p-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <PageTitle>Plan du site</PageTitle>
          <ul className="text-muted m-0 flex list-none flex-wrap gap-[18px] p-0 text-sm" aria-label="Légende">
            <li className="flex items-center gap-2">
              <span aria-hidden className="bg-brand size-3.5 rounded" />
              Page
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="bg-tint-blue size-3.5 rounded shadow-[inset_0_0_0_1.5px_#0B5CAD]" />
              Sous-page
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="bg-tint-orange size-3.5 rounded shadow-[inset_0_0_0_1.5px_#F4731F]" />
              Sur devis
            </li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Link href="/" className="bg-brand rounded-16 px-10 py-4 text-[22px] font-bold text-white hover:text-white">
            Accueil
          </Link>
        </div>
        <div aria-hidden className="bg-border mx-0 h-0.5 xl:mx-[90px]" />

        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-3 xl:grid-cols-6">
          {groups(data).map((g) => (
            <section key={g.title} className="flex flex-col gap-3" aria-labelledby={`pds-${g.title}`}>
              <h2 id={`pds-${g.title}`} className="bg-brand rounded-14 m-0 px-[18px] py-3.5 text-[19px] font-bold text-white">
                {g.title}
              </h2>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {g.items.map((it) => (
                  <li key={it.href + it.title} className="border-border ml-3.5 flex flex-col gap-1.5 border-l-2 pl-3.5">
                    <Link
                      href={it.href}
                      className={cn(
                        "rounded-12 text-ink hover:text-brand block px-3.5 py-2.5 text-base font-bold",
                        it.quote ? "bg-tint-orange shadow-[inset_0_0_0_1.5px_#F4731F]" : "bg-tint-blue shadow-[inset_0_0_0_1.5px_#0B5CAD]",
                      )}
                    >
                      {it.title}
                    </Link>
                    {!!it.sub?.length && (
                      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0 pt-0.5 pb-1.5">
                        {it.sub.map((s) => (
                          <li key={s.href + s.title}>
                            <Link href={s.href} className="bg-bg text-ink-2 hover:text-brand block rounded-full px-2.5 py-[5px] text-[13px]">
                              {s.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
