import Link from "next/link";
import { ClipReveal, Reveal } from "@/components/arfro/motion";
import { ArfroButtonLink, Section } from "@/components/arfro/ui";
import type { ArticleCardData } from "@/lib/blog/types";
import { cn } from "@/lib/cn";
import type { ArfroHomeSections } from "@/lib/home/arfro";
import { ArrowGlyph } from "./b/icons";
import { SectionHeader } from "./b/SectionHeader";

function Kicker({ article }: { article: ArticleCardData }) {
  const parts = [article.category?.name, article.readingTime ? `${article.readingTime} min de lecture` : null].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <p className="text-arfro-muted m-0 flex flex-wrap gap-x-3 text-[11px] font-bold tracking-[0.18em] uppercase">
      {article.category && <span className="text-arfro-blue">{article.category.name}</span>}
      {article.readingTime ? <span>{article.readingTime} min de lecture</span> : null}
    </p>
  );
}

/** Cover photo, or a typographic ice panel with the category when the article has none. */
function Cover({ article, className, sizes }: { article: ArticleCardData; className: string; sizes: string }) {
  return (
    <div className={cn("bg-arfro-ice rounded-arfro-md relative overflow-hidden", className)}>
      {article.cover ? (
        // eslint-disable-next-line @next/next/no-img-element -- covers are pre-sized by the API
        <img
          src={article.cover}
          alt=""
          loading="lazy"
          decoding="async"
          sizes={sizes}
          className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-arfro)] group-hover:scale-[1.04] motion-reduce:transition-none"
        />
      ) : (
        <span aria-hidden className="font-arfro text-arfro-blue/15 absolute bottom-4 left-5 text-[clamp(28px,4vw,56px)] leading-none font-extrabold tracking-[-0.03em]">
          {article.category?.name ?? "Conseils"}
        </span>
      )}
    </div>
  );
}

/**
 * 12 « Mieux comprendre le confort. » (brief §12): magazine layout of the real Arfro articles, one
 * lead story (large cover, excerpt) beside up to three shorter ones, each with its category label
 * and reading time; CTA « Explorer nos conseils ». No article → no section.
 */
export function ArfroJournal({ data }: { data: NonNullable<ArfroHomeSections["journal"]> }) {
  const articles = data.articles.slice(0, 4);
  if (articles.length === 0) return null;
  const [lead, ...rest] = articles;
  return (
    <Section tone="white" id="journal" labelledBy="arfro-journal-title">
      <SectionHeader
        id="arfro-journal-title"
        eyebrow={data.eyebrow}
        title={data.title}
        text={data.text}
        action={
          data.cta ? (
            <ArfroButtonLink href={data.cta.href} variant="outline" icon={<ArrowGlyph />}>
              {data.cta.label}
            </ArfroButtonLink>
          ) : undefined
        }
      />
      <div className={cn("mt-14 grid gap-x-16 gap-y-14 md:mt-20", rest.length > 0 && "lg:grid-cols-12")}>
        <article className="group relative lg:col-span-7">
          <ClipReveal>
            <Cover article={lead} className="aspect-[4/3] w-full md:aspect-[16/10]" sizes="(max-width: 1023px) 100vw, 58vw" />
          </ClipReveal>
          <div className="mt-6">
            <Kicker article={lead} />
            <h3 className="font-arfro m-0 mt-3 text-[clamp(24px,2.6vw,36px)] leading-[1.12] font-extrabold tracking-[-0.02em] text-balance">
              <Link href={lead.href} className="text-arfro-graphite hover:text-arfro-blue after:absolute after:inset-0">
                {lead.title}
              </Link>
            </h3>
            {lead.excerpt && <p className="text-arfro-muted m-0 mt-4 max-w-[60ch] text-[16px] leading-[1.6] md:text-[17px]">{lead.excerpt}</p>}
          </div>
        </article>
        {rest.length > 0 && (
          <Reveal as="ul" stagger className="m-0 flex list-none flex-col p-0 lg:col-span-5">
            {rest.map((a) => (
              <li key={a.slug} className="border-arfro-line border-t py-7 first:border-t-0 first:pt-0 last:pb-0 lg:first:border-t lg:first:pt-7">
                <article className="group relative grid grid-cols-[1fr_112px] gap-6 md:grid-cols-[1fr_144px]">
                  <div>
                    <Kicker article={a} />
                    <h3 className="font-arfro m-0 mt-3 text-[19px] leading-[1.3] font-extrabold tracking-[-0.01em] md:text-[21px]">
                      <Link href={a.href} className="text-arfro-graphite hover:text-arfro-blue after:absolute after:inset-0">
                        {a.title}
                      </Link>
                    </h3>
                  </div>
                  <Cover article={a} className="aspect-square w-full" sizes="144px" />
                </article>
              </li>
            ))}
          </Reveal>
        )}
      </div>
    </Section>
  );
}
