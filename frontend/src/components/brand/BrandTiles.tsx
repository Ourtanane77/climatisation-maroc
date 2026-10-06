import Link from "next/link";
import type { BrandSummary } from "@/lib/product/types";
import { BrandLogo } from "./BrandLogo";

/** Brand tiles (design: Marque LG "Autres marques"): 4 columns, 2 on mobile, logo + caption. */
export function BrandTiles({ brands }: { brands: BrandSummary[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-4">
      {brands.map((b) => (
        <li key={b.slug}>
          <Link
            href={b.href}
            aria-label={b.name}
            className="rounded-20 hover:shadow-card-hover flex h-[120px] flex-col items-center justify-center gap-3 bg-white transition-[box-shadow,transform] duration-300 hover:-translate-y-[3px] md:h-[150px]"
          >
            <BrandLogo brand={b} mobile={{ area: 2400, maxH: 40, maxW: 110 }} desktop={{ area: 3800, maxH: 56, maxW: 150 }} />
            {b.caption && <span className="text-muted text-sm">{b.caption}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
