"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

type Fbq = (command: "track", event: "PageView") => void;

/**
 * A PageView for every client-side navigation (the loader sends the first one). Skips the first
 * render, which is the page the loader already counted.
 */
export function MetaPixelPageViews() {
  const pathname = usePathname();
  const search = useSearchParams()?.toString() ?? "";
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    if (typeof fbq === "function") fbq("track", "PageView");
  }, [pathname, search]);

  return null;
}
