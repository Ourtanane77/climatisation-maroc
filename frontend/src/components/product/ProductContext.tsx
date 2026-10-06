"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ProductPageData, ProductVariantData } from "@/lib/product/types";

interface ProductState {
  product: ProductPageData;
  variant: ProductVariantData;
  selectVariant: (sku: string) => void;
}

const Ctx = createContext<ProductState | null>(null);

/**
 * Selected variant of the product page, shared by the hero, the spec table and the sticky bar.
 * The choice is mirrored in `?v=<sku>` without a navigation, so the URL can be shared.
 */
export function ProductProvider({ product, initialSku, children }: { product: ProductPageData; initialSku: string; children: React.ReactNode }) {
  const [sku, setSku] = useState(initialSku);
  const variant = product.variants.find((v) => v.sku === sku) ?? product.variants[0];

  const selectVariant = useCallback(
    (next: string) => {
      setSku(next);
      const url = new URL(window.location.href);
      if (next === product.defaultSku) url.searchParams.delete("v");
      else url.searchParams.set("v", next);
      window.history.replaceState(window.history.state, "", url);
    },
    [product.defaultSku],
  );

  const value = useMemo(() => ({ product, variant, selectVariant }), [product, variant, selectVariant]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProduct(): ProductState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProduct() outside <ProductProvider>");
  return ctx;
}
