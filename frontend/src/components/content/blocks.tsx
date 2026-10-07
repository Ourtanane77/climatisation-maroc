import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { DuoIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { telHref } from "@/lib/phone";
import { CONTENT_ICONS, SECTOR_SCENES } from "./icons";

/**
 * Building blocks shared by the content pages (Solutions, secteur, services, À propos, Livraison,
 * pages légales, ville). Sizes follow the design scripts: H1 34/44/56, H2 32/44, section gap 40/56.
 */

export const GRID_4 = "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4";
export const GRID_3 = "grid grid-cols-1 gap-4 md:grid-cols-3";
export const GRID_2 = "grid grid-cols-1 gap-4 md:grid-cols-2";

export const H1_CLASS = "m-0 text-[34px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px] xl:text-[56px]";

export function PageTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={cn(H1_CLASS, className)}>{children}</h1>;
}

export function SectionTitle({ children, id, className }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <h2 id={id} className={cn("m-0 mb-6 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px]", className)}>
      {children}
    </h2>
  );
}

/** A page section with the design's vertical rhythm (padding-top secGap). */
export function Section({ children, className, id, ...rest }: { children: ReactNode; className?: string; id?: string } & React.HTMLAttributes<HTMLElement>) {
  return (
    <section id={id} className={cn("pt-10 md:pt-14", className)} {...rest}>
      {children}
    </section>
  );
}

/** Two-tone icon in a rounded tile (52px, radius 16) or a circle. */
export function IconTile({
  icon,
  bg = "#E8EFF8",
  size = 52,
  iconSize = 26,
  round = false,
  radius = 16,
}: {
  icon?: string;
  bg?: string;
  size?: number;
  iconSize?: number;
  round?: boolean;
  radius?: number;
}) {
  const paths = icon ? CONTENT_ICONS[icon] : undefined;
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center"
      style={{ width: size, height: size, background: bg, borderRadius: round ? "50%" : radius }}
    >
      {paths && <DuoIcon paths={paths} size={iconSize} />}
    </span>
  );
}

export function ArrowIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14 M13 6l6 6-6 6" />
    </svg>
  );
}

/** Numbered steps as white cards ("Comment se déroule un projet", "Comment ça se passe"…). */
export function StepList({ items }: { items: readonly { title: string; text?: string }[] }) {
  return (
    <ol className={cn(GRID_4, "m-0 list-none p-0")}>
      {items.map((s, i) => (
        <li key={s.title} className="rounded-20 flex flex-col gap-3 bg-white p-6">
          <span className="bg-brand flex size-11 items-center justify-center rounded-full text-lg font-extrabold text-white">{i + 1}</span>
          <h3 className="m-0 text-[19px] font-bold">{s.title}</h3>
          {s.text && <p className="text-ink-2 m-0 text-base leading-[1.5]">{s.text}</p>}
        </li>
      ))}
    </ol>
  );
}

/**
 * CTA band. "blue": white text on brand blue (Solutions, Service); "light": #E8EFF8 panel
 * (À propos, ContactCtaBand). Buttons stack full width on mobile.
 */
export function CtaBand({ title, text, variant = "blue", children }: { title: string; text?: ReactNode; variant?: "blue" | "light"; children: ReactNode }) {
  const blue = variant === "blue";
  return (
    <div className={cn("rounded-28 flex flex-wrap items-center justify-between gap-6 p-6 md:p-12", blue ? "bg-brand text-white" : "bg-tint-blue text-ink")}>
      <div className="flex max-w-[640px] flex-col gap-2">
        <h2 className={cn("m-0 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px]", blue && "text-white")}>{title}</h2>
        {text && <p className={cn("m-0 text-[17px] leading-[1.55]", blue ? "text-footer-text-2" : "text-ink-2")}>{text}</p>}
      </div>
      <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">{children}</div>
    </div>
  );
}

/** "Parlons de votre projet" band of the pro pages (Solutions, secteur, Service). */
export function ProjectCtaBand({ phone }: { phone: string }) {
  return (
    <CtaBand title="Parlons de votre projet" text={`Projets et revendeurs : ${phone}, du lundi au samedi de 9h à 19h.`}>
      <ButtonLink href="/demander-un-devis?pro=1" variant="orange" mobileFull>
        Demander un devis
      </ButtonLink>
      <ButtonLink href={telHref(phone)} variant="white" mobileFull>
        Appeler le {phone}
      </ButtonLink>
    </CtaBand>
  );
}

/** Sector line drawing (SCN), viewBox 240×160, blue and orange strokes. */
export function SectorScene({
  scene,
  width = "78%",
  strokeWidth = 2.4,
  className,
  style,
}: {
  scene: string | null;
  width?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const paths = scene ? SECTOR_SCENES[scene] : undefined;
  if (!paths) return null;
  return (
    <svg
      viewBox="0 0 240 160"
      width={width}
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("block", className)}
      style={{ maxHeight: "86%", ...style }}
    >
      <path d={paths[0]} stroke="#0B5CAD" />
      <path d={paths[1]} stroke="#F4731F" />
    </svg>
  );
}

/** Sector card (hub grid, "Autres secteurs"): visual 4/3, name, tagline, round arrow. */
export function SectorCard({
  sector,
}: {
  sector: { name: string; tagline: string | null; scene: string | null; bg: string | null; image: string | null; href: string };
}) {
  return (
    <Link
      href={sector.href}
      className="rounded-24 text-ink hover:text-ink ease-design hover:shadow-card-hover flex flex-col overflow-hidden bg-white transition-[box-shadow,transform] duration-350 hover:-translate-y-1"
    >
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden" style={{ background: sector.bg ?? "#E8EFF8" }}>
        {sector.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sector.image} alt={sector.name} className="block size-full object-cover" />
        ) : (
          <SectorScene scene={sector.scene} />
        )}
      </div>
      <div className="flex flex-1 items-end gap-3 px-5 pt-[18px] pb-5">
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-[19px] leading-[1.25] font-bold">{sector.name}</span>
          {sector.tagline && <span className="text-ink-2 text-[15px] leading-[1.4]">{sector.tagline}</span>}
        </span>
        <span className="bg-bg text-ink flex size-11 shrink-0 items-center justify-center rounded-full">
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}
