import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArfroQuickOrderHeading } from "@/components/arfro/pro/ArfroQuickOrderHeading";
import { LogoutButton } from "@/components/layout/AccountBar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { H1 } from "@/components/leads/ui";
import { QuickOrder } from "@/components/pro/QuickOrder";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { getNavigation } from "@/lib/navigation";
import { getReseller } from "@/lib/pro/session";
import type { QuickItem } from "@/lib/pro/types";
import { seoMetadata } from "@/lib/seo/metadata";
import { SITE_KEY } from "@/lib/site";

export const metadata: Metadata = seoMetadata({ title: "Commande rapide · Espace professionnel", noindex: true });

const PATH = "/espace-professionnel/commande-rapide";

/** Commande rapide par référence (design: Commande rapide.dc.html). Validated resellers only. */
export default async function QuickOrderPage() {
  const reseller = await getReseller();
  if (!reseller) redirect(`/connexion?suite=${encodeURIComponent(PATH)}`);

  const [nav, token] = await Promise.all([getNavigation(), getToken()]);
  const frequent = await apiGet<{ data: QuickItem[] }>("/pro/frequent-refs", { token })
    .then((r) => r.data)
    .catch(() => []);

  if (SITE_KEY === "arfro") {
    // Same gate and data as above; only the page heading takes the Arfro editorial language.
    return (
      <>
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Espace professionnel", href: "/espace-professionnel" }, { label: "Commande rapide" }]} />
        <ArfroQuickOrderHeading account={reseller.company ?? reseller.name} logout={<LogoutButton className="text-arfro-blue flex min-h-11 items-center font-bold underline" />} />
        <QuickOrder frequent={frequent} whatsappNumber={nav.whatsapp.number} />
      </>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Espace professionnel", href: "/espace-professionnel" }, { label: "Commande rapide" }]} />
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pt-6">
        <div className="flex flex-col gap-2">
          <h1 className={H1}>Commande rapide par référence</h1>
          <span className="text-ink-2 text-base">
            Saisissez une référence et une quantité par ligne. Prix publics affichés, votre tarif revendeur apparaît à côté.
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-[15px] xl:hidden">
          <span className="font-bold">{reseller.company ?? reseller.name}</span>
          <LogoutButton className="text-brand flex min-h-11 items-center font-bold underline" />
        </div>
      </div>
      <QuickOrder frequent={frequent} whatsappNumber={nav.whatsapp.number} />
    </>
  );
}
