import Link from "next/link";
import { ChevronLeftIcon } from "@/components/ui/icons";
import type { Phone } from "@/lib/types";
import { Logo, type SiteLogo } from "../Logo";
import { PhoneIcon } from "./icons";

/** arfro.com checkout header: kept simple (logo, sales phone, « Retour au panier »), no navigation. */
export function ArfroCheckoutHeader({ logo, phone }: { logo: SiteLogo; phone: Phone }) {
  return (
    <header className="font-arfro text-arfro-graphite border-b border-arfro-line bg-white">
      <div className="site-gutter flex h-16 items-center gap-2 lg:h-[76px] lg:gap-6">
        <Link href="/" aria-label={`${logo.alt}, accueil`} className="flex shrink-0">
          <Logo logo={logo} height={28} className="lg:hidden" />
          <Logo logo={logo} height={34} className="hidden lg:block" />
        </Link>
        <a
          href={phone.href}
          aria-label={`Appeler le ${phone.display}`}
          className="text-arfro-graphite hover:text-arfro-graphite hover:bg-arfro-ice ml-auto flex h-11 min-w-11 items-center justify-center gap-2 rounded-full text-[15px] font-bold whitespace-nowrap md:px-3"
        >
          <PhoneIcon size={18} />
          <span className="hidden md:inline">{phone.display}</span>
        </a>
        <Link
          href="/panier"
          className="rounded-arfro-sm text-arfro-graphite hover:bg-arfro-graphite flex h-11 items-center gap-1.5 border border-arfro-graphite/40 pr-[18px] pl-3.5 text-sm font-bold whitespace-nowrap transition-colors hover:text-white"
        >
          <ChevronLeftIcon size={16} />
          Retour au panier
        </Link>
      </div>
    </header>
  );
}
