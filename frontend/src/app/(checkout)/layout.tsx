import { CheckoutHeader } from "@/components/layout/CheckoutHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ToastHost } from "@/components/ui/Toast";
import { logoSrc } from "@/lib/chrome";
import { getNavigation } from "@/lib/navigation";

/**
 * Checkout chrome (design/Commande.dc.html): reduced header (logo, sales phone, "Retour au
 * panier"), no promo bar, no navigation; the standard footer.
 */
export default async function CheckoutLayout({ children }: LayoutProps<"/">) {
  const nav = await getNavigation();
  const logo = logoSrc();
  return (
    <>
      <a href="#contenu" className="sr-only-focusable rounded-12 bg-ink fixed top-2 left-2 z-70 px-4 py-3 font-bold text-white">
        Aller au contenu
      </a>
      <CheckoutHeader logoSrc={logo} phone={nav.salesPhone} />
      <main id="contenu" className="site-container pb-10 md:pb-14">
        {children}
      </main>
      <SiteFooter footer={nav.footer} logoSrc={logo} />
      <ToastHost />
    </>
  );
}
