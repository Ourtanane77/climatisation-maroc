"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Storefront key for client components (src/lib/site.ts is server-only). Provided once by the root
 * layout; arfro.com has its own look (docs/deviations.md, « Arfro restyle »).
 */
export type SiteKeyValue = "cm" | "arfro";

const SiteKeyContext = createContext<SiteKeyValue>("cm");

export function SiteKeyProvider({ value, children }: { value: SiteKeyValue; children: ReactNode }) {
  return <SiteKeyContext.Provider value={value}>{children}</SiteKeyContext.Provider>;
}

export function useSiteKey(): SiteKeyValue {
  return useContext(SiteKeyContext);
}

export function useIsArfro(): boolean {
  return useContext(SiteKeyContext) === "arfro";
}
