import { describe, expect, it } from "vitest";
import { computePower } from "@/lib/power";
import {
  AREA_MAX,
  AREA_MIN,
  btuLabel,
  clampArea,
  clampOccupants,
  climateZone,
  computeAdvice,
  recommendCategories,
  roundToStandard,
  type AdvisorAnswers,
} from "./model";

const NB = " ";

const base: AdvisorAnswers = {
  room: "salon",
  area: 20,
  city: "marrakech",
  ceiling: "standard",
  sun: "normale",
  insulation: "moyenne",
  occupants: 2,
  heat: [],
};
const advise = (patch: Partial<AdvisorAnswers>) => computeAdvice({ ...base, ...patch });

describe("rounding to standard sizes", () => {
  it.each([
    [0, 9000],
    [9000, 9000],
    [9001, 12000],
    [12000, 12000],
    [12001, 18000],
    [24000, 24000],
    [24001, 30000],
    [36001, 48000],
    [60000, 60000],
  ])("%i BTU → %i", (need, size) => {
    expect(roundToStandard(need)).toBe(size);
  });

  it("has no standard size beyond 60 000 BTU", () => {
    expect(roundToStandard(60001)).toBeNull();
  });
});

describe("bounds", () => {
  it.each([
    [3, AREA_MIN],
    [8, 8],
    [20.4, 20],
    [150, 150],
    [500, AREA_MAX],
    [Number.NaN, AREA_MIN],
  ])("area %d → %i", (v, out) => {
    expect(clampArea(v)).toBe(out);
  });

  it.each([
    [0, 1],
    [4, 4],
    [99, 30],
    [Number.NaN, 2],
  ])("occupants %d → %i", (v, out) => {
    expect(clampOccupants(v)).toBe(out);
  });

  it("clamps the area in the estimate", () => {
    expect(advise({ area: 2 }).base).toBe(8 * 600);
  });
});

describe("estimate and factors", () => {
  it.each<[string, Partial<AdvisorAnswers>, number, number | null]>([
    ["base rule: 600 BTU per m²", {}, 12000, 12000],
    ["15 m² bedroom", { room: "chambre", area: 15 }, 9000, 9000],
    ["high ceiling ×1.2", { ceiling: "haute" }, 14400, 18000],
    ["very high ceiling ×1.4", { ceiling: "tres-haute" }, 16800, 18000],
    ["strong sun ×1.15", { sun: "forte" }, 13800, 18000],
    ["weak sun ×0.9", { sun: "faible" }, 10800, 12000],
    ["good insulation ×0.9", { insulation: "bonne" }, 10800, 12000],
    ["poor insulation ×1.15", { insulation: "faible" }, 13800, 18000],
    ["coastal city ×0.9", { city: "casablanca" }, 10800, 12000],
    ["unknown city keeps the base", { city: "autre-ville" }, 12000, 12000],
    ["commerce ×1.1", { room: "commerce" }, 13200, 18000],
    ["kitchen ×1.2", { heat: ["cuisine"] }, 14400, 18000],
    ["electronics +1 000", { heat: ["electronique"] }, 13000, 18000],
    ["4 occupants: +2 × 600", { occupants: 4 }, 13200, 18000],
    ["1 occupant: no reduction", { occupants: 1 }, 12000, 12000],
    ["large shop beyond the range", { room: "commerce", area: 150, sun: "forte", insulation: "faible" }, 130927.5, null],
  ])("%s", (_, patch, need, size) => {
    const a = advise(patch);
    expect(a.need).toBeCloseTo(need, 6);
    expect(a.size).toBe(size);
  });

  it("lists every applied factor with its effect", () => {
    const a = advise({ ceiling: "haute", city: "tanger", occupants: 5, heat: ["electronique"] });
    expect(a.factors).toEqual([
      { label: "Plafond entre 2,5 et 3 m", effect: `×${NB}1,2` },
      { label: "Ville du littoral, étés plus doux", effect: `×${NB}0,9` },
      { label: "3 occupants au-delà de deux", effect: `+${NB}1${NB}800${NB}BTU` },
      { label: "Équipements électroniques", effect: `+${NB}1${NB}000${NB}BTU` },
    ]);
  });

  it("has no factor for the default answers", () => {
    expect(advise({}).factors).toEqual([]);
  });

  it("formats BTU with non-breaking spaces", () => {
    expect(btuLabel(18000)).toBe(`18${NB}000${NB}BTU`);
  });

  it("classifies coastal and interior cities", () => {
    expect(climateZone("agadir")).toBe("littoral");
    expect(climateZone("rabat")).toBe("littoral");
    expect(climateZone("marrakech")).toBe("interieur");
    expect(climateZone("fes")).toBe("interieur");
    expect(climateZone("ouarzazate")).toBe("interieur");
  });
});

