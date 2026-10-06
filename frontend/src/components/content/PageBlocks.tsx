import Link from "next/link";
import { Fragment } from "react";
import type { Block } from "@/lib/content/types";
import { ArrowIcon, GRID_2, GRID_3, GRID_4, IconTile, PlaceholderChip, Section, SectionTitle, StepList } from "./blocks";

/**
 * Renders the Builder blocks of a static page (back office: Pages légales et statiques).
 * Block types and their look come from the design files: paragraph (À propos intro), services
 * ("Ce que nous faisons"), commitments ("Nos engagements"), promises (Livraison: big cards),
 * steps, info (white info cards, consecutive ones share a 2-column row).
 */

type Item = { title?: string; text?: string; icon?: string; href?: string; bg?: string };

const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() !== "" ? v : undefined);
const items = (v: unknown): Item[] => (Array.isArray(v) ? (v as Item[]) : []);

/** A placeholder of the design ("[DÉLAI PAR VILLE]") rather than real copy. */
export const isPlaceholder = (text: string) => /^\[[^\]]+\]$/.test(text.trim());

export function PageBlocks({ blocks }: { blocks: Block[] }) {
  // Consecutive "info" blocks are laid out side by side (Livraison: Délais / Retours).
  const groups: Block[][] = [];
  for (const block of blocks) {
    const last = groups[groups.length - 1];
    if (block.type === "info" && last?.[0]?.type === "info") last.push(block);
    else groups.push([block]);
  }

  return (
    <>
      {groups.map((group, i) =>
        group[0].type === "info" ? (
          <Section key={i} className={GRID_2}>
            {group.map((b, j) => (
              <InfoCard key={j} data={b.data} />
            ))}
          </Section>
        ) : (
          <Fragment key={i}>{renderBlock(group[0])}</Fragment>
        ),
      )}
    </>
  );
}

function renderBlock(block: Block) {
  const d = block.data;
  switch (block.type) {
    case "paragraph":
      return (
        <Section className="max-w-[860px]">
          <p className="m-0 text-[21px] leading-[1.6] text-pretty">{str(d.text)}</p>
        </Section>
      );
    case "services":
      return (
        <Section>
          <SectionTitle>{str(d.title) ?? "Ce que nous faisons"}</SectionTitle>
          <div className={GRID_4}>
            {items(d.items).map((it) => {
              const inner = (
                <>
                  <IconTile icon={it.icon} />
                  <h3 className="m-0 text-[19px] font-bold">{it.title}</h3>
                  {it.text && <p className="text-ink-2 m-0 text-base leading-[1.5]">{it.text}</p>}
                </>
              );
              const cls = "rounded-20 text-ink flex flex-col gap-3.5 bg-white p-6";
              return it.href ? (
                <Link
                  key={it.title}
                  href={it.href}
                  className={`${cls} hover:text-ink hover:shadow-card-hover transition-[box-shadow,transform] duration-300 hover:-translate-y-[3px]`}
                >
                  {inner}
                </Link>
              ) : (
                <div key={it.title} className={cls}>
                  {inner}
                </div>
              );
            })}
          </div>
        </Section>
      );
    case "commitments":
      return (
        <Section>
          <div className="rounded-28 bg-tint-orange-2 p-6 md:p-12">
            <SectionTitle>{str(d.title) ?? "Nos engagements"}</SectionTitle>
            <div className={GRID_4}>
              {items(d.items).map((it) => (
                <div key={it.text} className="rounded-20 flex items-center gap-3.5 bg-white p-5">
                  <IconTile icon={it.icon} bg="#FDF0E6" size={48} iconSize={24} round />
                  <span className="text-[17px] leading-[1.3] font-bold">{it.text ?? it.title}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      );
    case "promises":
      return (
        <section className={`${GRID_3} pt-8`}>
          {items(d.items).map((it) => (
            <div
              key={it.title}
              className="rounded-28 flex flex-col justify-between gap-6 p-6 md:min-h-[300px] md:p-8"
              style={{ background: it.bg ?? "#E8EFF8" }}
            >
              <IconTile icon={it.icon} bg="#fff" size={64} iconSize={32} radius={20} />
              <div className="flex flex-col gap-2">
                {/* The design uses h2 for these cards (Livraison et paiement). */}
                <h2 className="m-0 text-2xl leading-[1.15] font-bold tracking-[-0.02em] text-balance md:text-[28px]">{it.title}</h2>
                {it.text && <p className="m-0 text-base leading-[1.55]">{it.text}</p>}
              </div>
            </div>
          ))}
        </section>
      );
    case "steps":
      return (
        <Section>
          {str(d.title) && <SectionTitle>{str(d.title)}</SectionTitle>}
          <StepList items={items(d.items).map((it) => ({ title: it.title ?? "", text: it.text }))} />
        </Section>
      );
    case "info":
      return (
        <Section className={GRID_2}>
          <InfoCard data={d} />
        </Section>
      );
    default:
      // Legal "article" blocks are rendered by LegalPage; unknown blocks are skipped.
      return null;
  }
}

function InfoCard({ data }: { data: Record<string, unknown> }) {
  const link = data.link as { label?: string; href?: string } | undefined;
  const text = str(data.text);
  const placeholder = str(data.placeholder);
  return (
    <div className="rounded-24 flex flex-col items-start gap-3.5 bg-white p-5 md:p-8">
      <h2 className="m-0 text-[28px] font-bold tracking-[-0.02em]">{str(data.title)}</h2>
      {text && <p className="text-ink-2 m-0 text-[17px] leading-[1.6]">{text}</p>}
      {placeholder && (
        <span className="self-stretch">
          <PlaceholderChip>{placeholder}</PlaceholderChip>
        </span>
      )}
      {link?.href && link.label && (
        <Link href={link.href} className="flex min-h-11 items-center gap-2 text-base font-bold">
          {link.label.replace(/\s*→$/, "")}
          <ArrowIcon size={18} />
        </Link>
      )}
    </div>
  );
}
