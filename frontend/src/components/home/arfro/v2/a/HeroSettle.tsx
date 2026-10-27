"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { reducedMotion } from "./reducedMotion";

/**
 * Gentle movement of the hero photo: after paint, a very slow push-in (scale 1 → 1.05 over 14 s),
 * played once. Starts from the server state (scale 1), so nothing jumps and the LCP image is
 * never hidden; transform only; nothing moves with « réduire les animations ».
 */
export function HeroSettle({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || typeof el.animate !== "function") return;
    const anim = el.animate([{ transform: "scale(1)" }, { transform: "scale(1.05)" }], {
      duration: 14000,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    });
    return () => anim.cancel();
  }, []);
  return (
    <div ref={ref} className={cn("origin-[70%_40%] will-change-transform", className)}>
      {children}
    </div>
  );
}
