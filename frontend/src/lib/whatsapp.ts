/** WhatsApp links. The number comes from settings; the default is the sales line from the design. */

export const DEFAULT_WHATSAPP = "212666854184";

export function waLink(text?: string, number: string = DEFAULT_WHATSAPP): string {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** "Bonjour, je souhaite commander : LG Dual Inverter 12 000 BTU (réf. D13AJH.N)" */
export function waProductLink(productName: string, sku: string, number?: string): string {
  return waLink(`Bonjour, je souhaite commander : ${productName} (réf. ${sku})`, number);
}
