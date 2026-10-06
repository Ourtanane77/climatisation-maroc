import { describe, expect, it } from "vitest";
import { dh, discountBadge, formatNumber, plural, savingText } from "./format";
import { formatPhone, isValidMoroccanPhone, normalizePhone, telHref } from "./phone";
import { computePower } from "./power";
import { waLink, waProductLink } from "./whatsapp";

const NB = " ";

describe("format", () => {
  it("formats Dhs from centimes like the design", () => {
    expect(dh(570000)).toBe(`5${NB}700${NB}Dhs`);
    expect(dh(5500)).toBe(`55${NB}Dhs`);
    expect(dh(350)).toBe(`3,50${NB}Dhs`);
    expect(formatNumber(21100)).toBe(`21${NB}100`);
  });

  it("computes the discount badge and saving", () => {
    expect(discountBadge(650000, 570000)).toBe(`−12${NB}%`);
    expect(savingText(650000, 570000)).toBe(`Économisez 800${NB}Dhs`);
  });

  it("pluralises counts", () => {
    expect(plural(1, "article")).toBe(`1${NB}article`);
    expect(plural(4, "article")).toBe(`4${NB}articles`);
  });
});

describe("phone", () => {
  it("accepts 10-digit 05/06/07 numbers in any spacing", () => {
    expect(isValidMoroccanPhone("06 12 34 56 78")).toBe(true);
    expect(isValidMoroccanPhone("0524-306850")).toBe(true);
    expect(isValidMoroccanPhone("+212 6 61 23 45 67")).toBe(true);
  });

  it("rejects incomplete or foreign numbers", () => {
    expect(isValidMoroccanPhone("06 12 34")).toBe(false);
    expect(isValidMoroccanPhone("0812345678")).toBe(false);
    expect(isValidMoroccanPhone("")).toBe(false);
  });

  it("normalises and formats", () => {
    expect(normalizePhone("00212661234567")).toBe("0661234567");
    expect(formatPhone("0661234567")).toBe("06 61 23 45 67");
    expect(telHref("0666-854184")).toBe("tel:+212666854184");
  });
});

describe("power calculator (shared model)", () => {
  it("matches the calculator page default: 18 m² → 10 800 BTU → 12 000", () => {
    const r = computePower({ surface: 18 });
    expect(r.tier.btu).toBe(12000);
    expect(r.explanation).toBe(`Pour 18${NB}m² : besoin estimé d’environ 10${NB}800 BTU.`);
  });

  it("follows the tier table at standard exposure", () => {
    expect(computePower({ surface: 15 }).tier.btu).toBe(9000);
    expect(computePower({ surface: 20 }).tier.btu).toBe(12000);
    expect(computePower({ surface: 30 }).tier.btu).toBe(18000);
    expect(computePower({ surface: 40 }).tier.btu).toBe(24000);
    expect(computePower({ surface: 41 }).tierIndex).toBe(4);
  });

  it("goes one size up for a very sunny room or a top floor", () => {
    expect(computePower({ surface: 20, sun: "forte" }).tier.btu).toBe(18000);
    expect(computePower({ surface: 20, topFloor: true }).tier.btu).toBe(18000);
  });

  it("lists the reasons in the explanation", () => {
    const r = computePower({ surface: 25, ceiling: "haute", room: "cuisine-ouverte" });
    expect(r.explanation).toContain("avec plafond haut, cuisine ouverte");
  });

  it("clamps the surface to 8–60 m²", () => {
    expect(computePower({ surface: 2 }).explanation).toContain(`Pour 8${NB}m²`);
    expect(computePower({ surface: 500 }).explanation).toContain(`Pour 60${NB}m²`);
  });
});

describe("whatsapp", () => {
  it("builds prefilled links", () => {
    expect(waLink()).toBe("https://wa.me/212666854184");
    expect(waProductLink("LG Dual Inverter 12 000 BTU", "D13AJH.N")).toBe(
      "https://wa.me/212666854184?text=" + encodeURIComponent("Bonjour, je souhaite commander : LG Dual Inverter 12 000 BTU (réf. D13AJH.N)"),
    );
  });
});
