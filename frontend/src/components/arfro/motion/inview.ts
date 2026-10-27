import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./gsap";

/** True when the element intersects the viewport right now. */
export function isInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

/**
 * Marks the element `data-reveal="out"` (CSS hides it) when it is off screen at hydration, then
 * `data-reveal="in"` once it enters the viewport (CSS plays the entrance). Visible elements and
 * reduced motion: untouched.
 */
export function useInView<T extends HTMLElement | SVGElement>(enabled = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    if (isInViewport(el)) return; // already visible: leave it
    el.dataset.reveal = "out";
    let done = 0;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.dataset.reveal = "in";
            io.disconnect();
            // Entrance over: drop the attribute so the transition rules stop applying (children
            // keep their own hover transitions). Longest entrance: delay + 8 staggers + 1.1 s.
            const delay = parseFloat(el.style.getPropertyValue("--arfro-delay")) || 0;
            done = window.setTimeout(() => delete el.dataset.reveal, 2400 + delay * 1000);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(done);
      delete el.dataset.reveal; // never leave it hidden
    };
  }, [enabled]);
  return ref;
}
