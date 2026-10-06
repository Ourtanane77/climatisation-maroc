"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

const arrow = "border-ink hover:bg-ink size-12 cursor-pointer rounded-full border-[1.5px] bg-white text-lg transition-colors hover:text-white";

/**
 * Horizontal snap rail of the home sections, with optional ←/→ buttons that scroll by one view
 * (design `rail(d)`: clientWidth + gap). The section heading and links are passed in.
 */
export function RailSection({
  id,
  title,
  headingId,
  actions,
  arrows = false,
  align = "baseline",
  children,
  className,
}: {
  id: string;
  title: string;
  headingId: string;
  actions?: React.ReactNode;
  arrows?: boolean;
  align?: "baseline" | "center" | "end";
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * (el.clientWidth + 16), behavior: "smooth" });
  };

  return (
    <section id={id} aria-labelledby={headingId} className={cn("pt-10 md:pt-14", className)}>
      <div
        className={cn(
          "mb-8 flex flex-wrap justify-between gap-4",
          align === "baseline" ? "items-baseline" : align === "center" ? "items-center gap-x-6" : "items-end gap-5",
        )}
      >
        <h2 id={headingId} className="m-0 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] md:text-[44px]">
          {title}
        </h2>
        {(actions || arrows) && (
          <div className="flex max-w-full items-center gap-4">
            {actions}
            {arrows && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => scroll(-1)} aria-label="Précédent" className={arrow}>
                  ←
                </button>
                <button type="button" onClick={() => scroll(1)} aria-label="Suivant" className={arrow}>
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div
        ref={ref}
        className="-my-2 -mb-4 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto scroll-smooth pt-2 pb-4 max-xl:[mask-image:linear-gradient(to_right,#000_90%,transparent)]"
      >
        {children}
      </div>
    </section>
  );
}
