import Link from "next/link";
import { cn } from "@/lib/cn";
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
  return (
    <aside aria-label="Filtres" className={cn("rounded-24 flex flex-col gap-1 overflow-auto bg-white p-5", className)}>
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
