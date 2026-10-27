/**
 * The motion module without the next/dynamic split (./index.tsx): same exports, loaded eagerly.
 * Vitest resolves `@/components/arfro/motion` here (vitest.config.ts), so tests render
 * synchronously.
 */
export { ClipReveal, Parallax, Reveal, ScrollIndicator, SplitHeadline } from "./primitives";
export { Marquee } from "./Marquee";
export { CountUp } from "./CountUp";
export { HorizontalScroller } from "./HorizontalScroller";
export { isInViewport, useInView } from "./inview";
export { firstScroll, loadGsap, prefersReducedMotion, useGsap, whenNeeded } from "./gsap";
