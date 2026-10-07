import { describe, expect, it } from "vitest";
import { publicRef } from "@/lib/format";
import { hasPlaceholder, withoutPlaceholders } from "./placeholders";

describe("design placeholders", () => {
  it("detects and strips [ALL CAPS] tokens", () => {
    expect(hasPlaceholder("Le délai dépend de votre ville. [DÉLAI PAR VILLE]")).toBe(true);
    expect(withoutPlaceholders("Le délai dépend de votre ville. [DÉLAI PAR VILLE]")).toBe("Le délai dépend de votre ville.");
    expect(withoutPlaceholders("[CONDITIONS DE RETOUR]")).toBeUndefined();
    expect(withoutPlaceholders("[TEXTE JURIDIQUE]")).toBeUndefined();
  });

  it("keeps real text with brackets or lowercase", () => {
    expect(hasPlaceholder("Diamètre [mm] : 125")).toBe(false);
    expect(withoutPlaceholders("Livraison gratuite")).toBe("Livraison gratuite");
    expect(withoutPlaceholders(42)).toBeUndefined();
  });
});

describe("publicRef", () => {
  it("hides temporary Excel references only", () => {
    expect(publicRef("XLS-GRILLESIMPLE6010")).toBeNull();
    expect(publicRef("D13AJH.N")).toBe("D13AJH.N");
    expect(publicRef(null)).toBeNull();
  });
});
