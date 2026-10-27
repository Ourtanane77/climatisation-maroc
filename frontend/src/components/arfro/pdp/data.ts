import { POWER_TIERS } from "@/lib/power";
import type { ProductPageData, SpecRow } from "@/lib/product/types";

/**
 * Pure helpers of the Arfro product page: everything shown is read from the product's own data
 * (spec rows, variants), never written for it.
 */

/** Spec rows worth a « key figure » tile, in display order (first match per pattern). */
const KEY_FACTS: { pattern: RegExp; label?: string }[] = [
  { pattern: /^puissance frigorifique/i, label: "Froid" },
  { pattern: /^puissance calorifique/i, label: "Chaud" },
  { pattern: /^puissance$/i },
  { pattern: /^surface/i, label: "Surface conseillée" },
  { pattern: /^capacit/i },
  { pattern: /^technologie/i },
  { pattern: /^(fluide|gaz|r[ée]frig[ée]rant)/i, label: "Fluide" },
  { pattern: /^classe/i },
  { pattern: /^connectivit/i },
];

export const MAX_KEY_FACTS = 4;

/** The selected variant's headline figures (power, surface, technology…), at most four. */
export function keyFacts(rows: SpecRow[], max = MAX_KEY_FACTS): SpecRow[] {
  const facts: SpecRow[] = [];
  for (const { pattern, label } of KEY_FACTS) {
    const row = rows.find((r) => pattern.test(r.label));
    if (row && row.value.trim()) facts.push({ label: label ?? row.label, value: row.value });
    if (facts.length === max) break;
  }
  return facts;
}

export interface SpecGroup {
  title: string;
  rows: SpecRow[];
}

const PERFORMANCE =
  /^(puissance|surface|capacit|d[ée]bit|consommation|seer|scop|eer|cop|niveau sonore|pression sonore|puissance sonore|volume|temp[ée]rature|rendement|efficacit)/i;
const IDENTITY = /^(marque|r[ée]f[ée]rence|mod[èe]le|garantie)$/i;

/** Spec rows in three groups (performances, design and technology, identification); empty groups are dropped. */
export function groupSpecs(rows: SpecRow[]): SpecGroup[] {
  const groups: SpecGroup[] = [
    { title: "Performances", rows: rows.filter((r) => PERFORMANCE.test(r.label)) },
    { title: "Conception et technologie", rows: rows.filter((r) => !PERFORMANCE.test(r.label) && !IDENTITY.test(r.label)) },
    { title: "Identification", rows: rows.filter((r) => IDENTITY.test(r.label)) },
  ];
  return groups.filter((g) => g.rows.length > 0);
}

/** "jusqu'à 15 m²" → "Jusqu'à 15 m²". */
function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** 12000 from "12 000 BTU" / "12 000 BTU/h" (any spaces), else null. */
export function btuOf(text: string | null | undefined): number | null {
  const match = /([\d][\d\s  ]*)\s*BTU/iu.exec(text ?? "");
  if (!match) return null;
  const value = Number(match[1].replace(/\D/g, ""));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Recommended surface of a variant: its « Surface conseillée » row, else null. */
export function surfaceRow(specs: SpecRow[]): string | null {
  const value = specs.find((s) => /^surface/i.test(s.label))?.value?.trim();
  return value ? capitalise(value) : null;
}

export interface AudienceRow {
  sku: string;
  label: string;
  surface: string;
}

/**
 * « Pour qui ? »: the recommended surface per power. From the variant's own « Surface conseillée »
 * row; failing that, for air conditioners only, the power calculator's tier when the variant's
 * power is exactly one of its tiers (lib/power.ts). Empty when not every variant has one (the
 * section is then left out).
 */
export function audienceRows(product: Pick<ProductPageData, "category" | "variants">): AudienceRow[] {
  const clim = product.category.href.startsWith("/climatisation");
  const rows: AudienceRow[] = [];
  for (const v of product.variants) {
    let surface = surfaceRow(v.specs);
    if (!surface && clim) {
      const btu = btuOf(v.label) ?? btuOf(v.specs.find((s) => /^puissance/i.test(s.label))?.value);
      const tier = btu != null ? POWER_TIERS.slice(0, 4).find((t) => t.btu === btu) : undefined;
      surface = tier?.coverage ?? null;
    }
    if (!surface) return [];
    rows.push({ sku: v.sku, label: v.label ?? v.name, surface });
  }
  return rows;
}
