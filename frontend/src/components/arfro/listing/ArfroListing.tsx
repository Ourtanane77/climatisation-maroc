import Link from "next/link";
import { ArfroButtonLink } from "@/components/arfro/ui";
import { ArfroProductCard } from "@/components/arfro/product/ArfroProductCard";
import { CompareCheckbox, CompareTray } from "@/components/catalog/Compare";
import { FilterColumn } from "@/components/catalog/FilterColumn";
import { MobileFilterSheet, SortSelect } from "@/components/catalog/ListingControls";
import { Pagination } from "@/components/catalog/Pagination";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ARFRO_PDP_H2, PDP_SPLIT, PdpEyebrow } from "@/components/arfro/pdp/styles";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FaqDetails } from "@/components/product/FaqDetails";
import { withBrandBadge } from "@/lib/catalog/cards";
import { clearFiltersHref, DEFAULT_SORT, first, listingControls, setParamHref, SORTS, toggleFilterHref } from "@/lib/catalog/query";
import type { CategoryData, ListingData } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/format";
import type { SearchParams } from "@/lib/types";
import { ArfroCategoryHeader } from "./ArfroCategoryHeader";

/** `sizes` of the grid photos: 3 columns next to the filters on desktop, 4 without, 2 on tablets. */
const GRID_SIZES = "(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 92vw";

/**
 * Arfro category listing: editorial header with the sibling categories, toolbar (count, active
 * filter tags, mobile filter sheet, sort, grid/list), hairline filter sidebar, premium card grid,
 * pagination, « Bien choisir » SEO text with the related guides, FAQ, compare tray. Same URLs,
 * params (filters, `tri`, `vue`, `page`, `filtres`, `comparer`) and default sort as before.
 */
