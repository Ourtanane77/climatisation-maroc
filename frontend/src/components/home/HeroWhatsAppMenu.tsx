"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import type { WhatsAppNumber } from "@/lib/home/types";
import { formatWhatsApp, waLink } from "@/lib/whatsapp";

/**
 * Hero « WhatsApp » button with several numbers (Réglages, owner's request of 2026-10-19): the same
 * button opens a small menu, one link per number. The menu opens upwards, over the hero text, so it is
 * never clipped by the band (overflow hidden) nor hidden by the power finder, and nothing moves.
 * Escape, outside click, Tab or choosing a number closes it; arrow keys move between the numbers.
 */
export function HeroWhatsAppMenu({ numbers, className }: { numbers: WhatsAppNumber[]; className?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const focusItem = (i: number) => {
    const items = itemsRef.current.filter((el): el is HTMLAnchorElement => el !== null);
    items[(i + items.length) % items.length]?.focus();
  };

  const openAndFocus = (i: number) => {
    setOpen(true);
    // The menu is rendered on the next frame.
    requestAnimationFrame(() => focusItem(i));
  };

  const onButtonKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openAndFocus(e.key === "ArrowDown" ? 0 : -1);
    } else if (e.key === "Escape" && open) {
      setOpen(false);
    }
  };

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = itemsRef.current.filter((el): el is HTMLAnchorElement => el !== null);
    const current = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      rootRef.current?.querySelector<HTMLButtonElement>("button[aria-haspopup]")?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      focusItem(current + (e.key === "ArrowDown" ? 1 : -1));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      focusItem(e.key === "Home" ? 0 : -1);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative flex flex-col md:inline-flex">
      <Button
        variant="whatsapp"
        icon={<WhatsAppIcon size={22} />}
        className={className}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKey}
      >
        WhatsApp
      </Button>
      <div
        id={menuId}
        role="menu"
        aria-label="Choisir un numéro WhatsApp"
        hidden={!open}
        onKeyDown={onMenuKey}
        className="shadow-dropdown animate-rise absolute bottom-full left-0 z-10 mb-2 w-full min-w-[260px] rounded-[20px] bg-white p-2 text-left md:w-max"
      >
        {numbers.map((n, i) => (
          <a
            key={n.number}
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
            role="menuitem"
            href={waLink(undefined, n.number)}
            target="_blank"
            rel="noopener"
            onClick={() => setOpen(false)}
            className="text-ink hover:bg-tint-select focus-visible:bg-tint-select flex min-h-12 items-center gap-3 rounded-[14px] px-3 py-2 text-base font-bold whitespace-nowrap"
          >
            <span aria-hidden className="bg-whatsapp flex size-8 shrink-0 items-center justify-center rounded-full text-white">
              <WhatsAppIcon size={18} />
            </span>
            <span>
              {n.label && <span className="text-muted font-semibold">{`${n.label} · `}</span>}
              {formatWhatsApp(n.number)}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
