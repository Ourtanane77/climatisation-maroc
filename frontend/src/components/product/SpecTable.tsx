"use client";

import type { ProductPageData, ProductVariantData, SpecRow } from "@/lib/product/types";
import { cn } from "@/lib/cn";
import { useProduct } from "./ProductContext";
import { Section } from "./Section";

/**
 * Rows for the selected variant: Marque, the family rows (a variant row with the same label
 * replaces the family value), the variant's own rows, then Référence.
 */
export function specRows(product: Pick<ProductPageData, "brand" | "specs">, variant: Pick<ProductVariantData, "sku" | "specs">): SpecRow[] {
  const own = new Map(variant.specs.map((s) => [s.label, s.value]));
  const rows: SpecRow[] = [];
  if (product.brand) rows.push({ label: "Marque", value: product.brand.name });
  for (const s of product.specs) {
    rows.push({ label: s.label, value: own.get(s.label) ?? s.value });
    own.delete(s.label);
  }
  for (const [label, value] of own) rows.push({ label, value });
  rows.push({ label: "Référence", value: variant.sku });
  return rows;
}

/** "Caractéristiques" (design: white table, zebra rows, 280px label column on desktop). */
export function SpecTable() {
  const { product, variant } = useProduct();
  const rows = specRows(product, variant);
  return (
    <Section
      id="specifications"
      title="Caractéristiques"
      aside={
        product.datasheet ? (
          <a
            href={product.datasheet}
            target="_blank"
            rel="noopener"
            className="border-ink text-ink hover:bg-ink flex h-12 items-center rounded-full border-[1.5px] px-[22px] text-[15px] font-bold hover:text-white"
          >
            Télécharger la fiche technique
          </a>
        ) : undefined
      }
    >
      <dl className="rounded-24 m-0 overflow-hidden bg-white">
        {rows.map((r, i) => (
          <div key={r.label} className={cn("grid grid-cols-2 gap-4 px-6 py-4 text-[16px] md:grid-cols-[280px_1fr]", i % 2 ? "bg-white" : "bg-zebra")}>
            <dt className="text-muted">{r.label}</dt>
            <dd className="m-0 font-semibold">{r.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
