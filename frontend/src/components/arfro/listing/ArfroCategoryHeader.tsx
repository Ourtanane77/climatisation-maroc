import Link from "next/link";
import { AirflowLines } from "@/components/arfro/AirflowLines";
import { CategoryVisual } from "@/components/catalog/CategoryVisual";
import { cn } from "@/lib/cn";
import { categoryPhoto } from "@/lib/design-assets";
import { plural } from "@/lib/format";
import type { Crumb } from "@/lib/types";

export interface SubNavItem {
  label: string;
  href: string;
  active: boolean;
}

/** Eyebrow of a category: the range above it in the breadcrumb (« Climatisation »), else « Catalogue ». */
export function headerEyebrow(breadcrumb: Crumb[]): string {
  // [Accueil, …parents, current]: the closest parent that is not the home page.
  const parents = breadcrumb.slice(1, -1);
  return parents.length ? parents[parents.length - 1].label : "Catalogue";
}

/**
 * Editorial header of the Arfro category pages: Soft Ice full-width band with the airflow motif,
 * eyebrow (parent range), H1, intro, product count, the category's own photo when it has one
 * (categoryPhoto; no borrowed or placeholder image), and the sub-category navigation as a hairline
 * tab row (links, `aria-current` on the current one).
 */
export function ArfroCategoryHeader({
  title,
  intro,
  breadcrumb,
  href,
  count,
  nav = [],
  navLabel = "Types",
}: {
  title: string;
  intro?: string | null;
  breadcrumb: Crumb[];
  /** Category URL, for its photo. */
  href: string;
  /** Number of products, shown under the intro when given. */
  count?: number | null;
  nav?: SubNavItem[];
  navLabel?: string;
}) {
  const photo = categoryPhoto(href);
  return (
    <header className="bleed bg-arfro-ice text-arfro-graphite relative mt-4 overflow-hidden">
      <AirflowLines variant="hero" className="absolute inset-x-0 bottom-0 h-[70%] w-full opacity-70" />
      <div
        className={cn(
          "site-gutter relative grid grid-cols-1 items-center gap-8 pt-12 md:pt-16",
          photo && "md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12",
          nav.length > 1 ? "pb-0" : "pb-12 md:pb-16",
        )}
      >
        <div className="flex min-w-0 flex-col gap-5">
          <p className="text-arfro-blue m-0 text-[12px] font-bold tracking-[0.18em] uppercase md:text-[13px]">{headerEyebrow(breadcrumb)}</p>
          <h1 className="font-arfro m-0 text-[clamp(36px,5.2vw,72px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance">{title}</h1>
          {intro && <p className="text-arfro-graphite/80 m-0 max-w-[60ch] text-[17px] leading-[1.6] md:text-[19px]">{intro}</p>}
          {count != null && count > 0 && <p className="text-arfro-muted m-0 text-[15px] font-semibold">{plural(count, "produit")}</p>}
        </div>
        {photo && (
          <div aria-hidden className="flex min-w-0 items-center justify-center md:justify-end [&_img]:max-h-[180px] md:[&_img]:max-h-[320px]">
            <CategoryVisual href={href} sizes="(min-width: 760px) 460px, 90vw" className="block h-auto w-full max-w-[460px] object-contain" />
          </div>
        )}
        {nav.length > 1 && (
          <nav aria-label={navLabel} className="border-arfro-line -mx-4 scrollbar-none overflow-x-auto border-t px-4 md:col-span-full md:mx-0 md:px-0">
            <ul className="m-0 flex list-none gap-7 p-0 md:gap-10">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    scroll={false}
                    aria-current={item.active ? "page" : undefined}
                    className={cn(
                      "flex min-h-14 items-center text-[15px] font-bold whitespace-nowrap transition-colors duration-300",
                      item.active
                        ? "text-arfro-graphite hover:text-arfro-graphite shadow-[inset_0_-2px_0_var(--color-arfro-blue)]"
                        : "text-arfro-muted hover:text-arfro-graphite",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
