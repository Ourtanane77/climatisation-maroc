import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolvePath } from "@/lib/resolve";
import CategoryView, { categoryMetadata } from "@/views/catalog/CategoryView";

/** Two-segment paths: sub-categories (`/climatisation/mural`), else a redirect or the 404. */
export async function generateMetadata({ params, searchParams }: PageProps<"/[slug]/[sub]">): Promise<Metadata> {
  const { slug, sub } = await params;
  const resolved = await resolvePath(`/${slug}/${sub}`);
  return resolved.type === "category" ? categoryMetadata(resolved, await searchParams) : {};
}

export default async function SubPage({ params, searchParams }: PageProps<"/[slug]/[sub]">) {
  const { slug, sub } = await params;
  const resolved = await resolvePath(`/${slug}/${sub}`);
  if (resolved.type !== "category") notFound();
  return <CategoryView resolved={resolved} searchParams={await searchParams} />;
}
