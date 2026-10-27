import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SiteNavigation } from "@/lib/types";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; prefetch?: boolean }) => (
    <a href={href} {...{ ...rest, prefetch: undefined }}>
      {children}
    </a>
  ),
}));
vi.mock("@/lib/cart/store", () => ({ useCartCount: (n: number) => n, addToCart: vi.fn() }));
vi.mock("@/lib/compare", () => ({ useCompare: () => [], compareHref: () => "/comparer" }));
vi.mock("@/components/ui/Toast", () => ({ toast: vi.fn() }));
vi.mock("@/components/catalog/ProductVisual", () => ({ ProductVisual: () => null }));
vi.mock("../SiteHeader", () => ({ ScopedSearch: () => <form role="search" /> }));

import { ArfroDrawer } from "./ArfroDrawer";
import { ArfroHeaderClient } from "./ArfroHeaderClient";
import { ArfroMegaNav, OPEN_DELAY } from "./ArfroMegaNav";
import { type ArfroSiteNavigation, buildArfroMenu } from "./nav";

const range = (key: string, label: string, subs: string[], brands: string[] = []) => ({
  key,
  label,
  href: `/${key}`,
  mega: {
    title: label,
    href: `/${key}`,
    subs: subs.map((s) => ({ label: s, href: `/${key}/${s.toLowerCase()}` })),
    brands: brands.map((b) => ({ label: b, href: `/marques/${b.toLowerCase()}` })),
  },
});

const NAV: SiteNavigation = {
  promoBar: null,
  ranges: [
    range("climatisation", "Climatisation", ["Mural", "Gainable"], ["LG", "Carrier"]),
    range("chauffe-eau", "Chauffe-eau", ["Solaire"]),
    range("ventilation", "Ventilation", ["Multizone"]),
    range("gaines", "Gaines", ["Flexibles"], ["Arfro", "LG"]),
    range("cuivre-et-gaz", "Cuivre et gaz", ["Cuivre"], ["LG"]),
    range("pieces-de-rechange", "Pièces de rechange", ["Supports"]),
  ],
  promotions: { label: "Promotions", href: "/promotions" },
  rightLinks: [
    { label: "Demander un devis", href: "/demander-un-devis" },
    { label: "Contact", href: "/contact" },
    { label: "Devenir revendeur", href: "/devenir-revendeur" },
  ],
  drawerLinks: [],
  searchScopes: ["Toutes"],
  whatsapp: { number: "212666854184", display: "0666-854184" },
  salesPhone: { label: "Ventes", display: "0666-854184", href: "tel:+212666854184" },
  footer: {
    about: "",
    socials: [],
    columns: [],
    phones: [
      { label: "Ventes", display: "0666-854184", href: "tel:+212666854184" },
      { label: "Projets et revendeurs", display: "0666-602599", href: "tel:+212666602599" },
      { label: "E-mail", display: "a@b.ma", href: "mailto:a@b.ma" },
    ],
    stores: [],
    hours: "",
    legal: [],
    copyright: "",
  },
};

const LOGO = { src: "/logo.png", white: "/logo-white.png", alt: "Arfro", width: 300, height: 90 };

