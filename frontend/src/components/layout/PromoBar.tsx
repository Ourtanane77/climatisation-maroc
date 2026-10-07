import Link from "next/link";
import type { SiteNavigation } from "@/lib/types";

/** Blue top bar ("Super promo : jusqu'à -30 % sur les climatiseurs · Voir les promotions"), from settings. */
export function PromoBar({ promo }: { promo: SiteNavigation["promoBar"] }) {
  if (!promo?.text) return null;
  return (
    <div className="bg-brand flex min-h-[52px] flex-wrap items-center justify-center gap-3.5 px-4 py-1.5 text-center text-sm font-semibold text-white">
      <span>{promo.text}</span>
      {promo.link && (
        <Link href={promo.link.href} className="hover:text-tint-orange inline-flex min-h-6 items-center font-bold text-white underline">
          {promo.link.label}
        </Link>
      )}
    </div>
  );
}
