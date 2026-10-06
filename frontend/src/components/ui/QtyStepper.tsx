"use client";

import { cn } from "@/lib/cn";

/** Pill quantity stepper (−, value, +). Heights: 40 (dense rows), 48 (cart, quick order), 56 (PDP). */
export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  size = 48,
  label = "Quantité",
  editable = false,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 40 | 48 | 56;
  label?: string;
  editable?: boolean;
  className?: string;
}) {
  const btn = size === 40 ? "size-9 text-lg" : size === 48 ? "size-11 text-xl" : "size-[52px] text-xl";
  const set = (n: number) => onChange(Math.max(min, Math.min(max, n)));
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("border-control inline-flex items-center rounded-full border-[1.5px] bg-white px-0.5", className)}
      style={{ height: size }}
    >
      <button
        type="button"
        aria-label="Diminuer la quantité"
        disabled={value <= min}
        onClick={() => set(value - 1)}
        className={cn("rounded-full disabled:opacity-40", btn)}
      >
        −
      </button>
      {editable ? (
        <input
          inputMode="numeric"
          aria-label={label}
          value={value}
          onChange={(e) => set(Number(e.target.value.replace(/\D/g, "")) || min)}
          className="w-9 bg-transparent text-center font-bold outline-none"
        />
      ) : (
        <span aria-live="polite" className={cn("min-w-6 text-center font-bold", size === 40 ? "text-[15px]" : size === 56 ? "text-[17px]" : "text-base")}>
          {value}
        </span>
      )}
      <button
        type="button"
        aria-label="Augmenter la quantité"
        disabled={value >= max}
        onClick={() => set(value + 1)}
        className={cn("rounded-full disabled:opacity-40", btn)}
      >
        +
      </button>
    </div>
  );
}
