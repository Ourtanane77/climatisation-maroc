"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AirflowLines } from "@/components/arfro/AirflowLines";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { toast } from "@/components/ui/Toast";
import { WhatsAppIcon } from "@/components/ui/icons";
import { addToCart } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { dh } from "@/lib/format";
import type { Phone, SiteNavigation } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import { ArrowRightIcon, ChevronIcon, PhoneIcon } from "./icons";
import { type ArfroMenu, menuIsCurrent } from "./nav";

/** Hover intent: delay before a panel opens under a resting pointer, and before it closes. */
export const OPEN_DELAY = 120;
export const CLOSE_DELAY = 220;

const eyebrow = "m-0 text-[11px] font-bold tracking-[0.18em] uppercase text-arfro-muted";

/**
 * Desktop main navigation (≥1024px) with mega menus (disclosure pattern): each entry is a button
 * with aria-expanded / aria-controls; its panel opens on click, Enter, Space or ArrowDown, and on
 * hover after a short delay (never hover-only). Escape closes and returns focus to the button,
 * ArrowLeft / ArrowRight move between entries, focus or a click outside closes. Panels stay in the
 * HTML (hidden) so their links are crawlable, but until an entry is first hovered, focused or
 * opened its panel holds only a plain list of its links (CrawlLinks): the full layout (photos,
 * featured product, help blocks) mounts on first use, which keeps the DOM of every page light.
 */
