/**
 * Climate advisor of the Arfro home (docs/arfro-creative-brief.md, section 7): a transparent
 * cooling-capacity estimate. Pure functions, no React, so the Climatisation Maroc calculator can
 * share them later.
 *
 * It extends the sizing model of lib/power.ts (the « Calculateur de puissance ») and keeps its
 * numbers: 600 BTU per m², ×1.2 for a high ceiling, ×1.15 / ×0.9 for strong / weak sun, ×1.15 for a
 * poorly insulated room (the calculator's « dernier étage »), ×1.2 for a kitchen, rounded up to the
 * next standard size. With the same answers both tools give the same size (see model.test.ts).
 *
 * need = surface × 600 × ceiling × sun × insulation × room × climate × kitchen
 *        + 600 per occupant beyond two + 1 000 for electronic equipment
 *
 * It is an estimate, not a thermal study: the result always says so and offers a technical visit.
 */
import { BTU_PER_M2 } from "@/lib/power";

export type AdvisorRoom = "chambre" | "salon" | "bureau" | "commerce" | "autre";
export type AdvisorCeiling = "standard" | "haute" | "tres-haute";
export type AdvisorSun = "faible" | "normale" | "forte";
export type AdvisorInsulation = "bonne" | "moyenne" | "faible";
export type HeatSource = "cuisine" | "electronique";
export type ClimateZone = "interieur" | "littoral";
export type AdvisorCategory = "mural" | "cassette" | "gainable" | "console";

export interface AdvisorAnswers {
  room: AdvisorRoom;
  /** m², clamped to [AREA_MIN, AREA_MAX]. */
  area: number;
  /** City slug from GET /cities (or the fallback list). */
  city: string;
  ceiling: AdvisorCeiling;
  sun: AdvisorSun;
  insulation: AdvisorInsulation;
  occupants: number;
  heat: HeatSource[];
}

export const AREA_MIN = 8;
export const AREA_MAX = 150;
export const AREA_DEFAULT = 20;
export const OCCUPANTS_MIN = 1;
export const OCCUPANTS_MAX = 30;
export const OCCUPANTS_INCLUDED = 2;
export const BTU_PER_EXTRA_OCCUPANT = 600;
export const BTU_ELECTRONICS = 1000;

/** Standard nominal sizes sold for split and ducted units (the catalogue's power variants). */
export const STANDARD_SIZES = [9000, 12000, 18000, 24000, 30000, 36000, 48000, 60000] as const;
/** Largest wall-mounted (mural) size. */
export const MURAL_MAX_BTU = 24000;

export const FACTORS = {
  ceiling: { standard: 1, haute: 1.2, "tres-haute": 1.4 },
  sun: { faible: 0.9, normale: 1, forte: 1.15 },
  insulation: { bonne: 0.9, moyenne: 1, faible: 1.15 },
  room: { chambre: 1, salon: 1, bureau: 1, commerce: 1.1, autre: 1 },
  climate: { interieur: 1, littoral: 0.9 },
  kitchen: 1.2,
} as const;

/**
 * Coastal cities (milder summers, sea breeze): −10 %. Every other city, and « Autre ville », keeps
 * the base rule, which was set for the interior summers of Marrakech (Ariha Froid's city): when in
 * doubt the estimate stays on the prudent side.
 */
export const COASTAL_CITIES = new Set([
  "agadir",
  "casablanca",
  "el-jadida",
  "essaouira",
  "kenitra",
  "mohammedia",
  "rabat",
  "safi",
  "sale",
  "tanger",
  "tetouan",
]);

export function climateZone(citySlug: string): ClimateZone {
  return COASTAL_CITIES.has(citySlug) ? "littoral" : "interieur";
}

export function clampArea(value: number): number {
  if (!Number.isFinite(value)) return AREA_MIN;
  return Math.max(AREA_MIN, Math.min(AREA_MAX, Math.round(value)));
}

export function clampOccupants(value: number): number {
  if (!Number.isFinite(value)) return OCCUPANTS_INCLUDED;
  return Math.max(OCCUPANTS_MIN, Math.min(OCCUPANTS_MAX, Math.round(value)));
}

/** Smallest standard size covering `need`, or null beyond the largest one (several units needed). */
export function roundToStandard(need: number): number | null {
  return STANDARD_SIZES.find((s) => need <= s) ?? null;
}

const NBSP = " ";

/** 12000 → "12 000 BTU" (non-breaking spaces, as on the rest of the site). */
export function btuLabel(btu: number): string {
  return `${btu.toLocaleString("fr-FR").replace(/[\s  ]/g, NBSP)}${NBSP}BTU`;
}

function factorText(f: number): string {
  return `×${NBSP}${f.toLocaleString("fr-FR")}`;
}

export interface AppliedFactor {
  label: string;
  /** "× 1,2", "+ 1 200 BTU". */
  effect: string;
}

export type VisitReason = "surface" | "commerce" | "plafond" | "puissance" | "hors-gamme";

