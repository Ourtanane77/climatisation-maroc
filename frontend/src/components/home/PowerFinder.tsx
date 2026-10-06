"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { POWER_TIERS, SURFACE_MAX, SURFACE_MIN, clampSurface, powerCta, quickPower, type Sun } from "@/lib/power";

const SUNS: { value: Sun; label: string }[] = [
  { value: "faible", label: "Peu de soleil" },
  { value: "normale", label: "Ensoleillée" },
  { value: "forte", label: "Très ensoleillée" },
];

/** Tier chips of the home bar (design TIERS: the last one reads "30 000 +"). */
const TIER_LABELS = ["9 000 BTU", "12 000 BTU", "18 000 BTU", "24 000 BTU", "30 000 +"];

/**
 * Home power finder (design/Accueil.dc.html, `#puissance`): surface stepper, sun dropdown, the five
 * tiers with the recommended one highlighted, and "Voir →" to the matching air conditioners.
 * Uses the shared sizing model (lib/power.ts) with surface and sun only.
 */
export function PowerFinder() {
  const [surface, setSurface] = useState(18);
  const [sun, setSun] = useState<Sun>("normale");
  const [picked, setPicked] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ddRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const reco = quickPower(surface, sun);
  const current = picked ?? reco.tierIndex;
  const see = powerCta(current);
  const sunLabel = SUNS.find((s) => s.value === sun)!.label;

  const changeSurface = (value: number) => {
    setSurface(clampSurface(value));
    setPicked(null);
  };

  return (
    <div id="puissance" className="relative z-[3] mt-4 rounded-[24px] bg-white p-2 shadow-[0_24px_50px_-28px_rgba(14,40,70,0.45)] md:-mt-10 xl:rounded-full">
      <div className="flex flex-wrap items-center gap-1.5 gap-y-2 whitespace-nowrap xl:flex-nowrap">
        <div title="Surface de la pièce" className="bg-bg flex h-[60px] shrink-0 items-center gap-0.5 rounded-full px-1.5">
          <button
            type="button"
            onClick={() => changeSurface(surface - 1)}
            aria-label="Réduire la surface"
            className="hover:bg-tint-blue size-9 cursor-pointer rounded-full border-0 bg-white text-lg"
          >
            −
          </button>
          <input
            type="number"
            min={SURFACE_MIN}
            max={SURFACE_MAX}
            value={surface}
            onChange={(e) => changeSurface(Number(e.target.value) || SURFACE_MIN)}
            aria-label="Surface en m²"
            className="w-11 [appearance:textfield] border-0 bg-transparent text-center text-xl font-bold outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="mr-1 text-[15px] font-semibold">m²</span>
          <button
            type="button"
            onClick={() => changeSurface(surface + 1)}
            aria-label="Augmenter la surface"
            className="hover:bg-tint-blue size-9 cursor-pointer rounded-full border-0 bg-white text-lg"
          >
            +
          </button>
        </div>

        <div
          title="Ensoleillement de la pièce"
          className={cn(
            "flex h-[60px] shrink-0 items-center gap-2 rounded-full pr-1.5 pl-4 text-sm font-semibold",
            sun === "forte" ? "bg-tint-orange" : "bg-bg",
          )}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
            <path d="M7 14a5 5 0 0 1 10 0 M3 19c3 0 3-2 6-2s3 2 6 2 3-2 6-2" stroke="#0B5CAD" />
            <path d="M12 3v2.5 M5.6 5.6l1.8 1.8 M3 11h2.5 M18.4 5.6l-1.8 1.8 M21 11h-2.5" stroke="#F4731F" />
          </svg>
          <span className="text-muted">Soleil</span>
          <div ref={ddRef} className="relative flex h-full shrink-0 items-center">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-label={`Ensoleillement : ${sunLabel}`}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-full border-0 bg-white pr-3 pl-3.5 text-sm font-bold whitespace-nowrap"
            >
              {sunLabel}
              <ChevronDownIcon size={14} className={cn("transition-transform duration-200", open && "rotate-180")} />
            </button>
            {open && (
              <div
                role="listbox"
                aria-label="Ensoleillement"
                className="shadow-dropdown animate-rise absolute top-[calc(100%_+_8px)] left-0 z-50 flex min-w-[200px] flex-col gap-0.5 rounded-[18px] bg-white p-1.5"
              >
                {SUNS.map((s) => {
                  const on = s.value === sun;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      role="option"
                      aria-selected={on}
                      onClick={() => {
                        setSun(s.value);
                        setPicked(null);
                        setOpen(false);
                      }}
                      className={cn(
                        "rounded-12 hover:bg-tint-blue hover:text-brand flex h-[42px] cursor-pointer items-center justify-between gap-4 border-0 px-3.5 text-left text-[15px] font-semibold whitespace-nowrap",
                        on ? "bg-tint-select text-brand" : "text-ink bg-white",
                      )}
                    >
                      {s.label}
                      <span className="text-brand font-extrabold">{on ? "✓" : ""}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <Link
          href={see.href}
          className="bg-accent hover:bg-accent-hover order-5 box-border flex h-[60px] w-full shrink-0 items-center justify-center rounded-full px-[22px] text-[15px] font-bold text-white transition-colors hover:text-white md:order-4 md:w-auto"
        >
          Voir →
        </Link>

        <span aria-hidden className="bg-border mx-1 hidden h-9 w-px shrink-0 xl:block" />

        <div
          role="group"
          aria-label="Puissance"
          className="order-3 flex min-w-0 flex-[1_1_100%] [scrollbar-width:none] gap-1.5 overflow-x-auto md:flex-[1_1_calc(100%_-_140px)] md:overflow-visible xl:flex-[1_1_0]"
        >
          {POWER_TIERS.map((t, i) => {
            const on = picked === i;
            const rec = picked == null && reco.tierIndex === i;
            return (
              <button
                key={t.btu}
                type="button"
                aria-pressed={on}
                onClick={() => setPicked(on ? null : i)}
                className={cn(
                  "hover:border-brand flex h-[60px] min-w-[112px] flex-none cursor-pointer flex-col items-center justify-center overflow-hidden rounded-full border-2 px-2 transition-[background-color,border-color] duration-200 md:min-w-0 md:flex-[1_1_0]",
                  on ? "border-brand bg-brand text-white" : rec ? "border-reco bg-reco-bg text-ink" : "border-border text-ink bg-white",
                )}
              >
                <span className="text-sm font-bold md:text-base">{TIER_LABELS[i]}</span>
                <span className={cn("max-w-full overflow-hidden text-sm text-ellipsis md:text-[13px]", on ? "text-white" : rec ? "text-brand" : "text-muted")}>
                  {rec ? (reco.bumped ? "Conseillé · soleil" : "Conseillé") : t.coverage}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