export function ArfroMegaNav({ menus, nav, onOpenChange }: { menus: ArfroMenu[]; nav: SiteNavigation; onOpenChange?: (open: boolean) => void }) {
  const pathname = usePathname();
  const [open, setOpenState] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hoverOpenedAt = useRef(0);

  // Entries whose full panel has been mounted (first hover, focus or opening); it then stays mounted.
  const [primed, setPrimed] = useState<ReadonlySet<string>>(() => new Set());
  const prime = useCallback((key: string) => setPrimed((s) => (s.has(key) ? s : new Set(s).add(key))), []);
  const setOpen = useCallback(
    (key: string | null) => {
      if (key) prime(key);
      setOpenState(key);
    },
    [prime],
  );
  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  };
  useEffect(() => () => clearTimers(), []);

  // A new page closes the menu (state adjusted during render, as React recommends).
  const [path, setPath] = useState(pathname);
  if (path !== pathname) {
    setPath(pathname);
    setOpenState(null);
  }
  useEffect(() => onOpenChange?.(open !== null), [open, onOpenChange]);

  useEffect(() => {
    if (open === null) return;
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const trigger = triggers.current.get(open);
      setOpen(null);
      trigger?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  const focusPanelStart = (key: string) => {
    requestAnimationFrame(() => document.getElementById(`arfro-mega-${key}`)?.querySelector<HTMLElement>("a, button")?.focus());
  };

  const onTriggerKey = (e: React.KeyboardEvent<HTMLButtonElement>, index: number, key: string) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = menus[(index + (e.key === "ArrowRight" ? 1 : -1) + menus.length) % menus.length];
      triggers.current.get(next.key)?.focus();
      if (open !== null) setOpen(next.key);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(key);
      focusPanelStart(key);
    }
  };

  return (
    <nav
      ref={navRef}
      aria-label="Principal"
      className="hidden min-w-0 flex-1 items-center justify-center lg:flex"
      onPointerEnter={(e) => e.pointerType === "mouse" && clearTimeout(closeTimer.current)}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimeout(openTimer.current);
        clearTimeout(closeTimer.current);
        if (open !== null) closeTimer.current = setTimeout(() => setOpen(null), CLOSE_DELAY);
      }}
      onBlur={(e) => {
        // Focus moved to another element outside (Tab): close. A click outside is handled on pointerdown.
        const to = e.relatedTarget as Node | null;
        if (to && !e.currentTarget.contains(to)) setOpen(null);
      }}
    >
      <ul className="m-0 flex list-none items-center gap-0.5 p-0 xl:gap-1.5">
        {menus.map((m, i) => {
          const isOpen = open === m.key;
          const current = menuIsCurrent(m, pathname);
          return (
            <li key={m.key}>
              <button
                ref={(el) => {
                  if (el) triggers.current.set(m.key, el);
                  else triggers.current.delete(m.key);
                }}
                type="button"
                aria-expanded={isOpen}
                aria-controls={`arfro-mega-${m.key}`}
                data-current={current || undefined}
                onClick={() => {
                  clearTimers();
                  // A click right after the hover opened the panel keeps it open.
                  if (isOpen && Date.now() - hoverOpenedAt.current < 500) return;
                  setOpen(isOpen ? null : m.key);
                }}
                onFocus={() => prime(m.key)}
                onPointerEnter={(e) => {
                  if (e.pointerType !== "mouse") return;
                  prime(m.key);
                  clearTimers();
                  if (isOpen) return;
                  const show = () => {
                    hoverOpenedAt.current = Date.now();
                    setOpen(m.key);
                  };
                  if (open !== null) show();
                  else openTimer.current = setTimeout(show, OPEN_DELAY);
                }}
                onPointerLeave={(e) => e.pointerType === "mouse" && clearTimeout(openTimer.current)}
                onKeyDown={(e) => onTriggerKey(e, i, m.key)}
                className={cn(
                  "font-arfro relative flex h-11 items-center gap-1.5 px-2 text-[14px] font-semibold whitespace-nowrap text-(--hdr-fg) xl:px-3 xl:text-[15px]",
                  "after:absolute after:inset-x-2 after:bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 xl:after:inset-x-3",
                  "hover:after:scale-x-100 motion-reduce:after:transition-none",
                  (isOpen || current) && "after:scale-x-100",
                )}
              >
                {m.kind === "links" && m.shortLabel ? (
                  <>
                    <span className="min-[1280px]:hidden">{m.shortLabel}</span>
                    <span className="hidden min-[1280px]:inline">{m.label}</span>
                  </>
                ) : (
                  m.label
                )}
                <ChevronIcon size={12} className={cn("opacity-60 transition-transform duration-300 motion-reduce:transition-none", isOpen && "rotate-180")} />
              </button>
            </li>
          );
        })}
      </ul>

      {menus.map((m) => (
        <div
          key={m.key}
          id={`arfro-mega-${m.key}`}
          role="region"
          aria-label={m.label}
          hidden={open !== m.key}
          className="text-arfro-graphite border-arfro-line absolute inset-x-0 top-full max-h-[calc(100vh-var(--hdr-main)-24px)] overflow-y-auto border-t bg-white shadow-[0_24px_48px_-28px_rgb(16_28_48/0.45)]"
        >
          {primed.has(m.key) || open === m.key ? (
            <div className="site-gutter motion-safe:animate-rise grid grid-cols-12 gap-x-10 py-10 xl:gap-x-14">
              {m.kind === "range" ? <RangePanel menu={m} nav={nav} /> : <LinksPanel menu={m} nav={nav} />}
            </div>
          ) : (
            <CrawlLinks menu={m} />
          )}
        </div>
      ))}
    </nav>
  );
}

/** Every link of a panel, deduplicated (the server HTML of a panel not used yet: crawlable, light). */
export function panelLinks(menu: ArfroMenu): { href: string; label: string }[] {
  const all =
    menu.kind === "range"
      ? [
          ...menu.groups.flatMap((g) => [{ href: g.href, label: g.title }, ...g.subs]),
          ...menu.brands,
          ...(menu.guide ? [menu.guide] : []),
          ...(menu.featured ? [{ href: menu.featured.href, label: menu.featured.name }] : []),
        ]
      : menu.links;
  const seen = new Set<string>();
  return all.filter((l) => !seen.has(l.href) && !!seen.add(l.href)).map(({ href, label }) => ({ href, label }));
}

