import Link from "next/link";
import { cn } from "@/lib/cn";
import { SITE_KEY } from "@/lib/site";
import type { Facet } from "@/lib/types";

/**
 * Filter column of the category page (design/Categorie Climatiseurs muraux.dc.html): white card,
 * one group per facet, checkbox rows with counts. Filters are plain links that toggle URL query
 * params, so they work server-rendered and without JavaScript.
 */
export function FilterColumn({
  facets,
  hrefFor,
  className,
}: {
  facets: Facet[];
  /** URL with this facet value toggled (built by the page from the current search params). */
  hrefFor: (facetKey: string, value: string) => string;
  className?: string;
}) {
  if (SITE_KEY === "arfro") return <ArfroFilterColumn facets={facets} hrefFor={hrefFor} className={className} />;
  return (
    <aside aria-label="Filtres" className={cn("rounded-24 flex flex-col gap-1 overflow-auto bg-white p-5", className)}>
      {/* Parent of the facet headings (h3), for a valid heading order under the page h1. */}
      <h2 className="sr-only">Filtres</h2>
      {facets.map((facet) => (
        <div key={facet.key} className="border-divider border-b py-3.5 last:border-b-0">
          <h3 className="mb-2.5 text-base font-bold">{facet.label}</h3>
          <ul className="flex flex-col">
            {facet.values.map((v) => {
              const disabled = v.count === 0 && !v.selected;
              return (
                <li key={v.value}>
                  <Link
                    href={hrefFor(facet.key, v.value)}
                    scroll={false}
                    rel="nofollow"
                    role="checkbox"
                    aria-checked={v.selected}
                    aria-disabled={disabled || undefined}
                    className={cn("text-ink hover:text-brand flex min-h-10 items-center gap-2.5 text-[15px]", disabled && "pointer-events-none opacity-50")}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "rounded-6 flex size-5 shrink-0 items-center justify-center border-[1.5px] text-[13px] text-white",
                        v.selected ? "border-brand bg-brand" : "border-check bg-white",
                      )}
                    >
                      {v.selected ? "✓" : ""}
                    </span>
                    <span className="flex-1">{v.label}</span>
                    {v.count != null && <span className="text-muted text-sm">{v.count}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}

/** 20px square check mark of the Arfro filter rows (brand blue when ticked). */
function ArfroCheck({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] text-white",
        on ? "border-brand bg-brand" : "border-control bg-white",
      )}
    >
      {on && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 5 5L20 7" />
        </svg>
      )}
    </span>
  );
}

/**
 * Arfro filter sidebar (Categorie.dc.html): no card, groups separated by hairlines, bold group
 * titles, 20px checkboxes; the « En promotion » facet is a single row with its box on the right.
 * Same links and URL params as the default column.
 */
function ArfroFilterColumn({ facets, hrefFor, className }: { facets: Facet[]; hrefFor: (facetKey: string, value: string) => string; className?: string }) {
  const promo = facets.find((f) => f.key === "promo" && f.values.length === 1);
  const groups = facets.filter((f) => f !== promo);
  const promoValue = promo?.values[0];
  return (
    <aside aria-label="Filtres" className={cn("flex flex-col bg-white", className)}>
      <h2 className="sr-only">Filtres</h2>
      {groups.map((facet) => (
        <div
          key={facet.key}
          role="group"
          aria-labelledby={`filtre-${facet.key}`}
          className="border-border flex flex-col border-t py-4 first:border-t-0 md:first:border-t"
        >
          <h3 id={`filtre-${facet.key}`} className="m-0 pb-1 text-[15px] font-extrabold">
            {facet.label}
          </h3>
          <ul className="m-0 flex list-none flex-col p-0">
            {facet.values.map((v) => {
              const disabled = v.count === 0 && !v.selected;
              return (
                <li key={v.value}>
                  <Link
                    href={hrefFor(facet.key, v.value)}
                    scroll={false}
                    rel="nofollow"
                    role="checkbox"
                    aria-checked={v.selected}
                    aria-disabled={disabled || undefined}
                    className={cn(
                      "text-ink hover:text-brand flex min-h-11 items-center gap-3 text-[15px] font-semibold",
                      disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    <ArfroCheck on={v.selected} />
                    <span className="flex-1">{v.label}</span>
                    {v.count != null && <span className="text-muted text-sm font-medium">{v.count}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {promo && promoValue && (
        <Link
          href={hrefFor(promo.key, promoValue.value)}
          scroll={false}
          rel="nofollow"
          role="checkbox"
          aria-checked={promoValue.selected}
          aria-disabled={(promoValue.count === 0 && !promoValue.selected) || undefined}
          className={cn(
            "border-border text-ink hover:text-brand flex min-h-11 items-center justify-between gap-3 border-t py-4 text-[15px] font-extrabold",
            promoValue.count === 0 && !promoValue.selected && "pointer-events-none opacity-50",
          )}
        >
          {promo.label}
          <ArfroCheck on={promoValue.selected} />
        </Link>
      )}
    </aside>
  );
}
