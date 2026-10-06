import Link from "next/link";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { dh } from "@/lib/format";
import type { InlineProduct } from "@/lib/blog/types";

/** Air conditioners matching the recommended power (calculator result column). */
export function MatchList({ products }: { products: InlineProduct[] }) {
  if (!products.length) return null;
  return (
    <ul className="m-0 list-none rounded-[24px] bg-white px-5 py-2">
      {products.map((p, i) => (
        <li key={p.sku}>
          <Link
            href={p.href}
            className={`text-ink hover:text-brand flex items-center gap-3.5 py-3 ${i < products.length - 1 ? "border-divider border-b" : ""}`}
          >
            <span className="bg-tint-thumb box-border flex h-14 w-[76px] shrink-0 items-center justify-center rounded-[12px] p-1.5">
              <ProductVisual image={p.image} art={p.art ?? "mural"} dark={p.dark} alt="" shadow={false} />
            </span>
            <span className="min-w-0 flex-1 text-[15px] leading-[1.35] font-semibold">{p.name}</span>
            <span className="text-[17px] font-extrabold whitespace-nowrap">{dh(p.price)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
