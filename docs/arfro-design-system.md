# Arfro design system

Building blocks for the Arfro storefront (owner's brief: `docs/arfro-creative-brief.md`).
Arfro only: Climatisation Maroc never renders these components, and every CSS rule is scoped to
`[data-site="arfro"]` (`frontend/src/app/globals.css`, block « Arfro design system (2026-10-27) »).

| Module | Use from | Contents |
|---|---|---|
| `@/components/arfro/ui` | server components | everything below (re-exports `base` + `image`) |
| `@/components/arfro/ui/base` | **client components** (`"use client"`) and server | `Section`, `Eyebrow`, `DisplayHeading`, `Lead`, `ArfroButtonLink`, `ArfroButton`, `arfroButtonClasses` |
| `@/components/arfro/ui/image` | server components only | `EditorialImage`, `resolveArfroImage` (read the server-only photo manifest) |
| `@/components/arfro/motion` | anywhere (client module) | `Reveal`, `ClipReveal`, `Parallax`, `SplitHeadline`, `ScrollIndicator`, `Marquee`, `CountUp`, `HorizontalScroller`, `useInView`, `useGsap`, `loadGsap`, `whenNeeded` |
| `@/components/arfro/AirflowLines` | anywhere (client module) | `AirflowLines` |

`@/components/arfro/motion` exports its components through `next/dynamic` (server-rendered, no
loading fallback): the code is a separate chunk, downloaded only by pages that render it. Turbopack
bundles every client component a route segment imports, rendered or not, and the layout and many
routes are shared with Climatisation Maroc. Tests resolve it to its eager version
(`motion/eager.ts`, see `vitest.config.mts`). `AirflowLines` stays a plain client module (small; a
`next/dynamic` export of it made Turbopack preload a chunk it never emitted, a 404 on every page).

A client component that needs a photo receives the resolved `{ src, srcSet, width, height }`
(from `resolveArfroImage`) from its server parent.

## Tokens

Tailwind classes generated from `@theme` (globals.css):

| Token | Class examples | Use |
|---|---|---|
| Primary Blue `#105BA8` | `bg-arfro-blue`, `text-arfro-blue` | buttons, eyebrows, links on light tones (white text on it 6.8:1) |
| `#0C4A8A` | `hover:bg-arfro-blue-hover` | hover of the above |
| Deep Navy `#101C30` | `bg-arfro-navy` | dark technology sections (white text 17:1) |
| `#17263F` | `bg-arfro-navy-2` | raised surface on navy |
| Electric Blue `#1684E8` | `text-arfro-electric`, `stroke` | accents, airflow, focus ring, **large text only** (3.8:1 on white) |
| Sky `#4AA3F0` | `text-arfro-sky` | text and links on navy (6.3:1) |
| Soft Ice `#F2F7FB` | `bg-arfro-ice` | bright editorial bands |
| Warm Neutral `#F5F3EF` | `bg-arfro-warm` | lifestyle bands |
| Graphite `#252B35` | `text-arfro-graphite` | body text (14:1 on white) |
| Muted `#5B6577` | `text-arfro-muted` | secondary text on white / ice / warm (≥ 5.3:1) |
| On navy `#A9B8CC` | `text-arfro-on-navy` | secondary text on navy (8.5:1) |
| Lines | `border-arfro-line`, `border-arfro-line-dark` | hairlines on light / navy |
| Font | `font-arfro` | Manrope |
| Radii | `rounded-arfro-xs` 2px, `rounded-arfro-sm` 4px (buttons, inputs), `rounded-arfro-md` 6px (cards, frames) | keep corners tight, no pills |
| Easing | `ease-[var(--ease-arfro)]` = `cubic-bezier(0.22, 1, 0.36, 1)` | every transition |

Breakpoints are the project's, not Tailwind's defaults: `sm` 640px, `md` 760px, `lg` 1000px,
`xl` 1100px, `2xl` 1340px (`@theme` in globals.css); use `min-[1280px]:` for a 1280px step.

CSS variables (in `[data-site="arfro"]`): `--arfro-header-h` (sticky header height: 64px, 112px
from 1024px; the home hero clears the transparent header with it), `--arfro-dur-fast` 0.3s (hovers), `--arfro-dur-enter`
0.9s (reveals), `--arfro-dur-slow` 1.1s (clip reveals, headline words), `--arfro-stagger` 0.08s,
`--arfro-rise` 28px, `--arfro-focus` (electric blue).

## UI components

### `Section`

```tsx
<Section tone="navy" id="technologie" labelledBy="techno-title" bleed={false} className="" innerClassName="">
  …
</Section>
```

`tone`: `white` | `ice` | `warm` | `navy` (sets background + text colour and `data-tone`). Vertical
rhythm `py-16 md:py-24 xl:py-32`, content in the page column (`site-gutter`) unless `bleed`.
Alternate bright (white/ice), warm and a few navy sections; avoid two navy bands in a row.

### `Eyebrow`, `DisplayHeading`, `Lead`

```tsx
<Eyebrow>ARFRO — EXPERT DU CONFORT CLIMATIQUE</Eyebrow>
<DisplayHeading as="h2" size="l" id="techno-title">La technologie au service de votre bien-être.</DisplayHeading>
<Lead>Texte d'introduction…</Lead>
```

- `DisplayHeading` `size`: `xl` (hero, 40→104px), `l` (section titles, 34→72px), `m` (28→52px),
  `s` (22→32px). `as`: `h1` | `h2` | `h3`. One `h1` per page. Adds `data-size`.
- `Eyebrow` / `Lead` `onDark`: when **omitted**, they follow the Section tone automatically
  (sky / white 75 % on navy). Pass `onDark` / `onDark={false}` to force. A light card nested in a
  navy section sets its own `data-tone="white"` (or ice/warm) to switch back.
- Contrast on every tone: headings inherit the tone colour (≥ 12:1); Lead graphite 80 % ≥ 7:1 on
  light tones, white 75 % ≈ 10:1 on navy; Eyebrow blue ≥ 6:1 on white/ice/warm, sky 6.3:1 on navy.
  Never set body-size text in electric blue on light tones.

### `ArfroButtonLink`, `ArfroButton`, `arfroButtonClasses`

```tsx
<ArfroButtonLink href="/climatisation" icon={<ArrowRight />}>Découvrir nos solutions</ArfroButtonLink>
<ArfroButtonLink href="tel:+212…" variant="outline-light">Appeler</ArfroButtonLink>
<ArfroButton variant="primary" type="submit" disabled={!valid}>Voir ma solution</ArfroButton>
```

Variants and the tones they are made for:

| Variant | Light tones | Navy |
|---|---|---|
| `primary` | yes | yes |
| `outline` | yes | no |
| `outline-light` | no | yes |
| `light` | on photos / navy | yes |
| `link` (underlined text) | yes | no |
| `link-light` | no | yes |

Internal paths (`/…`, `#…`) use `next/link`; `http(s)` links open a new tab; `tel:`/`mailto:` a
plain `<a>`. A trailing `icon` nudges 3px on hover. All carry `.arfro-btn`: electric-blue
focus ring (2px, offset 3px), slight press scale. `arfroButtonClasses(variant, className)` gives
the same classes for other elements. Never render a button without a real destination/action.

### `EditorialImage`, `resolveArfroImage` (server)

```tsx
<EditorialImage image={settings.hero_image} alt="Salon marocain climatisé" sizes="100vw" priority className="aspect-[16/9]" />
```

Cover-fitted `<img>` in a relative, overflow-hidden frame (give the frame its size/aspect).
Renders **nothing** for an empty slot.

**Image slot rules.** Every photo the brief asks for is a back-office slot. An empty slot means
the section switches to its typographic/editorial layout: never a broken image, grey box or
placeholder. Only existing assets (`design/uploads`, `public/design`) or owner-approved photos; no
AI images. `priority` only for the first-viewport image (LCP); everything else lazy. Always pass
an honest French `alt` (empty `alt=""` only for purely decorative photos). Give `sizes`.

## Motion components

All are client components, safe to render from server components. The **server HTML is the final
visible state**: nothing is hidden without JavaScript, and a block that is already on screen when
the page hydrates never plays an entrance (no flash, LCP untouched).

### `Reveal`

```tsx
<Reveal as="ul" stagger delay={0.1} className="grid gap-6 md:grid-cols-3">
  <li>…</li><li>…</li><li>…</li>
</Reveal>
```

Fade + 28px rise, 0.9s. `stagger`: direct children enter 0.08s apart (up to 8 steps); the parent
itself stays put. `delay` in seconds. The `data-reveal` attribute is removed once the entrance
is over, so children keep their own hover transitions. Nested Reveals inherit the parent's
`delay` variable: avoid nesting.

### `ClipReveal`

```tsx
<ClipReveal from="left" className="relative aspect-[4/5]">
  <EditorialImage image={img} alt="…" className="absolute inset-0" />
</ClipReveal>
```

Clip-path wipe from `bottom` | `left` | `right` (1.1s) while the image inside settles from 1.08×.
For photos only; give the wrapper its size.

### `Parallax`

```tsx
<div className="relative overflow-hidden aspect-[3/2]">
  <Parallax speed={0.12} className="absolute -inset-y-[12%] inset-x-0">
    <EditorialImage … className="size-full" />
  </Parallax>
</div>
```

GSAP ScrollTrigger scrub (`y` from −d to +d while the block crosses the viewport, d = (viewport +
height) / 2 × `speed`), set up once the visitor has scrolled and the block is within a screen of the
viewport (gsap is never fetched on the initial load). Keep `speed` within 0.08–0.2, make the content taller than its mask so no
edge shows, at most one or two per screen, never on text. Falls back to a rAF scroll handler if
gsap cannot load.

### `SplitHeadline`

```tsx
<SplitHeadline as="h1" intro text="Le confort qui change tout." className="font-arfro text-[clamp(40px,7vw,104px)] font-extrabold" />
<SplitHeadline as="h2" id="manifeste-title" text="Le confort ne se résume pas à une température." />
```

Each word rises out of its own mask (1.1s, 0.08s apart). The heading's accessible name is
`aria-label={text}`; the words are aria-hidden. Without `intro`, plays on scroll (off-screen
headings only). `intro` (hero only): plays once on page load, in pure CSS from the server HTML; as
the hero headline is the LCP text, the words start visible (60 % opacity, slight rise), the whole
intro ends within 0.5s, and phones (under 768px) skip it.
`SplitHeadline` sets no typography: pass the display classes (or reuse `DisplayHeading` sizes).

### `ScrollIndicator`

```tsx
<ScrollIndicator href="#manifeste" label="Défiler" onDark />
```

Links to the next section; a light segment runs down the hairline (2.4s loop).

### `Marquee`

```tsx
<Marquee as="ul" label="Marques partenaires" duration={45} gap="4rem">
  {brands.map((b) => <li key={b.slug}><img src={b.logo} alt={b.name} /></li>)}
</Marquee>
```

Children rendered twice; the copy is `aria-hidden` and `inert` (never read, never focusable).
Pauses on hover and focus-within. `reverse` slides left-to-right. Reduced motion: static, the copy
is dropped and items wrap centred. Supply enough items to be wider than the viewport. Only for
logos or short facts, one per page.

### `CountUp`

```tsx
<CountUp value={5700} suffix=" Dhs" />  {/* only real, verified numbers */}
<CountUp value={2008} from={1990} grouping={false} />
```

Counts once when scrolled into view (1.6s). Server HTML and screen readers get the final value;
the width is reserved (no layout shift). Props: `value`, `from` (0), `duration` (s), `decimals`,
`prefix`, `suffix`, `grouping` (fr-FR `5 700`, default true), `className`. Never use it for
invented statistics.

### `HorizontalScroller`

```tsx
<HorizontalScroller label="Nos environnements" pin trackClassName="gap-6 px-[var(--site-gutter)]" itemClassName="w-[82vw] md:w-[60vw] xl:w-[46vw]">
  <EnvironmentPanel … />
  <EnvironmentPanel … />
</HorizontalScroller>
```

- Everywhere: native horizontal scroll-snap track (swipe on touch), focusable region
  (`role="region"`, `aria-label`), ← → / Home / End move one panel, Précédent / Suivant buttons
  (`controls`, default true; disabled at the ends). Each child becomes one panel
  (`.arfro-hscroll-item`); size panels with `itemClassName`.
- `pin` (default false): on desktop ≥ 1280px with motion allowed, GSAP pins the block and the
  vertical scroll drives the panels horizontally (`data-pinned="true"`); Tab into a panel scrolls
  the page to it. Below 1280px or with reduced motion: plain swipe track.
- Pinning uses `position: fixed`: no ancestor may have `transform`, `filter` or `contain` (e.g. do
  not put it inside `Parallax` or `Reveal`). Panels must not depend on hover to show content.

### `AirflowLines`

```tsx
<AirflowLines variant="hero" className="absolute inset-x-0 bottom-0 h-[40%]" />
<AirflowLines variant="divider" className="h-16 w-full" />
<AirflowLines variant="connector" className="absolute left-[45%] top-1/3 size-64" />
<AirflowLines variant="dark" />   {/* sky strokes, for navy sections */}
<AirflowLines variant="divider" animate={false} />
<AirflowLines variant="dark" scrub={false} />   {/* footer: CSS drawing, no gsap */}
```

« The flow of comfort » signature: thin curves (`aria-hidden`, `pointer-events: none`). With
`animate` (default): lines off screen at hydration are drawn when they enter (CSS transition on
stroke-dashoffset), and a faint pulse of air travels slowly along each line, only while the block
is on screen (`data-inview`, one shared IntersectionObserver) and never under 768px. `scrub`
(default for `hero` and `dark`, off for `divider` and `connector`) ties the drawing to the scroll
with GSAP ScrollTrigger instead, loaded once the visitor scrolls near the block. Use
`scrub={false}` for lines present on every page (footer) so forms and simple pages never fetch
gsap.

**Airflow guidelines.** Subtle, never a showcase: at most two animated airflow elements per screen
and one per section; behind content, never over text (`absolute` + low z-index, or in margins).
`hero` under the hero photo/text, `connector` to link a text block to an image (manifesto),
`divider` between two bands of the same tone, `dark` only on navy. Use `animate={false}` when
repeated (lists, cards). Don't recolour or thicken the strokes.

### Hooks (advanced)

- `useInView<T>(enabled?)`: ref that sets `data-reveal="out"` then `"in"` (the CSS reveal contract).
- `useGsap(ref, (lib, el) => { … }, deps, fallback?)`: runs inside `gsap.context` scoped to `ref`,
  reverted on unmount; nothing with reduced motion; `fallback(el)` if gsap fails to load.
- `useGsap` only sets up after `whenNeeded(el, run, rootMargin?)`: the visitor's first scroll
  (`firstScroll()`), then the element within `rootMargin` (default one screen) of the viewport.
- `loadGsap()`: `Promise<{ gsap, ScrollTrigger } | null>` (null on the server / reduced motion).
  Never `import "gsap"` statically anywhere: that would put it in the shared bundle (and in
  Climatisation Maroc's). Never call it on mount: go through `useGsap` / `whenNeeded`.

## CSS classes (globals.css, « Arfro design system »)

`.arfro-section`, `.arfro-eyebrow(-auto)`, `.arfro-lead(-auto)`, `.arfro-display`, `.arfro-btn`,
`.arfro-link` (hairline underline that slides out and back in), `.arfro-reveal`,
`.arfro-reveal-stagger`, `.arfro-clip-reveal[data-from]`, `.arfro-split`, `.arfro-split-intro`,
`.arfro-split-word`, `.arfro-split-inner`, `.arfro-parallax`, `.arfro-scroll-cue(-line)`,
`.arfro-airflow` (`-line`, `-pulse`, `[data-animate]`), `.arfro-marquee` (`-track`, `-group`,
`-copy`), `.arfro-hscroll` (`-pin`, `-viewport`, `-rail`, `-item`, `-button`, `[data-pinned]`).
State attribute: `data-reveal` = `out` (hidden, JS only) | `in` (entering) | `scrub` (GSAP-driven);
`.arfro-airflow[data-inview]`: pulse running.

## Motion rules

- Animate only `transform`, `opacity`, `clip-path`, `stroke-dashoffset`. No layout properties, no
  animated blur/filters/shadows on large layers, no `background-attachment: fixed`.
- Easing `--ease-arfro` everywhere (GSAP: `ease: "expo.out"` is close; `"none"` for scrub).
  Entrances 0.6–1.1s, hovers 0.3s, stagger 0.06–0.1s, total sequence under ~1.6s.
- One-shot entrances = CSS transitions via IntersectionObserver (`Reveal`, `ClipReveal`,
  `SplitHeadline`): compositor-only and no library. GSAP + ScrollTrigger only for scroll-linked
  effects (`Parallax`, airflow drawing, pinned `HorizontalScroller`).
- Don't animate everything: per section one entrance idea (reveal OR clip OR split), plus
  optional parallax on one image. Product cards, prices, forms and navigation never wait for an
  animation to be usable.
- Hover: small and purposeful (image scale ≤ 1.04, icon nudge 3px, underline). Content is never
  revealed only on hover (touch and keyboard users must see it).
- `prefers-reduced-motion: reduce`: nothing hidden, nothing moves, gsap never loads, marquee
  static, airflow drawn and still. Print: everything visible.

## Accessibility and performance

- Visible focus on every interactive element: electric-blue ring inside `.arfro-section`,
  `.arfro-hscroll`, `.arfro-btn`. Don't remove outlines.
- Decorative SVGs `aria-hidden` + `focusable="false"`; duplicated content `aria-hidden` + `inert`.
- Headings in order (one `h1`); sections `aria-labelledby` their heading (`Section labelledBy`).
- Text contrast AA on its tone (table above); electric blue only for large text, accents, focus.
- Mid-range Android: scroll work only through ScrollTrigger or rAF-throttled passive listeners;
  `will-change` only on the few elements that move; gsap is a lazy chunk fetched only after the
  first scroll, near a scroll-linked block (parallax, scrubbed airflow, pinned scroller); pages
  without one never fetch it. Endless loops (airflow pulse) pause off screen.
- LCP: the hero image uses `priority`; the hero headline is never hidden (use `intro` for its
  CSS mask reveal, or nothing).
