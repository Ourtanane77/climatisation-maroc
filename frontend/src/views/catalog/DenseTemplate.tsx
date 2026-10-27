import { DenseList } from "@/components/catalog/DenseList";
import { ArfroCategoryHeader } from "@/components/arfro/listing/ArfroCategoryHeader";
import { PageIntro } from "@/components/catalog/Sections";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { CategoryData, DenseItem } from "@/lib/catalog/types";
import { SITE_KEY } from "@/lib/site";

/**
 * Quick-order list (design: Cuivre et gaz.dc.html). On a sub-category the same page is shown
 * with that pill active; "Tout" goes back to the range.
 */
export default async function DenseTemplate({ category }: { category: CategoryData }) {
  const { data } = await apiGet<{ data: DenseItem[] }>(`/categories/${category.path}/products?flat=1`, {
    tags: ["categories", "products"],
    token: await getToken(),
  });
  const range = category.parent ?? { label: category.name, href: category.href };
  const pills = [
    { label: "Tout", href: range.href, active: !category.parent },
    ...category.siblings.map((s) => ({ label: s.label, href: s.href, active: s.active })),
  ];

  if (SITE_KEY === "arfro") {
    // Arfro: the sub-categories become the tab row of the editorial header.
    return (
      <>
        <Breadcrumb items={category.breadcrumb} />
        <ArfroCategoryHeader
          title={category.h1}
          intro={category.intro}
          breadcrumb={category.breadcrumb}
          href={category.href}
          nav={pills}
          navLabel="Sous-catégories"
        />
        <DenseList items={data} pills={[]} />
      </>
    );
  }

  return (
    <>
      <Breadcrumb items={category.breadcrumb} />
      <PageIntro title={category.h1} intro={category.intro} dense />
      <DenseList items={data} pills={pills} />
    </>
  );
}
