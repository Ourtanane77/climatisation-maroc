import type { ReactNode } from "react";
import { AirflowLines } from "@/components/arfro/AirflowLines";
import { Reveal } from "@/components/arfro/motion";
import { ArfroButtonLink, DisplayHeading, Eyebrow, Lead, Section, type SectionTone } from "@/components/arfro/ui";
import { cn } from "@/lib/cn";
import { phoneFor } from "@/lib/content/copy";
import type { Contact } from "@/lib/content/types";
import { telHref } from "@/lib/phone";
import type { Phone } from "@/lib/types";

/** A phone role of the content API's contact block (Réglages) as a Phone (label, display, tel: link). */
export function contactPhone(contact: Pick<Contact, "phones" | "salesPhone">, label: string): Phone {
  const display = phoneFor(contact, label);
  return { label, display, href: telHref(display) };
}

/**
 * Shared pieces of the Arfro professional journey (espace professionnel, devenir revendeur,
 * demander un devis, solutions, services). Server components; the data always comes from the API
 * or from Réglages (phones, hours), never from this file.
 */

/** Section of the arfro/ui kit broken out of the page column to the full width (main is a centred column). */
export function Band({ className, ...props }: React.ComponentProps<typeof Section>) {
  return <Section {...props} className={cn("bleed", className)} />;
}

export function ArrowRight({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M4 12h15 M13 6l6 6-6 6" />
    </svg>
  );
}

/** Two-digit index of an editorial list (01, 02…). */
export function indexLabel(i: number): string {
  return String(i + 1).padStart(2, "0");
}

/** Page opening: eyebrow, oversized H1, lead and actions; optional right column (photo, contact). */
export function ProHero({
  eyebrow,
  title,
  lead,
  actions,
  aside,
  tone = "white",
}: {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  tone?: SectionTone;
}) {
  const dark = tone === "navy";
  return (
    <Band tone={tone} labelledBy="pro-hero-title" className="mt-4 overflow-hidden" innerClassName="pt-12 md:pt-16 xl:pt-20 pb-14 md:pb-20 xl:pb-24">
      {dark && <AirflowLines variant="dark" className="absolute inset-x-0 bottom-0 h-[60%] w-full" />}
      <div className={cn("relative grid grid-cols-1 items-end gap-10 xl:gap-16", !!aside &&"xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]")}>
        <div className="flex flex-col gap-6">
          <Eyebrow onDark={dark}>{eyebrow}</Eyebrow>
          <DisplayHeading as="h1" size="l" id="pro-hero-title" className={dark ? "text-white" : "text-arfro-navy"}>
            {title}
          </DisplayHeading>
          {lead && <Lead onDark={dark}>{lead}</Lead>}
          {actions && <div className="flex flex-col gap-3 pt-2 md:flex-row md:flex-wrap">{actions}</div>}
        </div>
        {aside}
      </div>
    </Band>
  );
}

/** Section heading block: eyebrow, H2 and optional lead. */
export function SectionHead({
  id,
  eyebrow,
  title,
  lead,
  onDark = false,
  className,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex max-w-[820px] flex-col gap-4", className)}>
      {eyebrow && <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow>}
      <DisplayHeading id={id} size="m" className={onDark ? "text-white" : "text-arfro-navy"}>
        {title}
      </DisplayHeading>
      {lead && <Lead onDark={onDark}>{lead}</Lead>}
    </div>
  );
}

export interface ListItem {
  title: string;
  text?: string | null;
  link?: { label: string; href: string } | null;
}

/** Numbered editorial rows separated by hairlines (steps, constraints, services): no cards. */
export function NumberedList({ items, onDark = false, columns = 1 }: { items: readonly ListItem[]; onDark?: boolean; columns?: 1 | 2 }) {
  return (
    <Reveal as="ol" stagger className={cn("m-0 grid list-none grid-cols-1 p-0", columns === 2 && "md:grid-cols-2 md:gap-x-12")}>
      {items.map((item, i) => (
        <li
          key={item.title}
          className={cn("grid grid-cols-[48px_minmax(0,1fr)] gap-x-4 border-t py-7 md:grid-cols-[72px_minmax(0,1fr)] md:py-9", onDark ? "border-arfro-line-dark" : "border-arfro-line")}
        >
          <span aria-hidden className={cn("font-arfro pt-1 text-[13px] font-bold tracking-[0.14em] tabular-nums", onDark ? "text-arfro-sky" : "text-arfro-blue")}>
            {indexLabel(i)}
          </span>
          <div className="flex flex-col gap-2.5">
            <h3 className={cn("font-arfro m-0 text-[21px] leading-[1.25] font-extrabold tracking-[-0.015em] md:text-[24px]", onDark ? "text-white" : "text-arfro-navy")}>
              {item.title}
            </h3>
            {item.text && <p className={cn("m-0 max-w-[62ch] text-base leading-[1.6]", onDark ? "text-arfro-on-navy" : "text-arfro-muted")}>{item.text}</p>}
            {item.link && (
              <ArfroButtonLink href={item.link.href} variant={onDark ? "link-light" : "link"} className="self-start pt-1" icon={<ArrowRight />}>
                {item.link.label}
              </ArfroButtonLink>
            )}
          </div>
        </li>
      ))}
    </Reveal>
  );
}