beforeEach(() => {
  pathname = "/";
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("buildArfroMenu", () => {
  it("groups the accessory ranges and keeps every link real", () => {
    const menus = buildArfroMenu(NAV);
    expect(menus.map((m) => m.label)).toEqual(["Climatisation", "Chauffe-eau", "Ventilation", "Accessoires", "Solutions professionnelles"]);
    const acc = menus.find((m) => m.key === "accessoires");
    expect(acc?.kind).toBe("range");
    if (acc?.kind !== "range") return;
    expect(acc.groups.map((g) => g.href)).toEqual(["/gaines", "/cuivre-et-gaz", "/pieces-de-rechange"]);
    // Brands merged without duplicates.
    expect(acc.brands.map((b) => b.label)).toEqual(["Arfro", "LG"]);
    const clim = menus[0];
    expect(clim.kind === "range" && clim.guide?.href).toBe("/calculateur-puissance");
  });

  it("hides Services and Conseils until they have published pages", () => {
    const pro = buildArfroMenu(NAV).find((m) => m.key === "professionnels");
    expect(pro?.kind === "links" && pro.links.map((l) => l.href)).toEqual(["/espace-professionnel", "/demander-un-devis", "/devenir-revendeur"]);
    expect(pro?.kind === "links" && pro.phone?.display).toBe("0666-602599");

    const withContent: ArfroSiteNavigation = {
      ...NAV,
      arfro: {
        services: [{ label: "Installation", href: "/services/installation" }],
        solutions: [{ label: "Hôtellerie", href: "/solutions/hotellerie" }],
        blog: { label: "Conseils", href: "/blog" },
        quoteRanges: [{ label: "Froid et chambres froides", href: "/froid" }],
      },
    };
    const menus = buildArfroMenu(withContent);
    expect(menus.map((m) => m.key)).toEqual(["climatisation", "chauffe-eau", "ventilation", "accessoires", "professionnels", "services", "conseils"]);
    const pro2 = menus.find((m) => m.key === "professionnels");
    expect(pro2?.kind === "links" && pro2.links.map((l) => l.href).slice(0, 2)).toEqual(["/solutions/hotellerie", "/froid"]);
  });
});

describe("ArfroMegaNav", () => {
  const renderNav = () => render(<ArfroMegaNav menus={buildArfroMenu(NAV)} nav={NAV} />);

  it("opens a panel with the button and closes it with Escape, focus back on the button", async () => {
    const user = userEvent.setup();
    renderNav();
    const clim = screen.getByRole("button", { name: "Climatisation" });
    expect(clim).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("arfro-mega-climatisation")).not.toBeVisible();

    await user.click(clim);
    expect(clim).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById("arfro-mega-climatisation")!;
    expect(panel).toBeVisible();
    expect(within(panel).getByRole("link", { name: "Mural" })).toHaveAttribute("href", "/climatisation/mural");
    expect(within(panel).getByRole("link", { name: "Voir toute la gamme" })).toHaveAttribute("href", "/climatisation");

    await user.keyboard("{Escape}");
    expect(clim).toHaveAttribute("aria-expanded", "false");
    expect(clim).toHaveFocus();
  });

  it("serves unused panels as a light link list, the full panel mounting on first hover or focus", () => {
    renderNav();
    const panel = document.getElementById("arfro-mega-climatisation")!;
    expect(within(panel).getByRole("link", { name: "Mural", hidden: true })).toHaveAttribute("href", "/climatisation/mural");
    expect(within(panel).queryByRole("link", { name: "Voir toute la gamme", hidden: true })).toBeNull();
    fireEvent.pointerEnter(screen.getByRole("button", { name: "Climatisation" }), { pointerType: "mouse" });
    expect(within(panel).getByRole("link", { name: "Voir toute la gamme", hidden: true })).toBeInTheDocument();
    const chauffe = document.getElementById("arfro-mega-chauffe-eau")!;
    act(() => screen.getByRole("button", { name: "Chauffe-eau" }).focus());
    expect(chauffe.querySelector("p")).not.toBeNull();
  });

  it("moves between entries with the arrow keys and enters the panel with ArrowDown", async () => {
    const user = userEvent.setup();
    renderNav();
    const clim = screen.getByRole("button", { name: "Climatisation" });
    clim.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Chauffe-eau" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("button", { name: /Solutions professionnelles/ })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    const pro = screen.getByRole("button", { name: /Solutions professionnelles/ });
    expect(pro).toHaveAttribute("aria-expanded", "true");
    expect(within(document.getElementById("arfro-mega-professionnels")!).getAllByRole("link")[0]).toHaveFocus();
  });

  it("opens on hover only after the intent delay and closes when the pointer leaves", () => {
    vi.useFakeTimers();
    renderNav();
    const nav = screen.getByRole("navigation", { name: "Principal" });
    const acc = screen.getByRole("button", { name: "Accessoires" });
    fireEvent.pointerEnter(acc, { pointerType: "mouse" });
    expect(acc).toHaveAttribute("aria-expanded", "false");
    act(() => vi.advanceTimersByTime(OPEN_DELAY + 10));
    expect(acc).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerLeave(nav, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(500));
    expect(acc).toHaveAttribute("aria-expanded", "false");
  });

  it("ignores touch hover (tap toggles instead)", () => {
    vi.useFakeTimers();
    renderNav();
    const acc = screen.getByRole("button", { name: "Accessoires" });
    fireEvent.pointerEnter(acc, { pointerType: "touch" });
    act(() => vi.advanceTimersByTime(500));
    expect(acc).toHaveAttribute("aria-expanded", "false");
  });
});

describe("ArfroDrawer", () => {
  it("is a modal dialog with accordions, Escape closes it", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ArfroDrawer open onClose={onClose} menus={buildArfroMenu(NAV)} nav={NAV} logo={LOGO} />);
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("button", { name: "Fermer le menu" })).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");

    const acc = within(dialog).getByRole("button", { name: "Accessoires" });
    expect(within(dialog).queryByRole("button", { name: "Gaines" })).toBeNull();
    await user.click(acc);
    expect(acc).toHaveAttribute("aria-expanded", "true");
    const gaines = within(dialog).getByRole("button", { name: "Gaines" });
    await user.click(gaines);
    expect(within(dialog).getByRole("link", { name: "Flexibles" })).toHaveAttribute("href", "/gaines/flexibles");

    expect(within(dialog).getByRole("link", { name: "Suivi de commande" })).toHaveAttribute("href", "/suivi-commande");
    expect(within(dialog).getByRole("link", { name: /Appeler le 0666-854184/ })).toHaveAttribute("href", "tel:+212666854184");

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps the focus inside (Tab loops)", async () => {
    const user = userEvent.setup();
    render(<ArfroDrawer open onClose={() => {}} menus={buildArfroMenu(NAV)} nav={NAV} logo={LOGO} />);
    const close = screen.getByRole("button", { name: "Fermer le menu" });
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(close).toHaveFocus();
  });
});

