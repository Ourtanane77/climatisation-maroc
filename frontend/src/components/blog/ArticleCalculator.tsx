"use client";

import Link from "next/link";
import { createContext, useContext, useState } from "react";
import { PowerTable } from "@/components/calculator/PowerTable";
import { cn } from "@/lib/cn";
import { POWER_TIERS, clampSurface, powerCta, quickPower, type Sun } from "@/lib/power";

interface CalcState {
  surface: number;
  sun: Sun;
  setSurface: (v: number) => void;
  setSun: (v: Sun) => void;
}

const Ctx = createContext<CalcState | null>(null);

/** Shares the article calculator's input with the power table, whose matching row lights up. */
export function ArticleCalcProvider({ children }: { children: React.ReactNode }) {
  const [surface, setSurface] = useState(18);
  const [sun, setSun] = useState<Sun>("normale");
  return <Ctx.Provider value={{ surface, sun, setSurface: (v) => setSurface(clampSurface(v)), setSun }}>{children}</Ctx.Provider>;
}

function useCalc(): CalcState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("ArticleCalcProvider missing");
  return ctx;
}

const SUNS: { value: Sun; label: string }[] = [
  { value: "faible", label: "Peu de soleil" },
  { value: "normale", label: "Ensoleillée" },
  { value: "forte", label: "Très ensoleillée" },
];

/** "Calculez votre puissance" block of the article (`#calcul`): surface and sun only. */
export function InlineCalculator() {
  const { surface, sun, setSurface, setSun } = useCalc();
  const { tierIndex, bumped } = quickPower(surface, sun);
  const tier = POWER_TIERS[tierIndex];
  const cta = tierIndex < 4 ? powerCta(tierIndex) : { label: "Demander conseil", href: "/demander-un-devis" };
  const note = bumped ? "Puissance relevée d’un cran pour une pièce très ensoleillée." : `Pour ${surface} m² · ${tier.coverage.toLowerCase()}.`;
  const [text, setText] = useState(String(surface));
  const shown = Number(text) === surface ? text : String(surface);

  return (
    <div id="calcul" className="bg-brand my-2 flex scroll-mt-[110px] flex-col gap-[18px] rounded-[24px] p-5 text-white md:p-7">
      <h3 className="m-0 text-[22px] font-bold text-white">Calculez votre puissance</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[200px_minmax(0,1fr)]">
        <label className="flex flex-col gap-2 text-[15px] font-bold">
          Surface de la pièce
          <div className="text-ink rounded-12 flex h-[52px] items-center bg-white">
            <button type="button" onClick={() => setSurface(surface - 1)} aria-label="Moins" className="size-12 cursor-pointer border-0 bg-transparent text-xl">
              −
            </button>
            <input
              value={shown}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                setText(digits);
                if (digits) setSurface(Number(digits));
              }}
              onBlur={() => setText(String(surface))}
              inputMode="numeric"
              aria-label="Surface en m²"
              className="min-w-0 flex-1 border-0 bg-transparent text-center text-lg font-extrabold outline-none"
            />
            <span className="text-muted text-[15px] font-bold">m²</span>
            <button type="button" onClick={() => setSurface(surface + 1)} aria-label="Plus" className="size-12 cursor-pointer border-0 bg-transparent text-xl">
              +
            </button>
          </div>
        </label>
        <div className="flex flex-col gap-2 text-[15px] font-bold">
          <span id="calc-sun">Ensoleillement</span>
          <div role="radiogroup" aria-labelledby="calc-sun" className="flex flex-wrap gap-1.5">
            {SUNS.map((s) => {
              const on = s.value === sun;
              return (
                <button
                  key={s.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSun(s.value)}
                  className={cn(
                    "rounded-12 h-[52px] flex-[1_1_auto] cursor-pointer border-[1.5px] px-3.5 text-[15px] font-bold whitespace-nowrap",
                    on ? "text-brand border-white bg-white" : "border-white/45 bg-transparent text-white",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div aria-live="polite" className="text-ink flex flex-wrap items-center justify-between gap-4 rounded-[18px] bg-white px-5 py-[18px]">
        <div className="flex flex-col gap-0.5">
          <span className="text-ink-2 text-[15px]">Puissance conseillée :</span>
          <span className="text-[30px] font-extrabold tracking-[-0.02em]">{tier.label}</span>
          <span className="text-ink-2 text-sm">{note}</span>
        </div>
        <Link
          href={cta.href}
          className="bg-accent hover:bg-accent-hover box-border flex h-14 items-center justify-center gap-2.5 rounded-full px-7 text-center text-base font-bold whitespace-nowrap text-white hover:text-white"
        >
          {cta.label}
        </Link>
      </div>
    </div>
  );
}

/** Article power table, highlighting the calculator's result. */
export function ArticlePowerTable() {
  const { surface, sun } = useCalc();
  return <PowerTable active={quickPower(surface, sun).tierIndex} surfaceHeader="Surface de la pièce" ring />;
}
