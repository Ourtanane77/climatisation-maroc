/**
 * Moroccan phone validation, as in the design forms: digits only, 10 digits starting 05, 06 or 07.
 * The same rule is enforced by the Laravel API (App\Rules\MoroccanPhone).
 */

export const PHONE_ERROR_CHECKOUT = "Numéro incomplet : saisissez 10 chiffres, par exemple 06 12 34 56 78.";
export const PHONE_ERROR_SHORT = "Saisissez 10 chiffres, par exemple 06 12 34 56 78.";

/** Keeps digits; turns +212 6… / 00212 6… into 06…. */
export function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00212")) digits = "0" + digits.slice(5);
  else if (digits.startsWith("212") && digits.length === 12) digits = "0" + digits.slice(3);
  return digits;
}

export function isValidMoroccanPhone(input: string): boolean {
  return /^0[5-7]\d{8}$/.test(normalizePhone(input));
}

/** "0612345678" → "06 12 34 56 78". */
export function formatPhone(input: string): string {
  const d = normalizePhone(input);
  return d.length === 10 ? d.replace(/(\d{2})(?=\d)/g, "$1 ") : input;
}

/** "0666-854184" (display form used across the design) → "tel:+212666854184". */
export function telHref(display: string): string {
  const d = normalizePhone(display);
  return `tel:+212${d.replace(/^0/, "")}`;
}
