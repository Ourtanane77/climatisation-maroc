import Link from "next/link";
import { CompareCheckbox, CompareTray } from "@/components/catalog/Compare";
import { FilterColumn } from "@/components/catalog/FilterColumn";
import { MobileFilterSheet, SortSelect } from "@/components/catalog/ListingControls";
import { Pagination } from "@/components/catalog/Pagination";
import { ProductCard } from "@/components/catalog/ProductCard";
import { GuidePills, PageIntro, Section, SisterChips } from "@/components/catalog/Sections";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { withBrandBadge } from "@/lib/catalog/cards";
import { clearFiltersHref, DEFAULT_SORT, first, listingApiQuery, listingControls, setParamHref, SORTS, toggleFilterHref } from "@/lib/catalog/query";
import type { CategoryData, ListingData } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/format";
import { getNavigation } from "@/lib/navigation";
import type { SearchParams } from "@/lib/types";

/**
 * Category listing (design: Categorie Climatiseurs muraux.dc.html): sister type chips, filter
 * column (sheet on mobile), toolbar with count, sort and grid/list toggle, active filter chips,
 * cards with a compare checkbox, pagination, related guides and SEO text, compare tray.
 */
export default async function ListingTemplate({ category, searchParams }: { category: CategoryData; searchParams: SearchParams }) {
  const [listing, nav] = await Promise.all([
    apiGet<ListingData>(`/categories/${category.path}/products?${listingApiQuery(searchParams)}`, {
      tags: ["categories", "products"],
      token: await getToken(),
    }),
    getNavigation(),
  ]);
  const base = category.href;
  const view = first(searchParams.vue) === "liste" ? "liste" : "grille";
  const sort = first(searchParams.tri) || DEFAULT_SORT;
  const total = listing.meta.total;
  const active = listing.facets.flatMap((f) => f.values.filter((v) => v.selected).map((v) => ({ facet: f.key, ...v })));
  const isClim = category.path.startsWith("climatisation");
  // Older API responses (cache) have no unfilteredTotal: fall back to the filtered total.
  const controls = listingControls(listing.meta.unfilteredTotal ?? total, listing.facets.length);

  const filters = (
    <FilterColumn
      facets={listing.facets.map((f) => ({ ...f, values: f.values.map((v) => ({ ...v, count: f.key === "brand" ? v.count : undefined })) }))}
      hrefFor={(key, value) => toggleFilterHref(base, searchParams, key, value)}
    />
  );

  return (
    <>
      <Breadcrumb items={category.breadcrumb} />
      <PageIntro title={category.h1} intro={category.intro} />
      <SisterChips items={category.siblings.map((s) => ({ label: s.label, href: s.href, active: s.active }))} />

      <section id="produits" className={cn("grid grid-cols-1 items-start gap-8 pt-10 md:pt-14", controls.filters && "md:grid-cols-[280px_minmax(0,1fr)]")}>
        {controls.filters && <div className="hidden md:block">{filters}</div>}

        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <strong className="text-base" aria-live="polite">
              {plural(total, "produit")}
            </strong>
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
                <div className="border-control flex rounded-full border-[1.5px] bg-white p-[3px]" role="group" aria-label="Affichage">
                  {(["grille", "liste"] as const).map((v) => (
                    <Link
                      key={v}
                      href={setParamHref(base, searchParams, "vue", v === "grille" ? null : v)}
                      scroll={false}
                      rel="nofollow"
                      aria-current={view === v ? "true" : undefined}
                      className={cn(
                        "flex h-9 items-center rounded-full px-3 text-sm font-bold min-[391px]:px-4",
                        view === v ? "bg-ink text-white hover:text-white" : "text-ink hover:text-ink",
                      )}
                    >
                      {v === "grille" ? "Grille" : "Liste"}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {active.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {active.map((a) => (
                <Link
                  key={`${a.facet}-${a.value}`}
                  href={toggleFilterHref(base, searchParams, a.facet, a.value)}
                  scroll={false}
                  rel="nofollow"
                  aria-label={`Retirer le filtre ${a.label}`}
                  className="bg-tint-blue text-brand hover:text-brand flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold"
                >
                  {a.label} ✕
                </Link>
              ))}
              <Link href={clearFiltersHref(base, searchParams)} scroll={false} className="text-ink hover:text-brand text-sm font-semibold underline">
                Tout effacer
              </Link>
            </div>
          )}

          {listing.data.length > 0 ? (
            <div
              className={cn(
                "grid grid-cols-1 gap-4 md:grid-cols-2",
                // Without the filter column the cards take the full width: four per row, as on the range pages.
                view === "liste" ? "xl:grid-cols-1" : controls.filters ? "xl:grid-cols-3" : "xl:grid-cols-4",
              )}
            >
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
            <div className="rounded-24 flex flex-col items-center gap-4 bg-white px-8 py-12 text-center">
              <h2 className="m-0 text-[28px] leading-[1.15] font-bold">
                {isClim ? "Aucun climatiseur ne correspond à ces filtres" : "Aucun produit ne correspond à ces filtres"}
              </h2>
              <p className="text-ink-2 m-0 max-w-[480px] text-base leading-[1.5]">
                Retirez un filtre ou appelez le {nav.salesPhone.display} : nous vous orientons vers l&apos;appareil disponible le plus proche.
              </p>
              <ButtonLink href={clearFiltersHref(base, searchParams)} variant="blue" className="h-[52px] px-7">
                Effacer les filtres
              </ButtonLink>
            </div>
          )}

          <Pagination
            page={listing.meta.page}
            lastPage={listing.meta.lastPage}
            hrefFor={(p) => setParamHref(base, searchParams, "page", p === 1 ? null : String(p))}
          />
        </div>
      </section>

      {(category.guides.length > 0 || category.body) && (
        <Section id="guides" title={category.guides.length > 0 ? "Guides associés" : undefined}>
          {category.guides.length > 0 && <GuidePills guides={category.guides} />}
          {category.body && (
            <div className={cn("text-ink-2 max-w-[860px] text-base leading-[1.7]", category.guides.length > 0 && "mt-8")}>
              {category.body.split(/\n{2,}/).map((para) => (
                <p key={para.slice(0, 40)} className="m-0 mb-4 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          )}
        </Section>
      )}

      {category.faq.length > 0 && (
        <Section id="faq" title="Questions fréquentes">
          <FaqAccordion items={category.faq} />
        </Section>
      )}

      <div className="h-24" aria-hidden />
      <CompareTray />
    </>
  );
}
