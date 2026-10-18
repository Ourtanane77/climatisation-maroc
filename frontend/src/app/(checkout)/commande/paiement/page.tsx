import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CmiPaymentForm } from "@/components/commerce/CmiPaymentForm";
import { CardTitle, PageTitle, SummaryRow } from "@/components/commerce/parts";
import { MAT, MatIcon } from "@/components/ui/icons";
import { getOrder, getPaymentForm } from "@/lib/commerce/server";
import { dh } from "@/lib/format";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Paiement sécurisé", noindex: true, follow: false });

/**
 * Card payment of an order (CMI): readable with the order's access token, it posts the signed form
 * to CMI's payment page. An order that cannot be paid now (paid, cancelled, card payment turned
 * off) goes to its confirmation page.
 */
export default async function PaymentPage({ searchParams }: PageProps<"/commande/paiement">) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref : "";
  const token = typeof sp.t === "string" ? sp.t : "";
  const form = await getPaymentForm(ref, token);
  if (!form) {
    const order = await getOrder(ref, token);
    if (!order) notFound();
    redirect(`/commande/confirmation?ref=${encodeURIComponent(order.reference)}&t=${encodeURIComponent(token)}`);
  }

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-6 pt-10">
      <PageTitle>Paiement sécurisé</PageTitle>
      <div className="rounded-24 box-border flex flex-col gap-5 bg-white p-5 md:p-8">
        <CardTitle>Commande {form.fields.oid}</CardTitle>
        <SummaryRow label="Montant à payer">{dh(form.total)}</SummaryRow>
        <p className="text-ink-2 m-0 flex items-start gap-3 text-[15px] leading-normal">
          <MatIcon d={MAT.lock} size={20} className="text-brand mt-0.5 shrink-0" />
          Vous allez être redirigé vers la page de paiement sécurisé du CMI (Centre Monétique Interbancaire). Vos données bancaires
          sont saisies chez le CMI, jamais sur notre site.
        </p>
        <CmiPaymentForm form={form} />
      </div>
    </div>
  );
}