export interface Advice {
  /** Raw estimate in BTU/h, before rounding. */
  need: number;
  /** Rounded to the nearest 100 for display. */
  needRounded: number;
  /** Standard size, or null when the need exceeds 60 000 BTU (several units, study needed). */
  size: number | null;
  zone: ClimateZone;
  base: number;
  factors: AppliedFactor[];
  categories: AdvisorCategory[];
  visitReasons: VisitReason[];
  /** True when a technical visit is strongly advised rather than optional. */
  visitRecommended: boolean;
}

/** Wall units for living spaces up to 24 000 BTU; ceiling and ducted units beyond, and for shops. */
export function recommendCategories(room: AdvisorRoom, area: number, size: number | null, ceiling: AdvisorCeiling): AdvisorCategory[] {
  const btu = size ?? Number.POSITIVE_INFINITY;
  if (btu > MURAL_MAX_BTU) {
    return btu >= 48000 ? ["gainable", "console", "cassette"] : ["gainable", "cassette"];
  }
  if (room === "commerce") return area <= 30 ? ["cassette", "mural", "gainable"] : ["cassette", "gainable"];
  if (ceiling === "tres-haute") return ["cassette", "mural"];
  if ((room === "salon" || room === "bureau") && area >= 25) return ["mural", "gainable"];
  return ["mural"];
}

export function visitReasons(a: Pick<AdvisorAnswers, "area" | "room" | "ceiling">, need: number): VisitReason[] {
  const size = roundToStandard(need);
  return [
    a.area > 60 && ("surface" as const),
    a.room === "commerce" && ("commerce" as const),
    a.ceiling === "tres-haute" && ("plafond" as const),
    size === null ? ("hors-gamme" as const) : size > MURAL_MAX_BTU && ("puissance" as const),
  ].filter((r): r is VisitReason => Boolean(r));
}

export const VISIT_REASON_TEXT: Record<VisitReason, string> = {
  surface: "la surface dépasse 60 m²",
  commerce: "un commerce reçoit du public et ouvre souvent ses portes",
  plafond: "le plafond dépasse 3 m",
  puissance: "la puissance dépasse celle d’un climatiseur mural",
  "hors-gamme": "le besoin dépasse 60 000 BTU : plusieurs unités ou un système centralisé",
};

export function computeAdvice(input: AdvisorAnswers): Advice {
  const area = clampArea(input.area);
  const occupants = clampOccupants(input.occupants);
  const zone = climateZone(input.city);
  const kitchen = input.heat.includes("cuisine");
  const electronics = input.heat.includes("electronique");

  const base = area * BTU_PER_M2;
  const multiplier =
    FACTORS.ceiling[input.ceiling] *
    FACTORS.sun[input.sun] *
    FACTORS.insulation[input.insulation] *
    FACTORS.room[input.room] *
    FACTORS.climate[zone] *
    (kitchen ? FACTORS.kitchen : 1);
  const extraOccupants = Math.max(0, occupants - OCCUPANTS_INCLUDED);
  const need = base * multiplier + extraOccupants * BTU_PER_EXTRA_OCCUPANT + (electronics ? BTU_ELECTRONICS : 0);

  const factors: AppliedFactor[] = [];
  const push = (cond: boolean, label: string, effect: string) => cond && factors.push({ label, effect });
  push(input.ceiling === "haute", "Plafond entre 2,5 et 3 m", factorText(FACTORS.ceiling.haute));
  push(input.ceiling === "tres-haute", "Plafond de plus de 3 m", factorText(FACTORS.ceiling["tres-haute"]));
  push(input.sun === "forte", "Pièce très ensoleillée", factorText(FACTORS.sun.forte));
  push(input.sun === "faible", "Pièce peu exposée", factorText(FACTORS.sun.faible));
  push(input.insulation === "faible", "Isolation faible (toit, simple vitrage)", factorText(FACTORS.insulation.faible));
  push(input.insulation === "bonne", "Bonne isolation", factorText(FACTORS.insulation.bonne));
  push(input.room === "commerce", "Commerce (portes ouvertes, éclairage)", factorText(FACTORS.room.commerce));
  push(zone === "littoral", "Ville du littoral, étés plus doux", factorText(FACTORS.climate.littoral));
  push(kitchen, "Cuisine ou plaques de cuisson", factorText(FACTORS.kitchen));
  push(
    extraOccupants > 0,
    `${extraOccupants} occupant${extraOccupants > 1 ? "s" : ""} au-delà de deux`,
    `+${NBSP}${btuLabel(extraOccupants * BTU_PER_EXTRA_OCCUPANT)}`,
  );
  push(electronics, "Équipements électroniques", `+${NBSP}${btuLabel(BTU_ELECTRONICS)}`);

  const size = roundToStandard(need);
  const reasons = visitReasons({ area, room: input.room, ceiling: input.ceiling }, need);

  return {
    need,
    needRounded: Math.round(need / 100) * 100,
    size,
    zone,
    base,
    factors,
    categories: recommendCategories(input.room, area, size, input.ceiling),
    visitReasons: reasons,
    visitRecommended: reasons.length > 0,
  };
}
