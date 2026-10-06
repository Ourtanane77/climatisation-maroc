import type { Metadata } from "next";
import { BrandTiles } from "@/components/brand/BrandTiles";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getBrands } from "@/lib/product/api";

export const metadata: Metadata = {
  title: "Marques",
  alternates: { canonical: "/marques" },
};

/** Brand hub (implied by the Marque LG breadcrumb): tiles of the brands that have products. */
export default async function BrandsPage() {
  const brands = (await getBrands()).filter((b) => b.productCount > 0);
  return (
    <div>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Marques" }]} />
      <h1 className="m-0 pt-6 pb-8 text-[34px] leading-[1.05] font-bold tracking-[-0.03em] md:text-[44px] xl:text-[56px]">Marques</h1>
      <BrandTiles brands={brands} />
    </div>
  );
}