/** « Projets et revendeurs » line from Réglages: label, number (tel: link) and opening hours. */
export function PhoneBlock({ phone, hours, onDark = false }: { phone: Phone; hours?: string | null; onDark?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={cn("text-[13px] font-bold tracking-[0.14em] uppercase", onDark ? "text-arfro-on-navy" : "text-arfro-muted")}>{phone.label}</span>
      <a
        href={phone.href}
        className={cn(
          "font-arfro text-[clamp(28px,3vw,40px)] leading-[1.1] font-extrabold tracking-[-0.02em] tabular-nums",
          onDark ? "text-white hover:text-white" : "text-arfro-navy hover:text-arfro-blue",
        )}
      >
        {phone.display}
      </a>
      {hours && <span className={cn("text-[15px]", onDark ? "text-arfro-on-navy" : "text-arfro-muted")}>{hours}</span>}
    </div>
  );
}

/**
 * Closing contact band (navy): headline, the « Projets et revendeurs » phone, WhatsApp and the
 * professional quote. Replaces Climatisation Maroc's ProjectCtaBand on Arfro.
 */
export function ContactBand({
  phone,
  hours,
  whatsappHref,
  title = "Parlons de votre projet.",
  text = "Notre équipe projets et revendeurs vous répond et vous oriente vers le bon équipement.",
}: {
  phone: Phone;
  hours?: string | null;
  whatsappHref?: string | null;
  title?: string;
  text?: string;
}) {
  return (
    <Band tone="navy" labelledBy="pro-contact-title" className="overflow-hidden">
      <AirflowLines variant="dark" className="absolute inset-x-0 top-0 h-full w-full opacity-70" />
      <div className="relative grid grid-cols-1 items-end gap-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:gap-16">
        <SectionHead id="pro-contact-title" eyebrow="ARFRO Business" title={title} lead={text} onDark />
        <div className="flex flex-col gap-7">
          <PhoneBlock phone={phone} hours={hours} onDark />
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
            <ArfroButtonLink href="/demander-un-devis?pro=1" variant="light" icon={<ArrowRight />}>
              Demander un devis
            </ArfroButtonLink>
            {whatsappHref && (
              <ArfroButtonLink href={whatsappHref} variant="outline-light">
                Écrire sur WhatsApp
              </ArfroButtonLink>
            )}
          </div>
        </div>
      </div>
    </Band>
  );
}

/**
 * Arfro look for the shared lead forms (ResellerForm, QuoteForm, SectorQuoteForm) without forking
 * them: same fields, validation and API, only the radii and surfaces are restyled from here.
 */
export function FormFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "arfro-form",
        "[&_input]:rounded-arfro-sm [&_select]:rounded-arfro-sm [&_textarea]:rounded-arfro-sm",
        "[&_button[type=submit]]:rounded-arfro-sm [&_form]:rounded-arfro-md [&_[role=status]]:rounded-arfro-md",
        "[&_legend]:font-arfro [&_legend]:text-arfro-navy [&_legend]:font-extrabold",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Contact aside of the forms: phone, WhatsApp, hours, on a hairline-framed white panel. */
export function ContactAside({ title, phone, hours, whatsappHref, children }: { title: string; phone: Phone; hours?: string | null; whatsappHref?: string | null; children?: ReactNode }) {
  return (
    <aside className="flex flex-col gap-6 xl:sticky xl:top-28">
      <div className="rounded-arfro-md border-arfro-line flex flex-col gap-6 border bg-white p-6 md:p-8">
        <h2 className="font-arfro text-arfro-navy m-0 text-[22px] leading-[1.2] font-extrabold tracking-[-0.015em]">{title}</h2>
        <PhoneBlock phone={phone} hours={hours} />
        {whatsappHref && (
          <ArfroButtonLink href={whatsappHref} variant="outline" className="self-start">
            Écrire sur WhatsApp
          </ArfroButtonLink>
        )}
      </div>
      {children}
    </aside>
  );
}
