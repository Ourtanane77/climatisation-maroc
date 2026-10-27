# Design sources

Source files the site is built from. Nothing here is served as is: the site uses copies
generated from them under `frontend/public/`.

The original HTML design pages (Claude Design export of 2026-10-06, 30 pages and 2 boards)
were removed on 2026-10-12 once the site was built. Their layout values, states and data are
recorded in `docs/design-inventory/`, and code comments still name the page each screen comes
from (e.g. `design/Accueil.dc.html`). Git history keeps the files.

## `logos/`

The owner's logo files, one folder per storefront (file names do not matter):

| Folder | Files | Used as |
|---|---|---|
| `arfro/` | colour, white and black logos; colour, white and black icons | arfro.com |
| `climatisation-maroc/` | « Ariha Froid » logo in colour, white and black (no icon) | climatisationmaroc.com |

The site serves trimmed, resized copies from `frontend/public/brand/<site>/`: `logo.png`
(header), `logo-white.png` (footer, on the brand blue), `icon.png` (512 px), `apple-icon.png`
(180 px) and `favicon-32.png`. Climatisation Maroc's icons are the round « AF » mark cut from its
logo. They are wired in `frontend/src/lib/site.ts`. After replacing a logo, regenerate the copies
at the same sizes (logos 180 px high, transparent margins trimmed). Arfro also has `logo-76.png` and `logo-white-76.png`
(76 px high, palette PNG, made from the 180 px files with sharp) for the on-screen header, drawer
and footer logos; regenerate them too.

## `uploads/`

The owner's photos (home hero, range and category tiles, brand cut-outs). `npm run sync-assets`
(in `frontend/`) turns them into the WebP renditions and `public/design/manifest.json` that the
site serves; the output is committed, so production never needs this folder. Run it after adding
or replacing a photo here.
