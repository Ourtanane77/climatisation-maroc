// Copies site-chrome images from the design reference into public/brand/ (run before dev and build).
// Catalogue and content images are not handled here: they are seeded into Laravel storage.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const candidates = [path.resolve(here, "../../design/uploads"), "/design-uploads"];
const source = candidates.find((dir) => existsSync(dir));
const target = path.resolve(here, "../public/brand");

const files = {
  "pasted-1791221833312-0.png": "logo-ariha-froid.png",
  // Used by the dev-only /styleguide page.
  "New_DZ2.png": "sample-lg-dual.png",
};

mkdirSync(target, { recursive: true });
if (!source) {
  console.log("[sync-design-assets] design/uploads not found, skipping");
} else {
  for (const [from, to] of Object.entries(files)) {
    const src = path.join(source, from);
    if (existsSync(src)) {
      copyFileSync(src, path.join(target, to));
      console.log(`[sync-design-assets] ${from} → public/brand/${to}`);
    } else {
      console.log(`[sync-design-assets] missing ${from} (fallback used)`);
    }
  }

  // Home page photos (design/Accueil.dc.html), copied under their own names to public/design/.
  // The home uses each one only when present; a back-office image set on the category wins.
  const homeTarget = path.resolve(here, "../public/design");
  mkdirSync(homeTarget, { recursive: true });
  const homeFiles = [
    "cover-ariha.png", // hero photo
    "clima-cut2.png",
    "chauffe-eau-b0352fa9.png",
    "ventilateur-cut.png",
    "gaines-cut.png",
    "cuivre-cut2.png",
    "telecommande-cut2.png",
    "pasted-1791236697258-0.png", // "Solutions professionnelles" tile photo
    "cuivre-56818f19.png", // "Tout pour l'installation" card
  ];
  for (const file of homeFiles) {
    const src = path.join(source, file);
    if (existsSync(src)) {
      copyFileSync(src, path.join(homeTarget, file));
      console.log(`[sync-design-assets] ${file} → public/design/${file}`);
    }
  }
}