describe("parity with the Calculateur de puissance (lib/power.ts)", () => {
  it.each<[Partial<AdvisorAnswers>, Parameters<typeof computePower>[0]]>([
    [{ area: 15 }, { surface: 15 }],
    [{ area: 16 }, { surface: 16 }],
    [
      { area: 30, ceiling: "haute" },
      { surface: 30, ceiling: "haute" },
    ],
    [
      { area: 22, sun: "forte", insulation: "faible" },
      { surface: 22, sun: "forte", topFloor: true },
    ],
    [
      { area: 25, heat: ["cuisine"], sun: "faible" },
      { surface: 25, room: "cuisine-ouverte", sun: "faible" },
    ],
    [{ area: 40 }, { surface: 40 }],
  ])("%o gives the same need and size", (patch, power) => {
    const a = advise(patch);
    const p = computePower(power);
    expect(a.need).toBeCloseTo(p.need, 6);
    expect(a.size).toBe(p.tier.btu);
  });
});

describe("recommended categories", () => {
  it.each<[Parameters<typeof recommendCategories>, string[]]>([
    [["chambre", 15, 9000, "standard"], ["mural"]],
    [["salon", 20, 12000, "standard"], ["mural"]],
    [
      ["salon", 35, 24000, "standard"],
      ["mural", "gainable"],
    ],
    [
      ["bureau", 30, 18000, "standard"],
      ["mural", "gainable"],
    ],
    [
      ["commerce", 25, 18000, "standard"],
      ["cassette", "mural", "gainable"],
    ],
    [
      ["commerce", 40, 24000, "standard"],
      ["cassette", "gainable"],
    ],
    [
      ["salon", 20, 18000, "tres-haute"],
      ["cassette", "mural"],
    ],
    [
      ["salon", 50, 36000, "standard"],
      ["gainable", "cassette"],
    ],
    [
      ["autre", 120, 60000, "standard"],
      ["gainable", "console", "cassette"],
    ],
    [
      ["commerce", 150, null, "standard"],
      ["gainable", "console", "cassette"],
    ],
  ])("%o → %o", (args, out) => {
    expect(recommendCategories(...args)).toEqual(out);
  });
});

describe("technical visit", () => {
  it("is optional for a standard room", () => {
    expect(advise({}).visitRecommended).toBe(false);
  });

  it.each<[Partial<AdvisorAnswers>, string[]]>([
    [{ area: 61 }, ["surface", "puissance"]],
    [{ area: 60 }, ["puissance"]],
    [{ room: "commerce", area: 15 }, ["commerce"]],
    [{ ceiling: "tres-haute" }, ["plafond"]],
    [{ area: 45 }, ["puissance"]],
    [{ area: 150, sun: "forte" }, ["surface", "hors-gamme"]],
  ])("%o → %o", (patch, reasons) => {
    const a = advise(patch);
    expect(a.visitReasons).toEqual(reasons);
    expect(a.visitRecommended).toBe(true);
  });
});
