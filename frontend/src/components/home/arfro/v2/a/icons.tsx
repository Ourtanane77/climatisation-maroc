import type { TechnologyIcon } from "@/lib/home/arfro";
import { cn } from "@/lib/cn";

/**
 * Line icons of the Arfro home sections 01–04: 24 px grid, 1.5 stroke, round caps, currentColor.
 * Decorative (aria-hidden): the visible title always names the item.
 */

function Svg({ className, children }: { className?: string; children: React.ReactNode }) {
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
      className={cn("block shrink-0", className)}
    >
      {children}
    </svg>
  );
}

export function ArrowIcon({ className, direction = "right" }: { className?: string; direction?: "right" | "left" }) {
  return (
    <Svg className={cn("size-[18px]", direction === "left" && "-scale-x-100", className)}>
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </Svg>
  );
}

const TECH: Record<TechnologyIcon, React.ReactNode> = {
  // Compressor speed following the need: a wave settling into a steady line.
  inverter: (
    <>
      <path d="M2.5 12c1.6-5 3.2-5 4.8 0s3.2 5 4.8 0c1-3 2-3.6 3-2.4" />
      <path d="M15.5 12h6" />
      <path d="M2.5 19.5h19" opacity={0.45} />
    </>
  ),
  energy: (
    <>
      <path d="M13 2.5 5.5 13.5H12L11 21.5l7.5-11H12l1-8z" />
    </>
  ),
  regulation: (
    <>
      <path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0z" />
      <path d="M12 9v7" />
      <path d="M17.5 6h3M17.5 10h2" />
    </>
  ),
  quiet: (
    <>
      <path d="M3.5 9.5h3l4-3.5v12l-4-3.5h-3z" />
      <path d="M15 10.5c.7.8.7 2.2 0 3" />
      <path d="M17.5 8.5c1.8 2 1.8 5 0 7" opacity={0.45} />
    </>
  ),
  filtration: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M4 9.5h16M4 14.5h16M9.5 4v16M14.5 4v16" opacity={0.6} />
    </>
  ),
  connected: (
    <>
      <path d="M2.5 9a13.5 13.5 0 0 1 19 0" />
      <path d="M5.8 12.4a8.8 8.8 0 0 1 12.4 0" />
      <path d="M9.1 15.8a4.1 4.1 0 0 1 5.8 0" />
      <path d="M12 19.5h.01" strokeWidth={2.4} />
    </>
  ),
  refrigerant: (
    <>
      <path d="M12 2.5s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z" />
      <path d="M12 11v6M9.4 12.5l5.2 3M14.6 12.5l-5.2 3" opacity={0.7} />
    </>
  ),
  climate: (
    <>
      <circle cx="9" cy="10" r="3.5" />
      <path d="M9 2.5v1.5M9 16v1.5M1.5 10H3M3.7 4.7l1 1M3.7 15.3l1-1M13.3 4.7l-1 1" />
      <path d="M17.5 13.5V8a1.5 1.5 0 0 1 3 0v5.5a2.8 2.8 0 1 1-3 0z" />
    </>
  ),
};

export function TechIcon({ icon, className }: { icon: TechnologyIcon | null; className?: string }) {
  return (
    <Svg className={cn("size-6", className)}>
      {icon ? (
        TECH[icon]
      ) : (
        // Generic airflow mark when the back office gives no icon.
        <>
          <path d="M3 9c3-2 6 2 9 0s6-2 9 0" />
          <path d="M3 15c3-2 6 2 9 0s6-2 9 0" opacity={0.55} />
        </>
      )}
    </Svg>
  );
}
