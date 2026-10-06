/**
 * Air-conditioner sizing: the single model shared by the calculator page, the home power finder
 * and the article block (decision 2, docs/plan.md). Source: design/Calculateur puissance.dc.html.
 *
 * need = surface × 600 BTU × ceiling × sun × top floor × room, rounded up to the next tier.
 */

export type Ceiling = "standard" | "haute";
export type Sun = "faible" | "normale" | "forte";
export type Room = "chambre" | "salon" | "bureau" | "cuisine-ouverte";

export interface PowerInput {
  surface: number;
  ceiling?: Ceiling;
  sun?: Sun;
  topFloor?: boolean;
  room?: Room;
}

export interface PowerTier {
  btu: number;
  label: string;
  coverage: string;
}

export const BTU_PER_M2 = 600;
export const SURFACE_MIN = 8;
export const SURFACE_MAX = 60;

export const POWER_TIERS: PowerTier[] = [
  { btu: 9000, label: "9 000 BTU", coverage: "Jusqu’à 15 m²" },
  { btu: 12000, label: "12 000 BTU", coverage: "Jusqu’à 20 m²" },
  { btu: 18000, label: "18 000 BTU", coverage: "Jusqu’à 30 m²" },
  { btu: 24000, label: "24 000 BTU", coverage: "Jusqu’à 40 m²" },
  { btu: 30000, label: "30 000 BTU et plus", coverage: "Au-delà de 40 m²" },
];

export interface PowerResult {
  need: number;
  tierIndex: number;
  tier: PowerTier;
  reasons: string[];
  explanation: string;
}

export function clampSurface(value: number): number {
  if (!Number.isFinite(value)) return SURFACE_MIN;
  return Math.max(SURFACE_MIN, Math.min(SURFACE_MAX, Math.round(value)));
}

export function computePower(input: PowerInput): PowerResult {
  const surface = clampSurface(input.surface);
  const { ceiling = "standard", sun = "normale", topFloor = false, room = "salon" } = input;

  const factor =
    (ceiling === "haute" ? 1.2 : 1) * (sun === "forte" ? 1.15 : sun === "faible" ? 0.9 : 1) * (topFloor ? 1.15 : 1) * (room === "cuisine-ouverte" ? 1.2 : 1);
  const need = surface * BTU_PER_M2 * factor;

  const index = POWER_TIERS.slice(0, 4).findIndex((t) => need <= t.btu);
  const tierIndex = index === -1 ? 4 : index;

  const reasons = [
    ceiling === "haute" && "plafond haut",
    sun === "forte" && "pièce très ensoleillée",
    topFloor && "dernier étage",
    room === "cuisine-ouverte" && "cuisine ouverte",
    sun === "faible" && "pièce peu exposée",
  ].filter((r): r is string => Boolean(r));

  const rounded = (Math.round(need / 100) * 100).toLocaleString("fr-FR").replace(/[\s ]/g, " ");
  const explanation = `Pour ${surface} m²${reasons.length ? `, avec ${reasons.join(", ")}` : ""} : besoin estimé d’environ ${rounded} BTU.`;

  return { need, tierIndex, tier: POWER_TIERS[tierIndex], reasons, explanation };
}
