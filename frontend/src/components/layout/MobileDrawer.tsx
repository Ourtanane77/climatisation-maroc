"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { SiteNavigation } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";

/** Full-screen mobile menu: range accordions, extra links, call and WhatsApp buttons (design drawer). */
export function MobileDrawer({ open, onClose, nav, logoSrc }: { open: boolean; onClose: () => void; nav: SiteNavigation; logoSrc: string | null }) {
  const [section, setSection] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const extra = [{ ...nav.promotions, tone: "promo" as const }, ...nav.rightLinks.map((l) => ({ ...l, tone: "ink" as const }))];

  return (
    <nav
      aria-label="Menu mobile"
      className="fixed inset-0 z-60 flex flex-col overflow-y-auto bg-white px-4 pb-8 md:hidden"
      onClick={(e) => (e.target as HTMLElement).closest("a") && onClose()}
    >
      <div className="border-divider sticky top-0 z-2 -mx-4 mb-2 flex h-[72px] items-center justify-between border-b bg-white px-4">
        <Logo src={logoSrc} height={36} />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer le menu"
          className="bg-bg flex size-11 items-center justify-center rounded-full"
        >
          <CloseIcon />
        </button>
      </div>

      {nav.ranges.map((r) => {
        const isOpen = section === r.key;
        const subs = r.mega?.subs ?? [];
        return (
          <div key={r.key} className="border-divider border-b">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setSection(isOpen ? null : r.key)}
              className="flex min-h-14 w-full items-center justify-between px-1 text-[17px] font-bold"
            >
              {r.label}
              <ChevronDownIcon size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div className="flex flex-col px-1 pb-3">
                {subs.map((s) => (
                  <Link key={s.href} href={s.href} className="text-ink-2 flex min-h-11 items-center text-base">
                    {s.label}
                  </Link>
                ))}
                <Link href={r.href} className="flex min-h-11 items-center text-base font-bold">
                  Voir toute la gamme
                </Link>
              </div>
            )}
          </div>
        );
      })}

      {extra.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn("border-divider flex min-h-14 items-center border-b px-1 text-[17px] font-bold", l.tone === "promo" ? "text-promo" : "text-ink")}
        >
          {l.label}
        </Link>
      ))}

      <a
        href={nav.salesPhone.href}
        className="border-ink text-ink mt-5 flex min-h-[52px] items-center justify-center rounded-full border-[1.5px] text-base font-bold"
      >
        Appeler le {nav.salesPhone.display}
      </a>
      <a
        href={waLink(undefined, nav.whatsapp.number)}
        target="_blank"
        rel="noopener"
        className="bg-whatsapp mt-2.5 flex min-h-[52px] items-center justify-center rounded-full text-base font-bold text-white hover:text-white"
      >
        WhatsApp
      </a>
    </nav>
  );
}
