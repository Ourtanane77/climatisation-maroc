"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { ChevronDownIcon, ErrorIcon } from "@/components/ui/icons";

/**
 * Form primitives from the design forms (Commande, Devis, Contact, Revendeur, Connexion):
 * 15/700 labels, 52px inputs (radius 12, border #D3DDE8, focus #0B5CAD), error state
 * (#C4501A border, #FFF7F2 background, message with icon), "(optionnel)" hints.
 */

const inputBase = "w-full rounded-12 border-[1.5px] bg-white px-4 text-base outline-none transition-colors focus:border-brand focus-visible:outline-none";

export function inputClass(invalid?: boolean, extra?: string) {
  return cn(inputBase, invalid ? "border-promo bg-error-bg" : "border-input", extra);
}

export function Field({
  label,
  optional,
  error,
  hint,
  htmlFor,
  className,
  labelAside,
  children,
}: {
  label: ReactNode;
  optional?: boolean;
  error?: string | null;
  hint?: ReactNode;
  htmlFor?: string;
  className?: string;
  labelAside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[15px] font-bold">
          {label} {optional && <span className="text-muted font-medium">(optionnel)</span>}
        </label>
        {labelAside}
      </div>
      {children}
      {hint && !error && <span className="text-muted text-sm">{hint}</span>}
      {error && <FieldError id={htmlFor ? `${htmlFor}-error` : undefined}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <span id={id} role="alert" className="text-promo flex items-start gap-1.5 text-sm font-semibold">
      <ErrorIcon size={18} className="mt-px shrink-0" />
      {children}
    </span>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function TextInput({ invalid, className, id, ...rest }: InputProps) {
  return (
    <input
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && id ? `${id}-error` : undefined}
      className={inputClass(invalid, cn("h-[52px]", className))}
      {...rest}
    />
  );
}

export function Textarea({ invalid, className, rows = 4, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea rows={rows} aria-invalid={invalid || undefined} className={inputClass(invalid, cn("resize-y px-4 py-3.5", className))} {...rest} />;
}

export function Select({ invalid, className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select aria-invalid={invalid || undefined} className={inputClass(invalid, cn("h-[52px] appearance-none pr-11", className))} {...rest}>
        {children}
      </select>
      <ChevronDownIcon size={16} className="pointer-events-none absolute top-[18px] right-4" />
    </div>
  );
}

export function PasswordInput({ invalid, id, ...rest }: Omit<InputProps, "type">) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <TextInput id={id} type={shown ? "text" : "password"} invalid={invalid} className="pr-28" {...rest} />
      <button
        type="button"
        onClick={() => setShown(!shown)}
        aria-pressed={shown}
        className="rounded-10 bg-bg text-ink hover:bg-tint-blue absolute top-1 right-1 h-11 px-3.5 text-sm font-bold"
      >
        {shown ? "Masquer" : "Afficher"}
      </button>
    </div>
  );
}

/** Custom checkbox (24px box, radius 7) with a 44px hit area. */
export function Checkbox({
  checked,
  onChange,
  children,
  invalid,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  invalid?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("flex min-h-[52px] cursor-pointer items-center gap-3.5 text-base font-semibold", className)}>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={invalid || undefined} />
      <span
        aria-hidden
        className={cn(
          "rounded-7 peer-focus-visible:outline-brand flex size-6 shrink-0 items-center justify-center border-[1.5px] text-sm text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2",
          checked ? "border-brand bg-brand" : invalid ? "border-promo bg-white" : "border-check bg-white",
        )}
      >
        {checked ? "✓" : ""}
      </span>
      <span>{children}</span>
    </label>
  );
}

/** Single-choice chips (Type de projet, Type d'espace). */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <legend id={id} className="mb-2 text-[15px] font-bold">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={cn(
              "h-11 rounded-full border-[1.5px] px-4 text-[15px] font-semibold",
              value === o ? "border-ink bg-ink text-white" : "border-control hover:border-ink bg-white",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Segmented control ("Particulier / Professionnel"). */
export function SegmentedToggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-1 rounded-full bg-white p-1 shadow-[inset_0_0_0_1.5px_#E3E8EE]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("h-12 rounded-full px-6 text-base font-bold", value === o.value ? "bg-ink text-white" : "text-ink")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Dashed upload tile ("Joindre un plan ou une photo"). */
export function FileDrop({
  label,
  accept,
  onFile,
  fileName,
}: {
  label: string;
  accept: string;
  onFile: (file: File | null) => void;
  fileName?: string | null;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[15px] font-bold">
        {label} <span className="text-muted font-medium">(optionnel)</span>
      </span>
      <label
        htmlFor={id}
        className="rounded-16 border-upload-line bg-zebra hover:border-brand focus-within:border-brand flex min-h-16 cursor-pointer items-center gap-3.5 border-[1.5px] border-dashed px-4 py-3"
      >
        <span aria-hidden className="rounded-12 bg-tint-blue text-brand flex size-11 items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 11.5l-8.6 8.6a5 5 0 0 1-7.1-7.1l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4l8-8" />
          </svg>
        </span>
        <span className="text-ink-2 text-[15px]">{fileName || "Image ou PDF"}</span>
        <input id={id} type="file" accept={accept} className="sr-only" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}

/** Hidden honeypot field: bots fill it, the API rejects the submission. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Ne pas remplir
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
