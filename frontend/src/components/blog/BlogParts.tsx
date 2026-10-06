import Link from "next/link";
import type { ArticleCardData, BlogCategory } from "@/lib/blog/types";
import { cn } from "@/lib/cn";
import { ArticleArt, CategoryTag, ReadingTime } from "./ArticleCard";

/** H1 and lead of the blog pages (PageIntro). */
export function BlogIntro({ title, lead }: { title: string; lead: string | null }) {
  return (
    <div className="flex max-w-[820px] flex-col gap-3 pt-6">
      <h1 className="m-0 text-[34px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px] xl:text-[56px]">{title}</h1>
      {lead && <p className="text-ink-2 m-0 text-[19px] leading-[1.55] text-pretty">{lead}</p>}
    </div>
  );
}

/** Featured guide at the top of the blog (whole card is a link). */
export function FeaturedArticle({ article }: { article: ArticleCardData }) {
  return (
    <section className="pt-8">
      <Link
        href={article.href}
        className="text-ink hover:text-ink grid grid-cols-1 overflow-hidden rounded-[28px] bg-white transition-shadow duration-350 hover:shadow-[0_30px_60px_-36px_rgba(14,40,70,0.45)] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
      >
        <div
          className="box-border flex min-h-[220px] items-center justify-center p-8 md:min-h-[300px] xl:min-h-[420px]"
          style={{ background: article.bg ?? "#DCE8F5" }}
        >
          <ArticleArt article={article} className="w-full max-w-[560px]" imgClassName="w-full max-w-[560px] drop-shadow-[0_20px_26px_rgba(14,40,70,0.25)]" />
        </div>
        <div className="flex flex-col justify-center gap-4 px-5 pt-6 pb-7 md:p-12">
          {article.category && <CategoryTag>{article.category.name}</CategoryTag>}
          <h2 className="m-0 text-[28px] leading-[1.1] font-bold tracking-[-0.025em] text-balance md:text-4xl xl:text-[44px]">{article.title}</h2>
          {article.excerpt && <p className="text-ink-2 m-0 line-clamp-2 max-w-[520px] text-[17px] leading-[1.6]">{article.excerpt}</p>}
          <div className="flex flex-wrap items-center gap-5 pt-1">
            <span className="bg-brand flex h-[52px] items-center gap-2.5 rounded-full px-6 text-base font-bold text-white">
              Lire le guide
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14 M13 6l6 6-6 6" />
              </svg>
            </span>
            <ReadingTime minutes={article.readingTime} className="text-[15px]" />
          </div>
        </div>
      </Link>
    </section>
  );
}

/** Category pills: "Tous" then each category that has published articles. */
export function CategoryChips({ categories, current }: { categories: BlogCategory[]; current: string | null }) {
  const pills = [{ label: "Tous", href: "/blog", slug: null as string | null }, ...categories.map((c) => ({ label: c.name, href: c.href, slug: c.slug }))];
  return (
    <nav aria-label="Catégories" className="flex [scrollbar-width:none] gap-2 overflow-x-auto py-0.5">
      {pills.map((p) => {
        const on = p.slug === current;
        return (
          <Link
            key={p.href}
            href={p.href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "hover:border-ink flex h-11 shrink-0 items-center rounded-full border-[1.5px] px-[18px] text-[15px] font-bold whitespace-nowrap",
              on ? "border-ink bg-ink text-white hover:text-white" : "border-border text-ink hover:text-ink bg-white",
            )}
          >
            {p.label}
          </Link>
        );
      })}
    </nav>
  );
}

const pageBtn = "border-control flex size-11 items-center justify-center rounded-full border-[1.5px] bg-white text-lg";

/** Pagination of the blog listings (‹ 1 2 … ›). */
export function BlogPagination({ page, lastPage, hrefFor }: { page: number; lastPage: number; hrefFor: (page: number) => string }) {
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 pt-8">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} aria-label="Page précédente" className={cn(pageBtn, "text-ink hover:border-ink")}>
          ‹
        </Link>
      ) : (
        <span aria-disabled className={cn(pageBtn, "opacity-40")}>
          ‹
        </span>
      )}
      {Array.from({ length: lastPage }, (_, i) => i + 1).map((n) =>
        n === page ? (
          <span key={n} aria-current="page" className="bg-ink flex size-11 items-center justify-center rounded-full font-bold text-white">
            {n}
          </span>
        ) : (
          <Link key={n} href={hrefFor(n)} className={cn(pageBtn, "text-ink hover:border-ink text-base font-bold")}>
            {n}
          </Link>
        ),
      )}
      {page < lastPage ? (
        <Link href={hrefFor(page + 1)} aria-label="Page suivante" className={cn(pageBtn, "text-ink hover:border-ink")}>
          ›
        </Link>
      ) : (
        <span aria-disabled className={cn(pageBtn, "opacity-40")}>
          ›
        </span>
      )}
    </nav>
  );
}
