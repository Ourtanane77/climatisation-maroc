import type { ReactNode } from "react";
import { DisplayHeading, Eyebrow, Lead } from "@/components/arfro/ui";
import { PRO_PERKS } from "@/lib/leads/contacts";
import { Band, FormFrame, indexLabel } from "./parts";

/**
 * Arfro page of a lead form (Devenir revendeur, Demander un devis): editorial heading on Soft Ice,
 * then the shared form (unchanged fields, validation and API) in the Arfro form frame.
 */
export function ArfroFormPage({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: string; children: ReactNode }) {
  return (
    <Band tone="ice" labelledBy="form-page-title" innerClassName="pt-12 md:pt-16 xl:pt-20">
      <div className="flex max-w-[860px] flex-col gap-5">
        <Eyebrow>{eyebrow}</Eyebrow>
        <DisplayHeading as="h1" size="l" id="form-page-title" className="text-arfro-navy">
          {title}
        </DisplayHeading>
        <Lead>{lead}</Lead>
      </div>
      <FormFrame className="pt-4 md:pt-8">{children}</FormFrame>
    </Band>
  );
}

/** Steps or perks as a compact numbered list inside a form aside. */
export function AsideList({ title, items }: { title: string; items: readonly { title: string; text: string }[] }) {
  return (
    <div className="rounded-arfro-md border-arfro-line flex flex-col gap-2 border bg-white p-6 md:p-8">
      <h2 className="font-arfro text-arfro-navy m-0 text-[22px] leading-[1.2] font-extrabold tracking-[-0.015em]">{title}</h2>
      <ol className="m-0 list-none p-0">
        {items.map((item, i) => (
          <li key={item.title} className="border-arfro-line grid grid-cols-[36px_minmax(0,1fr)] gap-x-3 border-b py-4 last:border-b-0">
            <span aria-hidden className="text-arfro-blue pt-0.5 text-[13px] font-bold tracking-[0.14em] tabular-nums">
              {indexLabel(i)}
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-arfro-navy text-[17px] font-bold">{item.title}</span>
              <span className="text-arfro-muted text-[15px] leading-[1.5]">{item.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** « Votre compte revendeur »: the reseller perks shared with Climatisation Maroc (lib/leads/contacts). */
export function ResellerPerks() {
  return <AsideList title="Votre compte revendeur" items={PRO_PERKS} />;
}

/** « Comment ça se passe » of the quote page (no price here: the visit price lives in Réglages). */
export const QUOTE_STEPS = [
  { title: "Demande", text: "Vous décrivez votre projet, nous vous rappelons." },
  { title: "Visite technique", text: "Un technicien mesure et conseille." },
  { title: "Devis détaillé", text: "Appareil, matériel et pose, poste par poste." },
] as const;
