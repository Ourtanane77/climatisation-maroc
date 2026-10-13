import { DenseList } from "@/components/catalog/DenseList";
import { CategoryVisual } from "@/components/catalog/CategoryVisual";
import { CategoryHero, PageIntro } from "@/components/catalog/Sections";
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
    // Arfro: the sub-category pills move into the grey hero panel.
    return (
      <>
        <Breadcrumb items={category.breadcrumb} />
        <CategoryHero
          title={category.h1}
          intro={category.intro}
          pills={pills}
          pillsLabel="Sous-catégories"
          visual={<CategoryVisual href={category.href} sizes="(min-width: 760px) 460px, 90vw" className="block h-auto w-full max-w-[460px] object-contain" />}
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
