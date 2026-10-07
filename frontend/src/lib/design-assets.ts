import "server-only";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Photos from the design (design/uploads), copied to public/design/ with WebP renditions and a
 * manifest by scripts/sync-design-assets.mjs. A photo is null when its file is absent, so the
 * section falls back to its line drawing or plain version. URLs carry the file's modification time
 * (`?v=`): photos are replaced under the same name, and a reload must show the new one.
 */
export interface DesignPhoto {
  /** Default URL: a mid-size WebP rendition, else the PNG original. */
  src: string;
  /** `srcset` of the WebP renditions (empty when sharp was unavailable at sync time). */
  srcSet?: string;
  width?: number;
  height?: number;
}

interface ManifestEntry {
  src: string;
  width?: number;
  height?: number;
  renditions: { width: number; src: string }[];
}

const DIR = path.join(process.cwd(), "public", "design");

function manifest(): Record<string, ManifestEntry> {
  try {
    return JSON.parse(readFileSync(path.join(DIR, "manifest.json"), "utf8")) as Record<string, ManifestEntry>;
  } catch {
    return {};
  }
}

/** `/design/x.webp?v=<mtime>`, so the long browser cache never serves a replaced photo. */
function versioned(url: string): string {
  try {
    return `${url}?v=${Math.round(statSync(path.join(DIR, url.replace(/^\/design\//, ""))).mtimeMs)}`;
  } catch {
    return url;
  }
}

export function designPhoto(file: string): DesignPhoto | null {
  if (!existsSync(path.join(DIR, file))) return null;
  const entry = manifest()[file];
  const renditions = entry?.renditions ?? [];
  if (!renditions.length) return { src: versioned(`/design/${file}`), width: entry?.width, height: entry?.height };
  const mid = renditions[Math.min(1, renditions.length - 1)];
  return {
    src: versioned(mid.src),
    srcSet: renditions.map((r) => `${versioned(r.src)} ${r.width}w`).join(", "),
    width: entry.width,
    height: entry.height,
  };
}

/** Photo per category tile ("Choisir un type de …"), by category href; a back-office image wins. */
const CATEGORY_TILE_PHOTOS: Record<string, string> = {
  "/climatisation/mural": "cat-clima-mural.png",
  "/climatisation/gainable": "cat-clima-gainable.png",
  "/climatisation/cassette": "cat-clima-cassette.png",
  "/climatisation/console-armoire": "cat-clima-armoire.png",
  "/chauffe-eau/electrique": "cat-chauffe-eau-elect.png",
  "/chauffe-eau/gaz": "cat-chauffe-eau-gaz.png",
  "/chauffe-eau/solaire": "cat-chauffe-eau-solaire.png",
  "/chauffe-eau/chaudiere": "cat-chauffe-eau-chaudiere.png",
  "/ventilation/ventilateurs-de-gaine": "cat-ventilateur-gain.png",
  "/ventilation/multizone": "cat-ventilateur-multizone.png",
  "/ventilation/grilles-et-diffuseurs": "cat-grilles-diffuseurs.png",
  "/gaines/flexibles-souples": "cat-flexibles-souples.png",
  "/gaines/flexibles-isoles": "cat-flexibles-isoles.png",
  "/gaines/gaines-circulaires": "cat-gaines-circulaires.png",
};

/** Photo per range (top-level category), the design cut-outs also used by the home bento and the 404. */
const RANGE_PHOTOS: Record<string, string> = {
  "/climatisation": "clima-cut2.png",
  "/chauffe-eau": "chauffe-eau-b0352fa9.png",
  "/ventilation": "ventilateur-cut.png",
  "/gaines": "gaines-cut.png",
  "/cuivre-et-gaz": "cuivre-cut2.png",
  "/pieces-de-rechange": "telecommande-cut2.png",
};

/** Owner's photo for any category link: the sub-category photo, else its range's photo. */
export function categoryPhoto(href: string): DesignPhoto | null {
  const path = href.split(/[?#]/)[0].replace(/\/$/, "");
  const range = `/${path.split("/")[1] ?? ""}`;
  const own = CATEGORY_TILE_PHOTOS[path] ? designPhoto(CATEGORY_TILE_PHOTOS[path]) : null;
  if (own) return own;
  // A sub-category without its own photo does not borrow the range photo (it may not match).
  return path === range && RANGE_PHOTOS[range] ? designPhoto(RANGE_PHOTOS[range]) : null;
}

/** URL only (CSS backgrounds, simple images): the mid-size WebP rendition or the original. */
export function designImage(file: string): string | null {
  return designPhoto(file)?.src ?? null;
}
