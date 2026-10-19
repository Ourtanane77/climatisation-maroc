"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/icons";
import { waLink } from "@/lib/whatsapp";

/** Gap kept between the button and a bottom bar, in px. */
const GAP = 12;

/**
 * Height taken at the bottom of the viewport by the fixed bars shown at the moment (product add-to-cart
 * bar, quote bar, listing bar, compare bar, pro quick order): each carries `data-bottom-bar`. A bar
 * hidden at this width (display: none) or not rendered counts for nothing.
 */
export function bottomBarsHeight(doc: Document = document): number {
  let height = 0;
  doc.querySelectorAll<HTMLElement>("[data-bottom-bar]").forEach((el) => {
    if (el.getClientRects().length === 0) return;
    const bottom = parseFloat(getComputedStyle(el).bottom) || 0;
    height = Math.max(height, el.offsetHeight + bottom);
  });
  return height;
}

/**
 * Floating WhatsApp button, bottom right of every storefront page (Réglages « Contact », owner's request
 * of 2026-10-19). Not on the checkout (its own layout). Lifted above the fixed bottom bars so nothing
 * overlaps; below the drawers, dialogs (z-60/70) and the toast (z-40), above the bars (z-30/35).
 * Nothing without a number (Arfro until the owner fills the field).
 */
export function FloatingWhatsApp({ number }: { number?: string | null }) {
  return number ? <FloatingWhatsAppButton number={number} /> : null;
}

function FloatingWhatsAppButton({ number }: { number: string }) {
  const [lift, setLift] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setLift(bottomBarsHeight()));
    };
    measure();
    // Bars mount and unmount with scroll or state (sticky add-to-cart bar, compare bar…).
    const observer = new MutationObserver(measure);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <a
      href={waLink(undefined, number)}
      target="_blank"
      rel="noopener"
      aria-label="Nous écrire sur WhatsApp"
      title="Nous écrire sur WhatsApp"
      style={lift > 0 ? { bottom: `${lift + GAP}px` } : undefined}
      className="bg-whatsapp fixed right-[calc(16px+env(safe-area-inset-right))] bottom-[calc(16px+env(safe-area-inset-bottom))] z-36 flex size-14 items-center justify-center rounded-full text-white shadow-[0_12px_28px_-10px_rgba(14,40,70,0.55)] transition-[bottom,transform,filter] duration-200 hover:scale-105 hover:text-white hover:brightness-95 focus-visible:outline-offset-4 md:right-[calc(24px+env(safe-area-inset-right))] md:bottom-[calc(24px+env(safe-area-inset-bottom))] print:hidden"
    >
      <WhatsAppIcon size={30} />
    </a>
  );
}
