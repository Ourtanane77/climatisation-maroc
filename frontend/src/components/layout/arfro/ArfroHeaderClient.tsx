"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BurgerIcon, CartIcon, CloseIcon, SearchIcon } from "@/components/ui/icons";
import { useCartCount } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { compareHref, useCompare } from "@/lib/compare";
import type { SiteNavigation } from "@/lib/types";
import type { SiteLogo } from "../Logo";
import { ScopedSearch } from "../SiteHeader";
import styles from "./ArfroHeader.module.css";
import { ArfroDrawer } from "./ArfroDrawer";
import { ArfroMegaNav } from "./ArfroMegaNav";
import { ArfroUtilityBar } from "./ArfroUtilityBar";
import { CompareIcon, UserIcon } from "./icons";
import { type ArfroMenu, PRO_HREF } from "./nav";
import { useHeaderScroll } from "./useHeaderScroll";

const iconButton =
  "relative flex size-11 shrink-0 items-center justify-center rounded-full text-(--hdr-fg) transition-colors hover:bg-(--hdr-hover) hover:text-(--hdr-fg) focus-visible:outline-2 focus-visible:outline-offset-2";

/** Small count bubble on an icon button (compare selection, cart on narrow screens). */
function Bubble({ n, className }: { n: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-extrabold", className)}
    >
      {n}
    </span>
  );
}

/** Colour and white logos; the header state (ArfroHeader.module.css) shows one. */
function HeaderLogo({ logo }: { logo: SiteLogo }) {
  const width = Math.round((34 * logo.width) / logo.height);
  const cls = "block h-7 w-auto lg:h-[34px]";
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- small PNG logos */}
      <img src={logo.small?.src ?? logo.src} alt={logo.alt} width={width} height={34} className={cn(cls, styles.logoOnLight)} />
      {/* eslint-disable-next-line @next/next/no-img-element -- small PNG logos */}
      <img src={logo.small?.white ?? logo.white} alt={logo.alt} width={width} height={34} className={cn(cls, styles.logoOnDark)} />
    </>
  );
}

/**
 * arfro.com header, client part (docs/arfro-creative-brief.md « Navigation »).
 * - ≥1024px: 36px utility row (Particuliers / Professionnels, service links, phone) that scrolls
 *   away, then the 76px main row: logo, main menu with mega menus (ArfroMegaNav), search / compare /
 *   account / cart.
 * - <1024px: 64px row: menu, logo, search, cart; full-screen drawer (ArfroDrawer).
 * Sticky; hides while scrolling down and returns on scroll up; on the home page it lies transparent
 * over the editorial hero until the page scrolls (ArfroHeader.module.css). Fixed heights: no layout
 * shift.
 */
