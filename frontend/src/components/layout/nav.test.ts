import { describe, expect, it } from "vitest";
import { currentFor } from "./SiteHeader";

describe("currentFor (aria-current of navigation links)", () => {
  it("marks the link's own page and its section", () => {
    expect(currentFor("/climatisation", "/climatisation")).toBe("page");
    expect(currentFor("/climatisation/mural", "/climatisation")).toBe("true");
    expect(currentFor("/climatisation-marrakech", "/climatisation")).toBeUndefined();
    expect(currentFor("/blog", "/")).toBeUndefined();
  });
});
