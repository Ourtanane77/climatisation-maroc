/**
 * Design placeholders ("[PHOTO MAGASIN]", "[DÉLAI PAR VILLE]", "[TEXTE JURIDIQUE]"…) must never
 * reach visitors: real copy comes from the owner. Safety net for any text from the API.
 */
const TOKEN = /\[[A-ZÀ-ÖØ-Þ0-9][A-ZÀ-ÖØ-Þ0-9 ’'_/-]{2,}\]/gu;

export function hasPlaceholder(text: string): boolean {
  TOKEN.lastIndex = 0;
  return TOKEN.test(text);
}

/** The text without its placeholder tokens; undefined when nothing real is left. */
export function withoutPlaceholders(text: unknown): string | undefined {
  if (typeof text !== "string") return undefined;
  const cleaned = text
    .replace(TOKEN, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return cleaned !== "" ? cleaned : undefined;
}
