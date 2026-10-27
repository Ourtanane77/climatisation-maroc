import { afterEach, describe, expect, it, vi } from "vitest";
import { INITIAL_STATE, STORAGE_KEY, answersOf, canAdvance, loadState, parseState, saveState } from "./state";

const slugs = ["marrakech", "casablanca"];

describe("stored progress", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it("starts fresh without a stored value or with garbage", () => {
    expect(parseState(null, slugs)).toEqual(INITIAL_STATE);
    expect(parseState("{nope", slugs)).toEqual(INITIAL_STATE);
    expect(parseState("42", slugs)).toEqual(INITIAL_STATE);
  });

  it("restores valid answers and the step", () => {
    const raw = JSON.stringify({
      step: 4,
      room: "bureau",
      area: 32,
      city: "casablanca",
      ceiling: "haute",
      sun: "forte",
      insulation: "bonne",
      occupants: 6,
      heat: ["electronique"],
    });
    expect(parseState(raw, slugs)).toEqual({
      step: 4,
      room: "bureau",
      area: 32,
      city: "casablanca",
      ceiling: "haute",
      sun: "forte",
      insulation: "bonne",
      occupants: 6,
      heat: ["electronique"],
    });
  });

  it("drops invalid values and never resumes past an unanswered question", () => {
    const raw = JSON.stringify({ step: 4, room: "garage", area: 999, city: "paris", ceiling: "x", occupants: -3, heat: ["four", "cuisine"] });
    const s = parseState(raw, slugs);
    expect(s).toMatchObject({ step: 0, room: null, area: 150, city: null, ceiling: "standard", occupants: 1, heat: ["cuisine"] });
    expect(parseState(JSON.stringify({ step: 3, room: "salon" }), slugs).step).toBe(2);
  });

  it("survives a blocked storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(loadState(slugs)).toEqual(INITIAL_STATE);
    expect(() => saveState(INITIAL_STATE)).not.toThrow();
  });

  it("round-trips through sessionStorage", () => {
    const s = { ...INITIAL_STATE, step: 1, room: "chambre" as const, area: 14 };
    saveState(s);
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeTruthy();
    expect(loadState(slugs)).toEqual(s);
  });
});

describe("validation", () => {
  it("needs a room, then a city", () => {
    expect(canAdvance(INITIAL_STATE)).toBe(false);
    expect(canAdvance({ ...INITIAL_STATE, room: "salon" })).toBe(true);
    expect(canAdvance({ ...INITIAL_STATE, step: 1 })).toBe(true);
    expect(canAdvance({ ...INITIAL_STATE, step: 2 })).toBe(false);
    expect(canAdvance({ ...INITIAL_STATE, step: 2, city: "marrakech" })).toBe(true);
    expect(canAdvance({ ...INITIAL_STATE, step: 4, room: "salon", city: "marrakech" })).toBe(false);
  });

  it("gives the answers only when complete", () => {
    expect(answersOf(INITIAL_STATE)).toBeNull();
    expect(answersOf({ ...INITIAL_STATE, room: "salon", city: "rabat" })).toMatchObject({ room: "salon", city: "rabat", area: 20 });
  });
});
