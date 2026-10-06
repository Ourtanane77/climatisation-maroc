/**
 * Equal-area logo sizing from the design (`logo(n, A, mh, mw)` in Marque LG / Accueil): every logo
 * gets the same visual surface A whatever its aspect ratio, capped by a max height and width.
 */
export function logoBox(aspect: number | null | undefined, area: number, maxH: number, maxW: number): { width: number; height: number } {
  const ar = aspect && aspect > 0 ? aspect : 3;
  let w = Math.sqrt(area * ar);
  let h = Math.sqrt(area / ar);
  if (h > maxH) {
    h = maxH;
    w = h * ar;
  }
  if (w > maxW) {
    w = maxW;
    h = w / ar;
  }
  return { width: Math.round(w), height: Math.round(h) };
}

/** "9 000 à 24 000 BTU" for a family whose options are powers (Marque LG card ref slot), else null. */
export function powerRange(fullLabels: string[]): string | null {
  const values = fullLabels.map((l) => /^([\d\s  ]+)\s?BTU$/u.exec(l)?.[1]?.trim());
  if (values.length < 2 || values.some((v) => !v)) return null;
  return `${values[0]} à ${values[values.length - 1]} BTU`;
}

/** Selected compare SKUs from `?p=A,B,C` (max 3, unique, order kept). */
export function parseCompareParam(value: string | string[] | undefined, max = 3): string[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  return [
    ...new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ].slice(0, max);
}
