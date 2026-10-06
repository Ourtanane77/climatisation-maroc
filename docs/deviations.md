# Deliberate deviations from the design files

Each phase is compared with the design at 1440 and 390 px. The capture script
is `frontend/scripts/visual-compare.mjs` and its output goes to
`frontend/test-results/visual/<phase>/`. Anything that differs on purpose is
listed here.

## Phase 2: layout and shared components

| Area | Design | Built | Why |
|---|---|---|---|
| Brand icons (WhatsApp, Facebook…) | Loaded from the `cdn.simpleicons.org` CDN | Inline SVG | No third-party request, faster LCP, works offline. |
| Logo | `uploads/pasted-1791221833312-0.png` | Text wordmark until the file is added to `design/uploads/` | Image missing from the design export (see `design/README.md`). It is picked up automatically when present. |
| Mega-menu product image, range cut-outs | Photo cut-outs | `art.js` line drawings | Same reason: the images are missing. |
| Focus states | None | 3 px brand-blue `:focus-visible` ring | Accessibility requirement (keyboard navigation). |
| Mega menu, footer | Accueil's own versions differ from the Structure board's richer variants | Accueil's versions | The page files win over the boards. |
| Header search | The scope picker only changes the placeholder | Real `<form action="/recherche">`; the scope is sent as `gamme` | The search must work. |
| Text rendering | Browser default line-height | Same (`line-height: normal` overrides Tailwind's 1.5) | Not a deviation; noted because Tailwind changes it by default. |
| Footer phone rows | 30 px pitch | 32 px | Font metrics; within tolerance. |

Temporary, until later phases:

- **Home page.** A placeholder; the full design is built in phase 7.
- **Navigation data.** It comes from the design's values until
  `GET /api/v1/navigation` exists (phase 3/4).

## Phase 3: data model and back office

The back office has no design file; it uses Filament's layout with the design's colours and font.

| Area | Design | Built | Why |
|---|---|---|---|
| Footer social links | Facebook, Instagram and TikTok link to `#` | The client's real URLs (2026-10-06), editable in Réglages | Resolves the phase 2 deviation. |
| Back-office buttons | Brand blue `#0B5CAD` | Same; orange actions use `#D85A17` | `#F4731F` with white text is about 3:1, below the 4.5:1 needed for text. |
| Design-only products (cassette, cuivre, kits duo, isolant, gaz) | Shown with references and prices | Seeded as drawn, flagged « À vérifier » | Absent from `data/catalog.json`; must be confirmed before launch. |
| Legal pages, 7 sectors, 8 articles, 6 city pages | Titles only, or placeholder text | Created unpublished | No copy supplied; never invent text. |
