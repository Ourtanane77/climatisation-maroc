import type { ReactNode } from "react";
import type { SiteNavigation } from "@/lib/types";
import type { SiteLogo } from "../Logo";

/** Props of the per-site page chrome (app/(site)/layout.tsx). */
export type SiteChromeProps = {
  nav: SiteNavigation;
  logo: SiteLogo;
  initialCartCount: number;
  account: ReactNode;
  children: ReactNode;
};

/** Props of the per-site checkout chrome (app/(checkout)/layout.tsx). */
export type CheckoutChromeProps = {
  nav: SiteNavigation;
  logo: SiteLogo;
  children: ReactNode;
};
