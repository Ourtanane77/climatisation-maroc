"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AirflowLines } from "@/components/arfro/AirflowLines";
import { CloseIcon, WhatsAppIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { Link as NavLink, SiteNavigation } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import type { SiteLogo } from "../Logo";
import { ArrowRightIcon, PhoneIcon, PlusIcon } from "./icons";
import { type ArfroMenu, PRO_HREF, utilityLinks } from "./nav";

/**
 * arfro.com mobile menu (<1024px): full-screen dialog. One accordion per main entry (ranges with
 * their categories, « Accessoires » with one level per range), then the utility links, the
 * Particuliers / Professionnels spaces and the call / WhatsApp buttons. 56px rows, safe areas,
 * focus kept inside (Tab loops), Escape closes and focus goes back to the menu button.
 */
export function ArfroDrawer({
  open,
  onClose,
  menus,
  nav,
  logo,
}: {
  open: boolean;
  onClose: () => void;
  menus: ArfroMenu[];
  nav: SiteNavigation;
  logo: SiteLogo;
}) {
  const [section, setSection] = useState<string | null>(null);
  const [sub, setSub] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")].filter((el) => !el.closest("[hidden]"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const row = "flex min-h-14 w-full items-center justify-between gap-4 text-left";
  const extra: NavLink[] = [nav.promotions, ...utilityLinks(nav)];

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="font-arfro text-arfro-graphite fixed inset-0 z-60 flex flex-col overflow-y-auto overscroll-contain bg-white lg:hidden"
      onClick={(e) => (e.target as HTMLElement).closest("a") && onClose()}
    >
      <div className="border-arfro-line sticky top-0 z-2 box-content flex h-16 shrink-0 items-center justify-between border-b bg-white pt-[env(safe-area-inset-top)] pr-[max(8px,env(safe-area-inset-right))] pl-[max(16px,env(safe-area-inset-left))]">
        {/* eslint-disable-next-line @next/next/no-img-element -- small PNG logo */}
        <img src={logo.small?.src ?? logo.src} alt={logo.alt} width={Math.round((28 * logo.width) / logo.height)} height={28} className="block h-7 w-auto" />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer le menu"
          className="hover:bg-arfro-ice flex size-12 items-center justify-center rounded-full"
        >
          <CloseIcon size={22} strokeWidth={1.8} />
        </button>
      </div>

      <nav aria-label="Menu mobile" className="flex flex-1 flex-col px-[max(16px,env(safe-area-inset-left))] pb-[max(24px,env(safe-area-inset-bottom))]">
        <ul className="m-0 list-none p-0">
          {menus.map((m) => {
            const isOpen = section === m.key;
            const id = `arfro-drawer-${m.key}`;
            return (
              <li key={m.key} className="border-arfro-line border-b">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={id}
                  onClick={() => {
                    setSection(isOpen ? null : m.key);
                    setSub(null);
                  }}
                  className={cn(row, "text-[19px] font-bold tracking-[-0.01em]")}
                >
                  {m.label}
                  <PlusIcon className={cn("text-arfro-blue shrink-0 transition-transform duration-300 motion-reduce:transition-none", isOpen && "rotate-45")} />
                </button>
                <div id={id} hidden={!isOpen} className="pb-4">
                  {m.kind === "range" && m.groups.length === 1 && (
                    <ul className="m-0 flex list-none flex-col p-0">
                      {m.groups[0].subs.map((s) => (
                        <li key={s.href}>
                          <Link href={s.href} className="text-arfro-graphite/85 flex min-h-12 items-center pl-4 text-[16px] font-medium">
                            {s.label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link href={m.href} className="text-arfro-blue flex min-h-12 items-center gap-2 pl-4 text-[16px] font-bold">
                          Voir toute la gamme
                          <ArrowRightIcon />
                        </Link>
                      </li>
                    </ul>
                  )}
                  {m.kind === "range" && m.groups.length > 1 && (
                    <ul className="m-0 flex list-none flex-col p-0">
                      {m.groups.map((g) => {
                        const subOpen = sub === g.href;
                        const subId = `${id}-${g.href.replace(/\W+/g, "-")}`;
                        return (
                          <li key={g.href} className="border-arfro-line/70 border-t first:border-t-0">
                            <button
                              type="button"
                              aria-expanded={subOpen}
                              aria-controls={subId}
                              onClick={() => setSub(subOpen ? null : g.href)}
                              className={cn(row, "min-h-12 pl-4 text-[16px] font-semibold")}
                            >
                              {g.title}
                              <PlusIcon
                                size={16}
                                className={cn("shrink-0 transition-transform duration-300 motion-reduce:transition-none", subOpen && "rotate-45")}
                              />
                            </button>
                            <ul id={subId} hidden={!subOpen} className="m-0 list-none p-0 pb-2">
                              {g.subs.map((s) => (
                                <li key={s.href}>
                                  <Link href={s.href} className="text-arfro-graphite/80 flex min-h-12 items-center pl-8 text-[15px] font-medium">
                                    {s.label}
                                  </Link>
                                </li>
                              ))}
                              <li>
                                <Link href={g.href} className="text-arfro-blue flex min-h-12 items-center gap-2 pl-8 text-[15px] font-bold">
                                  Voir tout
                                  <ArrowRightIcon size={14} />
                                </Link>
                              </li>
                            </ul>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {m.kind === "links" && (
                    <ul className="m-0 flex list-none flex-col p-0">
                      {m.links.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} className="text-arfro-graphite/85 flex min-h-12 items-center pl-4 text-[16px] font-medium">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <ul className="m-0 mt-4 grid list-none grid-cols-1 p-0">
          {extra.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={cn("flex min-h-12 items-center text-[16px] font-semibold", l.href === nav.promotions.href ? "text-promo" : "text-arfro-graphite")}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-5 grid grid-cols-2 gap-2" role="group" aria-label="Espaces">
          <Link
            href="/"
            className="rounded-arfro-sm text-arfro-graphite hover:text-arfro-blue border-arfro-line flex min-h-12 items-center justify-center border text-[15px] font-bold"
          >
            Particuliers
          </Link>
          <Link
            href={PRO_HREF}
            className="rounded-arfro-sm text-arfro-graphite hover:text-arfro-blue border-arfro-line flex min-h-12 items-center justify-center border text-[15px] font-bold"
          >
            Professionnels
          </Link>
        </div>

        <div className="rounded-arfro-md bg-arfro-navy relative mt-6 overflow-hidden p-5 text-white">
          <AirflowLines variant="dark" animate={false} className="absolute inset-x-0 bottom-0 h-20 w-full" />
          <div className="relative flex flex-col gap-2.5">
            <a
              href={nav.salesPhone.href}
              className="rounded-arfro-sm bg-arfro-blue hover:bg-arfro-blue-hover flex min-h-[52px] items-center justify-center gap-2.5 text-base font-bold text-white hover:text-white"
            >
              <PhoneIcon size={18} />
              Appeler le {nav.salesPhone.display}
            </a>
            <a
              href={waLink(undefined, nav.whatsapp.number)}
              target="_blank"
              rel="noopener"
              className="rounded-arfro-sm flex min-h-[52px] items-center justify-center gap-2.5 border border-white/40 text-base font-bold text-white hover:border-white hover:text-white"
            >
              <WhatsAppIcon size={20} />
              WhatsApp
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}
