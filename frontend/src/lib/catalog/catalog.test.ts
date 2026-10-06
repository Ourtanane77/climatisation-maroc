import { describe, expect, it } from "vitest";
import { filterDense } from "@/components/catalog/DenseList";
import { compareHref, parseCompare } from "@/lib/compare";
import { withBrandBadge } from "./cards";
import { clearFiltersHref, listingApiQuery, selectedFilters, setParamHref, toggleFilterHref } from "./query";
import type { DenseItem } from "./types";

describe("listing URLs", () => {
  it("maps French params to the API query", () => {
    const q = new URLSearchParams(listingApiQuery({ marque: "lg,carrier", puissance: "12000", tri: "nom", page: "2" }));
    expect(q.get("brand")).toBe("lg,carrier");
    expect(q.get("power")).toBe("12000");
    expect(q.get("sort")).toBe("name");
    expect(q.get("page")).toBe("2");
    expect(new URLSearchParams(listingApiQuery({})).get("sort")).toBe("price_asc");
  });

  it("toggles a facet value and resets the page", () => {
    const base = "/climatisation/mural";
    expect(toggleFilterHref(base, { page: "2" }, "brand", "lg")).toBe("/climatisation/mural?marque=lg");
    expect(toggleFilterHref(base, { marque: "lg,carrier" }, "brand", "lg")).toBe("/climatisation/mural?marque=carrier");
    expect(toggleFilterHref(base, { marque: "lg" }, "brand", "lg")).toBe("/climatisation/mural");
    expect(toggleFilterHref(base, { marque: "lg", vue: "liste" }, "tech", "Inverter")).toBe("/climatisation/mural?marque=lg&vue=liste&techno=Inverter");
  });

  it("clears filters but keeps sort and view, and drops unknown params", () => {
    expect(clearFiltersHref("/c", { marque: "lg", tri: "nom", vue: "liste", utm: "x" })).toBe("/c?tri=nom&vue=liste");
    expect(setParamHref("/c", { marque: "lg", page: "3" }, "tri", "nom")).toBe("/c?marque=lg&tri=nom");
    expect(setParamHref("/c", { marque: "lg" }, "page", "2")).toBe("/c?marque=lg&page=2");
    expect(selectedFilters({ marque: ["lg", "ciat"] }).marque).toEqual(["lg", "ciat"]);
  });
});

describe("compare selection", () => {
  it("parses stored items defensively and caps at 3", () => {
    expect(parseCompare(null)).toEqual([]);
    expect(parseCompare("not json")).toEqual([]);
    const four = JSON.stringify(["A", "B", "C", "D"].map((sku) => ({ sku, name: sku })));
    expect(parseCompare(four)).toHaveLength(3);
    expect(
      compareHref([
        { sku: "FSW12T24PM/N", name: "x" },
        { sku: "D13AJH.N", name: "y" },
      ]),
    ).toBe("/comparer?p=FSW12T24PM%2FN,D13AJH.N");
  });
});

describe("dense list", () => {
  const item = (name: string, sku: string, price: number): DenseItem => ({
    name,
    sku,
    price,
    href: "#",
    image: null,
    art: null,
    inStock: true,
    sub: "",
    subPath: "",
  });
  const items = [item("Cuivre 3/8 Lafarga", "CUIV0006", 75000), item("Armaflex 9/6", "CLIM00008", 350), item("Électrovanne", "X1", 1000)];

  it("filters on name or reference, ignoring accents and case", () => {
    expect(filterDense(items, "cuiv0006", "pertinence").map((i) => i.sku)).toEqual(["CUIV0006"]);
    expect(filterDense(items, "electro", "pertinence").map((i) => i.sku)).toEqual(["X1"]);
  });

  it("sorts by price or name, keeping source order for relevance", () => {
    expect(filterDense(items, "", "pertinence").map((i) => i.sku)).toEqual(["CUIV0006", "CLIM00008", "X1"]);
    expect(filterDense(items, "", "prix-croissant").map((i) => i.price)).toEqual([350, 1000, 75000]);
    expect(filterDense(items, "", "nom").map((i) => i.name)).toEqual(["Armaflex 9/6", "Cuivre 3/8 Lafarga", "Électrovanne"]);
  });
});

describe("brand badge", () => {
  it("falls back to the brand when there is no discount", () => {
    expect(withBrandBadge({ name: "x", href: "#", price: 1, brand: "LG" }).badge).toEqual({ text: "LG", tone: "brand" });
    expect(withBrandBadge({ name: "x", href: "#", price: 1, brand: "LG", badge: { text: "−5 %", tone: "promo" } }).badge?.tone).toBe("promo");
  });
});
