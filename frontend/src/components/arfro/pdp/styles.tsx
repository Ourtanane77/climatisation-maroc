import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Shared typography of the Arfro product and category sections. Not a client module, so server
 * components get the real class string (a constant exported from a "use client" file would be a
 * client reference on the server).
 */
export const ARFRO_PDP_H2 = "font-arfro m-0 text-[clamp(26px,2.6vw,36px)] leading-[1.1] font-extrabold tracking-[-0.025em] text-balance";

/** Two-column section layout: heading column, content column. */
export const PDP_SPLIT = "grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16";

/** Small uppercase label above a section heading. */
export function PdpEyebrow({ children, onDark }: { children: ReactNode; onDark?: boolean }) {
  return <p className={cn("m-0 mb-3 text-[12px] font-bold tracking-[0.18em] uppercase", onDark ? "text-arfro-sky" : "text-arfro-blue")}>{children}</p>;
}
