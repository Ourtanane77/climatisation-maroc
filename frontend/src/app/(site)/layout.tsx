import { AccountPill } from "@/components/layout/AccountBar";
import { PromoBar } from "@/components/layout/PromoBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ArfroFooter } from "@/components/layout/arfro/ArfroFooter";
import { ArfroHeader } from "@/components/layout/arfro/ArfroHeader";
import { ArfroPromoStrip } from "@/components/layout/arfro/ArfroPromoStrip";
import { ArfroUtilityBar } from "@/components/layout/arfro/ArfroUtilityBar";
import { ToastHost } from "@/components/ui/Toast";
import { initialCartCount, siteLogo } from "@/lib/chrome";
import { getNavigation } from "@/lib/navigation";
import { getReseller } from "@/lib/pro/session";
import { JsonLd, organizationSchema, websiteSchema } from "@/lib/seo/jsonld";
import { SITE_KEY } from "@/lib/site";

/**
 * Standard page chrome: promo bar, header, footer (every page except the checkout). arfro.com has
 * its own chrome (docs/deviations.md « Arfro restyle »): promo strip, utility bar, sticky header,
 * navy footer.
 */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [nav, count, reseller] = await Promise.all([getNavigation(), initialCartCount(), getReseller().catch(() => null)]);
  const logo = siteLogo();
  const accountPill = reseller ? <AccountPill reseller={reseller} /> : null;
  const arfro = SITE_KEY === "arfro";
  return (
    <>
      <a href="#contenu" className="sr-only-focusable rounded-12 bg-ink fixed top-2 left-2 z-70 px-4 py-3 font-bold text-white">
        Aller au contenu
      </a>
      {arfro ? (
        <>
          <ArfroPromoStrip promo={nav.promoBar} />
          <ArfroUtilityBar nav={nav} />
          <ArfroHeader nav={nav} logo={logo} initialCartCount={count} account={accountPill} />
        </>
      ) : (
        <>
          <PromoBar promo={nav.promoBar} />
          <SiteHeader nav={nav} logo={logo} initialCartCount={count} account={accountPill} />
        </>
      )}
      <main id="contenu" className="site-container pb-10 md:pb-14">
        {children}
      </main>
      {arfro ? <ArfroFooter footer={nav.footer} logo={logo} /> : <SiteFooter footer={nav.footer} logo={logo} />}
      <ToastHost />
      <JsonLd data={[organizationSchema(nav.footer, logo.src), websiteSchema()]} />
    </>
  );
}
