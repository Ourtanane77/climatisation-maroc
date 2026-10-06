"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { CalculatorTier } from "@/lib/blog/types";
import { SURFACE_MAX, SURFACE_MIN, clampSurface, computePower, powerCta, type Ceiling, type Room, type Sun } from "@/lib/power";
import { MatchList } from "./MatchList";
import { PowerTable } from "./PowerTable";

interface Option<T> {
  value: T;
  label: string;
  sub?: string;
}

const CEILINGS: Option<Ceiling>[] = [
  { value: "standard", label: "Standard", sub: "Jusqu’à 2,5 m" },
  { value: "haute", label: "Haute", sub: "Plus de 2,5 m" },
];
const SUNS: Option<Sun>[] = [
  { value: "faible", label: "Peu ensoleillée" },
  { value: "normale", label: "Normale" },
  { value: "forte", label: "Très ensoleillée" },
];
const TOP: Option<"non" | "oui">[] = [
  { value: "non", label: "Non" },
  { value: "oui", label: "Oui" },
];
const ROOMS: Option<Room>[] = [
  { value: "chambre", label: "Chambre" },
  { value: "salon", label: "Salon" },
  { value: "bureau", label: "Bureau" },
  { value: "cuisine-ouverte", label: "Cuisine ouverte" },
];

function RadioGroup<T extends string>({ title, options, value, onChange }: { title: string; options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={title} className="flex flex-col gap-2.5">
      <span className="text-base font-bold">{title}</span>
      <div
        className={cn("grid gap-2", options.length > 3 && "max-md:!grid-cols-2")}
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              className={cn(
                "text-ink rounded-14 flex min-h-[52px] cursor-pointer flex-col items-center justify-center gap-0.5 border-2 px-2.5 py-1.5 text-center text-[15px] font-bold",
                on ? "border-brand bg-tint-blue" : "border-border bg-white",
              )}
            >
              <span>{o.label}</span>
              {o.sub && <span className="text-muted text-xs font-semibold">{o.sub}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Calculator of design/Calculateur puissance.dc.html: the form, the live result (sticky on
 * desktop) with its matching air conditioners, then the power table and the explanation.
 */
export function PowerCalculator({ tiers, children }: { tiers: CalculatorTier[]; children?: React.ReactNode }) {
  const [surface, setSurface] = useState(18);
  const [ceiling, setCeiling] = useState<Ceiling>("standard");
  const [sun, setSun] = useState<Sun>("normale");
  const [top, setTop] = useState<"non" | "oui">("non");
  const [room, setRoom] = useState<Room>("salon");

  const result = computePower({ surface, ceiling, sun, topFloor: top === "oui", room });
  const cta = tiers[result.tierIndex]?.cta ?? powerCta(result.tierIndex);
  const products = tiers[result.tierIndex]?.products ?? [];
  const change = (v: number) => setSurface(clampSurface(v));

  return (
    <>
      <section className="grid grid-cols-1 items-start gap-6 pt-7 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="flex flex-col gap-7 rounded-[24px] bg-white p-5 md:p-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="surf" className="text-base font-bold">
                Surface de la pièce
              </label>
              <div className="border-control flex h-12 shrink-0 items-center rounded-full border-[1.5px] bg-white">
                <button
                  type="button"
                  onClick={() => change(surface - 1)}
                  aria-label="Diminuer"
                  className="size-11 cursor-pointer border-0 bg-transparent text-lg"
                >
                  −
                </button>
                <span className="min-w-6 text-center text-[15px] font-bold" aria-live="polite">
                  {surface} m²
                </span>
                <button
                  type="button"
                  onClick={() => change(surface + 1)}
                  aria-label="Augmenter"
                  className="size-11 cursor-pointer border-0 bg-transparent text-lg"
                >
                  +
                </button>
              </div>
            </div>
            <input
              id="surf"
              type="range"
              min={SURFACE_MIN}
              max={SURFACE_MAX}
              step={1}
              value={surface}
              onChange={(e) => change(Number(e.target.value))}
              aria-label="Surface en m²"
              className="accent-brand h-8 w-full cursor-pointer"
            />
            <div className="text-muted flex justify-between text-[13px]">
              <span>{SURFACE_MIN} m²</span>
              <span>{SURFACE_MAX} m²</span>
            </div>
          </div>
          <RadioGroup title="Hauteur sous plafond" options={CEILINGS} value={ceiling} onChange={setCeiling} />
          <RadioGroup title="Exposition" options={SUNS} value={sun} onChange={setSun} />
          <RadioGroup title="Dernier étage" options={TOP} value={top} onChange={setTop} />
          <RadioGroup title="Type de pièce" options={ROOMS} value={room} onChange={setRoom} />
        </div>

        <aside aria-live="polite" className="top-[88px] flex flex-col gap-4 xl:sticky">
          <div className="bg-brand flex flex-col gap-2.5 rounded-[24px] p-5 text-white md:p-8">
            <span className="text-footer-text-2 text-base">Puissance conseillée</span>
            <span className="text-[44px] leading-none font-extrabold tracking-[-0.03em] md:text-[60px]">{result.tier.label}</span>
            <p className="text-footer-text-2 m-0 mt-1 text-base leading-[1.55]">{result.explanation}</p>
            <Link
              href={cta.href}
              className="text-ink hover:bg-tint-blue hover:text-ink mt-2.5 box-border flex h-14 items-center justify-center gap-2.5 rounded-full bg-white px-7 text-center text-base font-bold whitespace-nowrap"
            >
              {cta.label}
            </Link>
          </div>
          <MatchList products={products} />
        </aside>
      </section>

      <section className="grid grid-cols-1 items-start gap-x-12 gap-y-6 pt-10 md:pt-14 xl:grid-cols-2">
        <div>
          <h2 className="m-0 mb-6 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px]">Tableau des puissances</h2>
          <PowerTable active={result.tierIndex} />
        </div>
        {children}
      </section>
    </>
  );
}
