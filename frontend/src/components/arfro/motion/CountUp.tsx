"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { prefersReducedMotion } from "./gsap";

/**
 * A real, verified number that counts up once when it scrolls into view (never invent figures:
 * docs/arfro-creative-brief.md). The server HTML holds the final value; the width is reserved
 * with an invisible copy (no layout shift) and screen readers only ever get the final value.
 * On screen at hydration or reduced motion: shown as is.
 */
export function CountUp({
  value,
  from = 0,
  duration = 1.6,
  decimals = 0,
  prefix = "",
  suffix = "",
  grouping = true,
  className,
}: {
  value: number;
  /** Starting value (e.g. 2008 → from 1990 for a year). */
  from?: number;
  /** Seconds. */
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** fr-FR digit grouping (5 700); false for years. */
  grouping?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) =>
    new Intl.NumberFormat("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouping }).format(n);
  const final = `${prefix}${format(value)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    // Write into React's own text node (never replace it), so later renders stay in sync.
    const node = el.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const show = (n: number) => {
      node.nodeValue = `${prefix}${format(n)}${suffix}`;
    };
    show(from);
    let frame = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / (duration * 1000));
          const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart, close to --ease-arfro
          show(from + (value - from) * eased);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
      node.nodeValue = final;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- format derives from these props
  }, [value, from, duration, decimals, prefix, suffix, grouping]);

  return (
    <span className={cn("arfro-countup inline-grid tabular-nums", className)}>
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {final}
      </span>
      <span ref={ref} aria-hidden className="col-start-1 row-start-1">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
