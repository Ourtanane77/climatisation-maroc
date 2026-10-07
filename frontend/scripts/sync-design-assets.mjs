// Copies site-chrome images from the design reference into public/brand/ (run before dev and build).
// Catalogue and content images are not handled here: they are seeded into Laravel storage.
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
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

// sharp ships with Next.js (optional dependency); without it the PNG originals are used as they are.
let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.log("[sync-design-assets] sharp unavailable: no WebP renditions, PNG originals served");
}

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

  // Design photos, copied to public/design/ under the name the design uses, plus WebP renditions
  // (<name>-<width>.webp) and public/design/manifest.json (sizes, renditions) read by
  // src/lib/design-assets.ts. Each entry lists the accepted source files in design/uploads, first
  // found wins (e.g. the owner's clima.png stands in for clima-cut2.png), and the rendition widths.
  // Pages use a photo only when present; a back-office image wins.
  const designTarget = path.resolve(here, "../public/design");
  mkdirSync(designTarget, { recursive: true });
  const designPhotos = [
    [["cover-ariha.png"], [640, 1280, 1920]], // hero photo (full bleed)
    [
      ["clima-cut2.png", "clima.png"],
      [480, 960, 1440],
    ], // large bento tile, LG brand and service heroes
    [["chauffe-eau-b0352fa9.png"], [320, 480, 960]],
    [["ventilateur-cut.png"], [320, 480, 960]],
    [["gaines-cut.png"], [320, 480, 960]],
    [["cuivre-cut2.png"], [320, 480, 960]],
    [["telecommande-cut2.png"], [240, 480]],
    [["solutions-category.png"], [320, 480, 640, 1280]], // hotel lobby: "Solutions professionnelles" tile, sector image band
    [["cuivre-56818f19.png"], [480, 960]], // "Tout pour l'installation" card
    // Climatisation page type tiles (owner's photos in design/uploads/clim-cat/).
    [
      ["cat-clima-mural.png", "clim-cat/cat-clima-mural.png"],
      [400, 800],
    ],
    [
      ["cat-clima-gainable.png", "clim-cat/cat-clima-gainable.png"],
      [400, 800],
    ],
    [
      ["cat-clima-cassette.png", "clim-cat/cat-clima-cassette.png"],
      [400, 800],
    ],
    [
      ["cat-clima-armoire.png", "clim-cat/cat-clima-armoire.png"],
      [400, 800],
    ],
    // Chauffe-eau page type tiles (owner's photos in design/uploads/chauffe-eau-cat/).
    [
      ["cat-chauffe-eau-elect.png", "chauffe-eau-cat/cat-chauffe-eau-elect.png"],
      [400, 800],
    ],
    [
      ["cat-chauffe-eau-gaz.png", "chauffe-eau-cat/cat-chauffe-eau-gaz.png"],
      [400, 800],
    ],
    [
      ["cat-chauffe-eau-solaire.png", "chauffe-eau-cat/cat-chauffe-eau-solaire.png"],
      [400, 800],
    ],
    [
      ["cat-chauffe-eau-chaudiere.png", "chauffe-eau-cat/cat-chauffe-eau-chaudiere.png"],
      [400, 800],
    ],
    // Ventilation page type tiles (owner's photos in design/uploads/ventilateurs-cat/).
    [
      ["cat-ventilateur-gain.png", "ventilateurs-cat/cat-ventilateur-gain.png"],
      [400, 800],
    ],
    [
      ["cat-ventilateur-multizone.png", "ventilateurs-cat/cat-ventilateur-multizone.png"],
      [400, 800],
    ],
    [
      ["cat-grilles-diffuseurs.png", "ventilateurs-cat/cat-grilles-diffuseurs.png"],
      [400, 800],
    ],
    // Gaines page type tiles (owner's photos in design/uploads/gaines-cat/; published without the accent).
    [
      ["cat-flexibles-souples.png", "gaines-cat/cat-flexibles-souples.png"],
      [400, 800],
    ],
    [
      ["cat-flexibles-isoles.png", "gaines-cat/cat-flexibles-isolés.png", "gaines-cat/cat-flexibles-isoles.png"],
      [400, 800],
    ],
    [
      ["cat-gaines-circulaires.png", "gaines-cat/cat-gaines-circulaires.png", "gaines-cat/cat-gaine-circulaires.webp"],
      [400, 800],
    ],
  ];
  const manifest = {};
  for (const [[name, ...alternatives], widths] of designPhotos) {
    const found = [name, ...alternatives].find((file) => existsSync(path.join(source, file)));
    const dest = path.join(designTarget, name);
    const base = name.replace(/\.(png|webp|jpe?g)$/i, "");
    const stale = () => readdirSync(designTarget).filter((f) => f.startsWith(`${base}-`) && f.endsWith(".webp"));
    if (!found) {
      // Removed from design/uploads: drop the stale copies.
      if (existsSync(dest)) rmSync(dest);
      stale().forEach((f) => rmSync(path.join(designTarget, f)));
      continue;
    }
    const src = path.join(source, found);
    copyFileSync(src, dest);
    const entry = { src: `/design/${name}`, renditions: [] };
    if (sharp) {
      // Category tile photos (cat-*) have wide transparent margins: crop them so the object fills
      // the tile. The PNG copy stays untouched.
      const input = name.startsWith("cat-") ? await sharp(src).trim().png().toBuffer() : src;
      const meta = await sharp(input).metadata();
      Object.assign(entry, { width: meta.width, height: meta.height });
      const usable = widths.filter((w) => w < meta.width);
      if (usable.length < widths.length) usable.push(meta.width); // largest = original size, never upscaled
      const keep = new Set();
      for (const w of usable) {
        const file = `${base}-${w}.webp`;
        const out = path.join(designTarget, file);
        keep.add(file);
        if (!existsSync(out) || statSync(out).mtimeMs < statSync(src).mtimeMs) {
          await sharp(input).resize({ width: w }).webp({ quality: 72, alphaQuality: 80, effort: 6 }).toFile(out);
        }
        entry.renditions.push({ width: w, src: `/design/${file}` });
      }
      stale()
        .filter((f) => !keep.has(f))
        .forEach((f) => rmSync(path.join(designTarget, f)));
    }
    manifest[name] = entry;
    console.log(`[sync-design-assets] ${found} → public/design/${name} (${entry.renditions.length} WebP)`);
  }
  writeFileSync(path.join(designTarget, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}
