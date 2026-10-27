import { Reveal } from "@/components/arfro/motion";
import { EditorialImage, Section, resolveArfroImage } from "@/components/arfro/ui";
import { cn } from "@/lib/cn";
import type { ArfroHomeSections } from "@/lib/home/arfro";
import { QuoteGlyph } from "./b/icons";
import { SectionHeader } from "./b/SectionHeader";

type Testimonial = NonNullable<ArfroHomeSections["testimonials"]>["items"][number];

function Meta({ item }: { item: Testimonial }) {
  const details = [item.location, item.type].filter(Boolean).join(" · ");
  return (
    <figcaption className="mt-8 flex items-center gap-4">
      {resolveArfroImage(item.image) && <EditorialImage image={item.image} alt="" sizes="56px" className="size-14 shrink-0 rounded-full" />}
      <div>
        <p className="text-arfro-graphite m-0 text-[15px] font-bold">{item.author}</p>
        {details && <p className="text-arfro-muted m-0 mt-0.5 text-[14px]">{details}</p>}
        {item.products && <p className="text-arfro-muted m-0 mt-0.5 text-[13px]">Équipement : {item.products}</p>}
      </div>
    </figcaption>
  );
}

/**
 * 11b Testimonials (brief: real, verified quotes only). The payload only carries published
 * entries, so today the section is usually null; with no item nothing renders. The first quote is
 * set large as a pull quote, the others in columns under a hairline.
 */
export function ArfroTestimonials({ data }: { data: NonNullable<ArfroHomeSections["testimonials"]> }) {
  const items = data.items.filter((i) => i.quote.trim() && i.author.trim());
  if (items.length === 0) return null;
  const [lead, ...rest] = items;
  const title = data.title ?? "Témoignages";
  return (
    <Section tone="white" id="temoignages" labelledBy="arfro-testimonials-title">
      <SectionHeader id="arfro-testimonials-title" eyebrow={data.eyebrow} title={title} text={data.text} size="m" />
      <Reveal className="mt-14 md:mt-20">
        <figure className="m-0 max-w-[62rem]">
          <QuoteGlyph className="text-arfro-electric" />
          <blockquote className="font-arfro text-arfro-graphite m-0 mt-6 text-[clamp(24px,3vw,40px)] leading-[1.25] font-semibold tracking-[-0.02em] text-pretty">
            {lead.quote}
          </blockquote>
          <Meta item={lead} />
        </figure>
      </Reveal>
      {rest.length > 0 && (
        <Reveal as="ul" stagger className={cn("m-0 mt-16 grid list-none gap-x-12 gap-y-12 p-0 md:mt-20", rest.length > 1 && "md:grid-cols-2", rest.length > 2 && "xl:grid-cols-3")}>
          {rest.map((t) => (
            <li key={`${t.author}-${t.quote.slice(0, 24)}`} className="border-arfro-line border-t pt-8">
              <figure className="m-0">
                <blockquote className="text-arfro-graphite m-0 text-[17px] leading-[1.6]">« {t.quote} »</blockquote>
                <Meta item={t} />
              </figure>
            </li>
          ))}
        </Reveal>
      )}
    </Section>
  );
}
