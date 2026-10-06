import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Home page photos from the design (design/uploads, copied to public/design/ by
 * scripts/sync-design-assets.mjs). Returns the public URL when the file is present, else null so
 * the section falls back to its plain version.
 */
export function designImage(file: string): string | null {
  return existsSync(path.join(process.cwd(), "public", "design", file)) ? `/design/${file}` : null;
}

/** Bento tile photo per range key (design/Accueil.dc.html `catDef`). */
export const BENTO_IMAGES: Record<string, string> = {
  climatisation: "clima-cut2.png",
  "chauffe-eau": "chauffe-eau-b0352fa9.png",
  ventilation: "ventilateur-cut.png",
  gaines: "gaines-cut.png",
  "cuivre-et-gaz": "cuivre-cut2.png",
  "pieces-de-rechange": "telecommande-cut2.png",
  solutions: "pasted-1791236697258-0.png",
};

export const HERO_IMAGE = "cover-ariha.png";
export const INSTALL_IMAGE = "cuivre-56818f19.png";
