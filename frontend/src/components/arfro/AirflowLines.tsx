"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { isInViewport } from "@/components/arfro/motion/inview";
import { loadGsap, prefersReducedMotion, whenNeeded } from "@/components/arfro/motion/gsap";

/**
 * « The flow of comfort »: Arfro's airflow signature (docs/arfro-creative-brief.md,
 * docs/arfro-design-system.md). Thin flowing curves, purely decorative (aria-hidden). CONTRACT:
 * props are stable.
 *
 * With `animate` (default): lines off screen at hydration are drawn when they scroll into view (a
 * CSS transition on stroke-dashoffset, triggered by an IntersectionObserver), and a faint pulse of
 * air travels slowly along each line (CSS; paused while the block is off screen, none under 768px).
 * `scrub` (default for the large « hero » and « dark » variants) ties the drawing to the scroll
 * position with GSAP ScrollTrigger instead, loaded only once the visitor scrolls near the block
 * (`whenNeeded`); the divider, connector and footer lines never load gsap. Lines already on screen
 * at hydration (hero) are not redrawn. Reduced motion or `animate={false}`: static lines.
 */
export type AirflowVariant = "hero" | "divider" | "connector" | "dark";

const PATHS: Record<AirflowVariant, string[]> = {
  hero: [
    "M-20 260 C 220 180, 420 330, 680 230 S 1080 120, 1460 210",
    "M-20 300 C 260 230, 470 380, 720 280 S 1120 170, 1460 260",
    "M-20 340 C 300 290, 520 420, 760 330 S 1160 230, 1460 310",
  ],
  divider: ["M0 40 C 240 10, 480 70, 720 40 S 1200 10, 1440 40", "M0 52 C 260 26, 500 82, 740 52 S 1210 24, 1440 52"],
  connector: ["M10 10 C 120 60, 60 160, 180 210 S 300 300, 390 390"],
  dark: ["M-20 200 C 240 120, 460 280, 720 190 S 1120 90, 1460 170", "M-20 250 C 280 180, 500 330, 760 240 S 1160 140, 1460 220"],
};

const VIEWBOX: Record<AirflowVariant, string> = {
  hero: "0 0 1440 480",
  divider: "0 0 1440 80",
  connector: "0 0 400 400",
  dark: "0 0 1440 400",
};

/**
 * One shared IntersectionObserver for every airflow block: toggles `data-inview`, which runs the
 * pulse animation (CSS: paused otherwise). About twenty blocks on the home, one observer.
 */
let pulseObserver: IntersectionObserver | null = null;
function observePulse(svg: SVGSVGElement): () => void {
  pulseObserver ??= new IntersectionObserver((entries) => {
    for (const e of entries) {
      const el = e.target as SVGSVGElement;
      if (e.isIntersecting) el.dataset.inview = "true";
      else delete el.dataset.inview;
    }
  });
  pulseObserver.observe(svg);
  return () => {
    pulseObserver?.unobserve(svg);
    delete svg.dataset.inview;
  };
}

export function AirflowLines({
  variant = "divider",
  animate = true,
  scrub = variant === "hero" || variant === "dark",
  className,
}: {
  variant?: AirflowVariant;
  animate?: boolean;
  /** Scroll-linked drawing (GSAP, lazy). Default: hero and dark variants. */
  scrub?: boolean;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const stroke = variant === "dark" ? "var(--color-arfro-sky)" : "var(--color-arfro-electric)";

  // Pulse: runs only while the block is on screen.
  useEffect(() => {
    const svg = ref.current;
    if (!svg || !animate || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    return observePulse(svg);
  }, [animate]);

  // Drawing on entry.
  useEffect(() => {
    const svg = ref.current;
    if (!svg || !animate || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    if (isInViewport(svg)) return; // on screen at hydration: keep the drawn lines
    svg.dataset.reveal = "out"; // CSS: lines undrawn
    let cancelled = false;
    let revert: (() => void) | undefined;

    // CSS transition when the block enters (unless GSAP has taken over).
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || svg.dataset.reveal !== "out") return;
        svg.dataset.reveal = "in";
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(svg);

    const cancelWait = scrub
      ? whenNeeded(svg, () =>
          loadGsap().then(
            (lib) => {
              if (cancelled || !lib || svg.dataset.reveal !== "out") return;
              io.disconnect();
              svg.dataset.reveal = "scrub"; // CSS transition off, GSAP drives the stroke
              const paths = svg.querySelectorAll<SVGPathElement>(".arfro-airflow-line");
              const ctx = lib.gsap.context(() => {
                lib.gsap.fromTo(
                  paths,
                  { strokeDashoffset: 1 },
                  {
                    strokeDashoffset: 0,
                    ease: "none",
                    stagger: 0.12,
                    scrollTrigger: { trigger: svg, start: "top 95%", end: variant === "divider" ? "bottom 55%" : "center 45%", scrub: 0.8 },
                  },
                );
              }, svg);
              revert = () => ctx.revert();
            },
            () => {}, // network error: the IntersectionObserver draw stays in charge
          ),
        )
      : undefined;

    return () => {
      cancelled = true;
      io.disconnect();
      cancelWait?.();
      revert?.();
      delete svg.dataset.reveal;
    };
  }, [animate, scrub, variant]);

  return (
    <svg
      ref={ref}
      aria-hidden
      focusable="false"
      viewBox={VIEWBOX[variant]}
      preserveAspectRatio="none"
      data-animate={animate ? "true" : undefined}
      data-variant={variant}
      className={cn("arfro-airflow pointer-events-none block", className)}
      fill="none"
    >
      {PATHS[variant].map((d, i) => (
        <path
          key={i}
          className="arfro-airflow-line"
          d={d}
          stroke={stroke}
          strokeWidth={1.25}
          strokeLinecap="round"
          opacity={0.22 + i * 0.08}
          pathLength={1}
          style={{ ["--i" as string]: i }}
        />
      ))}
      {animate
        ? PATHS[variant].map((d, i) => (
            <path
              key={`p${i}`}
              className="arfro-airflow-pulse"
              d={d}
              stroke={stroke}
              strokeWidth={1.75}
              strokeLinecap="round"
              pathLength={1}
              style={{ ["--i" as string]: i }}
            />
          ))
        : null}
    </svg>
  );
}
