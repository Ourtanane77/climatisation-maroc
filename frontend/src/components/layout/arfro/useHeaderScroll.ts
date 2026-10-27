"use client";

import { useEffect, useRef, useState } from "react";

export interface HeaderScrollState {
  /** Page at (or near) its top: the home header can stay transparent over the hero. */
  atTop: boolean;
  /** Scrolling down past the header: slid out of view (transform only, no layout shift). */
  hidden: boolean;
}

/** Scroll distance before the header turns solid. */
export const TOP_THRESHOLD = 16;
/** Distance below which the header never hides (it is still part of the first screen). */
export const HIDE_AFTER = 240;
/** Minimal movement that counts as a direction change (ignores trackpad jitter). */
const DELTA = 6;

/**
 * Header scroll behaviour: one passive scroll listener, read in requestAnimationFrame. The header
 * hides while the visitor scrolls down and comes back as soon as they scroll up. `locked` (a menu,
 * the search or the drawer is open) keeps it visible.
 */
export function useHeaderScroll(locked: boolean): HeaderScrollState {
  const [state, setState] = useState<HeaderScrollState>({ atTop: true, hidden: false });
  const lockedRef = useRef(locked);

  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  useEffect(() => {
    let last = Math.max(0, window.scrollY);
    let frame = 0;
    let pending = false;

    const update = () => {
      pending = false;
      const y = Math.max(0, window.scrollY);
      const delta = y - last;
      setState((s) => {
        const atTop = y < TOP_THRESHOLD;
        let hidden = s.hidden;
        if (lockedRef.current || y < HIDE_AFTER) hidden = false;
        else if (delta > DELTA) hidden = true;
        else if (delta < -DELTA) hidden = false;
        return atTop === s.atTop && hidden === s.hidden ? s : { atTop, hidden };
      });
      if (Math.abs(delta) > DELTA || y < HIDE_AFTER) last = y;
    };
    const onScroll = () => {
      if (pending) return;
      pending = true;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (pending) cancelAnimationFrame(frame);
    };
  }, []);

  return locked && state.hidden ? { ...state, hidden: false } : state;
}
