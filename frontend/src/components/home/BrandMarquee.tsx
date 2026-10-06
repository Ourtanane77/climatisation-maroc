import Link from "next/link";
import type { BrandLogo } from "@/lib/home/types";

/**
 * Logo size with the same visual area for every brand (design: A = 4600 px², 55 % on mobile),
 * capped at 64 × 170 px (48 × 120 on mobile).
 */
function logoBox(aspect: number, mobile: boolean): { width: number; height: number } {
  const area = (mobile ? 0.55 : 1) * 4600;
  const maxH = mobile ? 48 : 64;
  const maxW = mobile ? 120 : 170;
  let w = Math.sqrt(area * aspect);
  let h = Math.sqrt(area / aspect);
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  if (w > maxW) {
    w = maxW;
    h = w / aspect;
  }
  return { width: Math.round(w), height: Math.round(h) };
}

function Mark({ brand }: { brand: BrandLogo }) {
  if (!brand.logo) return <span className="text-ink text-xl font-extrabold tracking-[-0.03em] md:text-2xl">{brand.name}</span>;
  const aspect = brand.aspect ?? 3;
  const d = logoBox(aspect, false);
  const m = logoBox(aspect, true);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brand.logo}
      alt={brand.name}
      loading="lazy"
      className="block h-[var(--mh)] w-[var(--mw)] object-contain md:h-[var(--dh)] md:w-[var(--dw)]"
      style={{ "--mw": `${m.width}px`, "--mh": `${m.height}px`, "--dw": `${d.width}px`, "--dh": `${d.height}px` } as React.CSSProperties}
    />
  );
}

/** "Nos marques": logos scrolling in a loop (30 s), paused for users who prefer reduced motion. */
export function BrandMarquee({ brands }: { brands: BrandLogo[] }) {
  if (!brands.length) return null;
  const loop = [...brands, ...brands];
  return (
    <section id="marques" aria-labelledby="h-mar" className="scroll-mt-24 pt-10 md:pt-14">
      <style>{`@keyframes cm-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 gap-x-6">
        <h2 id="h-mar" className="m-0 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] md:text-[44px]">
          Nos marques
        </h2>
        <Link href="/marques" className="text-ink hover:text-brand px-2 text-base font-semibold underline underline-offset-4">
          Toutes les marques
        </Link>
      </div>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]">
        <ul className="m-0 flex w-max animate-[cm-marquee_30s_linear_infinite] list-none items-center gap-10 px-0 pt-6 pb-2 hover:[animation-play-state:paused] md:gap-[72px]">
          {loop.map((b, i) => (
            <li key={`${b.href}-${i}`} aria-hidden={i >= brands.length || undefined}>
              <Link
                href={b.href}
                aria-label={b.name}
                tabIndex={i >= brands.length ? -1 : undefined}
                className="flex h-12 flex-none items-center justify-center md:h-16"
              >
                <Mark brand={b} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
