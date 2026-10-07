import type { Metadata } from "next";
import { PageTitle } from "@/components/commerce/parts";
import { TrackOrder } from "@/components/commerce/TrackOrder";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Suivre ma commande", noindex: true });

/** Order tracking (design/Suivi commande.dc.html). `?ref=` prefills the reference. */
export default async function TrackPage({ searchParams }: PageProps<"/suivi-commande">) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref.slice(0, 20) : "";
  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Suivre ma commande" }]} />
      <div className="pt-6">
        <PageTitle>Suivre ma commande</PageTitle>
      </div>
      <TrackOrder initialRef={ref} />
    </>
  );
}
