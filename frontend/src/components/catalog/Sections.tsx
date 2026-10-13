import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { BrandTile, CategoryTile } from "@/lib/catalog/types";
import { SITE_KEY } from "@/lib/site";
import { CategoryVisual } from "./CategoryVisual";

/**
 * Building blocks of the range and category pages (design: Climatisation.dc.html,
 * Categorie Climatiseurs muraux.dc.html). Server components. On arfro.com they take the Arfro look
 * (grey #F2F4F7 panels on a white page, docs/deviations.md « Arfro restyle »).
 */

const ARFRO = SITE_KEY === "arfro";

/** Section with the shared H2 (32 mobile / 44, margin-bottom 32) and the `secGap` top padding. */
export function Section({ id, title, children, className }: { id?: string; title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={cn(ARFRO ? "pt-12 md:pt-[72px]" : "pt-10 md:pt-14", className)} aria-labelledby={title && id ? `${id}-title` : undefined}>
      {title && (
        <h2
          id={id ? `${id}-title` : undefined}
          className={cn(
            "m-0",
            ARFRO
              ? "mb-6 text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em] md:text-[30px]"
              : "mb-8 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] md:text-[44px]",
          )}
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

/** H1 (32 / 44 / 56) and intro paragraph. */
export function PageIntro({ title, intro, dense = false }: { title: string; intro?: string | null; dense?: boolean }) {
  return (
    <section className={cn("flex max-w-[820px] flex-col", dense ? "gap-3 pt-6" : "gap-4 pt-8")}>
      <h1
        className={cn("m-0 font-bold tracking-[-0.035em] md:text-[44px] xl:text-[56px]", dense ? "text-[34px] leading-[1.05]" : "text-[32px] leading-[1.02]")}
      >
        {title}
      </h1>
      {intro && <p className={cn("text-ink-2 m-0 text-lg", dense ? "leading-[1.55]" : "leading-[1.6]")}>{intro}</p>}
    </section>
  );
}

/**
 * Arfro category hero (Categorie.dc.html): rounded grey panel with the H1 (48/800), the intro, the
 * sibling pills (active one ink) and the category's cut-out picture on the right.
 */
export function CategoryHero({
  title,
  intro,
  pills = [],
  pillsLabel = "Types",
  visual,
  children,
}: {
  title: string;
  intro?: string | null;
  pills?: { label: string; href: string; active: boolean }[];
  pillsLabel?: string;
  visual?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-24 bg-bg flex flex-wrap items-center gap-6 overflow-hidden px-6 py-8 md:gap-10 md:px-14 md:py-12">
      <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-4">
        <h1 className="m-0 text-[34px] leading-[1.05] font-extrabold tracking-[-0.025em] md:text-[48px]">{title}</h1>
        {intro && <p className="text-muted m-0 max-w-[560px] text-base leading-[1.55] md:text-[17px]">{intro}</p>}
        {pills.length > 1 && (
          <nav aria-label={pillsLabel} className="flex flex-wrap gap-2 pt-2">
            {pills.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                scroll={false}
                aria-current={p.active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center rounded-full px-[18px] text-sm font-bold whitespace-nowrap",
                  p.active ? "bg-ink text-white hover:text-white" : "text-ink hover:text-brand bg-white",
                )}
              >
                {p.label}
              </Link>
            ))}
          </nav>
        )}
        {children}
      </div>
      {visual && (
        <div aria-hidden className="flex min-w-0 flex-[0_1_460px] items-center justify-center [&_img]:max-h-[160px] md:[&_img]:max-h-[320px]">
          {visual}
        </div>
      )}
    </section>
  );
}

/** "Choisir un type de …": coloured tiles with the drawing at the bottom. */
export function TypeTiles({ tiles }: { tiles: CategoryTile[] }) {
  const artWidth: Record<string, string> = { gainable: "100%", cassette: "52%", console: "38%" };
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {tiles.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn(
            "rounded-24 text-ink hover:text-ink ease-design relative flex min-h-[300px] flex-col gap-1.5 overflow-hidden transition-transform duration-300 hover:-translate-y-1 md:min-h-[340px]",
            ARFRO ? "bg-bg p-7" : "p-6",
          )}
          style={ARFRO ? undefined : { background: t.bg ?? "#E8EFF8" }}
        >
          <span className={cn("text-[26px] leading-[1.15]", ARFRO ? "font-extrabold tracking-[-0.02em]" : "font-bold")}>{t.shortName ?? t.name}</span>
          {t.text && <span className="text-ink-2 max-w-[80%] text-[15px] leading-[1.4]">{t.text}</span>}
          <span aria-hidden className="absolute inset-x-6 bottom-5 flex h-[55%] items-end justify-center">
            <CategoryVisual
              href={t.href}
              image={t.image}
              art={t.art}
              sizes="(min-width: 1100px) 300px, (min-width: 760px) 45vw, 90vw"
              className="h-auto max-h-full w-auto max-w-full object-contain"
              artClassName="flex max-h-full items-end justify-center"
              artStyle={{ width: (t.art && artWidth[t.art]) || "80%" }}
            />
          </span>
        </Link>
      ))}
    </div>
  );
}

