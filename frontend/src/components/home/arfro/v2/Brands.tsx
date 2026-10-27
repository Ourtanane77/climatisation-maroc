import Link from "next/link";
import { Reveal } from "@/components/arfro/motion";
import { DisplayHeading, Eyebrow, Lead, Section } from "@/components/arfro/ui";
import type { ArfroHomeSections } from "@/lib/home/arfro";
import type { HomeData } from "@/lib/home/types";

/** Equal visual area for every logo (wide wordmarks and tall emblems look the same size). */
const LOGO_AREA = 3400;

export function logoWidth(aspect: number | null): number {
  const a = aspect && aspect > 0 ? aspect : 2.5;
  return Math.round(Math.sqrt(LOGO_AREA * a));
}

/**
 * 10 « Des marques reconnues. Une expertise de confiance. » (brief §10): the official logos of the
 * brands Arfro distributes, in a hairline grid beside the heading. Logos sit in grayscale and
 * take their colours on hover/focus; each links to its brand page. A brand without a logo file
 * shows its name. No logos → no section.
 */
export function ArfroBrands({ data, brands }: { data: NonNullable<ArfroHomeSections["brands"]>; brands: HomeData["brands"] }) {
  if (!brands || brands.length === 0) return null;
  return (
    <Section tone="white" id="marques" labelledBy="arfro-brands-title">
      <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
        <Reveal stagger className="lg:col-span-4">
          {data.eyebrow && <Eyebrow>{data.eyebrow}</Eyebrow>}
          <DisplayHeading id="arfro-brands-title" size="m" className={data.eyebrow ? "mt-5" : undefined}>
            {data.title}
          </DisplayHeading>
          {data.text && <Lead className="mt-6">{data.text}</Lead>}
        </Reveal>
        <Reveal
          as="ul"
          stagger
          className="border-arfro-line m-0 grid list-none grid-cols-2 border-t border-l p-0 sm:grid-cols-3 lg:col-span-8"
        >
          {brands.map((b) => (
            <li key={b.name} className="border-arfro-line border-r border-b">
              <Link
                href={b.href}
                aria-label={b.name}
                className="group/b flex aspect-[3/2] items-center justify-center p-6 transition-colors duration-500 hover:bg-arfro-ice focus-visible:bg-arfro-ice"
              >
                {b.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- pre-sized logo renditions (h96 WebP)
                  <img
                    src={b.logo}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={logoWidth(b.aspect)}
                    height={b.aspect ? Math.round(logoWidth(b.aspect) / b.aspect) : undefined}
                    style={{ width: logoWidth(b.aspect) }}
                    className="h-auto max-w-[78%] opacity-60 grayscale transition-[filter,opacity] duration-500 ease-[var(--ease-arfro)] group-hover/b:opacity-100 group-hover/b:grayscale-0 group-focus-visible/b:opacity-100 group-focus-visible/b:grayscale-0 motion-reduce:transition-none"
                  />
                ) : (
                  <span className="font-arfro text-arfro-graphite/70 group-hover/b:text-arfro-graphite text-[22px] font-extrabold tracking-[-0.02em]">{b.name}</span>
                )}
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
