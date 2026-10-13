"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, CloseIcon, WhatsAppIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useIsArfro } from "@/lib/site-context";
import type { SiteNavigation } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import { Logo, type SiteLogo } from "./Logo";

/** Full-screen mobile menu: range accordions, extra links, call and WhatsApp buttons (design drawer). */
export function MobileDrawer({ open, onClose, nav, logo }: { open: boolean; onClose: () => void; nav: SiteNavigation; logo: SiteLogo }) {
  const [section, setSection] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const arfro = useIsArfro();

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
  if (arfro) return <ArfroDrawer nav={nav} logo={logo} onClose={onClose} closeRef={closeRef} section={section} setSection={setSection} />;

  const extra = [
    { ...nav.promotions, tone: "promo" as const },
    ...[...(nav.drawerLinks ?? []), ...nav.rightLinks].map((l) => ({ ...l, tone: "ink" as const })),
  ];

  return (
    <nav
      aria-label="Menu mobile"
      className="fixed inset-0 z-60 flex flex-col overflow-y-auto bg-white px-4 pb-8 md:hidden"
      onClick={(e) => (e.target as HTMLElement).closest("a") && onClose()}
    >
      <div className="border-divider sticky top-0 z-2 -mx-4 mb-2 flex h-[72px] items-center justify-between border-b bg-white px-4">
        <Logo logo={logo} height={36} />
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

/**
 * arfro.com drawer (docs/deviations.md « Arfro restyle »): same content, flat white sheet up to
 * 1024px (the Arfro header switches to its mobile row below lg), bold links on hairlines, grey
 * rounded panels for the open range, plus the utility bar's links (tracking, pro area).
 */
function ArfroDrawer({
  nav,
  logo,
  onClose,
  closeRef,
  section,
  setSection,
}: {
  nav: SiteNavigation;
  logo: SiteLogo;
  onClose: () => void;
  closeRef: React.RefObject<HTMLButtonElement | null>;
  section: string | null;
  setSection: (key: string | null) => void;
}) {
  const extra = [
    { ...nav.promotions, tone: "promo" as const },
    ...[
      ...(nav.drawerLinks ?? []),
      { label: "Suivre ma commande", href: "/suivi-commande" },
      ...nav.rightLinks,
      { label: "Espace professionnel", href: "/espace-professionnel" },
    ].map((l) => ({ ...l, tone: "ink" as const })),
  ];

  return (
    <nav
      aria-label="Menu mobile"
      className="fixed inset-0 z-60 flex flex-col overflow-y-auto bg-white px-4 pb-8 lg:hidden"
      onClick={(e) => (e.target as HTMLElement).closest("a") && onClose()}
    >
      <div className="border-border sticky top-0 z-2 -mx-4 mb-2 flex h-16 items-center justify-between border-b bg-white pr-2 pl-4">
        <Logo logo={logo} height={28} />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer le menu"
          className="text-ink hover:bg-bg flex size-11 items-center justify-center rounded-full"
        >
          <CloseIcon size={22} strokeWidth={2} />
        </button>
      </div>

      {nav.ranges.map((r) => {
        const isOpen = section === r.key;
        const subs = r.mega?.subs ?? [];
        return (
          <div key={r.key} className="border-border border-b">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setSection(isOpen ? null : r.key)}
              className="text-ink flex min-h-14 w-full items-center justify-between text-[17px] font-extrabold"
            >
              {r.label}
              <ChevronDownIcon size={16} strokeWidth={2} className={cn("transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div className="bg-bg mb-3 flex flex-col rounded-[20px] px-4 py-2">
                {subs.map((s) => (
                  <Link key={s.href} href={s.href} className="text-ink-2 flex min-h-11 items-center text-base font-semibold">
                    {s.label}
                  </Link>
                ))}
                <Link href={r.href} className="text-ink flex min-h-11 items-center text-base font-extrabold underline underline-offset-4">
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
          className={cn("border-border flex min-h-14 items-center border-b text-[17px] font-extrabold", l.tone === "promo" ? "text-promo" : "text-ink")}
        >
          {l.label}
        </Link>
      ))}

      <a
        href={nav.salesPhone.href}
        className="bg-accent hover:bg-accent-hover mt-6 flex min-h-[52px] items-center justify-center rounded-full text-base font-bold text-white hover:text-white"
      >
        Appeler le {nav.salesPhone.display}
      </a>
      <a
        href={waLink(undefined, nav.whatsapp.number)}
        target="_blank"
        rel="noopener"
        className="border-ink text-ink hover:text-ink mt-2.5 flex min-h-[52px] items-center justify-center gap-2 rounded-full border-[1.5px] text-base font-bold"
      >
        <WhatsAppIcon size={20} className="text-whatsapp" />
        WhatsApp
      </a>
    </nav>
  );
}
