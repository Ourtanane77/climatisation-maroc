"use client";

import dynamic from "next/dynamic";

/**
 * Motion primitives of the Arfro design system (docs/arfro-design-system.md). CONTRACT: the props
 * below are stable (new props are optional). Rules: the server HTML is the final visible state (no
 * JS = everything visible), only transform / opacity / clip-path / stroke-dashoffset animate,
 * nothing moves with prefers-reduced-motion, the LCP element is never hidden. A block starts its
 * entrance only if it is off screen when hydrated.
 *
 * One-shot entrances (Reveal, ClipReveal, SplitHeadline) are CSS transitions triggered by an
 * IntersectionObserver: compositor-only, no library download. Scroll-linked effects (Parallax,
 * AirflowLines drawing, HorizontalScroller pinning) use GSAP + ScrollTrigger, lazy-loaded by
 * ./gsap.ts only in the browser, once the visitor scrolls near them.
 *
 * The components are exported through next/dynamic (server-rendered, no Suspense fallback): their
 * code is a separate chunk that only pages rendering them download. Server components import this
 * module from routes shared by both storefronts (home, layout); without the split, Climatisation
 * Maroc downloaded the Arfro motion code with every page (Turbopack bundles all client components a
 * route segment imports, rendered or not). Tests resolve this module to ./eager.ts (vitest.config.ts).
 */

export const Reveal = dynamic(() => import("./primitives").then((m) => m.Reveal));
export const ClipReveal = dynamic(() => import("./primitives").then((m) => m.ClipReveal));
export const Parallax = dynamic(() => import("./primitives").then((m) => m.Parallax));
export const SplitHeadline = dynamic(() => import("./primitives").then((m) => m.SplitHeadline));
export const ScrollIndicator = dynamic(() => import("./primitives").then((m) => m.ScrollIndicator));
export const Marquee = dynamic(() => import("./Marquee").then((m) => m.Marquee));
export const CountUp = dynamic(() => import("./CountUp").then((m) => m.CountUp));
export const HorizontalScroller = dynamic(() => import("./HorizontalScroller").then((m) => m.HorizontalScroller));

export { isInViewport, useInView } from "./inview";
export { firstScroll, loadGsap, prefersReducedMotion, useGsap, whenNeeded } from "./gsap";
