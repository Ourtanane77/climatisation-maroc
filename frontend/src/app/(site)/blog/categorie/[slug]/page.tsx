import type { Metadata } from "next";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { BlogIntro, BlogPagination, CategoryChips } from "@/components/blog/BlogParts";
import { ContactCtaBand } from "@/components/blog/ContactCtaBand";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getBlog, pageParam } from "@/lib/blog/api";
import { plural } from "@/lib/format";
import { seoMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params, searchParams }: PageProps<"/blog/categorie/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = pageParam((await searchParams).page);
  const blog = await getBlog(slug, page);
  const category = blog.category!;
  return seoMetadata({
    title: page > 1 ? `${category.name} · Blog · page ${page}` : `${category.name} · Blog`,
    description: category.description,
    path: page > 1 ? `${category.href}?page=${page}` : category.href,
  });
}

/** One blog category (design/Blog categorie.dc.html). Categories without a published article are 404. */
export default async function BlogCategoryPage({ params, searchParams }: PageProps<"/blog/categorie/[slug]">) {
  const { slug } = await params;
  const page = pageParam((await searchParams).page);
  const blog = await getBlog(slug, page);
  const category = blog.category!;

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Blog", href: "/blog" }, { label: category.name }]} />
      <BlogIntro title={category.name} lead={category.description} />

      <section className="flex flex-col gap-6 pt-7">
        <CategoryChips categories={blog.categories} current={category.slug} />
        <p className="m-0 text-base font-bold">{plural(blog.meta.total, "article")}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {blog.data.map((a) => (
            <ArticleCard key={a.slug} article={a} headingLevel="h2" />
          ))}
        </div>
        <BlogPagination page={blog.meta.page} lastPage={blog.meta.lastPage} hrefFor={(n) => (n > 1 ? `${category.href}?page=${n}` : category.href)} />
      </section>

      <ContactCtaBand title="Besoin d’un conseil ?" whatsappText="Bonjour, j’ai besoin d’un conseil pour choisir un climatiseur." />
    </>
  );
}
