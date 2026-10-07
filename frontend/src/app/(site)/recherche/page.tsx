import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/catalog/Pagination";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { withBrandBadge } from "@/lib/catalog/cards";
import { first } from "@/lib/catalog/query";
import type { SearchData } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/format";
import { getNavigation } from "@/lib/navigation";
import type { SearchParams } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Recherche", noindex: true });

function href(term: string, extra: { gamme?: string; onglet?: string; page?: number } = {}): string {
  const q = new URLSearchParams({ q: term });
  if (extra.gamme) q.set("gamme", extra.gamme);
  if (extra.onglet) q.set("onglet", extra.onglet);
  if (extra.page && extra.page > 1) q.set("page", String(extra.page));
  return `/recherche?${q}`;
}

/** Search results (design: Recherche.dc.html): range tabs, product cards, no-result card. */
export default async function SearchPage({ searchParams }: PageProps<"/recherche">) {
  const params: SearchParams = await searchParams;
  const term = first(params.q).trim();
  const gamme = first(params.gamme);
  const onglet = first(params.onglet);
  const page = Number.parseInt(first(params.page), 10) || 1;
  const q = new URLSearchParams({ q: term, range: gamme, tab: onglet, page: String(page) });
  const [results, nav] = await Promise.all([apiGet<SearchData>(`/search?${q}`, { tags: ["products", "search"], token: await getToken() }), getNavigation()]);
  const tab = results.tab;
  const chip = "flex h-11 shrink-0 items-center rounded-full px-[18px] text-[15px] font-semibold";

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Recherche" }]} />
      <section className="flex flex-col gap-2 pt-6">
        <h1 className="m-0 text-[34px] leading-[1.05] font-bold tracking-[-0.035em] md:text-[44px] xl:text-[56px]">
          {term ? `Résultats pour « ${term} »` : "Recherche"}
        </h1>
        {term && <p className="text-muted m-0 text-[17px]">{plural(results.total, "produit")}</p>}
      </section>

      {results.total > 0 ? (
        <>
          <div role="tablist" aria-label="Gammes" className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pt-6 md:mx-0 md:px-0">
            {[{ value: "", label: "Tout", count: results.total }, ...results.tabs].map((t) => {
              const on = t.value === tab;
              return (
                <Link
                  key={t.value || "all"}
                  href={href(term, { gamme, onglet: t.value })}
                  role="tab"
                  aria-selected={on}
                  scroll={false}
                  className={cn(
                    "flex h-11 shrink-0 items-center gap-2.5 rounded-full border-[1.5px] pr-2 pl-[18px] text-[15px] font-bold whitespace-nowrap",
                    on ? "border-ink bg-ink text-white hover:text-white" : "border-border text-ink hover:border-ink hover:text-ink bg-white",
                  )}
                >
                  {t.label}
                  <span className={cn("flex h-7 min-w-7 items-center justify-center rounded-[14px] px-2 text-[13px]", on ? "bg-white/20" : "bg-bg")}>
                    {t.count}
                  </span>
                </Link>
              );
            })}
          </div>
          <div role="tabpanel" className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-2 xl:grid-cols-4">
            {results.data.map((p) => (
              <ProductCard key={p.href} product={withBrandBadge(p)} action="add" headingLevel="h2" />
            ))}
          </div>
          <Pagination page={results.meta.page} lastPage={results.meta.lastPage} hrefFor={(p) => href(term, { gamme, onglet: tab, page: p })} />
        </>
      ) : (
        <section className="rounded-24 mt-6 flex max-w-[860px] flex-col gap-6 bg-white p-5 md:p-8">
          {term && (
            <div className="flex flex-col gap-2">
              <h2 className="m-0 text-[28px] leading-[1.15] font-bold">Aucun produit ne correspond à « {term} »</h2>
              <p className="text-ink-2 m-0 text-base">Vérifiez l&apos;orthographe, essayez un terme plus court ou une référence.</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <h3 className="m-0 text-[15px] font-bold">Recherches fréquentes</h3>
            <div className="flex flex-wrap gap-2">
              {results.popular.map((p) => (
                <Link key={p} href={href(p)} className={cn(chip, "bg-bg text-ink hover:bg-tint-blue hover:text-brand")}>
                  {p}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="m-0 text-[15px] font-bold">Parcourir les gammes</h3>
            <div className="flex flex-wrap gap-2">
              {results.ranges.map((r) => (
                <Link key={r.href} href={r.href} className={cn(chip, "border-control text-ink hover:border-ink hover:text-ink border-[1.5px] bg-white")}>
                  {r.label}
                </Link>
              ))}
            </div>
          </div>
          <hr className="border-divider m-0 border-0 border-t" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-ink-2 m-0 max-w-[440px] text-base leading-[1.5]">
              Envoyez-nous le nom ou une photo du produit, nous vérifions s&apos;il est disponible.
            </p>
            <ButtonLink href={waLink(term ? `Bonjour, je cherche : ${term}` : undefined, nav.whatsapp.number)} variant="whatsapp" size="md" mobileFull>
              Demander sur WhatsApp
            </ButtonLink>
          </div>
        </section>
      )}
    </>
  );
}
