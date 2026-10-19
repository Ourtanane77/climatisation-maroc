/**
 * Google Maps embed of the contact page (Réglages « Carte Google Maps »). Laravel validates the
 * address when it is saved and again before the API outputs it (App\Support\Sites\MapEmbed); this
 * check is the storefront's own guard, so only an https://www.google.com/maps/embed?… address ever
 * becomes an iframe src. Returns null otherwise (the page then shows its default map).
 */
export function googleMapsEmbedSrc(url: string | null | undefined): string | null {
  const value = url?.trim();
  if (!value || value.length > 2048 || /[\s"'<>\\]/.test(value)) return null;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  const ok =
    parsed.protocol === "https:" &&
    parsed.hostname === "www.google.com" &&
    parsed.port === "" &&
    parsed.username === "" &&
    parsed.password === "" &&
    parsed.pathname === "/maps/embed" &&
    parsed.search.length > 1 &&
    parsed.hash === "";
  return ok ? value : null;
}
