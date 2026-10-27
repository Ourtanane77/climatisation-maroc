import { ArfroCheckoutChrome } from "@/components/layout/chrome/arfro-checkout";
import { CmCheckoutChrome } from "@/components/layout/chrome/cm-checkout";
import { ToastHost } from "@/components/ui/Toast";
import { siteLogo } from "@/lib/chrome";
import { getNavigation } from "@/lib/navigation";
import { SITE_KEY } from "@/lib/site";

/**
 * Checkout chrome (design/Commande.dc.html): reduced header (logo, sales phone, "Retour au
 * panier"), no promo bar, no navigation; the standard footer. arfro.com: its own header and footer.
 */
export default async function CheckoutLayout({ children }: LayoutProps<"/">) {
  const nav = await getNavigation();
  const logo = siteLogo();
  const Chrome = SITE_KEY === "arfro" ? ArfroCheckoutChrome : CmCheckoutChrome;
  return (
    <>
      <a href="#contenu" className="sr-only-focusable rounded-12 bg-ink fixed top-2 left-2 z-70 px-4 py-3 font-bold text-white">
        Aller au contenu
      </a>
      <Chrome nav={nav} logo={logo}>
        <main id="contenu" className="site-container pb-10 md:pb-14">
          {children}
        </main>
      </Chrome>
      <ToastHost />
    </>
  );
}
