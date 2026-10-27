import { ClipReveal, Reveal } from "@/components/arfro/motion";
import { EditorialImage, Section, resolveArfroImage } from "@/components/arfro/ui";
import { cn } from "@/lib/cn";
import type { ArfroHomeSections } from "@/lib/home/arfro";
import { SectionHeader } from "./b/SectionHeader";

type Project = NonNullable<ArfroHomeSections["projects"]>["items"][number];

function Caption({ item, large }: { item: Project; large?: boolean }) {
  const meta = [item.type, item.location].filter(Boolean).join(" · ");
  return (
    <div className="mt-5">
      {meta && <p className="text-arfro-muted m-0 text-[11px] font-bold tracking-[0.18em] uppercase">{meta}</p>}
      <h3
        className={cn(
          "font-arfro text-arfro-graphite m-0 mt-2 font-extrabold tracking-[-0.02em]",
          large ? "text-[clamp(24px,2.6vw,36px)] leading-[1.1]" : "text-[21px] leading-[1.2]",
        )}
      >
        {item.title}
      </h3>
      {item.description && <p className="text-arfro-muted m-0 mt-3 max-w-[60ch] text-[15px] leading-[1.6]">{item.description}</p>}
      {item.products && (
        <p className="text-arfro-graphite m-0 mt-3 text-[14px]">
          <span className="text-arfro-muted">Équipements : </span>
          {item.products}
        </p>
      )}
    </div>
  );
}

/** Photo of a project, or a typographic warm panel when its slot is empty (never a broken image). */
function Visual({ item, className, sizes }: { item: Project; className: string; sizes: string }) {
  return resolveArfroImage(item.image) ? (
    <ClipReveal className={cn("rounded-arfro-md overflow-hidden", className)}>
      <EditorialImage
        image={item.image}
        alt={item.title}
        sizes={sizes}
        className="size-full"
        imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-arfro)] group-hover:scale-[1.03] motion-reduce:transition-none"
      />
    </ClipReveal>
  ) : (
    <div className={cn("bg-arfro-warm rounded-arfro-md flex items-end p-8", className)}>
      <span aria-hidden className="font-arfro text-arfro-graphite/15 text-[clamp(40px,6vw,88px)] leading-none font-extrabold tracking-[-0.04em]">
        {item.location ?? item.type ?? item.title}
      </span>
    </div>
  );
}

/**
 * 08 « Le confort prend vie. » (brief §8): only real, verified installations (the payload omits
 * unpublished ones; none → nothing renders). Editorial gallery: the first project full width in a
 * cinematic frame, the next ones in an offset two-column rhythm, each with type, location and the
 * products used.
 */
export function ArfroProjects({ data }: { data: NonNullable<ArfroHomeSections["projects"]> }) {
  const items = data.items.filter((i) => i.title.trim());
  if (items.length === 0) return null;
  const [first, ...rest] = items;
  return (
    <Section tone="white" id="projets" labelledBy="arfro-projects-title">
      <SectionHeader id="arfro-projects-title" eyebrow={data.eyebrow} title={data.title} text={data.text} />
      <ul className="m-0 mt-14 list-none p-0 md:mt-20">
        <li className="group">
          <Visual item={first} className="aspect-[4/3] w-full md:aspect-[21/9]" sizes="100vw" />
          <Reveal>
            <Caption item={first} large />
          </Reveal>
        </li>
      </ul>
      {rest.length > 0 && (
        <ul className="m-0 mt-16 grid list-none gap-x-12 gap-y-16 p-0 md:mt-24 md:grid-cols-2">
          {rest.map((item, i) => (
            <li key={`${item.title}-${i}`} className={cn("group", i % 2 === 1 && "md:mt-24")}>
              <Visual item={item} className="aspect-[4/5] w-full" sizes="(max-width: 767px) 100vw, 50vw" />
              <Reveal>
                <Caption item={item} />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
