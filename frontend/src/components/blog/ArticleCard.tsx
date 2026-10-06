import Link from "next/link";
import { ProductArt } from "@/components/catalog/ProductArt";
import { ClockIcon } from "@/components/ui/icons";
import type { ArticleCardData } from "@/lib/blog/types";
import { cn } from "@/lib/cn";

/** Category tag of the blog (soft blue, 14/700). */
export function CategoryTag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-8 bg-tint-blue text-brand self-start px-2.5 py-1 text-sm leading-[1.2] font-bold">{children}</span>;
}

export function ReadingTime({ minutes, className }: { minutes: number | null; className?: string }) {
  if (!minutes) return null;
  return (
    <span className={cn("text-muted flex items-center gap-1.5", className)}>
      <ClockIcon size={16} strokeWidth={2} />
      {minutes} min de lecture
    </span>
  );
}

/** Cover of an article: its uploaded image, else the line drawing of its art key. */
export function ArticleArt({ article, className, imgClassName }: { article: ArticleCardData; className?: string; imgClassName?: string }) {
  if (article.cover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={article.cover}
        alt=""
        loading="lazy"
        className={cn("block max-h-full object-contain drop-shadow-[0_14px_18px_rgba(14,40,70,0.2)]", imgClassName)}
      />
    );
  }
  if (!article.art) return null;
  return (
    <div className={cn("flex w-[78%] justify-center", className)}>
      <ProductArt art={article.art} className="h-auto w-full" />
    </div>
  );
}

/** Article card (Blog, Blog catégorie, "À lire aussi"). */
export function ArticleCard({ article, headingLevel = "h3" }: { article: ArticleCardData; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <Link
      href={article.href}
      className="text-ink hover:text-ink hover:shadow-card-hover ease-design flex flex-col overflow-hidden rounded-[24px] bg-white transition-[box-shadow,transform] duration-350 hover:-translate-y-1"
    >
      <div className="box-border flex aspect-[16/10] items-center justify-center overflow-hidden p-5" style={{ background: article.bg ?? "#E8EFF8" }}>
        <ArticleArt article={article} imgClassName="w-[92%]" />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-5 pt-[18px] pb-[22px]">
        {article.category && <CategoryTag>{article.category.name}</CategoryTag>}
        <Heading className="m-0 text-xl leading-[1.3] font-bold tracking-[-0.01em] text-pretty">{article.title}</Heading>
        <ReadingTime minutes={article.readingTime} className="mt-auto text-sm" />
      </div>
    </Link>
  );
}
