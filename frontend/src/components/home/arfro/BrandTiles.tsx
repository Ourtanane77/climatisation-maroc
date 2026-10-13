import Link from "next/link";
import type { BrandLogo } from "@/lib/home/types";

/**
 * « Nos marques » (Main.dc.html): bordered tiles with the brand logos, « Distributeur officiel »
 * under the brands flagged official in the back office. Two full rows (8 brands); the others are
 * on « Toutes les marques ».
 */
export function BrandTiles({ brands, official }: { brands: BrandLogo[]; official: Set<string> }) {
  if (!brands.length) return null;
  return (
    <section id="marques" aria-labelledby="h-mar" className="scroll-mt-24 pt-11 md:pt-[88px]">
      <div className="mb-[18px] flex flex-wrap items-end justify-between gap-4 md:mb-6">
        <h2 id="h-mar" className="m-0 text-2xl font-extrabold tracking-[-0.02em] md:text-[34px]">
          Nos marques
        </h2>
        <Link href="/marques" className="text-brand -my-3 inline-flex min-h-11 items-center text-[15px] font-bold">
          Toutes les marques
        </Link>
      </div>
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4 md:gap-4">
        {brands.slice(0, 8).map((b) => (
          <li key={b.href}>
            <Link
              href={b.href}
              className="hover:border-ink flex h-[100px] flex-col items-center justify-center gap-2.5 rounded-[22px] border border-[#E3E7EE] px-4 transition-colors md:h-[120px]"
            >
              {b.logo ? (
                // Logos are served pre-sized by the API (h96 WebP).
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.logo}
                  alt={b.name}
                  loading="lazy"
                  decoding="async"
                  height={40}
                  width={Math.round(40 * (b.aspect ?? 3))}
                  className="block h-8 w-auto max-w-[70%] object-contain md:h-10"
                />
              ) : (
                <span className="text-ink text-xl font-extrabold tracking-[-0.03em]">{b.name}</span>
              )}
              {official.has(b.href) && <span className="text-brand text-xs font-bold">Distributeur officiel</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
