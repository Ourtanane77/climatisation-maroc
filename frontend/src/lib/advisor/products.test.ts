import { describe, expect, it } from "vitest";
import type { AdvisorCategory } from "./model";
import { categoryFromPath, parseBtu, pickTiers, productsFromCards, type AdvisorProduct, type ListingCard } from "./products";

const NB = " ";

function product(name: string, btu: number, price: number, category: AdvisorCategory = "mural", family = `/produit/${name}`): AdvisorProduct {
  return {
    name,
    brand: null,
    sku: `${name}-${btu}-${price}`,
    btu,
    price,
    regularPrice: null,
    href: family,
    image: null,
    art: null,
    dark: false,
    category,
    family,
  };
}

describe("reading the listing cards", () => {
  it.each([
    [`12${NB}000${NB}BTU`, "12K", 12000],
    [`9${NB}000${NB}BTU · Noir`, "9K Noir", 9000],
    [undefined, "18K", 18000],
    [undefined, "50 L", null],
  ])("%s / %s → %s", (full, label, btu) => {
    expect(parseBtu(full, label)).toBe(btu);
  });

  it.each([
    ["/climatisation/mural", "mural"],
    ["/climatisation/gainable/", "gainable"],
    ["/climatisation/cassette", "cassette"],
    ["/climatisation/console-armoire", "console"],
    ["/climatisation/accessoires", null],
  ])("%s → %s", (path, key) => {
    expect(categoryFromPath(path)).toBe(key);
  });

  it("flattens power variants, links the variant, skips priceless ones", () => {
    const cards: ListingCard[] = [
      {
        name: "LG Dual Inverter",
        href: "/produit/lg-dual-inverter",
        brand: "LG",
        art: "mural",
        options: [
          { label: "9K", fullLabel: `9${NB}000${NB}BTU`, sku: "S09", price: 520000, image: "/a.webp" },
          { label: "12K", fullLabel: `12${NB}000${NB}BTU`, sku: "S12", price: 550000, regularPrice: 600000 },
          { label: "18K", fullLabel: `18${NB}000${NB}BTU`, sku: "S18", price: 0, onRequest: true },
        ],
      },
      { name: "Single", href: "/produit/single", options: [{ label: "24K", sku: "X24", price: 900000 }] },
      { name: "No power", href: "/produit/np", options: [] },
    ];
    const list = productsFromCards(cards, "mural");
    expect(list.map((p) => [p.sku, p.btu, p.href])).toEqual([
      ["S09", 9000, "/produit/lg-dual-inverter?v=S09"],
      ["S12", 12000, "/produit/lg-dual-inverter?v=S12"],
      ["X24", 24000, "/produit/single"],
    ]);
    expect(list[1]).toMatchObject({ brand: "LG", regularPrice: 600000, category: "mural", family: "/produit/lg-dual-inverter" });
  });
});

describe("Essentiel / Confort / Premium", () => {
  const catalogue = [
    product("a", 12000, 500000),
    product("b", 12000, 400000),
    product("c", 12000, 700000),
    product("d", 12000, 550000),
    product("e", 18000, 300000),
    product("g", 12000, 900000, "gainable"),
  ];

  it("picks the lowest, the middle and the highest price at the size", () => {
    const { btu, picks } = pickTiers(catalogue, 12000, ["mural", "gainable"]);
    expect(btu).toBe(12000);
    expect(picks.map((p) => [p.level, p.product.name])).toEqual([
      ["essentiel", "b"],
      ["confort", "a"],
      ["premium", "c"],
    ]);
  });

  it("keeps one variant per family (the cheapest colour)", () => {
    const list = [
      product("white", 9000, 375000, "mural", "/produit/fitco"),
      product("black", 9000, 410000, "mural", "/produit/fitco"),
      product("x", 9000, 450000),
    ];
    const { picks } = pickTiers(list, 9000, ["mural"]);
    expect(picks.map((p) => p.product.name)).toEqual(["white", "x"]);
    expect(picks.map((p) => p.level)).toEqual(["essentiel", "premium"]);
  });

  it("pools the recommended categories when the first has fewer than three", () => {
    const list = [product("m", 18000, 600000), product("c1", 18000, 1000000, "cassette"), product("c2", 18000, 1250000, "cassette")];
    const { picks } = pickTiers(list, 18000, ["cassette", "mural"]);
    expect(picks.map((p) => [p.level, p.product.name])).toEqual([
      ["essentiel", "m"],
      ["confort", "c1"],
      ["premium", "c2"],
    ]);
  });

  it("ignores categories that are not recommended", () => {
    expect(pickTiers(catalogue, 12000, ["cassette"]).picks).toEqual([]);
  });

  it("shows a single product as « Notre sélection »", () => {
    const { picks } = pickTiers([product("only", 30000, 1140000, "gainable")], 30000, ["gainable", "cassette"]);
    expect(picks).toEqual([{ level: "selection", product: expect.objectContaining({ name: "only" }) }]);
  });

  it("falls back to the next size up, one step at most", () => {
    const list = [product("g36", 36000, 1500000, "gainable"), product("g48", 48000, 2000000, "gainable")];
    expect(pickTiers(list, 30000, ["gainable"])).toMatchObject({ btu: 36000, picks: [{ product: { name: "g36" } }] });
    expect(pickTiers([product("g60", 60000, 1, "gainable")], 30000, ["gainable"])).toEqual({ btu: 30000, picks: [] });
  });

  it("has nothing beyond the range", () => {
    expect(pickTiers(catalogue, null, ["gainable"])).toEqual({ btu: null, picks: [] });
  });
});
