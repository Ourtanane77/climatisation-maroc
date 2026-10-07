"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { FooterColumn } from "@/lib/types";

/** Footer link columns: three per row from 760px, all five from 1100px; accordions ("+" turning 45°) on mobile. */
export function FooterColumns({ columns }: { columns: FooterColumn[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <nav aria-label="Plan du site" className="grid grid-cols-1 gap-x-6 md:grid-cols-3 md:gap-y-8 xl:grid-cols-5">
      {columns.map((col, i) => {
        const isOpen = open === i;
        return (
          <div key={col.title} className="flex flex-col border-b border-white/18 md:border-0">
            <h3 className="m-0 font-bold tracking-[0.04em]">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex min-h-[52px] w-full items-center justify-between text-left text-base text-white md:hidden"
              >
                {col.title}
                <span aria-hidden className={cn("text-xl transition-transform", isOpen && "rotate-45")}>
                  +
                </span>
              </button>
              <span className="text-footer-text mb-4 hidden text-[13px] md:block">{col.title}</span>
            </h3>
            <ul className={cn("m-0 list-none flex-col gap-3 p-0 pb-3 md:mt-3 md:flex md:pb-0", isOpen ? "flex" : "hidden")}>
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    prefetch={false}
                    href={l.href}
                    className="hover:text-tint-orange flex min-h-11 items-center text-[15px] leading-5 text-white md:-my-0.5 md:min-h-0 md:py-0.5"
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
