/** WhatsApp links. The number comes from settings; the default is the sales line from the design. */

export const DEFAULT_WHATSAPP = "212666854184";

export function waLink(text?: string, number: string = DEFAULT_WHATSAPP): string {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * Visible form of a WhatsApp number (international, without "+"): a Moroccan number reads the local way,
 * "212666854184" → "0666 85 41 84"; any other is shown as "+" and its digits.
 */
export function formatWhatsApp(number: string): string {
  const digits = number.replace(/\D/g, "");
  const m = /^212(\d{3})(\d{2})(\d{2})(\d{2})$/.exec(digits);
  return m ? `0${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${digits}`;
}

/** "Bonjour, je souhaite commander : LG Dual Inverter 12 000 BTU (réf. D13AJH.N)" */
export function waProductLink(productName: string, sku: string, number?: string): string {
  // No temporary « XLS-… » reference in the message (products from the Excel list awaiting theirs).
  const ref = /^XLS-/i.test(sku) ? "" : ` (réf. ${sku})`;
  return waLink(`Bonjour, je souhaite commander : ${productName}${ref}`, number);
}