function CrawlLinks({ menu }: { menu: ArfroMenu }) {
  return (
    <ul className="m-0 list-none p-0">
      {panelLinks(menu).map((l) => (
        <li key={l.href}>
          <Link href={l.href} prefetch={false}>
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PanelHeading({ label, href, cta }: { label: string; href?: string; cta?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-arfro m-0 text-[30px] leading-[1.05] font-extrabold tracking-[-0.025em] xl:text-[36px]">{label}</p>
      {href && cta && (
        <Link
          href={href}
          prefetch={false}
          className="arfro-link text-arfro-blue hover:text-arfro-blue-hover inline-flex items-center gap-2 self-start text-[15px] font-bold"
        >
          {cta}
          <ArrowRightIcon />
        </Link>
      )}
    </div>
  );
}

/** Quick help: sales line and WhatsApp (from the navigation settings). */
function QuickHelp({ nav, phone, className }: { nav: SiteNavigation; phone?: Phone; className?: string }) {
  const line = phone ?? nav.salesPhone;
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <p className={eyebrow}>Besoin d’aide&nbsp;?</p>
      <a href={line.href} className="text-arfro-graphite hover:text-arfro-blue inline-flex min-h-8 items-center gap-2 text-[15px] font-bold">
        <PhoneIcon />
        {line.display}
        {phone && <span className="text-arfro-muted text-[13px] font-semibold">· {phone.label}</span>}
      </a>
      <a
        href={waLink(undefined, nav.whatsapp.number)}
        target="_blank"
        rel="noopener"
        className="text-arfro-graphite hover:text-arfro-blue inline-flex min-h-8 items-center gap-2 text-[15px] font-bold"
      >
        <WhatsAppIcon size={16} />
        WhatsApp
      </a>
    </div>
  );
}

function RangePanel({ menu, nav }: { menu: Extract<ArfroMenu, { kind: "range" }>; nav: SiteNavigation }) {
  const single = menu.groups.length === 1 ? menu.groups[0] : null;
  const fallbackPhoto = menu.photo;
  const featured = menu.featured;

  return (
    <>
      <div className="col-span-3 flex flex-col justify-between gap-10">
        <PanelHeading label={menu.label} href={single?.href} cta="Voir toute la gamme" />
        <div className="flex flex-col gap-7">
          {menu.guide && (
            <div className="flex flex-col gap-2.5">
              <p className={eyebrow}>Guide d’achat</p>
              <Link
                href={menu.guide.href}
                prefetch={false}
                className="text-arfro-graphite hover:text-arfro-blue inline-flex items-center gap-2 text-[15px] font-bold"
              >
                {menu.guide.label}
                <ArrowRightIcon />
              </Link>
            </div>
          )}
          <QuickHelp nav={nav} />
        </div>
      </div>

      <div className={cn("flex flex-col gap-9", single ? "col-span-5" : "col-span-6")}>
        {single ? (
          <div className="flex flex-col gap-3">
            <p className={eyebrow}>Catégories</p>
            <ul className={cn("m-0 grid list-none gap-x-6 p-0", single.subs.length > 4 && "grid-cols-2")}>
              {single.subs.map((s) => {
                const photo = s.photo;
                return (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      prefetch={false}
                      className="group/sub text-arfro-graphite hover:text-arfro-graphite border-arfro-line flex min-h-16 items-center gap-4 border-b py-2"
                    >
                      <span className="rounded-arfro-sm bg-arfro-ice flex size-12 shrink-0 items-center justify-center overflow-hidden">
                        {photo && (
                          // eslint-disable-next-line @next/next/no-img-element -- pre-sized renditions
                          <img
                            src={photo.src}
                            srcSet={photo.srcSet}
                            sizes={photo.srcSet ? "48px" : undefined}
                            alt=""
                            width={48}
                            height={48}
                            loading="lazy"
                            decoding="async"
                            className="size-11 object-contain"
                          />
                        )}
                      </span>
                      <span className="flex-1 text-[16px] font-semibold">{s.label}</span>
                      <ArrowRightIcon className="text-arfro-blue -translate-x-1 opacity-0 transition duration-300 group-hover/sub:translate-x-0 group-hover/sub:opacity-100 motion-reduce:transition-none" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-8 gap-y-8">
            {menu.groups.map((g) => (
              <div key={g.href} className="flex flex-col gap-3">
                <Link
                  href={g.href}
                  prefetch={false}
                  className="text-arfro-graphite hover:text-arfro-blue border-arfro-line border-b pb-3 text-[16px] leading-snug font-extrabold"
                >
                  {g.title}
                </Link>
                <ul className="m-0 flex list-none flex-col p-0">
                  {g.subs.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        prefetch={false}
                        className="text-arfro-graphite/85 hover:text-arfro-blue flex min-h-9 items-center text-[15px] font-medium"
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {menu.brands.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className={eyebrow}>Marques distribuées</p>
            <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-1 p-0">
              {menu.brands.map((b) => (
                <li key={b.href}>
                  <Link
                    href={b.href}
                    prefetch={false}
                    className="text-arfro-graphite hover:text-arfro-blue inline-flex min-h-9 items-center text-[15px] font-bold"
                  >
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={single ? "col-span-4" : "col-span-3"}>
        {featured ? (
          <div className="rounded-arfro-md bg-arfro-ice flex h-full flex-col gap-4 p-6">
            <p className={eyebrow}>Sélection Arfro</p>
            <Link href={featured.href} prefetch={false} tabIndex={-1} aria-hidden className="flex h-[180px] items-center justify-center xl:h-[200px]">
              <ProductVisual image={featured.image} art={featured.art} alt="" shadow={false} sizes="320px" />
            </Link>
            <div className="mt-auto flex flex-col gap-3">
              <Link href={featured.href} prefetch={false} className="text-arfro-graphite hover:text-arfro-blue text-[16px] leading-snug font-bold">
                {featured.name}
              </Link>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[20px] font-extrabold tracking-[-0.01em]">{dh(featured.price)}</span>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(featured.sku);
                    toast(`${featured.name} ajouté au panier`);
                  }}
                  className="rounded-arfro-sm bg-arfro-blue hover:bg-arfro-blue-hover h-11 px-4 text-sm font-bold whitespace-nowrap text-white transition-colors"
                >
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        ) : (
          fallbackPhoto && (
            <Link
              href={menu.href}
              prefetch={false}
              tabIndex={-1}
              aria-hidden
              className="rounded-arfro-md bg-arfro-ice flex h-full min-h-[240px] items-center justify-center p-6"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized renditions */}
              <img
                src={fallbackPhoto.src}
                srcSet={fallbackPhoto.srcSet}
                sizes="320px"
                alt=""
                loading="lazy"
                decoding="async"
                className="max-h-[220px] w-auto object-contain"
              />
            </Link>
          )
        )}
      </div>
    </>
  );
}

function LinksPanel({ menu, nav }: { menu: Extract<ArfroMenu, { kind: "links" }>; nav: SiteNavigation }) {
  return (
    <>
      <div className="col-span-3">
        <PanelHeading label={menu.label} />
      </div>
      <ul className="col-span-5 m-0 flex list-none flex-col p-0">
        {menu.links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              prefetch={false}
              className="group/l text-arfro-graphite hover:text-arfro-graphite border-arfro-line flex min-h-14 items-center justify-between gap-4 border-b text-[17px] font-semibold"
            >
              {l.label}
              <ArrowRightIcon className="text-arfro-blue -translate-x-1 opacity-40 transition duration-300 group-hover/l:translate-x-0 group-hover/l:opacity-100 motion-reduce:transition-none" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="rounded-arfro-md bg-arfro-navy relative col-span-4 overflow-hidden p-7 text-white">
        <AirflowLines variant="dark" animate={false} className="absolute inset-x-0 bottom-0 h-28 w-full" />
        <div className="relative flex flex-col gap-3">
          <p className="text-arfro-sky m-0 text-[11px] font-bold tracking-[0.18em] uppercase">Aide rapide</p>
          {menu.phone && <p className="text-arfro-on-navy m-0 text-sm font-semibold">{menu.phone.label}</p>}
          <a
            href={(menu.phone ?? nav.salesPhone).href}
            className="font-arfro inline-flex items-center gap-2.5 text-[24px] font-extrabold tracking-[-0.01em] text-white hover:text-white"
          >
            <PhoneIcon size={20} />
            {(menu.phone ?? nav.salesPhone).display}
          </a>
          <a
            href={waLink(undefined, nav.whatsapp.number)}
            target="_blank"
            rel="noopener"
            className="text-arfro-sky hover:text-arfro-sky inline-flex min-h-9 items-center gap-2 text-[15px] font-bold"
          >
            <WhatsAppIcon size={16} />
            Écrire sur WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
