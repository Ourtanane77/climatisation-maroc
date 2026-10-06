import type { Metadata } from "next";
import { ArticleCard, CategoryTag, ReadingTime } from "@/components/blog/ArticleCard";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { ArticleCalcProvider } from "@/components/blog/ArticleCalculator";
import { ShareBar } from "@/components/blog/ArticleInteractive";
import { DesktopToc } from "@/components/blog/ArticleToc";
import { ContactCtaBand } from "@/components/blog/ContactCtaBand";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getArticle } from "@/lib/blog/api";
import { SITE_NAME, siteUrl } from "@/lib/site";
import type { Crumb } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { article, seo } = await getArticle(slug);
  return {
    title: seo.title,
    description: seo.description ?? undefined,
    alternates: { canonical: seo.canonical ?? article.href },
    robots: seo.noindex ? { index: false } : undefined,
    openGraph: { type: "article", title: seo.title, url: siteUrl(article.href), publishedTime: article.publishedAt ?? undefined },
  };
}

const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Casablanca" });

/** Blog article (design/Article puissance climatiseur.dc.html). */
export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const { article, related } = await getArticle(slug);
  const hasCalculator = article.blocks.some((b) => b.type === "calculator");

  const crumbs: Crumb[] = [
    { label: "Accueil", href: "/" },
    { label: "Blog", href: "/blog" },
  ];
  if (article.category) crumbs.push({ label: article.category.name, href: article.category.href });
  crumbs.push({ label: article.title });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.h1,
    description: article.excerpt ?? undefined,
    mainEntityOfPage: siteUrl(article.href),
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt ?? undefined,
    author: article.author ? { "@type": "Person", name: article.author } : { "@type": "Organization", name: "Ariha Froid" },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <>
      <Breadcrumb items={crumbs} />
      <header className="flex max-w-[900px] flex-col gap-4 pt-6">
        {article.category && <CategoryTag>{article.category.name}</CategoryTag>}
        <h1 className="m-0 text-[34px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px] xl:text-[56px]">{article.h1}</h1>
        <div className="text-muted flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px]">
          {article.publishedAt && <time dateTime={article.publishedAt}>{dateFormat.format(new Date(article.publishedAt))}</time>}
          {article.author && <span>{article.author}</span>}
          <ReadingTime minutes={article.readingTime} />
        </div>
      </header>

      <ArticleCalcProvider>
        <div className="grid grid-cols-1 items-start gap-14 pt-8 xl:grid-cols-[minmax(0,720px)_260px]">
          <article className="flex max-w-[720px] min-w-0 flex-col gap-5">
            <ArticleBody blocks={article.blocks} toc={article.toc} />
            <ShareBar title={article.title} url={siteUrl(article.href)} />
          </article>
          {article.toc.length > 0 && <DesktopToc entries={article.toc} calculator={hasCalculator} />}
        </div>
      </ArticleCalcProvider>

      {related.length > 0 && (
        <section className="pt-10 md:pt-14">
          <h2 className="m-0 mb-6 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px]">À lire aussi</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      <ContactCtaBand title="Besoin d’aide pour choisir ?" whatsappText="Bonjour, j’ai besoin d’un conseil pour choisir un climatiseur." />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
