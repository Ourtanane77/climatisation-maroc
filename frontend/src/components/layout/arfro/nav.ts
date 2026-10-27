import type { Link, MegaMenu, Phone, SiteNavigation } from "@/lib/types";

/**
 * arfro.com navigation model (docs/arfro-creative-brief.md « Navigation »), built from
 * GET /api/v1/navigation only: every entry points to a real, published page.
 *
 * Main menu: one entry per range (Climatisation, Chauffe-eau, Ventilation…), the accessory ranges
 * (gaines, cuivre et gaz, pièces de rechange) grouped under « Accessoires », then « Solutions
 * professionnelles » (pro space, quote-only ranges, sector pages when published), « Services »
 * (only with published service pages) and « Conseils » (only with published articles).
 */

/** Optional `arfro` key of the navigation API (Arfro only; absent on Climatisation Maroc). */
export interface ArfroNavExtras {
  services: Link[];
  solutions: Link[];
  blog: Link | null;
  quoteRanges: Link[];
}

export type ArfroSiteNavigation = SiteNavigation & { arfro?: ArfroNavExtras };

/** Owner's photo of a category (lib/design-assets, resolved on the server by ArfroHeader). */
export interface MenuPhoto {
  src: string;
  srcSet?: string;
}

export type MenuLink = Link & { photo?: MenuPhoto | null };

export interface MenuGroup {
  title: string;
  href: string;
  subs: MenuLink[];
}

export type ArfroMenu =
  | {
      kind: "range";
      key: string;
      label: string;
      /** Page of the whole entry (the range, or the first accessory range). */
      href: string;
      groups: MenuGroup[];
      brands: Link[];
      featured?: MegaMenu["featured"];
      /** Range photo, shown when no product is featured. */
      photo?: MenuPhoto | null;
      /** Buying guide shown in the panel (power calculator for air conditioning). */
      guide?: Link;
    }
  | {
      kind: "links";
      key: string;
      label: string;
      /** Short label for narrow desktops. */
      shortLabel?: string;
      href?: string;
      links: Link[];
      /** Direct line shown in the panel (pro projects…). */
      phone?: Phone;
    };

/** Ranges grouped under « Accessoires » (brief: gaines + cuivre/gaz + pièces de rechange). */
export const ACCESSORY_KEYS = ["gaines", "cuivre-et-gaz", "pieces-de-rechange"] as const;

export const PRO_HREF = "/espace-professionnel";
export const ORDER_TRACKING: Link = { label: "Suivi de commande", href: "/suivi-commande" };
export const POWER_GUIDE: Link = { label: "Calculateur de puissance", href: "/calculateur-puissance" };

const uniqueBy = <T>(items: T[], key: (item: T) => string): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => (seen.has(key(item)) ? false : (seen.add(key(item)), true)));
};

/** The phone line for projects and resellers, when the footer lists one. */
export function proPhone(nav: SiteNavigation): Phone | undefined {
  return nav.footer.phones.find((p) => !p.href.startsWith("mailto:") && /revendeur|projet/i.test(p.label));
}

export function buildArfroMenu(nav: ArfroSiteNavigation): ArfroMenu[] {
  const extras = nav.arfro;
  const menus: ArfroMenu[] = [];
  const accessories = nav.ranges.filter((r) => (ACCESSORY_KEYS as readonly string[]).includes(r.key));

  for (const r of nav.ranges) {
    const isAccessory = accessories.includes(r);
    if (isAccessory && r !== accessories[0]) continue;
    if (isAccessory) {
      menus.push({
        kind: "range",
        key: "accessoires",
        label: "Accessoires",
        href: accessories[0].href,
        groups: accessories.map((a) => ({ title: a.label, href: a.href, subs: a.mega?.subs ?? [] })),
        brands: uniqueBy(
          accessories.flatMap((a) => a.mega?.brands ?? []),
          (b) => b.href,
        ),
        featured: accessories.find((a) => a.mega?.featured)?.mega?.featured,
      });
      continue;
    }
    menus.push({
      kind: "range",
      key: r.key,
      label: r.label,
      href: r.href,
      groups: [{ title: r.label, href: r.href, subs: r.mega?.subs ?? [] }],
      brands: r.mega?.brands ?? [],
      featured: r.mega?.featured,
      guide: r.key === "climatisation" ? POWER_GUIDE : undefined,
    });
  }

  // Solutions professionnelles: always has real pages (pro space, quote form).
  const reseller = nav.rightLinks.find((l) => l.href === "/devenir-revendeur");
  const quote = nav.rightLinks.find((l) => l.href === "/demander-un-devis");
  const solutions = extras?.solutions ?? [];
  const solutionsHub = (nav.drawerLinks ?? []).find((l) => l.href === "/solutions");
  menus.push({
    kind: "links",
    key: "professionnels",
    label: "Solutions professionnelles",
    shortLabel: "Professionnels",
    href: PRO_HREF,
    links: uniqueBy(
      [
        ...solutions,
        ...(solutionsHub && solutions.length === 0 ? [solutionsHub] : []),
        ...(extras?.quoteRanges ?? []),
        { label: "Espace professionnel", href: PRO_HREF },
        ...(quote ? [quote] : []),
        ...(reseller ? [reseller] : []),
      ],
      (l) => l.href,
    ),
    phone: proPhone(nav),
  });

  const services = extras?.services ?? [];
  if (services.length > 0) {
    menus.push({ kind: "links", key: "services", label: "Services", href: "/services", links: services });
  }

  const blog = extras?.blog ?? (nav.drawerLinks ?? []).find((l) => l.href === "/blog") ?? null;
  if (blog) {
    menus.push({
      kind: "links",
      key: "conseils",
      label: "Conseils",
      href: blog.href,
      links: [{ label: "Tous les conseils", href: blog.href }, POWER_GUIDE, { label: "Comparer des produits", href: "/comparer" }],
    });
  }

  return menus;
}

/** Utility links (right of the utility bar, drawer): order tracking, quote, contact, reseller… */
export function utilityLinks(nav: SiteNavigation): Link[] {
  return uniqueBy([ORDER_TRACKING, ...nav.rightLinks], (l) => l.href);
}

/** `aria-current` for a link: "page" on its own page, "true" inside its section. */
export function currentFor(pathname: string, href: string): "page" | "true" | undefined {
  const path = href.split(/[?#]/)[0];
  if (path === "/") return pathname === "/" ? "page" : undefined;
  if (pathname === path) return "page";
  return pathname.startsWith(`${path}/`) ? "true" : undefined;
}

/** Whether a menu holds the current page (underline in the bar). */
export function menuIsCurrent(menu: ArfroMenu, pathname: string): boolean {
  const hrefs = menu.kind === "range" ? menu.groups.map((g) => g.href) : [menu.href ?? "", ...menu.links.map((l) => l.href)];
  return hrefs.some((h) => h && h !== "/" && currentFor(pathname, h) !== undefined);
}
