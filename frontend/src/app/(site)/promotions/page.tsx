import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/catalog/Pagination";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { first } from "@/lib/catalog/query";
import type { FilterOption, PromotionsData } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/format";
import type { SearchParams } from "@/lib/types";
import { seoMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ searchParams }: PageProps<"/promotions">): Promise<Metadata> {
  const params = await searchParams;
  const page = Number.parseInt(first(params.page), 10) || 1;
  // Brand / range filters change the content: not indexed (the canonical page is /promotions).
  const filtered = !!(first(params.marque) || first(params.gamme));
  return seoMetadata({
    title: page > 1 ? `Promotions · page ${page}` : "Promotions",
    description: "Climatiseurs en promotion chez Climatisation Maroc : livraison gratuite partout au Maroc, paiement à la livraison.",
    path: page > 1 ? `/promotions?page=${page}` : "/promotions",
    noindex: filtered,
  });
}

function href(params: { marque?: string; gamme?: string; page?: number }): string {
  const q = new URLSearchParams();
  if (params.marque) q.set("marque", params.marque);
  if (params.gamme) q.set("gamme", params.gamme);
  if (params.page && params.page > 1) q.set("page", String(params.page));
  const s = q.toString();
  return s ? `/promotions?${s}` : "/promotions";
}

function FilterRow({ label, options, current, hrefFor }: { label: string; options: FilterOption[]; current: string; hrefFor: (v: string) => string }) {
  return (
    <div className="-mx-4 flex [scrollbar-width:none] items-center gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
      <span className="w-[72px] shrink-0 text-[15px] font-bold">{label}</span>
      {[{ value: "", label: "Toutes", selected: current === "" }, ...options].map((o) => (
        <Link
          key={o.value || "all"}
          href={hrefFor(o.value)}
          scroll={false}
          aria-current={o.selected ? "true" : undefined}
          className={cn(
            "flex h-11 shrink-0 items-center rounded-full border-[1.5px] px-4 text-[15px] font-semibold whitespace-nowrap",
            o.selected ? "border-ink bg-ink text-white hover:text-white" : "border-border text-ink hover:border-ink hover:text-ink bg-white",
          )}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}

/** Discounted families (design: Promotions.dc.html): brand and range chips, 6 cards per page. */
export default async function PromotionsPage({ searchParams }: PageProps<"/promotions">) {
  const params: SearchParams = await searchParams;
  const marque = first(params.marque);
  const gamme = first(params.gamme);
  const page = Number.parseInt(first(params.page), 10) || 1;
  const q = new URLSearchParams({ brand: marque, range: gamme, page: String(page) });
  const promos = await apiGet<PromotionsData>(`/promotions?${q}`, { tags: ["products", "promotions"], token: await getToken() });

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Promotions" }]} />
      <section className="flex flex-col gap-3 pt-6">
        <h1 className="m-0 text-[34px] leading-[1.05] font-bold tracking-[-0.035em] md:text-[44px] xl:text-[56px]">Promotions</h1>
        <p className="text-ink-2 m-0 text-[17px]">{plural(promos.meta.all, "produit")} en promotion · livraison gratuite partout au Maroc</p>
      </section>

      <div className="flex flex-col gap-3 pt-7">
        <FilterRow label="Marque" options={promos.filters.brands} current={marque} hrefFor={(v) => href({ marque: v, gamme })} />
        <FilterRow label="Gamme" options={promos.filters.ranges} current={gamme} hrefFor={(v) => href({ marque, gamme: v })} />
      </div>

      <div className="flex items-center justify-between pt-6 pb-4">
        <strong className="text-base">{plural(promos.meta.total, "produit")}</strong>
        {promos.meta.lastPage > 1 && (
          <span className="text-muted text-[15px]">
            Page {promos.meta.page} sur {promos.meta.lastPage}
          </span>
        )}
      </div>

      {promos.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {promos.data.map((p) => (
            <ProductCard key={p.href} product={p} action="add" headingLevel="h2" />
          ))}
        </div>
      ) : (
        <div className="rounded-24 flex flex-col items-center gap-5 bg-white px-6 py-12 text-center">
          <h2 className="m-0 text-[26px] font-bold">Aucune promotion pour cette sélection</h2>
          <ButtonLink href="/promotions" variant="blue" size="md">
            Voir toutes les promotions
          </ButtonLink>
        </div>
      )}

      <Pagination page={promos.meta.page} lastPage={promos.meta.lastPage} tone="ink" arrows hrefFor={(p) => href({ marque, gamme, page: p })} />
    </>
  );
}
