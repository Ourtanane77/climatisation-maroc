"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { SiteNavigation } from "@/lib/types";
import { PhoneIcon } from "./icons";
import { PRO_HREF, currentFor, utilityLinks } from "./nav";

/**
 * arfro.com utility row (≥1024px, 36px): « Particuliers » / « Professionnels » on the left (the pro
 * area marked while inside it), order tracking, quote, contact, reseller, promotions and the sales
 * phone on the right. It is the top row of ArfroHeader (`embedded`) so it follows the header states
 * (transparent over the home hero); rendered alone it outputs nothing (the site layout still
 * mounts it before the header).
 */
export function ArfroUtilityBar({ nav, embedded = false }: { nav: SiteNavigation; embedded?: boolean }) {
  const pathname = usePathname();
  if (!embedded) return null;
  const pro = pathname === PRO_HREF || pathname.startsWith(`${PRO_HREF}/`);
  const spaces = [
    { label: "Particuliers", href: "/", active: !pro },
    { label: "Professionnels", href: PRO_HREF, active: pro },
  ];
  const links = [...utilityLinks(nav), nav.promotions];

  return (
    <div className="hidden text-[12.5px] lg:block">
      <div className="site-gutter flex h-9 items-center justify-between gap-6 shadow-[inset_0_-1px_0_var(--hdr-line)]">
        <nav aria-label="Espaces" className="-ml-2 flex h-full items-center">
          {spaces.map((s, i) => (
            <span key={s.href} className="flex h-full items-center">
              {i > 0 && <span aria-hidden className="h-3 w-px bg-(--hdr-line)" />}
              <Link
                href={s.href}
                aria-current={s.active ? "true" : undefined}
                className={cn(
                  "flex h-full items-center px-2 tracking-[0.02em]",
                  s.active ? "font-bold text-(--hdr-fg) hover:text-(--hdr-fg)" : "font-semibold text-(--hdr-muted) hover:text-(--hdr-fg)",
                )}
              >
                {s.label}
              </Link>
            </span>
          ))}
        </nav>
        <nav aria-label="Services" className="flex h-full items-center gap-5 xl:gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={currentFor(pathname, l.href)}
              className="flex h-full items-center font-semibold text-(--hdr-muted) hover:text-(--hdr-fg) aria-[current]:text-(--hdr-fg)"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={nav.salesPhone.href}
            aria-label={`Appeler le ${nav.salesPhone.display}`}
            className="flex h-full items-center gap-1.5 font-bold text-(--hdr-fg) hover:text-(--hdr-fg)"
          >
            <PhoneIcon size={14} />
            {nav.salesPhone.display}
          </a>
        </nav>
      </div>
    </div>
  );
}
