import { ProductArt } from "@/components/catalog/ProductArt";
import { GRID_4, IconTile, PageTitle } from "@/components/content/blocks";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * Service page sections (design: Service.dc.html): hero, "Ce qui est inclus" and the Tarifs band.
 * The hero cut-out photo (uploads/clima-cut2.png) is missing from the design export: the wall unit
 * line drawing stands in until it is added (docs/deviations.md).
 */
export function ServiceHero({ name, h1, text, whatsappHref }: { name: string; h1: string; text: string | null; whatsappHref: string }) {
  return (
    <section className="rounded-28 bg-tint-blue mt-6 grid grid-cols-1 items-center overflow-hidden xl:min-h-[440px] xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="flex flex-col gap-5 px-5 pt-7 pb-2 md:px-10 md:pt-10 xl:p-14">
        <span className="rounded-8 text-brand self-start bg-white px-2.5 py-1 text-sm font-bold">Service · {name}</span>
        <PageTitle>{h1}</PageTitle>
        {text && <p className="text-ink m-0 max-w-[560px] text-[19px] leading-[1.55] text-pretty">{text}</p>}
        <div className="flex flex-col gap-3 pt-1 md:flex-row">
          <ButtonLink href="/demander-un-devis" variant="orange" mobileFull>
            Demander un devis
          </ButtonLink>
          <ButtonLink href={whatsappHref} variant="whatsapp" mobileFull>
            Commander par WhatsApp
          </ButtonLink>
        </div>
      </div>
      <div aria-hidden className="flex min-h-[160px] items-center justify-center px-5 pb-7 md:min-h-[240px] md:px-10 md:py-6 xl:min-h-[300px]">
        <div className="w-full max-w-[640px] drop-shadow-[0_24px_30px_rgba(14,40,70,0.25)]">
          <ProductArt art="mural" className="h-auto w-full" />
        </div>
      </div>
    </section>
  );
}

export function IncludedGrid({ items }: { items: { title: string; icon?: string }[] }) {
  return (
    <div className={GRID_4}>
      {items.map((i) => (
        <div key={i.title} className="rounded-20 flex flex-col gap-4 bg-white p-6">
          <IconTile icon={i.icon} />
          <h3 className="m-0 text-lg leading-[1.3] font-bold">{i.title}</h3>
        </div>
      ))}
    </div>
  );
}

/** "Tarifs" band: the H2 and one white price card per price, in one row on desktop. */
export function PriceBand({ prices }: { prices: { label: string; value: string }[] }) {
  return (
    <div
      className={cn("rounded-24 bg-tint-orange-2 grid grid-cols-1 items-center gap-4 p-6 md:p-12", "md:grid-cols-[repeat(var(--cols),minmax(0,1fr))]")}
      style={{ "--cols": prices.length + 1 } as React.CSSProperties}
    >
      <h2 className="m-0 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] md:text-[44px]">Tarifs</h2>
      {prices.map((p) => (
        <div key={p.label} className="rounded-18 flex flex-col gap-1 bg-white px-6 py-5">
          <span className="text-ink-2 text-base">{p.label}</span>
          <span className="text-[30px] font-extrabold tracking-[-0.02em]">{p.value}</span>
        </div>
      ))}
    </div>
  );
}
