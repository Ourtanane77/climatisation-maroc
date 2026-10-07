import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddressBlock, CardTitle, CashLine, CompactLines, Divider, PageTitle, SummaryRow, TotalRow } from "@/components/commerce/parts";
import { ButtonLink } from "@/components/ui/Button";
import { CheckIcon, MAT, MatIcon } from "@/components/ui/icons";
import { getOrder } from "@/lib/commerce/server";
import { dh } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Commande confirmée", noindex: true, follow: false });

const STEPS = [
  ["Nous vous appelons pour confirmer", MAT.phone],
  ["Livraison gratuite", MAT.truck],
  ["Paiement à la réception", MAT.cash],
] as const;

/** Thank-you page (design/Confirmation.dc.html), readable with the order's access token. */
export default async function ConfirmationPage({ searchParams }: PageProps<"/commande/confirmation">) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref : "";
  const token = typeof sp.t === "string" ? sp.t : "";
  const order = await getOrder(ref, token);
  if (!order) notFound();

  return (
    <div className="mx-auto flex max-w-[980px] flex-col gap-8 pt-10 md:gap-12">
      <section className="rounded-24 flex flex-col items-center gap-4 bg-white px-5 py-8 text-center md:px-8 md:py-12">
        <span className="bg-success-bg text-success flex size-20 items-center justify-center rounded-full">
          <CheckIcon size={40} />
        </span>
        <PageTitle>Merci, votre commande est enregistrée</PageTitle>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-ink-2 text-[16px]">Référence de commande</span>
          <span className="rounded-12 bg-bg px-4 py-2 text-[22px] font-extrabold tracking-[0.01em]">{order.reference}</span>
        </div>
        <div className="flex w-full flex-col gap-3 pt-2 md:w-auto md:flex-row">
          <ButtonLink href={`/suivi-commande?ref=${encodeURIComponent(order.reference)}`} variant="blue">
            Suivre ma commande
          </ButtonLink>
          <ButtonLink href={waLink(`Bonjour, je vous écris au sujet de ma commande ${order.reference}`)} variant="whatsapp">
            Nous écrire sur WhatsApp
          </ButtonLink>
        </div>
      </section>

      <section>
        <h2 className="m-0 mb-5 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] md:text-[44px]">Et maintenant ?</h2>
        <ol className="m-0 grid list-none gap-4 p-0 xl:grid-cols-3">
          {STEPS.map(([title, d], i) => (
            <li key={title} className="rounded-20 flex items-center gap-4 bg-white p-5">
              <span className="bg-tint-blue text-brand flex size-12 shrink-0 items-center justify-center rounded-full">
                <MatIcon d={d} size={24} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-brand text-[14px] font-bold">Étape {i + 1}</span>
                <span className="text-[17px] leading-[1.3] font-bold">{title}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-2">
        <div className="rounded-24 box-border flex flex-col gap-4 bg-white p-5 md:p-8">
          <CardTitle>Récapitulatif</CardTitle>
          <CompactLines lines={order.lines} />
          <Divider />
          {order.technicalVisitPrice > 0 && <SummaryRow label="Visite technique">{dh(order.technicalVisitPrice)}</SummaryRow>}
          <SummaryRow label="Livraison" tone="success">
            Gratuite
          </SummaryRow>
          <TotalRow total={order.total} />
        </div>
        <div className="rounded-24 box-border flex flex-col gap-4 bg-white p-5 md:p-8">
          <CardTitle>Adresse de livraison</CardTitle>
          <AddressBlock name={order.customer.name} phone={order.customer.phone} address={order.address} city={order.city} />
          <Divider />
          <CashLine />
        </div>
      </section>
    </div>
  );
}
