import { PromoBar } from "../PromoBar";
import { SiteFooter } from "../SiteFooter";
import { SiteHeader } from "./cm-client";
import type { SiteChromeProps } from "./types";

/**
 * Climatisation Maroc page chrome (app/(site)/layout.tsx): promo bar, header, footer around the
 * page. The header comes through ./cm-client.tsx (own chunk, not downloaded by arfro.com).
 */
export function CmSiteChrome({ nav, logo, initialCartCount, account, children }: SiteChromeProps) {
  return (
    <>
      <PromoBar promo={nav.promoBar} />
      <SiteHeader nav={nav} logo={logo} initialCartCount={initialCartCount} account={account} />
      {children}
      <SiteFooter footer={nav.footer} logo={logo} />
    </>
  );
}
