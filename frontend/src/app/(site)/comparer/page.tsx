import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CompareTable } from "@/components/product/CompareTable";
import { getComparison } from "@/lib/product/api";
import { parseCompareParam } from "@/lib/product/logo";
import type { CompareData } from "@/lib/product/types";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Comparer des climatiseurs", noindex: true });

/** Default category for the "Ajouter un produit" slot when nothing is selected yet. */
const DEFAULT_CATEGORY = { label: "Climatiseurs muraux", href: "/climatisation/mural" };

/** Comparison (design: Comparer): `?p=SKU1,SKU2,SKU3` (variant SKUs, max 3), from the category tray. */
export default async function ComparePage({ searchParams }: PageProps<"/comparer">) {
  const skus = parseCompareParam((await searchParams).p);
  const data: CompareData = skus.length ? await getComparison(skus) : { products: [], rows: [], max: 3 };
  const category = data.products[0]?.category ?? DEFAULT_CATEGORY;

  return (
    <div>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, category, { label: "Comparer" }]} />
      <CompareTable key={data.products.map((p) => p.sku).join(",")} data={data} addHref={`${category.href}?comparer=1`} />
    </div>
  );
}
