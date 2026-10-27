"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Choice } from "@/lib/advisor/options";

/**
 * Form controls of the climate advisor: native radios and checkboxes styled as cards (arrow keys,
 * Space and screen readers work as for any radio group), inside a fieldset with its legend.
 */

const CARD =
  "relative flex min-h-[64px] cursor-pointer flex-col justify-center gap-1 rounded-arfro-sm border bg-white px-4 py-3 text-left transition-[border-color,background-color,box-shadow] duration-200 ease-[var(--ease-arfro)] motion-reduce:transition-none";
const CARD_OFF = "border-arfro-line hover:border-arfro-graphite/40";
const CARD_ON = "border-arfro-blue bg-arfro-ice shadow-[inset_0_0_0_1px_var(--color-arfro-blue)]";
const FOCUS = "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-arfro-blue";

export function Legend({ children, hint, id }: { children: ReactNode; hint?: ReactNode; id?: string }) {
  return (
    <legend id={id} className="mb-5 block w-full p-0">
      <span className="font-arfro text-arfro-graphite block text-[18px] leading-tight font-extrabold tracking-[-0.01em] md:text-[20px]">{children}</span>
      {hint && <span className="text-arfro-muted mt-1.5 block text-[15px] leading-normal font-normal">{hint}</span>}
    </legend>
  );
}

/** Square mark of a card: filled when selected. */
function Mark({ on, round }: { on: boolean; round: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute top-3.5 right-3.5 flex size-4 items-center justify-center border",
        round ? "rounded-full" : "rounded-arfro-xs",
        on ? "border-arfro-blue bg-arfro-blue" : "border-arfro-graphite/30 bg-white",
      )}
    >
      {on && <span className={cn("size-1.5 bg-white", round ? "rounded-full" : "")} />}
    </span>
  );
}

export function ChoiceGroup<T extends string>({
  name,
  legend,
  hint,
  choices,
  value,
  onChange,
  columns = "sm:grid-cols-3",
  index = false,
}: {
  name: string;
  legend: ReactNode;
  hint?: ReactNode;
  choices: Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** Grid columns from the sm breakpoint. */
  columns?: string;
  /** Numbered cards (01, 02…), for the main question of a step. */
  index?: boolean;
}) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <Legend hint={hint}>{legend}</Legend>
      <div className={cn("grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2", columns)}>
        {choices.map((c, i) => {
          const on = c.value === value;
          return (
            <label key={c.value} className={cn(CARD, FOCUS, on ? CARD_ON : CARD_OFF, "pr-10")}>
              <input type="radio" name={name} value={c.value} checked={on} onChange={() => onChange(c.value)} className="sr-only" />
              <Mark on={on} round />
              {index && (
                <span aria-hidden="true" className="text-arfro-muted font-arfro text-[12px] font-bold tracking-[0.12em] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
              <span className="text-arfro-graphite text-[16px] leading-snug font-bold">{c.label}</span>
              {c.sub && <span className="text-arfro-muted text-[13px] leading-snug">{c.sub}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function CheckGroup<T extends string>({
  legend,
  hint,
  choices,
  values,
  onChange,
}: {
  legend: ReactNode;
  hint?: ReactNode;
  choices: Choice<T>[];
  values: T[];
  onChange: (values: T[]) => void;
}) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <Legend hint={hint}>{legend}</Legend>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {choices.map((c) => {
          const on = values.includes(c.value);
          return (
            <label key={c.value} className={cn(CARD, FOCUS, on ? CARD_ON : CARD_OFF, "pr-10")}>
              <input
                type="checkbox"
                value={c.value}
                checked={on}
                onChange={() => onChange(on ? values.filter((v) => v !== c.value) : [...values, c.value])}
                className="sr-only"
              />
              <Mark on={on} round={false} />
              <span className="text-arfro-graphite text-[16px] leading-snug font-bold">{c.label}</span>
              {c.sub && <span className="text-arfro-muted text-[13px] leading-snug">{c.sub}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** − n + counter around a labelled number input. */
export function Stepper({
  id,
  label,
  hint,
  value,
  min,
  max,
  onChange,
  unit,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
}) {
  const btn =
    "flex size-12 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent text-[22px] text-arfro-graphite hover:bg-arfro-ice disabled:cursor-not-allowed disabled:opacity-35";
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div>
        <label htmlFor={id} className="font-arfro text-arfro-graphite block text-[18px] leading-tight font-extrabold tracking-[-0.01em] md:text-[20px]">
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="text-arfro-muted m-0 mt-1.5 text-[15px] leading-normal">
            {hint}
          </p>
        )}
      </div>
      <div className="border-arfro-line rounded-arfro-sm flex h-12 w-fit shrink-0 items-center border bg-white">
        <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Moins" aria-controls={id}>
          −
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n) && e.target.value !== "") onChange(Math.max(min, Math.min(max, Math.round(n))));
          }}
          className="text-arfro-graphite focus-visible:outline-arfro-blue h-full w-14 [appearance:textfield] border-0 bg-transparent text-center text-[17px] font-bold tabular-nums outline-none focus-visible:outline-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {unit && <span className="text-arfro-muted pr-1 text-[14px]">{unit}</span>}
        <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Plus" aria-controls={id}>
          +
        </button>
      </div>
    </div>
  );
}
