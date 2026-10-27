"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { FooterColumn } from "@/lib/types";
import { PlusIcon } from "./icons";

/**
 * arfro.com footer link columns: one per column from 1024px (small uppercase headings), three per
 * row from 768px, collapsible sections on phones (« + » turning into « × »).
 */
export function ArfroFooterColumns({ columns }: { columns: FooterColumn[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <nav
      aria-label="Plan du site"
      style={{ "--cols": columns.length } as React.CSSProperties}
      className="grid grid-cols-1 md:grid-cols-3 md:gap-x-8 md:gap-y-10 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
    >
      {columns.map((col, i) => {
        const isOpen = open === i;
        const id = `pied-${i}`;
        return (
          <div key={col.title} className="flex flex-col border-t border-arfro-line-dark md:border-0">
            <h3 className="m-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={id}
                className="flex h-14 w-full items-center justify-between text-left text-[16px] font-bold text-white md:hidden"
              >
                {col.title}
                <PlusIcon className={cn("text-arfro-sky transition-transform duration-300 motion-reduce:transition-none", isOpen && "rotate-45")} />
              </button>
              <span className="text-arfro-sky mb-5 hidden text-[11px] font-bold tracking-[0.18em] uppercase md:block">{col.title}</span>
            </h3>
            <ul id={id} className={cn("m-0 list-none flex-col gap-3 p-0 pb-4 md:flex md:pb-0", isOpen ? "flex" : "hidden")}>
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    prefetch={false}
                    href={l.href}
                    className="flex min-h-11 items-center text-[15px] leading-5 font-medium text-white/90 hover:text-white hover:underline hover:underline-offset-4 md:-my-0.5 md:min-h-0 md:py-0.5"
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
