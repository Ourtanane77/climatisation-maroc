/**
 * Checkout form rules shared by the page and its tests. As in design/Commande.dc.html, the page
 * itself checks the phone and the CGV box; the API validates everything again.
 */
import { isValidMoroccanPhone, PHONE_ERROR_CHECKOUT } from "@/lib/phone";

export interface CheckoutValues {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  note: string;
  technicalVisit: boolean;
  installationQuote: boolean;
  cgv: boolean;
}

export const CGV_ERROR = "Cochez cette case pour confirmer la commande.";

export type CheckoutErrors = Partial<Record<keyof CheckoutValues | "lines" | "form", string>>;

export function validateCheckout(v: CheckoutValues): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (!isValidMoroccanPhone(v.phone)) errors.phone = PHONE_ERROR_CHECKOUT;
  if (!v.cgv) errors.cgv = CGV_ERROR;
  return errors;
}

/** Toast shown when the submit is refused (design: phone first, then CGV). */
export function refusalToast(errors: CheckoutErrors): string | null {
  if (errors.phone) return "Vérifiez votre numéro de téléphone";
  if (errors.cgv) return "Acceptez les conditions générales de vente";
  return null;
}

/** API field names → form field names, first message of each. */
export function mapApiErrors(errors: Record<string, string[]> | undefined): CheckoutErrors {
  const out: CheckoutErrors = {};
  const map: Record<string, keyof CheckoutErrors> = {
    name: "name",
    phone: "phone",
    email: "email",
    city: "city",
    address: "address",
    note: "note",
    cgv: "cgv",
    form: "form",
  };
  for (const [key, messages] of Object.entries(errors ?? {})) {
    const field = map[key] ?? (key.startsWith("lines") ? "lines" : "form");
    if (!out[field] && messages[0]) out[field] = messages[0];
  }
  return out;
}

/** Milliseconds since the form was shown, sent as `_t` (the API refuses posts under 3 000 ms). */
export function formMilliseconds(shownAt: number, now = Date.now()): number {
  return Math.max(0, Math.round(now - shownAt));
}
