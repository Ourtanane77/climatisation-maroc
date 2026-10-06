import Link from "next/link";
import { ChevronLeftIcon, MAT, MatIcon } from "@/components/ui/icons";
import type { Phone } from "@/lib/types";
import { Logo } from "./Logo";

/** Reduced checkout header (design/Commande.dc.html): logo, sales phone, "Retour au panier". */
export function CheckoutHeader({ logoSrc, phone }: { logoSrc: string | null; phone: Phone }) {
  return (
    <header className="shadow-hairline bg-white">
      <div className="mx-auto flex h-[76px] items-center gap-3 px-4 md:px-10">
        <Link href="/" className="flex shrink-0" aria-label="Accueil · Climatisation Maroc">
          <Logo src={logoSrc} height={36} className="md:hidden" />
          <Logo src={logoSrc} height={50} className="hidden md:flex" />
        </Link>
        <a
          href={phone.href}
          aria-label={`Appeler le ${phone.display}`}
          className="text-ink hover:text-brand ml-auto flex items-center gap-2 text-base font-bold whitespace-nowrap"
        >
          <span className="bg-tint-blue text-brand flex size-10 items-center justify-center rounded-full">
            <MatIcon d={MAT.phone} size={20} />
          </span>
          <span className="hidden md:inline">{phone.display}</span>
        </a>
        <Link
          href="/panier"
          className="border-control text-ink hover:border-ink hover:text-ink flex h-11 items-center gap-1.5 rounded-full border-[1.5px] pr-[18px] pl-3.5 text-[15px] font-bold"
        >
          <ChevronLeftIcon size={16} />
          Retour au panier
        </Link>
      </div>
    </header>
  );
}
