import type { Metadata } from "next";
import { CartView } from "@/components/commerce/CartView";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { cartFromCookie, quoteCart } from "@/lib/commerce/server";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Votre panier", noindex: true });

/** Basket (design/Panier.dc.html). Rendered with the server's quote of the `cm_cart` cookie. */
export default async function CartPage() {
  const lines = await cartFromCookie();
  const quote = lines.length > 0 ? await quoteCart(lines) : null;
  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Panier" }]} />
      <CartView initialQuote={quote} />
    </>
  );
}
