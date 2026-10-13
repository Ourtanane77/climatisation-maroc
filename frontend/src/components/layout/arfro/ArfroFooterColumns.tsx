"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { FooterColumn } from "@/lib/types";

/**
 * arfro.com footer link columns: one per column from 1024px (small uppercase headings), three per
 * row from 760px, collapsible sections on phones (« + » turning into « − »).
 */
export function ArfroFooterColumns({ columns }: { columns: FooterColumn[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <nav
      aria-label="Plan du site"
      style={{ "--cols": columns.length } as React.CSSProperties}
      className="grid grid-cols-1 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
    >
      {columns.map((col, i) => {
        const isOpen = open === i;
        const id = `pied-${i}`;
        return (
          <div key={col.title} className="flex flex-col border-t border-[#2a5a8f] md:border-0">
            <h3 className="m-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={id}
                className="flex h-[52px] w-full items-center justify-between text-left text-[15px] font-extrabold text-white md:hidden"
              >
                {col.title}
                <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d={isOpen ? "M5 12h14" : "M12 5v14M5 12h14"} />
                </svg>
              </button>
              <span className="text-footer-text mb-4 hidden text-[13px] font-extrabold tracking-[0.08em] uppercase md:block">{col.title}</span>
            </h3>
            <ul id={id} className={cn("m-0 list-none flex-col gap-3 p-0 pb-4 md:flex md:pb-0", isOpen ? "flex" : "hidden")}>
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    prefetch={false}
                    href={l.href}
                    className="flex min-h-11 items-center text-[15px] leading-5 font-semibold text-white hover:text-white hover:underline md:-my-0.5 md:min-h-0 md:py-0.5"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
