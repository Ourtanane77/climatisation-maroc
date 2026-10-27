"use client";

import { useEffect, useState } from "react";
import { bottomBarsHeight } from "./FloatingWhatsApp";

/**
 * Empty block at the very end of the footers, as tall as the fixed bottom bars shown at the moment
 * (product add-to-cart bar, quote bar, listing bar, compare bar… each carries `data-bottom-bar`), so
 * a bar never covers the last footer row (legal links, signature) once the page is scrolled to the
 * end. Nothing without a bar. It only grows the page at its bottom edge: nothing above moves.
 */
export function BottomBarSpacer() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setHeight(bottomBarsHeight()));
    };
    measure();
    // Bars mount and unmount with scroll or state.
    const observer = new MutationObserver(measure);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return height > 0 ? <div aria-hidden data-bottom-bar-spacer style={{ height }} /> : null;
}
