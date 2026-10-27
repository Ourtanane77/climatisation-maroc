import { categoryPhoto } from "@/lib/design-assets";
import type { SiteNavigation } from "@/lib/types";
import type { SiteLogo } from "../Logo";
import { ArfroHeaderClient } from "../chrome/arfro-client";
import { type ArfroMenu, type ArfroSiteNavigation, type MenuPhoto, buildArfroMenu } from "./nav";

const photoOf = (href: string): MenuPhoto | null => {
  const photo = categoryPhoto(href);
  return photo ? { src: photo.src, srcSet: photo.srcSet || undefined } : null;
};

/** Main menu with the owner's category photos (lib/design-assets reads the manifest on the server). */
export function arfroMenusWithPhotos(nav: SiteNavigation): ArfroMenu[] {
  return buildArfroMenu(nav as ArfroSiteNavigation).map((m) =>
    m.kind === "range"
      ? {
          ...m,
          photo: photoOf(m.href),
          groups: m.groups.map((g) => ({ ...g, subs: g.subs.map((s) => ({ ...s, photo: photoOf(s.href) })) })),
        }
      : m,
  );
}

/**
 * arfro.com header (server part): builds the main menu from the navigation API and hands it to
 * ArfroHeaderClient (utility row, main row with mega menus, drawer, scroll states).
 */
export function ArfroHeader({
  nav,
  logo,
  initialCartCount = 0,
  account,
}: {
  nav: SiteNavigation;
  logo: SiteLogo;
  initialCartCount?: number;
  /** Logged-in reseller pill. */
  account?: React.ReactNode;
}) {
  return <ArfroHeaderClient menus={arfroMenusWithPhotos(nav)} nav={nav} logo={logo} initialCartCount={initialCartCount} account={account} />;
}
