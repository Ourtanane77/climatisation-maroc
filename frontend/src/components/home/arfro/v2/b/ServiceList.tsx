import Link from "next/link";
import { Reveal } from "@/components/arfro/motion";
import { cn } from "@/lib/cn";
import type { ArfroHomeFacts, ArfroLink, ArfroServiceItem } from "@/lib/home/arfro";
import { ArrowGlyph, ServiceGlyph } from "./icons";

/** Links of a service item: its own CTA, or for advice/support items the real advice phone and WhatsApp. */
export function serviceLinks(item: ArfroServiceItem, facts: ArfroHomeFacts | undefined): ArfroLink[] {
  if (item.cta) return [item.cta];
  if ((item.icon !== "advice" && item.icon !== "support") || !facts) return [];
  const links: ArfroLink[] = [];
  if (facts.advicePhone) links.push({ label: `Appeler le ${facts.advicePhone.display}`, href: facts.advicePhone.href });
  if (facts.whatsapp) links.push({ label: "WhatsApp", href: `https://wa.me/${facts.whatsapp}` });
  return links;
}

function ItemLink({ link, onDark }: { link: ArfroLink; onDark?: boolean }) {
  const cls = cn(
    "group/l inline-flex min-h-11 items-center gap-2 text-[15px] font-bold",
    onDark ? "text-arfro-sky hover:text-white" : "text-arfro-blue hover:text-arfro-blue-hover",
  );
  const body = (
    <>
      {link.label}
      <ArrowGlyph className="transition-transform duration-300 ease-[var(--ease-arfro)] group-hover/l:translate-x-1 motion-reduce:transition-none" />
    </>
  );
  return link.href.startsWith("/") ? (
    <Link href={link.href} className={cls}>
      {body}
    </Link>
  ) : (
    <a href={link.href} className={cls} {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>
      {body}
    </a>
  );
}

/**
 * Numbered service pillars (ARFRO Care, Trust): hairline on top, index « 01 », line icon, title,
 * text and links. `columns` lays them side by side on desktop; `rows` stacks them (next to a photo).
 */
export function ServiceList({
  items,
  facts,
  layout = "columns",
  headingLevel = "h3",
  numbered = true,
  className,
}: {
  items: ArfroServiceItem[];
  facts?: ArfroHomeFacts;
  layout?: "columns" | "rows";
  headingLevel?: "h3" | "h4";
  numbered?: boolean;
  className?: string;
}) {
  const H = headingLevel;
  const cols = items.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  return (
    <Reveal as="ol" stagger className={cn("m-0 grid list-none gap-x-10 p-0", layout === "columns" ? cn("gap-y-12", cols) : "gap-y-0", className)}>
      {items.map((item, i) => {
        const links = serviceLinks(item, facts);
        return (
          <li
            key={item.title}
            className={cn(
              "border-arfro-graphite/15 border-t",
              layout === "columns" ? "flex flex-col pt-6" : "grid grid-cols-[auto_1fr] gap-x-6 py-7 last:border-b md:gap-x-8",
            )}
          >
            <div className={cn("text-arfro-blue flex items-center", layout === "columns" ? "justify-between" : "flex-col items-start gap-4 pt-1")}>
              {numbered && <span className="text-arfro-muted text-[12px] font-bold tracking-[0.14em] tabular-nums">{String(i + 1).padStart(2, "0")}</span>}
              <ServiceGlyph icon={item.icon} className="size-7" />
            </div>
            <div className={cn("flex flex-col", layout === "columns" && "mt-8")}>
              <H className="font-arfro text-arfro-graphite m-0 text-[21px] leading-[1.25] font-extrabold tracking-[-0.015em] md:text-[23px]">{item.title}</H>
              {item.text && <p className="text-arfro-muted m-0 mt-3 max-w-[46ch] text-[15px] leading-[1.6] md:text-[16px]">{item.text}</p>}
              {links.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-x-6">
                  {links.map((l) => (
                    <ItemLink key={l.href} link={l} />
                  ))}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </Reveal>
  );
}
