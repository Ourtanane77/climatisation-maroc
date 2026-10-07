import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/commerce/CheckoutForm";
import { PageTitle } from "@/components/commerce/parts";
import { cartFromCookie, getCities, quoteCart, visitFromCookie } from "@/lib/commerce/server";
import { getNavigation, publishedLegalHref } from "@/lib/navigation";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Commande", noindex: true, follow: false });

/** Checkout, cash on delivery (design/Commande.dc.html). An empty basket goes back to /panier. */
export default async function CheckoutPage() {
  const lines = await cartFromCookie();
  if (lines.length === 0) redirect("/panier");
  const [quote, cities, visit, nav] = await Promise.all([quoteCart(lines), getCities(), visitFromCookie(), getNavigation()]);
  if (!quote.lines.some((l) => l.available)) redirect("/panier");

  return (
    <>
      <div className="pt-8">
        <PageTitle>Finaliser la commande</PageTitle>
      </div>
      <CheckoutForm quote={quote} cities={cities} initialVisit={visit} cgvHref={publishedLegalHref(nav, "/cgv")} />
    </>
  );
}
