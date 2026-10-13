import Link from "next/link";
import { cn } from "@/lib/cn";
import { SITE_KEY } from "@/lib/site";

/**
 * Page circles (44px). Catégorie: blue current page, no arrows. Promotions: black current page
 * with ‹ › arrows (disabled at the ends, opacity .4).
 */
export function Pagination({
  page,
  lastPage,
  hrefFor,
  tone = "brand",
  arrows = false,
}: {
  page: number;
  lastPage: number;
  hrefFor: (page: number) => string;
  tone?: "brand" | "ink";
  arrows?: boolean;
}) {
  if (lastPage <= 1) return null;
  if (SITE_KEY === "arfro") return <ArfroPagination page={page} lastPage={lastPage} hrefFor={hrefFor} />;
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1);
  const circle = "flex size-11 items-center justify-center rounded-full text-base font-bold";
  const arrow = (target: number, label: string, glyph: string) =>
    target < 1 || target > lastPage ? (
      <span aria-hidden className={cn(circle, "border-control text-ink border-[1.5px] bg-white opacity-40")}>
        {glyph}
      </span>
    ) : (
      <Link href={hrefFor(target)} aria-label={label} className={cn(circle, "border-control text-ink hover:border-ink hover:text-ink border-[1.5px] bg-white")}>
        {glyph}
      </Link>
    );

  return (
    <nav aria-label="Pagination" className={cn("flex justify-center gap-2", arrows ? "pt-8" : "pt-3")}>
      {arrows && arrow(page - 1, "Page précédente", "‹")}
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            circle,
            p === page
              ? tone === "brand"
                ? "bg-brand text-white hover:text-white"
                : "bg-ink text-white hover:text-white"
              : "text-ink hover:text-brand bg-white",
          )}
        >
          {p}
        </Link>
      ))}
      {arrows && arrow(page + 1, "Page suivante", "›")}
    </nav>
  );
}

/**
 * Arfro (Categorie.dc.html): outline pills. « Page suivante » is the main outline pill (50px, ink
 * border), page numbers are 44px circles (current one ink filled).
 */
function ArfroPagination({ page, lastPage, hrefFor }: { page: number; lastPage: number; hrefFor: (page: number) => string }) {
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1);
  const pill = "border-ink text-ink hover:bg-ink box-border flex h-[50px] items-center rounded-full border-[1.5px] px-7 text-[15px] font-bold hover:text-white";
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2 pt-12">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={pill}>
          Page précédente
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? "page" : undefined}
          aria-label={`Page ${p}`}
          className={cn(
            "flex size-11 items-center justify-center rounded-full text-[15px] font-bold",
            p === page ? "bg-ink text-white hover:text-white" : "text-ink hover:bg-bg hover:text-ink",
          )}
        >
          {p}
        </Link>
      ))}
      {page < lastPage && (
        <Link href={hrefFor(page + 1)} className={pill}>
          Page suivante
        </Link>
      )}
    </nav>
  );
}
