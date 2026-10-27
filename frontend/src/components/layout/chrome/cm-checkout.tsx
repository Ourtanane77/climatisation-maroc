import { CheckoutHeader } from "../CheckoutHeader";
import { SiteFooter } from "../SiteFooter";
import type { CheckoutChromeProps } from "./types";

/** Climatisation Maroc checkout chrome (app/(checkout)/layout.tsx). */
export function CmCheckoutChrome({ nav, logo, children }: CheckoutChromeProps) {
  return (
    <>
      <CheckoutHeader logo={logo} phone={nav.salesPhone} />
      {children}
      <SiteFooter footer={nav.footer} logo={logo} />
    </>
  );
}