/** "Climatiseurs par puissance" pills. */
export function PowerChips({ powers }: { powers: { label: string; sub: string; href: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {powers.map((p) => (
        <Link
          key={p.label}
          href={p.href}
          className={cn(
            "text-ink hover:text-brand group flex min-h-16 flex-col justify-center rounded-full px-[22px] py-2",
            ARFRO ? "bg-bg hover:shadow-[inset_0_0_0_2px_var(--color-brand)]" : "border-border hover:border-brand border-[1.5px] bg-white",
          )}
        >
          <span className={cn("text-lg leading-[1.2]", ARFRO ? "font-extrabold" : "font-bold")}>{p.label}</span>
          <span className="text-muted group-hover:text-brand text-sm">{p.sub}</span>
        </Link>
      ))}
    </div>
  );
}

/**
 * Brand logo tiles. Logos get the same visual area whatever their shape (design heights: LG 40,
 * Carrier 40, CIAT 36, Fitco 64 for a 160px max width).
 */
export function BrandTiles({ brands }: { brands: BrandTile[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {brands.map((b) => {
        const aspect = b.logoAspect ?? 2.5;
        const height = Math.round(Math.min(64, Math.max(32, Math.sqrt(3400 / aspect))));
        return (
          <Link
            key={b.slug}
            href={b.href}
            className={cn(
              "hover:shadow-tile-hover text-ink flex h-[120px] flex-col items-center justify-center gap-1.5 transition-shadow",
              ARFRO ? "bg-bg rounded-24 [&_img]:mix-blend-multiply" : "rounded-20 bg-white",
            )}
            aria-label={b.note ? `${b.name} · ${b.note}` : b.name}
          >
            {b.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.logo} alt={b.name} style={{ height, maxWidth: 160 }} className="w-auto object-contain" loading="lazy" />
            ) : (
              <span className="text-2xl font-extrabold">{b.name}</span>
            )}
            {b.note && <span className="text-brand text-sm font-bold">{b.note}</span>}
          </Link>
        );
      })}
    </div>
  );
}

const GUIDE_BGS = ["#DCE8F5", "#FCE6D6", "#E8EFF8"];

/** "Guides associés" cards (range page). */
export function GuideCards({ guides }: { guides: { title: string; href: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {guides.map((g, i) => (
        <Link
          key={g.href}
          href={g.href}
          className={cn(
            "rounded-24 text-ink hover:text-ink flex min-h-[200px] flex-col justify-between gap-6 p-7",
            ARFRO && "bg-bg hover:shadow-[inset_0_0_0_2px_var(--color-brand)]",
          )}
          style={ARFRO ? undefined : { background: GUIDE_BGS[i % GUIDE_BGS.length] }}
        >
          <h3 className={cn("m-0 text-2xl leading-[1.2]", ARFRO ? "font-extrabold tracking-[-0.01em]" : "font-bold")}>{g.title}</h3>
          <span className="text-brand text-base font-bold">Lire le guide</span>
        </Link>
      ))}
    </div>
  );
}

/** "Guides associés" pills (category page). */
export function GuidePills({ guides }: { guides: { title: string; href: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {guides.map((g) => (
        <Link
          key={g.href}
          href={g.href}
          className={cn(
            "text-ink hover:text-brand flex min-h-[52px] items-center rounded-full px-[22px] py-2 text-base font-bold",
            ARFRO ? "bg-bg" : "bg-white",
          )}
        >
          {g.title}
        </Link>
      ))}
    </div>
  );
}

/** Sister type chips under the category intro (active one black). */
export function SisterChips({ items }: { items: { label: string; href: string; active: boolean }[] }) {
  if (items.length < 2) return null;
  return (
    <nav aria-label="Types" className="flex flex-wrap gap-2 pt-5">
      {items.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          aria-current={s.active ? "page" : undefined}
          className={cn(
            "flex h-11 items-center rounded-full border-[1.5px] px-[18px] text-[15px] font-bold",
            s.active ? "border-ink bg-ink text-white hover:text-white" : "border-control text-ink hover:border-ink hover:text-ink bg-white",
          )}
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}

/** Blue advice band with the quote and WhatsApp buttons (range page, `#contact`). */
export function AdviceCta({ title, text, whatsappHref }: { title: string; text: string; whatsappHref: string }) {
  return (
    <section id="contact" className="py-10 md:py-14">
      <div className={cn("rounded-24 flex flex-wrap items-center justify-between gap-6 p-6 md:p-12", ARFRO ? "bg-bg" : "bg-tint-blue")}>
        <div>
          <h2
            className={cn(
              "m-0",
              ARFRO
                ? "text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em] md:text-[30px]"
                : "text-[32px] leading-[1.05] font-bold tracking-[-0.03em] md:text-[44px]",
            )}
          >
            {title}
          </h2>
          <p className="text-ink-2 mt-2 mb-0 text-lg">{text}</p>
        </div>
        <div className="flex w-full flex-wrap gap-3 md:w-auto">
          <ButtonLink href="/demander-un-devis" variant="orange" className="h-[52px] flex-1 px-[26px]">
            Demander un devis
          </ButtonLink>
          <ButtonLink href={whatsappHref} variant="whatsapp" className="h-[52px] flex-1 px-[26px]">
            Commander par WhatsApp
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
