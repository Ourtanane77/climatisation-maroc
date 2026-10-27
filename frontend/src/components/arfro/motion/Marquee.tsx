import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Endless horizontal track (partner logos, short facts). The children are rendered twice: the
 * second copy is aria-hidden and inert (never read, never focusable) and the track slides by one
 * copy. Pauses on hover and keyboard focus. Reduced motion: no movement, the copy is dropped and
 * the items wrap centred. Pure CSS (« Arfro design system » block in globals.css).
 */
export function Marquee({
  children,
  as = "div",
  duration = 40,
  gap = "3rem",
  reverse = false,
  label,
  className,
  groupClassName,
}: {
  /** The items. With `as="ul"`, pass <li> elements. */
  children: ReactNode;
  as?: "div" | "ul";
  /** Seconds for one full loop (one copy width). Slower is calmer: 30–60 s. */
  duration?: number;
  /** CSS length between items (and between the two copies). */
  gap?: string;
  /** Slide left-to-right. */
  reverse?: boolean;
  /** Accessible name of the list (e.g. « Marques partenaires »). */
  label?: string;
  className?: string;
  groupClassName?: string;
}) {
  const Group = as;
  return (
    <div
      className={cn("arfro-marquee", className)}
      data-reverse={reverse ? "true" : undefined}
      style={{ "--arfro-marquee-duration": `${duration}s`, "--arfro-marquee-gap": gap } as CSSProperties}
    >
      <div className="arfro-marquee-track">
        <Group className={cn("arfro-marquee-group", groupClassName)} aria-label={label}>
          {children}
        </Group>
        <Group className={cn("arfro-marquee-group arfro-marquee-copy", groupClassName)} aria-hidden="true" inert>
          {children}
        </Group>
      </div>
    </div>
  );
}
