"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";

/**
 * Client parts of the category toolbar: the mobile "Filtres" button with its full-screen sheet
 * (the filter column is rendered on the server and passed as children), and the sort pill.
 */
export function MobileFilterSheet({ count, initialOpen = false, children }: { count: number; initialOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(initialOpen);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="border-ink flex h-11 items-center rounded-full border-[1.5px] bg-white px-[18px] text-[15px] font-bold md:hidden"
      >
        Filtres
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Filtres" className="fixed inset-0 z-70 flex flex-col bg-white md:hidden">
          <div className="border-divider mx-5 flex min-h-14 items-center justify-between border-b py-3">
            <strong className="text-xl">Filtres</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="bg-bg flex size-11 items-center justify-center rounded-full">
              <CloseIcon size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-auto px-5 [&>aside]:flex [&>aside]:rounded-none [&>aside]:p-0">{children}</div>
          <div className="bg-white px-5 pt-2 pb-4">
            <button type="button" onClick={() => setOpen(false)} className="bg-brand h-[52px] w-full rounded-full text-base font-bold text-white">
              Voir les {count} produit{count > 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/** "Trier : Prix croissant" pill; a native select laid over it keeps it accessible. */
export function SortSelect({ options, value }: { options: { value: string; label: string; href: string }[]; value: string }) {
  const router = useRouter();
  const current = options.find((o) => o.value === value) ?? options[0];
  return (
    <label className="border-control relative flex h-11 items-center gap-1 rounded-full border-[1.5px] bg-white px-3 text-[15px] leading-[1.1] whitespace-nowrap md:px-4">
      {/* On phones the pill shows the value only, so the toolbar stays on one line. */}
      <span className="max-md:sr-only">Trier :</span> <strong>{current.label}</strong>
      <select
        aria-label="Trier"
        value={current.value}
        onChange={(e) => {
          const target = options.find((o) => o.value === e.target.value);
          if (target) router.push(target.href, { scroll: false });
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
