import { describe, expect, it } from "vitest";
import { PHONE_ERROR_CHECKOUT } from "@/lib/phone";
import { CGV_ERROR, formMilliseconds, mapApiErrors, refusalToast, validateCheckout, type CheckoutValues } from "./checkout";

const valid: CheckoutValues = {
  name: "Yassine El Amrani",
  phone: "06 12 34 56 78",
  email: "",
  city: "marrakech",
  address: "24 rue Ibn Sina, Guéliz",
  note: "",
  technicalVisit: false,
  installationQuote: false,
  cgv: true,
};

describe("checkout rules (design/Commande.dc.html)", () => {
  it("accepts a complete form", () => {
    expect(validateCheckout(valid)).toEqual({});
  });

  it("refuses the design's incomplete default phone", () => {
    const errors = validateCheckout({ ...valid, phone: "06 12 34" });
    expect(errors.phone).toBe(PHONE_ERROR_CHECKOUT);
    expect(refusalToast(errors)).toBe("Vérifiez votre numéro de téléphone");
  });

  it("asks for the CGV box after the phone", () => {
    const errors = validateCheckout({ ...valid, cgv: false });
    expect(errors).toEqual({ cgv: CGV_ERROR });
    expect(refusalToast(errors)).toBe("Acceptez les conditions générales de vente");
  });

  it("accepts +212 numbers", () => {
    expect(validateCheckout({ ...valid, phone: "+212 7 00 00 00 00" })).toEqual({});
  });

  it("maps API errors to fields", () => {
    expect(mapApiErrors({ phone: ["a"], "lines.0.sku": ["b"], cgv: ["c", "d"], website: ["e"] })).toEqual({
      phone: "a",
      lines: "b",
      cgv: "c",
      form: "e",
    });
  });

  it("measures the form time in milliseconds", () => {
    expect(formMilliseconds(1_000, 4_250)).toBe(3_250);
  });
});
