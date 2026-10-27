import type { ReactNode } from "react";
import { DisplayHeading, Eyebrow } from "@/components/arfro/ui";

/**
 * Heading of the Arfro quick order (validated resellers only; the page checks the session on the
 * server before rendering it). `account` is the signed-in reseller's own company or name.
 */
export function ArfroQuickOrderHeading({ account, logout }: { account: string; logout: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pt-8 pb-2 md:pt-12">
      <div className="flex max-w-[860px] flex-col gap-4">
        <Eyebrow>ARFRO Business · Commande rapide</Eyebrow>
        <DisplayHeading as="h1" size="m" className="text-arfro-navy">
          Commande rapide par référence
        </DisplayHeading>
        <p className="text-arfro-muted m-0 max-w-[64ch] text-[17px] leading-[1.6]">
          Saisissez une référence et une quantité par ligne. Prix publics affichés, votre tarif revendeur apparaît à côté.
        </p>
      </div>
      <div className="text-arfro-graphite flex items-center gap-3 text-[15px] xl:hidden">
        <span className="font-bold">{account}</span>
        {logout}
      </div>
    </div>
  );
}
