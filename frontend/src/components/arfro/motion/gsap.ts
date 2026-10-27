"use client";

import { useEffect, useRef, type DependencyList, type RefObject } from "react";

/**
 * Lazy GSAP + ScrollTrigger loader for the Arfro motion primitives (docs/arfro-design-system.md).
 *
 * - gsap is only ever loaded through dynamic import() from an effect, so it is a separate chunk
 *   that the server never evaluates and Climatisation Maroc never downloads (no Arfro component
 *   mounts there).
 * - Never on the initial load (mobile: ~46 KB gz and ~2 s of script evaluation): `useGsap` waits
 *   until the visitor has scrolled and its block is within a screen of the viewport (`whenNeeded`).
 *   Only scroll-linked blocks use it (scrub, pin, parallax); a page without one never fetches gsap.
 * - The plugin is registered once; ScrollTrigger refreshes after web fonts and images settle
 *   (it already refreshes itself, debounced, on resize).
 * - Everything is a no-op with prefers-reduced-motion: callers keep the static server state.
 */

type GsapModule = typeof import("gsap");
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger");

export type GsapLib = {
  gsap: GsapModule["gsap"];
  ScrollTrigger: ScrollTriggerModule["ScrollTrigger"];
};

let loading: Promise<GsapLib> | null = null;

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

/**
 * Loads gsap + ScrollTrigger once (browser only). Resolves to null on the server or with
 * prefers-reduced-motion; rejects if the chunk fails to load (callers fall back to CSS).
 */
export function loadGsap(): Promise<GsapLib | null> {
  if (typeof window === "undefined" || prefersReducedMotion()) return Promise.resolve(null);
  loading ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
    .then(([g, st]) => {
      const gsap = g.gsap ?? g.default;
      const ScrollTrigger = st.ScrollTrigger ?? st.default;
      gsap.registerPlugin(ScrollTrigger);
      // Mobile address-bar show/hide must not re-measure every trigger (janky on Android).
      ScrollTrigger.config({ ignoreMobileResize: true });
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh).catch(() => {});
      if (document.readyState !== "complete") window.addEventListener("load", refresh, { once: true });
      return { gsap, ScrollTrigger };
    })
    .catch((error: unknown) => {
      loading = null; // allow a later retry
      throw error;
    });
  return loading;
}

let scrolled: Promise<void> | null = null;

/**
 * Resolves on the visitor's first scroll (or scroll-like input: wheel, touch, keys), immediately if
 * the page is already scrolled (restored position, anchor). Scroll-linked effects have nothing to
 * do before that, and a lab load (Lighthouse) never scrolls.
 */
export function firstScroll(): Promise<void> {
  if (typeof window === "undefined") return new Promise(() => {});
  scrolled ??= new Promise<void>((resolve) => {
    if (window.scrollY > 0) return resolve();
    const events = ["scroll", "wheel", "touchmove", "keydown"] as const;
    const done = () => {
      events.forEach((e) => window.removeEventListener(e, done));
      resolve();
    };
    events.forEach((e) => window.addEventListener(e, done, { passive: true }));
  });
  return scrolled;
}

/**
 * Calls `run` once the visitor has scrolled and `el` is within `rootMargin` of the viewport
 * (default: one screen above and below). Returns a cancel function.
 */
export function whenNeeded(el: Element, run: () => void, rootMargin = "100% 0px 100% 0px"): () => void {
  let cancelled = false;
  let io: IntersectionObserver | undefined;
  firstScroll().then(() => {
    if (cancelled) return;
    if (typeof IntersectionObserver === "undefined") return run();
    io = new IntersectionObserver(
      (entries) => {
        if (cancelled || !entries.some((e) => e.isIntersecting)) return;
        io?.disconnect();
        run();
      },
      { rootMargin },
    );
    io.observe(el);
  });
  return () => {
    cancelled = true;
    io?.disconnect();
  };
}

/** Test hook: forget the cached module promise and the first-scroll state. */
export function resetGsapForTests(): void {
  loading = null;
  scrolled = null;
}

export type GsapSetup<T extends Element> = (lib: GsapLib, el: T) => void | (() => void);

/**
 * Runs `setup` inside a gsap.context scoped to `ref` once gsap is needed (`whenNeeded`: the visitor
 * has scrolled and the block is near the viewport) and loaded; reverts everything
 * (tweens, ScrollTriggers, pin spacers, inline styles) on unmount or when `deps` change.
 * `fallback` runs instead when gsap cannot load (network error); it may return a cleanup.
 * Nothing runs with prefers-reduced-motion.
 */
export function useGsap<T extends Element>(
  ref: RefObject<T | null>,
  setup: GsapSetup<T>,
  deps: DependencyList = [],
  fallback?: (el: T) => void | (() => void),
): void {
  // Latest callbacks without re-running the effect on every render.
  const setupRef = useRef(setup);
  const fallbackRef = useRef(fallback);
  useEffect(() => {
    setupRef.current = setup;
    fallbackRef.current = fallback;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let cancelled = false;
    let revert: (() => void) | undefined;
    const cancelWait = whenNeeded(el, () =>
      loadGsap().then(
        (lib) => {
          if (cancelled || !lib) return;
          let cleanup: void | (() => void);
          const ctx = lib.gsap.context(() => {
            cleanup = setupRef.current(lib, el);
          }, el);
          revert = () => {
            if (typeof cleanup === "function") cleanup();
            ctx.revert();
          };
        },
        () => {
          if (cancelled || !fallbackRef.current) return;
          const cleanup = fallbackRef.current(el);
          if (typeof cleanup === "function") revert = cleanup;
        },
      ),
    );
    return () => {
      cancelled = true;
      cancelWait();
      revert?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are the caller's
  }, deps);
}
