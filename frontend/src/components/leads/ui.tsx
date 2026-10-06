import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { DuoIcon, MAT, MatIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { Phone } from "@/lib/types";

/**
 * Pieces shared by the lead and pro pages (Demander un devis, Contact, Devenir revendeur,
 * Espace professionnel, Connexion, Commande rapide), sized as in the design files.
 */

export const H1 = "m-0 text-[34px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px] xl:text-[56px]";
export const H2 = "m-0 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] md:text-[44px]";
export const CARD_H2 = "m-0 text-2xl font-bold tracking-[-0.01em]";
/** Form and info cards: white, radius 24, padding 20 (mobile) / 32. */
export const CARD = "rounded-24 box-border bg-white p-5 md:p-8";
/** Form + 400px aside, single column below 1100. */
export const FORM_GRID = "grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]";
/** Field grid: 2 columns from 760, 1 on mobile. */
export const FIELDS = "grid grid-cols-1 gap-4 md:grid-cols-2";

export function PageIntro({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex max-w-[820px] flex-col gap-3 pt-6">
      <h1 className={H1}>{title}</h1>
      {children && <p className="text-ink-2 m-0 text-lg leading-[1.55] text-pretty">{children}</p>}
    </div>
  );
}

export function CheckIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#1F9D57" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Success state that replaces a form ("Demande envoyée", "Votre demande est enregistrée."). */
export function SuccessPanel({ title, children, actions }: { title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div role="status" className={cn(CARD, "flex flex-col items-start gap-4")}>
      <span className="bg-success-bg flex size-[72px] items-center justify-center rounded-full">
        <CheckIcon />
      </span>
      <h2 className="m-0 max-w-[620px] text-[32px] font-bold tracking-[-0.02em] text-balance">{title}</h2>
      {children}
      {actions}
    </div>
  );
}

/** Row of success actions: stacked full width on mobile. */
export function ActionRow({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">{children}</div>;
}

/** "Projets et revendeurs" phone link with a round icon. */
export function PhoneLine({ phone, circle = "bg-white" }: { phone: Phone; circle?: string }) {
  return (
    <a href={phone.href} className="text-ink hover:text-brand flex items-center gap-3">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", circle)}>
        <MatIcon d={MAT.phone} size={22} className="text-brand" />
      </span>
      <span className="flex flex-col">
        <span className="text-ink-2 text-sm">{phone.label}</span>
        <span className="text-[22px] font-extrabold">{phone.display}</span>
      </span>
    </a>
  );
}

/** Phone + WhatsApp + hours card of the form asides. */
export function CallbackCard({
  title,
  phone,
  whatsappHref,
  hours,
  tone = "tint",
}: {
  title?: string;
  phone: Phone;
  whatsappHref: string;
  hours: string;
  tone?: "tint" | "white";
}) {
  return (
    <div className={cn("rounded-24 flex flex-col gap-4", tone === "tint" ? "bg-tint-blue p-6" : "bg-white p-5 md:p-8")}>
      {title && <h2 className={CARD_H2}>{title}</h2>}
      <PhoneLine phone={phone} circle={tone === "tint" ? "bg-white" : "bg-tint-blue"} />
      <ButtonLink href={whatsappHref} variant="whatsapp" full>
        WhatsApp
      </ButtonLink>
      <span className="text-ink-2 text-[15px]">{hours}</span>
    </div>
  );
}

/** Vertical numbered timeline ("Comment ça se passe", "Comment ça marche"). */
export function Timeline({ steps, size = "sm" }: { steps: readonly { title: string; text: string }[]; size?: "sm" | "lg" }) {
  const lg = size === "lg";
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {steps.map((s, i) => (
        <li key={s.title} className={cn("flex", lg ? "gap-4" : "gap-3.5")}>
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "bg-brand flex shrink-0 items-center justify-center rounded-full font-extrabold text-white",
                lg ? "size-11 text-lg" : "size-9 text-[15px]",
              )}
            >
              {i + 1}
            </span>
            <span className={cn("bg-step-line w-0.5 flex-1", lg ? "min-h-5" : "min-h-4", i === steps.length - 1 && "invisible")} />
          </div>
          <div className={cn("flex flex-col", lg ? "gap-1 pt-2 pb-7" : "gap-0.5 pt-1.5 pb-[18px]")}>
            <span className={cn("font-bold", lg ? "text-xl" : "text-[17px]")}>{s.title}</span>
            <span className={cn("text-ink-2", lg ? "text-base leading-[1.5]" : "text-[15px] leading-[1.45]")}>{s.text}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Two-tone icon in a tile (perks, needs, audience cards). */
export function IconTile({ paths, size = 52, icon = 26, radius = 16, bg = "bg-tint-blue" }: { paths: readonly [string, string]; size?: number; icon?: number; radius?: number; bg?: string }) {
  return (
    <span aria-hidden className={cn("flex shrink-0 items-center justify-center", bg)} style={{ width: size, height: size, borderRadius: radius }}>
      <DuoIcon paths={paths} size={icon} />
    </span>
  );
}
