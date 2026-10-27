/**
 * Advisor progress kept in sessionStorage so a refresh does not lose the consultation. Everything
 * read back is validated: a stale or tampered value falls back to the defaults.
 */
import {
  AREA_DEFAULT,
  OCCUPANTS_INCLUDED,
  clampArea,
  clampOccupants,
  type AdvisorAnswers,
  type AdvisorCeiling,
  type AdvisorInsulation,
  type AdvisorRoom,
  type AdvisorSun,
  type HeatSource,
} from "./model";

export const STORAGE_KEY = "arfro-advisor-v1";

/** Steps 0–3 are questions, 4 is the result. */
export const STEP_COUNT = 5;
export const RESULT_STEP = 4;

export interface AdvisorState {
  step: number;
  /** Null until chosen: steps 1 and 3 need an explicit answer. */
  room: AdvisorRoom | null;
  area: number;
  city: string | null;
  ceiling: AdvisorCeiling;
  sun: AdvisorSun;
  insulation: AdvisorInsulation;
  occupants: number;
  heat: HeatSource[];
}

export const INITIAL_STATE: AdvisorState = {
  step: 0,
  room: null,
  area: AREA_DEFAULT,
  city: null,
  ceiling: "standard",
  sun: "normale",
  insulation: "moyenne",
  occupants: OCCUPANTS_INCLUDED,
  heat: [],
};

const ROOMS: AdvisorRoom[] = ["chambre", "salon", "bureau", "commerce", "autre"];
const CEILINGS: AdvisorCeiling[] = ["standard", "haute", "tres-haute"];
const SUNS: AdvisorSun[] = ["faible", "normale", "forte"];
const INSULATIONS: AdvisorInsulation[] = ["bonne", "moyenne", "faible"];
const HEATS: HeatSource[] = ["cuisine", "electronique"];

function oneOf<T extends string>(list: readonly T[], value: unknown, fallback: T): T {
  return list.includes(value as T) ? (value as T) : fallback;
}

/** Whether the visitor may leave `step` (the answer it asks for is given). */
export function canAdvance(state: AdvisorState, step = state.step): boolean {
  if (step === 0) return state.room !== null;
  if (step === 2) return state.city !== null;
  return step < RESULT_STEP;
}

/** The answers of a complete consultation, or null while one is missing. */
export function answersOf(state: AdvisorState): AdvisorAnswers | null {
  if (!state.room || !state.city) return null;
  return {
    room: state.room,
    area: state.area,
    city: state.city,
    ceiling: state.ceiling,
    sun: state.sun,
    insulation: state.insulation,
    occupants: state.occupants,
    heat: state.heat,
  };
}

/** Parses a stored value; `citySlugs` are the cities offered (an unknown city is dropped). */
export function parseState(raw: string | null, citySlugs: string[]): AdvisorState {
  if (!raw) return INITIAL_STATE;
  let v: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return INITIAL_STATE;
    v = parsed as Record<string, unknown>;
  } catch {
    return INITIAL_STATE;
  }
  const room = ROOMS.includes(v.room as AdvisorRoom) ? (v.room as AdvisorRoom) : null;
  const city = typeof v.city === "string" && citySlugs.includes(v.city) ? v.city : null;
  const state: AdvisorState = {
    step: 0,
    room,
    area: typeof v.area === "number" ? clampArea(v.area) : AREA_DEFAULT,
    city,
    ceiling: oneOf(CEILINGS, v.ceiling, "standard"),
    sun: oneOf(SUNS, v.sun, "normale"),
    insulation: oneOf(INSULATIONS, v.insulation, "moyenne"),
    occupants: typeof v.occupants === "number" ? clampOccupants(v.occupants) : OCCUPANTS_INCLUDED,
    heat: Array.isArray(v.heat) ? HEATS.filter((h) => (v.heat as unknown[]).includes(h)) : [],
  };
  // Resume at the stored step, but never past an unanswered question.
  const wanted = typeof v.step === "number" && Number.isInteger(v.step) ? Math.max(0, Math.min(RESULT_STEP, v.step)) : 0;
  let step = 0;
  while (step < wanted && canAdvance(state, step)) step++;
  return { ...state, step };
}

export function loadState(citySlugs: string[]): AdvisorState {
  try {
    return parseState(window.sessionStorage.getItem(STORAGE_KEY), citySlugs);
  } catch {
    return INITIAL_STATE;
  }
}

export function saveState(state: AdvisorState): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or storage blocked: the consultation still works, it just is not kept.
  }
}

export function clearState(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
