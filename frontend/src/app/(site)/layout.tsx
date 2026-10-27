import { AccountPill } from "@/components/layout/AccountBar";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { ArfroSiteChrome } from "@/components/layout/chrome/arfro-site";
import { CmSiteChrome } from "@/components/layout/chrome/cm-site";
import { ToastHost } from "@/components/ui/Toast";
import { initialCartCount, siteLogo } from "@/lib/chrome";
import { getNavigation } from "@/lib/navigation";
import { getReseller } from "@/lib/pro/session";
import { JsonLd, organizationSchema, websiteSchema } from "@/lib/seo/jsonld";
import { SITE_KEY } from "@/lib/site";

/**
 * Standard page chrome: promo bar, header, footer (every page except the checkout). arfro.com has
 * its own chrome (docs/deviations.md « Arfro restyle »): promo strip, header (utility row + main row),
 * navy footer.
 */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [nav, count, reseller] = await Promise.all([getNavigation(), initialCartCount(), getReseller().catch(() => null)]);
  const logo = siteLogo();
  const accountPill = reseller ? <AccountPill reseller={reseller} /> : null;
  const Chrome = SITE_KEY === "arfro" ? ArfroSiteChrome : CmSiteChrome;
  return (
    <>
      <a href="#contenu" className="sr-only-focusable rounded-12 bg-ink fixed top-2 left-2 z-70 px-4 py-3 font-bold text-white">
        Aller au contenu
      </a>
      <Chrome nav={nav} logo={logo} initialCartCount={count} account={accountPill}>
        <main id="contenu" className="site-container pb-10 md:pb-14">
          {children}
        </main>
      </Chrome>
      {/* Réglages « Contact »: only when the site has a number; never on the checkout (its own layout). */}
      <FloatingWhatsApp number={nav.floatingWhatsapp} />
      <ToastHost />
      <JsonLd data={[organizationSchema(nav.footer, logo.src), websiteSchema()]} />
    </>
  );
}
