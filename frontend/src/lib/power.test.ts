import { describe, expect, it } from "vitest";
import { computePower, powerCta, quickPower } from "./power";

const NB = " ";

/** Same cases as backend/tests/Feature/Api/Home/CalculatorTest.php (PHP port of this model). */
describe("power calculator parity with the API", () => {
  it.each([
    [15, 0],
    [16, 1],
    [20, 1],
    [30, 2],
    [40, 3],
    [41, 4],
  ])("%i m² → tier %i", (surface, tier) => {
    expect(computePower({ surface }).tierIndex).toBe(tier);
  });

  it("lowers the need for a room with little sun", () => {
    expect(computePower({ surface: 14, sun: "faible" }).tier.btu).toBe(9000);
  });

  it("writes the same explanation", () => {
    expect(computePower({ surface: 25, ceiling: "haute", room: "cuisine-ouverte" }).explanation).toBe(
      `Pour 25${NB}m², avec plafond haut, cuisine ouverte : besoin estimé d’environ 21${NB}600 BTU.`,
    );
  });

  it("points to the murals of the tier, or the gainables beyond 24 000 BTU", () => {
    expect(powerCta(1)).toEqual({ label: `Voir les climatiseurs 12${NB}000 BTU`, href: "/climatisation/mural?puissance=12000" });
    expect(powerCta(4)).toEqual({ label: "Voir les gainables", href: "/climatisation/gainable" });
  });
});

describe("two-setting widgets (home finder, article calculator)", () => {
  it("recommends 12 000 BTU for the default 18 m²", () => {
    expect(quickPower(18, "normale")).toEqual({ tierIndex: 1, bumped: false });
  });

  it("flags the tier moved up by a very sunny room", () => {
    expect(quickPower(20, "forte")).toEqual({ tierIndex: 2, bumped: true });
    expect(quickPower(10, "forte")).toEqual({ tierIndex: 0, bumped: false });
  });
});
