import Link from "next/link";
import { Fragment } from "react";
import { JsonLd } from "@/lib/seo/jsonld";
import { siteUrl } from "@/lib/site";
import type { Crumb } from "@/lib/types";

/** Breadcrumb from the design (14px, "›" separators, current page bold) + BreadcrumbList JSON-LD. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: siteUrl(c.href) } : {}),
    })),
  };

  return (
    <nav aria-label="Fil d'Ariane" className="pt-6">
      <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-sm">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={`${c.label}-${i}`}>
              <li>
                {last || !c.href ? (
                  <span aria-current={last ? "page" : undefined} className={last ? "text-ink font-bold" : "text-muted font-medium"}>
                    {c.label}
                  </span>
                ) : (
                  <Link href={c.href} className="text-muted hover:text-brand font-medium">
                    {c.label}
                  </Link>
                )}
              </li>
              {!last && (
                <li aria-hidden className="text-line-strong">
                  ›
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
      <JsonLd data={schema} />
    </nav>
  );
}
