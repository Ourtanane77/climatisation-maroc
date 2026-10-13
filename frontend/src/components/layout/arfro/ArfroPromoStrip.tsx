import Link from "next/link";
import type { SiteNavigation } from "@/lib/types";

/** arfro.com promo strip: dark ink bar, centred text and an underlined white link (from settings). */
export function ArfroPromoStrip({ promo }: { promo: SiteNavigation["promoBar"] }) {
  if (!promo?.text) return null;
  return (
    <div className="bg-ink text-xs font-semibold text-white md:text-[13px]">
      <div className="site-gutter flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-center md:py-2.5">
        {/* Phones: the text alone on one line (Mobile.dc.html), linked to the offer. */}
        {promo.link ? (
          <Link href={promo.link.href} className="inline-flex min-h-6 items-center text-white hover:text-white md:hidden">
            {promo.text}
          </Link>
        ) : (
          <span className="md:hidden">{promo.text}</span>
        )}
        <span className="hidden md:inline">{promo.text}</span>
        {promo.link && (
          <Link
            href={promo.link.href}
            className="hidden min-h-6 items-center text-white underline underline-offset-[3px] hover:text-white hover:decoration-2 md:inline-flex"
          >
            {promo.link.label}
          </Link>
        )}
      </div>
    </div>
  );
}