export function ArfroListing({
  category,
  listing,
  searchParams,
  salesPhone,
}: {
  category: CategoryData;
  listing: ListingData;
  searchParams: SearchParams;
  salesPhone: string;
}) {
  const base = category.href;
  const view = first(searchParams.vue) === "liste" ? "liste" : "grille";
  const sort = first(searchParams.tri) || DEFAULT_SORT;
  const total = listing.meta.total;
  const active = listing.facets.flatMap((f) => f.values.filter((v) => v.selected).map((v) => ({ facet: f.key, ...v })));
  const isClim = category.path.startsWith("climatisation");
  // Older API responses (cache) have no unfilteredTotal: fall back to the filtered total.
  const controls = listingControls(listing.meta.unfilteredTotal ?? total, listing.facets.length);
  const promoLabel = listing.facets.find((f) => f.key === "promo")?.label;
  const chipLabel = (a: (typeof active)[number]) => (a.facet === "promo" && promoLabel ? promoLabel : a.label);

  const filters = (
    <FilterColumn
      facets={listing.facets.map((f) => ({ ...f, values: f.values.map((v) => ({ ...v, count: f.key === "brand" ? v.count : undefined })) }))}
      hrefFor={(key, value) => toggleFilterHref(base, searchParams, key, value)}
    />
  );

  return (
    <>
      <Breadcrumb items={category.breadcrumb} />
      <ArfroCategoryHeader
        title={category.h1}
        intro={category.intro}
        breadcrumb={category.breadcrumb}
        href={category.href}
        nav={category.siblings.map((s) => ({ label: s.label, href: s.href, active: s.active }))}
      />

      <section id="produits" aria-label="Produits" className="flex flex-col">
        <div className="border-arfro-line flex flex-wrap items-center justify-between gap-4 border-b pt-8 pb-5 md:pt-10">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-arfro-graphite mr-3 text-[15px] font-extrabold" aria-live="polite">
              {plural(total, "produit")}
            </strong>
            {active.map((a) => (
              <Link
                key={`${a.facet}-${a.value}`}
                href={toggleFilterHref(base, searchParams, a.facet, a.value)}
                scroll={false}
                rel="nofollow"
                aria-label={`Retirer le filtre ${chipLabel(a)}`}
                className="rounded-arfro-sm border-arfro-blue/30 bg-arfro-ice text-arfro-blue hover:border-arfro-blue hover:text-arfro-blue flex h-9 items-center gap-2 border px-3 text-sm font-bold transition-colors duration-300"
              >
                {chipLabel(a)}
                <span aria-hidden>✕</span>
              </Link>
            ))}
            {active.length > 0 && (
              <Link
                href={clearFiltersHref(base, searchParams)}
                scroll={false}
                className="text-arfro-graphite hover:text-arfro-blue inline-flex min-h-9 items-center px-1 text-sm font-semibold underline underline-offset-4"
              >
                Tout effacer
              </Link>
            )}
          </div>
          {controls.sort && (
            <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3">
              {controls.filters && (
                <MobileFilterSheet count={total} initialOpen={first(searchParams.filtres) === "1"}>
                  {filters}
                </MobileFilterSheet>
              )}
              <SortSelect
                value={sort}
                options={SORTS.map((s) => ({
                  value: s.value,
                  label: s.label,
                  href: setParamHref(base, searchParams, "tri", s.value === DEFAULT_SORT ? null : s.value),
                }))}
              />
              <div className="border-arfro-line rounded-arfro-sm flex border bg-white p-[3px]" role="group" aria-label="Affichage">
                {(["grille", "liste"] as const).map((v) => (
                  <Link
                    key={v}
                    href={setParamHref(base, searchParams, "vue", v === "grille" ? null : v)}
                    scroll={false}
                    rel="nofollow"
                    aria-current={view === v ? "true" : undefined}
                    className={cn(
                      "rounded-arfro-xs flex h-9 items-center px-3 text-sm font-bold min-[391px]:px-4",
                      view === v ? "bg-arfro-graphite text-white hover:text-white" : "text-arfro-graphite hover:text-arfro-blue",
                    )}
                  >
                    {v === "grille" ? "Grille" : "Liste"}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className={cn(
            "grid grid-cols-1 items-start gap-10 pt-8 md:pt-10",
            controls.filters && "md:grid-cols-[232px_minmax(0,1fr)] xl:grid-cols-[264px_minmax(0,1fr)] xl:gap-14",
          )}
        >
          {controls.filters && (
            <div className="hidden md:sticky md:top-28 md:block md:max-h-[calc(100vh-8rem)] md:[scrollbar-width:thin] md:overflow-y-auto md:pr-1">
              <p className="text-arfro-muted m-0 pb-1 text-[12px] font-bold tracking-[0.18em] uppercase">Affiner</p>
              {filters}
            </div>
          )}
          <div className="flex min-w-0 flex-col">
            {listing.data.length > 0 ? (
              view === "liste" ? (
                // List view: the existing horizontal-friendly card with its compare checkbox.
                <div className="grid grid-cols-1 gap-y-8">
                  {listing.data.map((p) => {
                    const sku = p.sku ?? p.options?.[0]?.sku;
                    return (
                      <ProductCard
                        key={p.href}
                        headingLevel="h2"
                        product={withBrandBadge(p)}
                        compareSlot={sku ? <CompareCheckbox item={{ sku, name: p.name }} /> : undefined}
                      />
                    );
                  })}
                </div>
              ) : (
                <div
                  className={cn(
                    "grid grid-cols-1 gap-x-6 gap-y-12 md:gap-y-14",
                    controls.filters ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                  )}
                >
                  {listing.data.map((p, i) => (
                    <ArfroProductCard key={p.href} product={p} headingLevel="h2" priority={i < 3} sizes={GRID_SIZES} />
                  ))}
                </div>
              )
            ) : (
              <div className="rounded-arfro-md bg-arfro-ice flex flex-col items-center gap-4 px-8 py-14 text-center">
                <h2 className="font-arfro m-0 text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em]">
                  {isClim ? "Aucun climatiseur ne correspond à ces filtres" : "Aucun produit ne correspond à ces filtres"}
                </h2>
                <p className="text-arfro-graphite/80 m-0 max-w-[480px] text-base leading-[1.55]">
                  Retirez un filtre ou appelez le {salesPhone} : nous vous orientons vers l&apos;appareil disponible le plus proche.
                </p>
                <ArfroButtonLink href={clearFiltersHref(base, searchParams)}>Effacer les filtres</ArfroButtonLink>
              </div>
            )}
            <Pagination
              page={listing.meta.page}
              lastPage={listing.meta.lastPage}
              hrefFor={(p) => setParamHref(base, searchParams, "page", p === 1 ? null : String(p))}
            />
          </div>
        </div>
      </section>

      {(category.body || category.guides.length > 0) && (
        <section id="guides" aria-labelledby="guides-title" className={cn(PDP_SPLIT, "border-arfro-line mt-16 border-t pt-12 md:mt-24 md:pt-16")}>
          <div>
            <PdpEyebrow>Conseils</PdpEyebrow>
            <h2 id="guides-title" className={ARFRO_PDP_H2}>
              {category.body ? `Bien choisir vos ${category.name.toLowerCase()}` : "Guides associés"}
            </h2>
          </div>
          <div className="flex min-w-0 flex-col gap-8">
            {category.body && (
              <div className="text-arfro-graphite/85 max-w-[68ch] text-[17px] leading-[1.75]">
                {category.body.split(/\n{2,}/).map((para) => (
                  <p key={para.slice(0, 40)} className="m-0 mb-5 last:mb-0">
                    {para}
                  </p>
                ))}
              </div>
            )}
            {category.guides.length > 0 && (
              <div>
                {category.body && <h3 className="text-arfro-muted m-0 mb-2 text-[13px] font-bold tracking-[0.14em] uppercase">Guides associés</h3>}
                <ul className="border-arfro-line m-0 flex list-none flex-col border-t p-0">
                  {category.guides.map((g) => (
                    <li key={g.href} className="border-arfro-line border-b">
                      <Link
                        href={g.href}
                        className="text-arfro-graphite hover:text-arfro-blue group flex min-h-14 items-center justify-between gap-4 py-4 text-[16px] font-bold transition-colors duration-300"
                      >
                        {g.title}
                        <span aria-hidden className="text-arfro-blue transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {category.faq.length > 0 && (
        <section id="faq" aria-labelledby="faq-title" className={cn(PDP_SPLIT, "pt-14 md:pt-20")}>
          <div>
            <PdpEyebrow>Questions</PdpEyebrow>
            <h2 id="faq-title" className={ARFRO_PDP_H2}>
              Questions fréquentes
            </h2>
          </div>
          <FaqDetails items={category.faq} />
        </section>
      )}

      <div className="h-24" aria-hidden />
      <CompareTray />
    </>
  );
}
