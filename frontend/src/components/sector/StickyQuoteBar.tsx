"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Sticky quote bar of the sector pages (design: Restaurants.dc.html): appears once the page is
 * scrolled past 140px, at every width. While it shows, the page gets bottom padding so the
 * footer's last line is not hidden (design: footer padding-bottom 80 / 76).
 */
export function StickyQuoteBar({ title, subtitle }: { title: string; subtitle: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 140);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.paddingBottom = shown ? (window.innerWidth < 760 ? "80px" : "76px") : "";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [shown]);

  if (!shown) return null;
  return (
    <div className="shadow-bottom-bar animate-rise fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 bg-white px-4 py-3 md:px-10">
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-base font-bold">{title}</span>
        <span className="text-ink-2 hidden text-sm md:block">{subtitle}</span>
      </span>
      <ButtonLink href="#devis" variant="orange">
        Demander un devis
      </ButtonLink>
    </div>
  );
}
