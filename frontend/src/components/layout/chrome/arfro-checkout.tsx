import { ArfroCheckoutHeader } from "../arfro/ArfroCheckoutHeader";
import { ArfroFooter } from "../arfro/ArfroFooter";
import type { CheckoutChromeProps } from "./types";

/** arfro.com checkout chrome (app/(checkout)/layout.tsx). */
export function ArfroCheckoutChrome({ nav, logo, children }: CheckoutChromeProps) {
  return (
    <>
      <ArfroCheckoutHeader logo={logo} phone={nav.salesPhone} />
      {children}
      <ArfroFooter footer={nav.footer} logo={logo} />
    </>
  );
}
