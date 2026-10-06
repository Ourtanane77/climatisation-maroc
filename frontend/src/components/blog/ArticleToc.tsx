"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type Entry = { id: string; text: string };

function go(e: React.MouseEvent, id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
  history.replaceState(null, "", `#${id}`);
}

function TocLink({ entry, active }: { entry: Entry; active: boolean }) {
  return (
    <a
      href={`#${entry.id}`}
      onClick={(e) => go(e, entry.id)}
      aria-current={active ? "location" : undefined}
      className={cn(
        "hover:text-brand flex min-h-[52px] items-center border-l-[3px] py-1.5 pl-3.5 text-[15px] leading-[1.35]",
        active ? "border-brand text-brand font-bold" : "border-step-line text-ink-2 font-medium",
      )}
    >
      {entry.text}
    </a>
  );
}

/** Desktop table of contents (sticky, scroll-spy) with the calculator shortcut. */
export function DesktopToc({ entries, calculator }: { entries: Entry[]; calculator: boolean }) {
  const [active, setActive] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    const onScroll = () => {
      let current = entries[0]?.id ?? null;
      for (const e of entries) {
        const el = document.getElementById(e.id);
        if (el && el.getBoundingClientRect().top < 160) current = e.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [entries]);

  return (
    <nav aria-label="Sommaire" className="sticky top-[110px] hidden flex-col gap-1 xl:flex">
      <span className="text-muted mb-2 text-[13px] font-bold tracking-[0.04em]">SOMMAIRE</span>
      {entries.map((e) => (
        <TocLink key={e.id} entry={e} active={e.id === active} />
      ))}
      {calculator && (
        <a href="#calcul" onClick={(e) => go(e, "calcul")} className="bg-tint-blue text-ink hover:text-brand mt-5 flex flex-col gap-1 rounded-[16px] p-4">
          <strong className="text-[15px]">Calculateur</strong>
          <span className="text-ink-2 text-sm">Votre puissance en deux réglages</span>
        </a>
      )}
    </nav>
  );
}

/** Collapsible "Sommaire" card shown under "En bref" below 1100 px. */
export function MobileToc({ entries }: { entries: Entry[] }) {
  const [open, setOpen] = useState(false);
  return (
    <nav aria-label="Sommaire" className="overflow-hidden rounded-[20px] bg-white xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-ink flex min-h-14 w-full cursor-pointer items-center justify-between border-0 bg-transparent px-5 text-[17px] font-bold"
      >
        Sommaire
        <ChevronDownIcon size={16} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="flex flex-col px-5 pb-4">
          {entries.map((e) => (
            <TocLink key={e.id} entry={e} active={false} />
          ))}
        </div>
      )}
    </nav>
  );
}
