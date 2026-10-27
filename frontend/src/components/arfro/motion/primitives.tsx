"use client";

import { Fragment, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useGsap } from "./gsap";
import { useInView } from "./inview";

/**
 * Motion primitives of the Arfro design system: implementations. Import them from
 * `@/components/arfro/motion` (lazy, see ./index.tsx), not from this file.
 */

/** Fade/rise entrance on scroll; `stagger` makes direct children enter one after another. */
export function Reveal({
  as: Tag = "div",
  stagger = false,
  delay = 0,
  className,
  children,
}: {
  as?: ElementType;
  stagger?: boolean;
  /** Seconds, added before the entrance (and before the first staggered child). */
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useInView<HTMLElement>();
  return (
    <Tag
      ref={ref}
      className={cn("arfro-reveal", stagger && "arfro-reveal-stagger", className)}
      style={delay ? ({ "--arfro-delay": `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

/** Image frame revealed with a clip-path wipe on scroll (the image inside eases from 1.08 scale). */
export function ClipReveal({ from = "bottom", className, children }: { from?: "bottom" | "left" | "right"; className?: string; children: ReactNode }) {
  const ref = useInView<HTMLDivElement>();
  return (
    <div ref={ref} data-from={from} className={cn("arfro-clip-reveal", className)}>
      {children}
    </div>
  );
}

/** rAF scroll fallback when gsap cannot load. */
function parallaxFallback(el: HTMLElement, speed: number) {
  let frame = 0;
  const update = () => {
    frame = 0;
    const rect = el.getBoundingClientRect();
    const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
    el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  update();
  return () => {
    window.removeEventListener("scroll", onScroll);
    if (frame) cancelAnimationFrame(frame);
    el.style.transform = "";
  };
}

/**
 * Subtle vertical drift while scrolling (`speed` -1..1, e.g. 0.15; positive = the element moves
 * slower than the page). GSAP ScrollTrigger scrub; keep it to one or two elements per screen and
 * put it on a wrapper with overflow room (an image frame bigger than its mask), never on text.
 */
export function Parallax({ speed = 0.15, className, children }: { speed?: number; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(
    ref,
    ({ gsap }, el) => {
      const distance = () => ((window.innerHeight + el.offsetHeight) / 2) * speed;
      gsap.fromTo(
        el,
        { y: () => -distance() },
        {
          y: () => distance(),
          ease: "none",
          force3D: true,
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        },
      );
    },
    [speed],
    (el) => parallaxFallback(el, speed),
  );
  return (
    <div ref={ref} className={cn("arfro-parallax will-change-transform", className)}>
      {children}
    </div>
  );
}

/**
 * Headline whose words rise out of a mask. The text is in the server HTML and visible (LCP): on
 * scroll the entrance only plays when the heading is off screen at hydration. `intro` (hero only)
 * plays the mask reveal once on page load with pure CSS (no JS needed, final state = visible).
 */
export function SplitHeadline({
  text,
  as: Tag = "h2",
  id,
  className,
  intro = false,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
  /** Play the word reveal on page load (first-viewport hero headline). */
  intro?: boolean;
}) {
  const ref = useInView<HTMLHeadingElement>(!intro);
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag ref={ref} id={id} aria-label={text} className={cn("arfro-split", intro && "arfro-split-intro", className)}>
      {words.map((w, i) => (
        <Fragment key={i}>
          {/* The mask (overflow hidden) is the word; the space stays outside so lines wrap normally. */}
          <span aria-hidden className="arfro-split-word" style={{ ["--i" as string]: i }}>
            <span className="arfro-split-inner">{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}

/** « Défiler » cue at the bottom of the hero: links to the next section. */
export function ScrollIndicator({ href, label = "Défiler", onDark = true }: { href: string; label?: string; onDark?: boolean }) {
  return (
    <a
      href={href}
      className={cn(
        "arfro-scroll-cue group inline-flex items-center gap-3.5 text-[11px] font-bold tracking-[0.22em] uppercase transition-colors duration-300",
        onDark ? "text-white/85 hover:text-white" : "text-arfro-graphite/80 hover:text-arfro-graphite",
      )}
    >
      {/* Outlined circle with an arrow that drifts down (CSS, off with reduced motion). */}
      <span
        aria-hidden
        className="arfro-scroll-cue-ring relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-current/35 transition-colors duration-300 group-hover:border-current"
      >
        <svg className="arfro-scroll-cue-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" focusable="false">
          <path d="M7 1.5v10.5M2.5 7.5 7 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {label}
    </a>
  );
}
