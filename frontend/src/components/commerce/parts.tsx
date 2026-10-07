import type { ReactNode } from "react";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { MAT, MatIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { dh, publicRef } from "@/lib/format";
import type { ArtKey } from "@/lib/types";

/**
 * Small pieces shared by the basket, checkout, confirmation and tracking pages
 * (design: Panier, Commande, Confirmation, Suivi commande).
 */

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="m-0 text-[24px] font-bold tracking-[-0.01em]">{children}</h2>;
}

/** Page H1: 34 / 44 / 56, weight 700, line-height 1.05. */
export function PageTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={cn("m-0 text-[34px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px] xl:text-[56px]", className)}>{children}</h1>
  );
}

export function Divider() {
  return <div className="bg-divider h-px" />;
}

/** Summary row: "Sous-total … 6 940 Dhs". */
export function SummaryRow({ label, children, tone }: { label: string; children: ReactNode; tone?: "success" }) {
  return (
    <div className="flex justify-between gap-4 text-[16px]">
      <span className="text-ink-2">{label}</span>
      <span className={cn("font-bold", tone === "success" && "text-success")}>{children}</span>
    </div>
  );
}

export function TotalRow({ total }: { total: number }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[18px] font-bold">Total</span>
      <span className="text-[32px] font-extrabold tracking-[-0.02em] whitespace-nowrap">{dh(total)}</span>
    </div>
  );
}

/** Product thumbnail on the #EEF3FA tile: photo, else the design's line drawing. */
export function Thumb({ image, art, dark, alt, className }: { image: string | null; art: ArtKey | null; dark?: boolean; alt: string; className?: string }) {
  return (
    <span className={cn("bg-tint-thumb box-border flex shrink-0 items-center justify-center overflow-hidden", className)}>
      <ProductVisual image={image} art={art} dark={dark} alt={alt} shadow={false} />
    </span>
  );
}

export interface CompactLine {
  sku: string;
  name: string;
  qty: number;
  lineTotal: number;
  image: string | null;
  art: ArtKey | null;
  dark?: boolean;
  href?: string | null;
}

/** Compact order lines (Commande, Confirmation, Suivi): 64×52 thumbnail, "Réf. … · Qté …", total. */
export function CompactLines({ lines }: { lines: CompactLine[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
      {lines.map((l) => (
        <li key={l.sku} className="flex items-center gap-3.5">
          <Thumb image={l.image} art={l.art} dark={l.dark} alt={l.name} className="rounded-12 h-[52px] w-16 p-1.5" />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[15px] leading-[1.3] font-bold">{l.name}</span>
            <span className="text-muted text-[14px]">
              {publicRef(l.sku) ? `Réf. ${l.sku} · ` : ""}Qté {l.qty}
            </span>
          </span>
          <span className="text-[16px] font-bold whitespace-nowrap">{dh(l.lineTotal)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Delivery address block (Confirmation, Suivi). */
export function AddressBlock({ name, phone, address, city }: { name: string; phone: string; address: string; city: string }) {
  return (
    <div className="flex flex-col gap-1.5 text-[16px] leading-normal">
      <strong className="text-[17px]">{name}</strong>
      <span>{phone}</span>
      <span>{address}</span>
      <span>{city}</span>
    </div>
  );
}

export function CashLine() {
  return (
    <span className="flex items-center gap-2.5 text-[15px] font-semibold">
      <MatIcon d={MAT.cash} size={22} className="text-brand" />
      Paiement à la livraison
    </span>
  );
}
