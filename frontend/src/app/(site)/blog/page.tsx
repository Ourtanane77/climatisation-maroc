import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { BlogIntro, BlogPagination, CategoryChips, FeaturedArticle } from "@/components/blog/BlogParts";
import { ContactCtaBand } from "@/components/blog/ContactCtaBand";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getBlog, pageParam } from "@/lib/blog/api";
import { seoMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ searchParams }: PageProps<"/blog">): Promise<Metadata> {
  const page = pageParam((await searchParams).page);
  // A page past the last one is a 404, not an empty listing.
  if (page > 1 && page > (await getBlog(null, page)).meta.lastPage) notFound();
  return seoMetadata({
    title: page > 1 ? `Conseils et guides climatisation · page ${page}` : "Conseils et guides climatisation",
    description: "Choisir, installer et entretenir votre climatiseur ou votre chauffe-eau, expliqué simplement.",
    path: page > 1 ? `/blog?page=${page}` : "/blog",
  });
}

/** Blog index (design/Blog.dc.html): featured guide, category chips, article grid. */
export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const page = pageParam((await searchParams).page);
  const blog = await getBlog(null, page);
  if (page > blog.meta.lastPage) notFound();

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Blog" }]} />
      <BlogIntro
        title="Conseils et guides climatisation"
        lead="Choisir, installer et entretenir votre climatiseur ou votre chauffe-eau, expliqué simplement."
      />
      {blog.featured && <FeaturedArticle article={blog.featured} />}

      <section className="flex flex-col gap-6 pt-10 md:pt-14">
        <h2 className="sr-only">Tous les articles</h2>
        <CategoryChips categories={blog.categories} current={null} />
        {blog.data.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {blog.data.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
            <BlogPagination page={blog.meta.page} lastPage={blog.meta.lastPage} hrefFor={(n) => (n > 1 ? `/blog?page=${n}` : "/blog")} />
          </>
        )}
      </section>

      <ContactCtaBand title="Besoin d’un conseil ?" whatsappText="Bonjour, j’ai besoin d’un conseil pour choisir un climatiseur." />
    </>
  );
}
