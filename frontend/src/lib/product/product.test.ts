import { describe, expect, it } from "vitest";
import { kitTotal } from "@/components/product/InstallKit";
import { specRows } from "@/components/product/SpecTable";
import { visibleRows } from "@/components/product/CompareTable";
import type { ProductCardData } from "@/lib/types";
import { brandCard, sameRangeCard } from "./cards";
import { logoBox, parseCompareParam, powerRange } from "./logo";

const NB = "\u00a0";

describe("logoBox (equal-area logos)", () => {
  it("keeps the area within the caps", () => {
    // LG on Marque LG desktop: A=4200, ratio 2.05 → about 93 × 45.
    expect(logoBox(2.05, 4200, 56, 140)).toEqual({ width: 93, height: 45 });
  });
  it("caps tall logos by height and wide logos by width", () => {
    expect(logoBox(0.69, 3800, 56, 150).height).toBe(56);
    expect(logoBox(4.64, 3800, 56, 150).width).toBe(133);
    expect(logoBox(10, 3800, 56, 150).width).toBe(150);
  });
});

describe("powerRange", () => {
  it("reads the first and last power", () => {
    expect(powerRange([`9${NB}000 BTU`, `12${NB}000 BTU`, `24${NB}000 BTU`])).toBe(`9${NB}000 à 24${NB}000 BTU`);
  });
  it("is null for non-power variants", () => {
    expect(powerRange(["50 L", "80 L"])).toBeNull();
    expect(powerRange([`9${NB}000 BTU`])).toBeNull();
  });
});

describe("parseCompareParam", () => {
  it("keeps up to 3 unique SKUs in order", () => {
    expect(parseCompareParam("A, B,A,,C,D")).toEqual(["A", "B", "C"]);
    expect(parseCompareParam(["A", "B"])).toEqual(["A", "B"]);
    expect(parseCompareParam(undefined)).toEqual([]);
  });
});

describe("specRows", () => {
  it("puts the brand first, lets the variant override family rows, and ends with the reference", () => {
    const rows = specRows(
      {
        brand: { name: "LG", slug: "lg", href: "/marques/lg", logo: null, logoAspect: null, caption: null, official: true },
        specs: [
          { label: "Type", value: "Mural" },
          { label: "Puissance", value: "?" },
        ],
      },
      {
        sku: "D13AJH.N",
        specs: [
          { label: "Puissance", value: "12 000 BTU/h" },
          { label: "Surface", value: "20 m²" },
        ],
      },
    );
    expect(rows.map((r) => `${r.label}=${r.value}`)).toEqual(["Marque=LG", "Type=Mural", "Puissance=12 000 BTU/h", "Surface=20 m²", "Référence=D13AJH.N"]);
  });
});

describe("kitTotal", () => {
  it("adds checked, orderable accessories and the visit", () => {
    const acc = [
      { price: 113000, orderable: true },
      { price: 5500, orderable: true },
      { price: 9900, orderable: false },
    ];
    expect(kitTotal(acc, [true, true, true], 30000, false)).toBe(118500);
    expect(kitTotal(acc, [false, true, false], 30000, true)).toBe(35500);
  });
});

describe("visibleRows", () => {
  it("hides rows where every product has the same value", () => {
    const rows = [
      { label: "Marque", values: ["LG", "Carrier"], differs: true },
      { label: "Puissance", values: ["12 000", "12 000"], differs: false },
    ];
    expect(visibleRows(rows, false)).toHaveLength(2);
    expect(visibleRows(rows, true).map((r) => r.label)).toEqual(["Marque"]);
  });
});

describe("card adapters", () => {
  const family: ProductCardData = {
    name: "LG Dual Inverter",
    href: "/produit/lg-dual-inverter",
    brand: "LG",
    refText: "4 puissances",
    price: 540000,
    fromPrice: true,
    badge: { text: "−13 %", tone: "promo" },
    options: [
      { label: "9K", fullLabel: `9${NB}000 BTU`, sku: "A", price: 540000 },
      { label: "24K", fullLabel: `24${NB}000 BTU`, sku: "B", price: 890000 },
    ],
  };
  const single: ProductCardData = {
    name: "Carrier",
    href: "/produit/c",
    brand: "Carrier",
    sku: "X",
    price: 420000,
    regularPrice: 505000,
    badge: { text: "−17 %", tone: "promo" },
  };

  it("same range: brand badge on families, discount on single items, no chips", () => {
    expect(sameRangeCard(family)).toMatchObject({ options: [], refText: null, badge: { text: "LG", tone: "brand" } });
    expect(sameRangeCard(single).badge).toEqual({ text: "−17 %", tone: "promo" });
  });
  it("brand page: brand badge and the power range in the reference slot", () => {
    expect(brandCard(family)).toMatchObject({ options: [], refText: `9${NB}000 à 24${NB}000 BTU`, badge: { text: "LG", tone: "brand" } });
  });
});
