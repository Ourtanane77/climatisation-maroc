"use client";

import { Children, useCallback, useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { GsapLib } from "./gsap";
import { useGsap } from "./gsap";

type Trigger = ReturnType<GsapLib["ScrollTrigger"]["create"]>;

/**
 * Horizontal panel track (environments, collections). Everywhere: a native scroll-snap track
 * (swipe on touch, focusable region, ← → keys move one panel, optional Précédent / Suivant
 * buttons). With `pin` on desktop (≥ 1280 px) and motion allowed, GSAP pins the block and the
 * vertical scroll drives the panels horizontally; keyboard focus inside a panel scrolls the page
 * to it. Each child is one panel: size panels with `itemClassName` (e.g. "w-[78vw] xl:w-[56vw]").
 */
export function HorizontalScroller({
  label,
  pin = false,
  controls = true,
  className,
  trackClassName,
  itemClassName,
  children,
}: {
  /** Accessible name of the region (e.g. « Nos environnements »). */
  label: string;
  /** Desktop pinned horizontal scroll (≥ 1280 px). Off: plain scroll-snap everywhere. */
  pin?: boolean;
  /** Show the Précédent / Suivant buttons. */
  controls?: boolean;
  className?: string;
  /** Classes of the rail (gap, padding: e.g. "gap-6 px-[var(--site-gutter)]"). */
  trackClassName?: string;
  itemClassName?: string;
  children: ReactNode;
}) {
  const pinRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Trigger | null>(null);
  const [ends, setEnds] = useState({ start: true, end: false });

  const items = () => Array.from(railRef.current?.children ?? []) as HTMLElement[];
  /** Panel position inside the rail (the rail is position: relative), without its leading padding. */
  const panelLeft = (el: HTMLElement) => el.offsetLeft - parseFloat(getComputedStyle(railRef.current ?? el).paddingLeft || "0");

  const updateEnds = useCallback((progress?: number) => {
    const vp = viewportRef.current;
    if (!vp) return;
    if (progress !== undefined) {
      setEnds((prev) => (prev.start === progress <= 0.001 && prev.end === progress >= 0.999 ? prev : { start: progress <= 0.001, end: progress >= 0.999 }));
      return;
    }
    const max = vp.scrollWidth - vp.clientWidth;
    const start = vp.scrollLeft <= 2;
    const end = vp.scrollLeft >= max - 2;
    setEnds((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  // Native mode: track the scroll position (rAF-throttled) for the button states.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    let frame = 0;
    const onScroll = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (!triggerRef.current) updateEnds();
        });
    };
    vp.addEventListener("scroll", onScroll, { passive: true });
    updateEnds();
    return () => {
      vp.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [updateEnds]);

  // Pinned mode (desktop, motion allowed).
  useGsap(
    pinRef,
    ({ gsap }, pinEl) => {
      if (!pin) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1280px)", () => {
        const vp = viewportRef.current;
        const rail = railRef.current;
        if (!vp || !rail) return;
        const distance = () => Math.max(0, rail.scrollWidth - vp.clientWidth);
        if (distance() < 8) return;
        pinEl.dataset.pinned = "true";
        vp.scrollLeft = 0;
        const tween = gsap.to(rail, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pinEl,
            pin: true,
            start: () => (pinEl.offsetHeight >= window.innerHeight ? "top top" : "center center"),
            end: () => `+=${distance()}`,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => updateEnds(self.progress),
          },
        });
        triggerRef.current = tween.scrollTrigger ?? null;
        return () => {
          triggerRef.current = null;
          delete pinEl.dataset.pinned;
          updateEnds();
        };
      });
      return () => mm.revert();
    },
    [pin],
  );

  /** Scrolls panel `index` into view (page scroll when pinned, track scroll otherwise). */
  const goTo = (index: number) => {
    const list = items();
    const vp = viewportRef.current;
    const rail = railRef.current;
    if (!vp || !rail || list.length === 0) return;
    const i = Math.max(0, Math.min(list.length - 1, index));
    const target = list[i];
    const st = triggerRef.current;
    const smooth = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (st) {
      const max = Math.max(1, rail.scrollWidth - vp.clientWidth);
      const ratio = Math.min(1, panelLeft(target) / max);
      window.scrollTo({ top: st.start + ratio * (st.end - st.start), behavior: smooth });
    } else {
      vp.scrollTo({ left: panelLeft(target), behavior: smooth });
    }
  };

  /** Index of the panel closest to the left edge. */
  const current = () => {
    const vp = viewportRef.current;
    const rail = railRef.current;
    const list = items();
    if (!vp || !rail) return 0;
    const st = triggerRef.current;
    const offset = st ? st.progress * Math.max(0, rail.scrollWidth - vp.clientWidth) : vp.scrollLeft;
    let best = 0;
    list.forEach((el, i) => {
      if (Math.abs(panelLeft(el) - offset) < Math.abs(panelLeft(list[best]) - offset)) best = i;
    });
    return best;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return; // keys inside a panel (links…) keep their behaviour
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(current() + (e.key === "ArrowRight" ? 1 : -1));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      goTo(e.key === "Home" ? 0 : items().length - 1);
    }
  };

  // Pinned: a focused panel that is off to the side is brought into view.
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (!triggerRef.current) return;
    const index = items().findIndex((el) => el.contains(e.target as Node));
    if (index >= 0) goTo(index);
  };

  return (
    <div className={cn("arfro-hscroll", className)}>
      <div ref={pinRef} className="arfro-hscroll-pin">
        <div
          ref={viewportRef}
          role="region"
          aria-roledescription="carrousel"
          aria-label={label}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          className="arfro-hscroll-viewport"
        >
          <div ref={railRef} className={cn("arfro-hscroll-rail", trackClassName)}>
            {Children.map(children, (child) =>
              child === null || child === undefined || child === false ? null : <div className={cn("arfro-hscroll-item", itemClassName)}>{child}</div>,
            )}
          </div>
        </div>
        {controls ? (
          <div className="arfro-hscroll-controls site-gutter mt-6 flex justify-end gap-3">
            <button type="button" className="arfro-hscroll-button" aria-label="Panneau précédent" disabled={ends.start} onClick={() => goTo(current() - 1)}>
              <Chevron dir="left" />
            </button>
            <button type="button" className="arfro-hscroll-button" aria-label="Panneau suivant" disabled={ends.end} onClick={() => goTo(current() + 1)}>
              <Chevron dir="right" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}
