"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { SiteNavigation } from "@/lib/types";
import { currentFor } from "../SiteHeader";

const PRO_HREF = "/espace-professionnel";

/**
 * arfro.com utility bar (≥1024px, above the sticky header): « Particuliers » / « Professionnels »
 * on the left (the pro area underlined while inside it), service links and the sales phone on the right.
 */
export function ArfroUtilityBar({ nav }: { nav: SiteNavigation }) {
  const pathname = usePathname();
  const pro = pathname === PRO_HREF || pathname.startsWith(`${PRO_HREF}/`);
  const spaces = [
    { label: "Particuliers", href: "/", active: !pro },
    { label: "Professionnels", href: PRO_HREF, active: pro },
  ];
  const services = [{ label: "Suivre ma commande", href: "/suivi-commande" }, ...nav.rightLinks];

  return (
    <div className="border-border hidden border-b text-[13px] lg:block">
      <div className="site-gutter flex h-10 items-center justify-between gap-4">
        <nav aria-label="Espaces" className="-ml-3 flex h-full gap-1">
          {spaces.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              aria-current={s.active ? "true" : undefined}
              className={cn(
                "flex h-full items-center border-b-2 px-3",
                s.active ? "border-ink text-ink hover:text-ink font-bold" : "text-muted hover:text-ink border-transparent font-semibold",
              )}
            >
              {s.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Services" className="flex h-full items-center gap-[22px]">
          {services.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={currentFor(pathname, l.href)}
              className="text-muted hover:text-ink aria-[current=page]:text-ink flex h-full items-center font-semibold"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={nav.salesPhone.href}
            aria-label={`Appeler le ${nav.salesPhone.display}`}
            className="text-ink hover:text-ink flex h-full items-center gap-1.5 font-bold"
          >
            <svg
              aria-hidden
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
            </svg>
            {nav.salesPhone.display}
          </a>
        </nav>
      </div>
    </div>
  );
}
