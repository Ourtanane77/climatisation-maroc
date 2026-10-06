import { PromoBar } from "@/components/layout/PromoBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ToastHost } from "@/components/ui/Toast";
import { initialCartCount, logoSrc } from "@/lib/chrome";
import { getNavigation } from "@/lib/navigation";

/** Standard page chrome: promo bar, header, footer (every page except the checkout). */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [nav, count] = await Promise.all([getNavigation(), initialCartCount()]);
  const logo = logoSrc();
  return (
    <>
      <a href="#contenu" className="sr-only-focusable rounded-12 bg-ink fixed top-2 left-2 z-70 px-4 py-3 font-bold text-white">
        Aller au contenu
      </a>
      <PromoBar promo={nav.promoBar} />
      <SiteHeader nav={nav} logoSrc={logo} initialCartCount={count} />
      <main id="contenu" className="mx-auto box-border px-4 pb-10 md:px-10 md:pb-14">
        {children}
      </main>
      <SiteFooter footer={nav.footer} logoSrc={logo} />
      <ToastHost />
    </>
  );
}