export function ArfroHeaderClient({
  menus,
  nav,
  logo,
  initialCartCount = 0,
  account,
}: {
  /** Main menu (buildArfroMenu, photos resolved on the server). */
  menus: ArfroMenu[];
  nav: SiteNavigation;
  logo: SiteLogo;
  initialCartCount?: number;
  /** Logged-in reseller pill. */
  account?: React.ReactNode;
}) {
  const pathname = usePathname();
  const count = useCartCount(initialCartCount);
  const compare = useCompare();
  const headerRef = useRef<HTMLElement>(null);

  const [megaOpen, setMegaOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);

  // A new page closes the search boxes and the drawer (state adjusted during render).
  const [path, setPath] = useState(pathname);
  if (path !== pathname) {
    setPath(pathname);
    setSearchOpen(false);
    setMobileSearch(false);
    setScopeOpen(false);
    setDrawer(false);
  }

  const busy = megaOpen || drawer || searchOpen || mobileSearch;
  const { atTop, hidden } = useHeaderScroll(busy);
  const home = pathname === "/";

  useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!headerRef.current?.contains(target)) setSearchOpen(false);
      else if (!target.closest?.("[data-dd]")) setScopeOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (scopeOpen) setScopeOpen(false);
      else setSearchOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen, scopeOpen]);

  const closeDrawer = useCallback(() => setDrawer(false), []);
  const cartLabel = `Panier, ${count} article${count > 1 ? "s" : ""}`;

  return (
    <>
      <header
        ref={headerRef}
        data-home={home || undefined}
        data-overlay={home && atTop && !busy ? "true" : undefined}
        data-scrolled={!atTop || undefined}
        data-hidden={hidden || undefined}
        className={cn(styles.header, "font-arfro")}
      >
        <ArfroUtilityBar nav={nav} embedded />

        <div className="site-gutter">
          <div className="flex h-16 items-center gap-1 lg:h-[76px] lg:gap-6 xl:gap-10">
            <button
              type="button"
              onClick={() => {
                setDrawer(true);
                setMobileSearch(false);
              }}
              aria-label="Menu"
              aria-expanded={drawer}
              aria-haspopup="dialog"
              className={cn(iconButton, "-ml-3 lg:hidden")}
            >
              <BurgerIcon size={24} strokeWidth={1.8} />
            </button>

            <Link href="/" aria-label={`${logo.alt}, accueil`} className="flex min-w-0 flex-1 lg:flex-none lg:shrink-0">
              <HeaderLogo logo={logo} />
            </Link>

            <ArfroMegaNav menus={menus} nav={nav} onOpenChange={setMegaOpen} />

            <div className="flex shrink-0 items-center gap-0.5 lg:gap-1">
              {account}
              <button
                type="button"
                onClick={() => {
                  setMobileSearch(!mobileSearch);
                  setDrawer(false);
                }}
                aria-label="Rechercher"
                aria-expanded={mobileSearch}
                aria-controls="arfro-recherche-mobile"
                className={cn(iconButton, "lg:hidden")}
              >
                <SearchIcon size={22} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Rechercher"
                aria-expanded={searchOpen}
                aria-controls="arfro-recherche"
                className={cn(iconButton, "hidden lg:flex", searchOpen && "bg-(--hdr-hover)")}
              >
                <SearchIcon size={21} strokeWidth={1.8} />
              </button>
              <Link
                href={compare.length ? compareHref(compare) : "/comparer"}
                aria-label={compare.length ? `Comparer (${compare.length} produit${compare.length > 1 ? "s" : ""})` : "Comparer"}
                className={cn(iconButton, "hidden xl:flex")}
              >
                <CompareIcon size={21} />
                {compare.length > 0 && <Bubble n={compare.length} className="bg-arfro-graphite text-white" />}
              </Link>
              {!account && (
                <Link href={PRO_HREF} aria-label="Compte professionnel" className={cn(iconButton, "hidden lg:flex")}>
                  <UserIcon size={21} />
                </Link>
              )}
              <Link
                href="/panier"
                aria-label={cartLabel}
                className="rounded-arfro-sm bg-arfro-blue hover:bg-arfro-blue-hover relative ml-1 flex size-11 items-center justify-center gap-2 text-sm font-bold text-white transition-colors hover:text-white min-[1280px]:w-auto min-[1280px]:px-4"
              >
                <CartIcon size={19} />
                <span className="hidden min-[1280px]:inline">Panier · {count}</span>
                {count > 0 && <Bubble n={count} className="text-arfro-blue ring-arfro-blue bg-white ring-2 min-[1280px]:hidden" />}
              </Link>
            </div>
          </div>

          {mobileSearch && (
            <form id="arfro-recherche-mobile" action="/recherche" role="search" className="pb-3 lg:hidden">
              <div className="rounded-arfro-sm border-arfro-graphite/40 text-arfro-graphite flex h-12 items-center border bg-white pr-1.5 pl-4">
                <input
                  name="q"
                  type="search"
                  autoFocus
                  placeholder="Rechercher un produit ou une référence"
                  aria-label="Rechercher"
                  className="min-w-0 flex-1 border-0 bg-transparent text-base outline-none"
                />
                <button
                  type="button"
                  onClick={() => setMobileSearch(false)}
                  aria-label="Fermer la recherche"
                  className="hover:bg-arfro-ice flex size-10 items-center justify-center rounded-full"
                >
                  <CloseIcon size={16} />
                </button>
              </div>
            </form>
          )}
        </div>

        {searchOpen && (
          <div
            id="arfro-recherche"
            className="site-gutter text-arfro-graphite border-arfro-line absolute inset-x-0 top-full hidden border-t bg-white pt-5 pb-7 shadow-[0_24px_48px_-28px_rgb(16_28_48/0.45)] lg:block"
          >
            <div className="mx-auto flex max-w-[860px] items-center gap-3">
              <ScopedSearch scopes={nav.searchScopes} open={scopeOpen} onOpenChange={setScopeOpen} className="relative flex h-14 min-w-0 flex-1" autoFocus />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Fermer la recherche"
                className="hover:bg-arfro-ice flex size-11 items-center justify-center rounded-full"
              >
                <CloseIcon size={20} />
              </button>
            </div>
          </div>
        )}
      </header>

      <ArfroDrawer open={drawer} onClose={closeDrawer} menus={menus} nav={nav} logo={logo} />
    </>
  );
}
