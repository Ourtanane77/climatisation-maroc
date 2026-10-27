"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Arfro home motion (owner's request, 2026-10-27; docs/deviations.md). The server HTML is always
 * the final, visible state: after hydration, only blocks that are still below (or above) the
 * viewport are hidden, then revealed when they scroll in. Blocks already on screen (the hero, the
 * LCP element) never animate in, nothing moves for « réduire les animations », and opacity and
 * transform are the only properties touched (no layout shift). CSS: « Arfro home motion » in globals.css.
 */

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Calls `onEnter` once when `el` scrolls into view. Returns null (and never calls it) when there is
 * nothing to animate: reduced motion, no IntersectionObserver, or the element already on screen.
 * Otherwise returns the cleanup.
 */
export function onFirstEntry(el: Element, onEnter: () => void): (() => void) | null {
  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") return null;
  const r = el.getBoundingClientRect();
  if (r.top < window.innerHeight && r.bottom > 0) return null;
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      onEnter();
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  io.observe(el);
  return () => io.disconnect();
}

/** Longest reveal: 9 staggered steps of 80 ms plus the 0.8 s transition (globals.css « Arfro home motion »). */
export const REVEAL_MS = 1700;

/** data-reveal: absent (server, on screen, reduced motion) → "hidden" → "shown" → "done". */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = onFirstEntry(el, () => {
      el.dataset.reveal = "shown";
      // After the longest staggered transition, drop the reveal transitions (see globals.css).
      timer = setTimeout(() => {
        el.dataset.reveal = "done";
      }, REVEAL_MS);
    });
    if (!stop) return;
    el.dataset.reveal = "hidden";
    return () => {
      stop();
      clearTimeout(timer);
      // Never leave a block hidden (unmount, fast refresh).
      if (el.dataset.reveal === "hidden") el.dataset.reveal = "done";
    };
  }, []);
  return ref;
}

/**
 * Scroll-reveal wrapper. `group`: the wrapper itself does not move; its `.am-fade` parts and the
 * children of its `.am-stagger` lists rise one after the other.
 */
export function Reveal({ children, group = false, className }: { children: ReactNode; group?: boolean; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={cn(group ? "am-group" : "am-reveal", className)}>
      {children}
    </div>
  );
}

/** "9 000" with the separator of `sample` (fr-FR grouping, narrow or regular non-breaking space). */
export function groupDigits(n: number, sample: string): string {
  const sep = sample.match(/\D/)?.[0] ?? " ";
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

/**
 * A real figure (`text`, e.g. "9 000") counting up from 0 when it scrolls into view. Screen readers
 * get the final text only; without JavaScript, on screen or with reduced motion it is static.
 */
export function CountUp({ text, duration = 1200, className }: { text: string; duration?: number; className?: string }) {
  const target = Number.parseInt(text.replace(/\D/g, ""), 10);
  const [shown, setShown] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !Number.isFinite(target)) return;
    let frame = 0;
    const stop = onFirstEntry(el, () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - t) ** 3;
        setShown(t >= 1 ? text : groupDigits(target * eased, text));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    if (!stop) return;
    // Off screen: start from 0 (not visible yet, so nothing flashes).
    setShown(groupDigits(0, text));
    return () => {
      stop();
      cancelAnimationFrame(frame);
      setShown(text);
    };
  }, [text, target, duration]);

  return (
    <span className={className}>
      <span aria-hidden ref={ref} className="tabular-nums">
        {shown}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
