import Link from "next/link";
import type { SiteNavigation } from "@/lib/types";

/**
 * arfro.com promo strip (from the settings): a quiet Deep Navy line above the header, centred text
 * and an underlined link. Phones: the text alone, linked to the offer. A labelled `aside` landmark,
 * so its link is never content outside landmarks.
 */
export function ArfroPromoStrip({ promo }: { promo: SiteNavigation["promoBar"] }) {
  if (!promo?.text) return null;
  return (
    <aside aria-label="Promotion" className="bg-arfro-navy font-arfro text-xs font-semibold tracking-[0.01em] text-white/90 md:text-[13px]">
      <div className="site-gutter flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-center">
        {promo.link ? (
          <Link href={promo.link.href} className="inline-flex min-h-6 items-center text-white/90 hover:text-white md:hidden">
            {promo.text}
          </Link>
        ) : (
          <span className="md:hidden">{promo.text}</span>
        )}
        <span className="hidden md:inline">{promo.text}</span>
        {promo.link && (
          <Link
            href={promo.link.href}
            className="text-arfro-sky hover:text-arfro-sky hidden min-h-6 items-center underline decoration-1 underline-offset-[3px] hover:decoration-2 md:inline-flex"
          >
            {promo.link.label}
          </Link>
        )}
      </div>
    </aside>
  );
}
