import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Client-safe part of the Arfro ui (no server-only import): client components (forms, the climate
 * advisor…) import from "@/components/arfro/ui/base"; server components may keep using
 * "@/components/arfro/ui", which re-exports everything here.
 *
 * Editorial building blocks of the Arfro design system (docs/arfro-design-system.md). Tokens:
 * bg-arfro-navy / -ice / -warm, text-arfro-graphite, text-arfro-electric, rounded-arfro-sm/-md,
 * font-arfro (globals.css). Arfro pages only.
 */

export type SectionTone = "white" | "ice" | "warm" | "navy";

const TONES: Record<SectionTone, string> = {
  white: "bg-white text-arfro-graphite",
  ice: "bg-arfro-ice text-arfro-graphite",
  warm: "bg-arfro-warm text-arfro-graphite",
  navy: "bg-arfro-navy text-white",
};

/** Full-width band with the section rhythm; content in the page column unless `bleed`. */
export function Section({
  tone = "white",
  id,
  bleed = false,
  className,
  innerClassName,
  labelledBy,
  children,
}: {
  tone?: SectionTone;
  id?: string;
  /** Content spans the full width (hero, full-bleed photos). */
  bleed?: boolean;
  className?: string;
  innerClassName?: string;
  /** id of the section heading, for aria-labelledby. */
  labelledBy?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} data-tone={tone} className={cn("arfro-section relative", TONES[tone], className)}>
      <div className={cn(bleed ? "" : "site-gutter", "py-16 md:py-24 xl:py-32", innerClassName)}>{children}</div>
    </section>
  );
}

/** Small uppercase label above a heading. */
export function Eyebrow({ children, className, onDark }: { children: ReactNode; className?: string; onDark?: boolean }) {
  return (
    <p
      className={cn(
        "arfro-eyebrow m-0 text-[12px] font-bold tracking-[0.18em] uppercase md:text-[13px]",
        onDark ? "text-arfro-sky" : "text-arfro-blue",
        // Not told explicitly: switches to sky on a navy Section (globals.css).
        onDark === undefined && "arfro-eyebrow-auto",
        className,
      )}
    >
      {children}
    </p>
  );
}

export type DisplaySize = "xl" | "l" | "m" | "s";

const DISPLAY: Record<DisplaySize, string> = {
  xl: "text-[clamp(40px,7vw,104px)] leading-[0.98] tracking-[-0.035em]",
  l: "text-[clamp(34px,5vw,72px)] leading-[1.02] tracking-[-0.03em]",
  m: "text-[clamp(28px,3.6vw,52px)] leading-[1.06] tracking-[-0.025em]",
  s: "text-[clamp(22px,2.4vw,32px)] leading-[1.15] tracking-[-0.015em]",
};

/** Editorial headline (h1–h3), Manrope, confident weight. */
export function DisplayHeading({
  as: Tag = "h2",
  size = "l",
  id,
  className,
  children,
}: {
  as?: "h1" | "h2" | "h3";
  size?: DisplaySize;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag id={id} data-size={size} className={cn("arfro-display font-arfro m-0 font-extrabold text-balance", DISPLAY[size], className)}>
      {children}
    </Tag>
  );
}

/** Intro paragraph under a headline. */
export function Lead({ children, className, onDark }: { children: ReactNode; className?: string; onDark?: boolean }) {
  return (
    <p
      className={cn(
        "arfro-lead m-0 max-w-[60ch] text-[17px] leading-[1.6] md:text-[19px]",
        onDark ? "text-white/75" : "text-arfro-graphite/80",
        // Not told explicitly: switches to light text on a navy Section (globals.css).
        onDark === undefined && "arfro-lead-auto",
        className,
      )}
    >
      {children}
    </p>
  );
}

export type ArfroButtonVariant = "primary" | "outline" | "outline-light" | "light" | "link" | "link-light";

const BUTTONS: Record<ArfroButtonVariant, string> = {
  primary: "rounded-arfro-sm bg-arfro-blue px-7 h-[52px] text-white hover:bg-arfro-blue-hover hover:text-white",
  outline: "rounded-arfro-sm border border-arfro-graphite/30 px-7 h-[52px] text-arfro-graphite hover:border-arfro-graphite hover:text-arfro-graphite",
  "outline-light": "rounded-arfro-sm border border-white/40 px-7 h-[52px] text-white hover:border-white hover:text-white",
  light: "rounded-arfro-sm bg-white px-7 h-[52px] text-arfro-navy hover:bg-arfro-ice hover:text-arfro-navy",
  link: "arfro-link text-arfro-blue hover:text-arfro-blue-hover",
  "link-light": "arfro-link text-white hover:text-white",
};

/**
 * Classes of an Arfro button variant (for elements that are neither ArfroButtonLink nor
 * ArfroButton, e.g. a form submit styled by a parent). Includes the focus ring (.arfro-btn).
 */
export function arfroButtonClasses(variant: ArfroButtonVariant = "primary", className?: string): string {
  return cn(
    "arfro-btn inline-flex items-center justify-center gap-2.5 text-[15px] font-bold whitespace-nowrap transition-[background-color,border-color,color,transform] duration-300 ease-[var(--ease-arfro)] select-none",
    BUTTONS[variant],
    className,
  );
}

/** Real <button> with the Arfro button look (forms, the climate advisor, toggles). */
export function ArfroButton({
  variant = "primary",
  className,
  children,
  icon,
  type = "button",
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
  variant?: ArfroButtonVariant;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button type={type} className={arfroButtonClasses(variant, cn("disabled:cursor-not-allowed disabled:opacity-50", className))} {...rest}>
      {children}
      {icon}
    </button>
  );
}

/** Button-looking link. Internal paths use next/link; others (tel:, https:) a plain <a>. */
export function ArfroButtonLink({
  href,
  variant = "primary",
  className,
  children,
  icon,
}: {
  href: string;
  variant?: ArfroButtonVariant;
  className?: string;
  children: ReactNode;
  /** Trailing icon (arrow…). */
  icon?: ReactNode;
}) {
  const cls = arfroButtonClasses(variant, className);
  const content = (
    <>
      {children}
      {icon}
    </>
  );
  return href.startsWith("/") || href.startsWith("#") ? (
    <Link href={href} className={cls}>
      {content}
    </Link>
  ) : (
    <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>
      {content}
    </a>
  );
}

