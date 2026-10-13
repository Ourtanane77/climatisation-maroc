"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export type HeaderDropdown = "scope" | "plus" | "search" | null;

/**
 * Menu state shared by both storefront headers (SiteHeader, ArfroHeader).
 * Mega menu: opened on hover/focus of a range; closed a moment after the pointer leaves the
 * header (so moving from the nav item into the panel keeps it open), on a click or tap anywhere
 * outside the header, on Escape and on navigation. Dropdowns (`[data-dd]` elements) close on a
 * click elsewhere in the header too.
 */
export function useHeaderMenus() {
  const pathname = usePathname();
  const [mega, setMega] = useState<string | null>(null);
  const [dropdown, setDropdown] = useState<HeaderDropdown>(null);
  const headerRef = useRef<HTMLElement>(null);

  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const openMega = useCallback((key: string | null) => {
    clearTimeout(closeTimer.current);
    setMega(key);
  }, []);
  const scheduleClose = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(null), 150);
  }, []);
  const cancelClose = useCallback(() => clearTimeout(closeTimer.current), []);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const closeAll = useCallback(() => {
    clearTimeout(closeTimer.current);
    setMega(null);
    setDropdown(null);
  }, []);

  useEffect(() => {
    if (!dropdown && !mega) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!headerRef.current?.contains(target)) {
        closeAll();
      } else if (dropdown && !target.closest?.("[data-dd]")) {
        setDropdown(null);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [dropdown, mega, closeAll]);

  // A new page (link in the mega menu, the drawer or anywhere else) closes every menu
  // (state adjusted during render, as React recommends, rather than in an effect).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMega(null);
    setDropdown(null);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeAll();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeAll]);

  return { pathname, mega, setMega, dropdown, setDropdown, headerRef, openMega, scheduleClose, cancelClose, closeAll };
}
