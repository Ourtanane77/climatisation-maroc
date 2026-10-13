import Link from "next/link";
import { ChevronLeftIcon } from "@/components/ui/icons";
import type { Phone } from "@/lib/types";
import { Logo, type SiteLogo } from "../Logo";

/** arfro.com checkout header: the white Arfro row reduced to logo, sales phone and « Retour au panier ». */
export function ArfroCheckoutHeader({ logo, phone }: { logo: SiteLogo; phone: Phone }) {
  return (
    <header className="border-border border-b bg-white">
      <div className="site-gutter flex h-16 items-center gap-2 lg:h-[76px] lg:gap-6">
        <Link href="/" aria-label={`${logo.alt}, accueil`} className="flex shrink-0">
          <Logo logo={logo} height={28} className="lg:hidden" />
          <Logo logo={logo} height={34} className="hidden lg:block" />
        </Link>
        <a
          href={phone.href}
          aria-label={`Appeler le ${phone.display}`}
          className="text-ink hover:text-ink hover:bg-bg ml-auto flex h-11 min-w-11 items-center justify-center gap-2 rounded-full text-[15px] font-bold whitespace-nowrap md:px-3"
        >
          <svg
            aria-hidden
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
          </svg>
          <span className="hidden md:inline">{phone.display}</span>
        </a>
        <Link
          href="/panier"
          className="border-ink text-ink hover:bg-ink flex h-11 items-center gap-1.5 rounded-full border-[1.5px] pr-[18px] pl-3.5 text-sm font-bold whitespace-nowrap transition-colors hover:text-white"
        >
          <ChevronLeftIcon size={16} />
          Retour au panier
        </Link>
      </div>
    </header>
  );
}