describe("ArfroHeaderClient states", () => {
  const scrollTo = (y: number) =>
    act(() => {
      Object.defineProperty(window, "scrollY", { value: y, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });
  const renderHeader = () => render(<ArfroHeaderClient menus={buildArfroMenu(NAV)} nav={NAV} logo={LOGO} />);

  afterEach(() => scrollTo(0));

  it("is transparent over the home hero at the top, solid once scrolled, hides on scroll down", () => {
    renderHeader();
    const header = screen.getByRole("banner");
    expect(header).toHaveAttribute("data-home", "true");
    expect(header).toHaveAttribute("data-overlay", "true");

    scrollTo(100);
    expect(header).not.toHaveAttribute("data-overlay");
    expect(header).toHaveAttribute("data-scrolled", "true");
    expect(header).not.toHaveAttribute("data-hidden");

    scrollTo(600);
    expect(header).toHaveAttribute("data-hidden", "true");
    scrollTo(500);
    expect(header).not.toHaveAttribute("data-hidden");
  });

  it("stays solid on other pages and while a menu is open", async () => {
    pathname = "/climatisation";
    const { unmount } = renderHeader();
    expect(screen.getByRole("banner")).not.toHaveAttribute("data-overlay");
    unmount();

    pathname = "/";
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole("button", { name: "Climatisation" }));
    expect(screen.getByRole("banner")).not.toHaveAttribute("data-overlay");
  });

  it("keeps the cart count, search and drawer", async () => {
    const user = userEvent.setup();
    render(<ArfroHeaderClient menus={buildArfroMenu(NAV)} nav={NAV} logo={LOGO} initialCartCount={3} />);
    expect(screen.getByRole("link", { name: "Panier, 3 articles" })).toHaveAttribute("href", "/panier");
    const [, desktopSearch] = screen.getAllByRole("button", { name: "Rechercher" });
    await user.click(desktopSearch);
    expect(screen.getByRole("search")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
  });
});
