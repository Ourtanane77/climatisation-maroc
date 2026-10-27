import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { ServiceIcon } from "@/lib/home/arfro";

/**
 * Line icons of the Arfro home sections 05–13: one 24 px grid, 1.5 stroke, round caps, no fill,
 * so they read as a family next to the airflow motif. Decorative (aria-hidden): the title beside
 * the icon carries the meaning.
 */

function Svg({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-6 shrink-0", className)}
    >
      {children}
    </svg>
  );
}

const SERVICE_PATHS: Record<ServiceIcon, ReactNode> = {
  // Wall unit with its airflow.
  installation: (
    <>
      <rect x="3" y="4.5" width="18" height="7" rx="1.5" />
      <path d="M6.5 9h11" />
      <path d="M7 15c1 1.2 1 2.8 0 4M12 15c1 1.2 1 2.8 0 4M17 15c1 1.2 1 2.8 0 4" />
    </>
  ),
  // Tape measure over a floor plan.
  visit: (
    <>
      <path d="M3.5 20.5V6.5h7v4h10v10z" />
      <path d="M7 20.5v-2M10.5 20.5v-3M14 20.5v-2M17.5 20.5v-3" />
    </>
  ),
  // Speech bubble.
  advice: (
    <>
      <path d="M4 5.5h16v10H10l-4.5 3.5v-3.5H4z" />
      <path d="M8 10.5h8M8 13h5" />
    </>
  ),
  // Document with lines.
  quote: (
    <>
      <path d="M6 3.5h8.5L18.5 7.5v13H6z" />
      <path d="M14.5 3.5v4h4M9 12h6.5M9 15h6.5M9 18h4" />
    </>
  ),
  // Delivery van.
  delivery: (
    <>
      <path d="M2.5 6.5h11v10h-11zM13.5 9.5h4l3.5 3.5v3.5h-7.5" />
      <circle cx="6.5" cy="17.5" r="1.75" />
      <circle cx="17" cy="17.5" r="1.75" />
    </>
  ),
  // Banknote.
  payment: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="1.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9.5v5M18 9.5v5" />
    </>
  ),
  // Headset.
  support: (
    <>
      <path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2" />
      <rect x="3.5" y="13" width="3.5" height="5.5" rx="1.25" />
      <rect x="17" y="13" width="3.5" height="5.5" rx="1.25" />
      <path d="M18.75 18.5c0 1.5-1.5 2.5-4.5 2.5H12" />
    </>
  ),
};

/** Icon of a service / trust item; a neutral airflow mark when the item has none. */
export function ServiceGlyph({ icon, className }: { icon: ServiceIcon | null; className?: string }) {
  return <Svg className={className}>{icon ? SERVICE_PATHS[icon] : <path d="M3 9c3-2 6 2 9 0s6-2 9 0M3 15c3-2 6 2 9 0s6-2 9 0" />}</Svg>;
}

/** Thin arrow for « Découvrir », « Voir toute la collection »… */
export function ArrowGlyph({ className }: { className?: string }) {
  return (
    <Svg className={cn("size-[18px]", className)}>
      <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />
    </Svg>
  );
}

/** Large opening quote of the testimonials. */
export function QuoteGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 48 36" fill="currentColor" className={cn("h-9 w-12 shrink-0", className)}>
      <path d="M0 36V21.6C0 9.9 6.2 2.7 18.6 0l2.2 4.4C14 6.3 10.6 10.2 10.4 16H20v20zm27 0V21.6C27 9.9 33.2 2.7 45.6 0l2.2 4.4C41 6.3 37.6 10.2 37.4 16H47v20z" />
    </svg>
  );
}
