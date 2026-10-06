import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { WhatsAppIcon } from "./icons";

/**
 * Pill buttons from the design: 56px primary CTAs (orange, blue, WhatsApp, outline, white),
 * smaller sizes for toolbars, and the 54px rounded "card" button used on product cards.
 */
export type ButtonVariant = "orange" | "blue" | "whatsapp" | "outline" | "white" | "card" | "ghost-white";
export type ButtonSize = "lg" | "md" | "sm" | "xs";

const variants: Record<ButtonVariant, string> = {
  orange: "bg-accent text-white hover:bg-accent-hover hover:text-white",
  blue: "bg-brand text-white hover:bg-brand-hover hover:text-white",
  whatsapp: "bg-whatsapp text-white hover:brightness-95 hover:text-white",
  outline: "bg-white text-ink border-[1.5px] border-ink hover:bg-ink hover:text-white",
  white: "bg-white text-ink hover:bg-tint-blue hover:text-ink",
  card: "bg-white text-ink border-[1.5px] border-line-strong rounded-12! hover:bg-ink hover:border-ink hover:text-white",
  "ghost-white": "border-[1.5px] border-white/70 text-white hover:bg-white/15 hover:text-white",
};

const sizes: Record<ButtonSize, string> = {
  lg: "h-14 px-7 text-base",
  md: "h-12 px-6 text-base",
  sm: "h-11 px-[18px] text-[15px]",
  xs: "h-10 px-4 text-sm",
};

interface Common {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Full width on mobile only (CTA groups stack on mobile in the design). */
  mobileFull?: boolean;
  full?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

function classes({ variant = "orange", size = "lg", mobileFull, full, className }: Omit<Common, "children" | "icon">) {
  return cn(
    "inline-flex items-center justify-center gap-2.5 rounded-full font-bold whitespace-nowrap transition-[background-color,color,border-color,filter] duration-200 select-none",
    "disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    variant === "card" ? "h-[54px] px-4 text-[17px]" : sizes[size],
    full && "w-full",
    mobileFull && "w-full md:w-auto",
    className,
  );
}

export function Button({
  variant,
  size,
  mobileFull,
  full,
  icon,
  className,
  children,
  type = "button",
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes({ variant, size, mobileFull, full, className })} {...rest}>
      {variant === "whatsapp" && !icon ? <WhatsAppIcon size={20} /> : icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  mobileFull,
  full,
  icon,
  className,
  children,
  external,
  ...rest
}: Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; external?: boolean }) {
  const content = (
    <>
      {variant === "whatsapp" && !icon ? <WhatsAppIcon size={20} /> : icon}
      {children}
    </>
  );
  const cls = classes({ variant, size, mobileFull, full, className });
  const isExternal = external ?? /^(https?:|tel:|mailto:)/.test(href);
  if (isExternal) {
    return (
      <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {content}
    </Link>
  );
}
