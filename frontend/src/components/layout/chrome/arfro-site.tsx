import { ArfroFooter } from "../arfro/ArfroFooter";
import { ArfroHeader } from "../arfro/ArfroHeader";
import { ArfroPromoStrip } from "../arfro/ArfroPromoStrip";
import type { SiteChromeProps } from "./types";

/**
 * arfro.com page chrome (docs/deviations.md « Arfro restyle »): promo strip, header (utility row +
 * main row), navy footer (app/(site)/layout.tsx).
 */
export function ArfroSiteChrome({ nav, logo, initialCartCount, account, children }: SiteChromeProps) {
  return (
    <>
      <ArfroPromoStrip promo={nav.promoBar} />
      <ArfroHeader nav={nav} logo={logo} initialCartCount={initialCartCount} account={account} />
      {children}
      <ArfroFooter footer={nav.footer} logo={logo} />
    </>
  );
}
