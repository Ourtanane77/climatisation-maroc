"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { toast } from "@/components/ui/Toast";
import { BurgerIcon, CartIcon, CloseIcon, SearchIcon } from "@/components/ui/icons";
import { addToCart, useCartCount } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { compareHref, useCompare } from "@/lib/compare";
import { dh } from "@/lib/format";
import type { SiteNavigation } from "@/lib/types";
import { Logo, type SiteLogo } from "../Logo";
import { MobileDrawer } from "../MobileDrawer";
import { ScopedSearch, currentFor } from "../SiteHeader";
import { useHeaderMenus } from "../useHeaderMenus";

const iconButton =
  "text-ink hover:bg-bg hover:text-ink relative flex size-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

/** Small count bubble on an icon button (compare selection, cart on mobile). */
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

/**
 * arfro.com header (owner-approved restyle after LG/Samsung storefronts; docs/deviations.md « Arfro
 * restyle »). White, sticky, hairline bottom border.
 * - ≥1024px: 76px row: logo, ranges as bold text links (mega menus as on Climatisation Maroc,
 *   flat: white panel, grey tiles), Promotions, then search / compare / pro account icons and the
 *   blue « Panier · N » pill. The search button opens the scoped search box under the row.
 * - <1024px: 64px row: menu, logo, search, round blue cart; the mobile drawer.
 * Menu logic is shared with SiteHeader (useHeaderMenus).
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
  const count = useCartCount(initialCartCount);
  const compare = useCompare();
  const { pathname, mega, dropdown, setDropdown, headerRef, openMega, scheduleClose, cancelClose, closeAll } = useHeaderMenus();
  const [drawer, setDrawer] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  // The desktop search panel stays open while its scope list is open.
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchPath, setSearchPath] = useState(pathname);
  if (searchPath !== pathname) {
    setSearchPath(pathname);
    setSearchOpen(false);
    setMobileSearch(false);
  }

  useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e: PointerEvent) => !headerRef.current?.contains(e.target as Node) && setSearchOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen, headerRef]);

  const activeRange = nav.ranges.find((r) => r.key === mega && r.mega);
  const cartLabel = `Panier, ${count} article${count > 1 ? "s" : ""}`;

  return (
    <>
      <header
        ref={headerRef}
        onMouseLeave={scheduleClose}
        onMouseEnter={cancelClose}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) closeAll();
        }}
        className="border-border sticky top-0 z-30 border-b bg-white"
      >
        <div className="site-gutter">
          <div className="flex h-16 items-center gap-1 min-[1360px]:gap-[clamp(20px,2.8vw,40px)] lg:h-[76px] lg:gap-5 xl:gap-6">
            <button type="button" onClick={() => setDrawer(true)} aria-label="Menu" aria-expanded={drawer} className={cn(iconButton, "-ml-3 lg:hidden")}>
              <BurgerIcon size={24} strokeWidth={2} />
            </button>

            <Link href="/" aria-label={`${logo.alt}, accueil`} className="flex min-w-0 flex-1 lg:flex-none lg:shrink-0">
              <Logo logo={logo} height={28} className="lg:hidden" />
              <Logo logo={logo} height={34} className="hidden lg:block" />
            </Link>

            <nav
              aria-label="Principal"
              className="-mx-2 hidden min-w-0 flex-1 scrollbar-none items-center overflow-x-auto text-sm font-bold whitespace-nowrap min-[1360px]:gap-[clamp(4px,1vw,14px)] lg:flex xl:text-[15px]"
            >
              {nav.ranges.map((r) => (
                <Link
                  key={r.key}
                  href={r.href}
                  aria-current={currentFor(pathname, r.href)}
                  onMouseEnter={() => openMega(r.mega ? r.key : null)}
                  onFocus={() => openMega(r.mega ? r.key : null)}
                  aria-expanded={r.mega ? mega === r.key : undefined}
                  aria-haspopup={r.mega ? "true" : undefined}
                  className={cn(
                    "text-ink hover:text-ink relative flex h-11 shrink-0 items-center px-1.5 xl:px-2",
                    "after:bg-ink after:absolute after:inset-x-1.5 after:bottom-1 after:h-0.5 after:scale-x-0 after:transition-transform hover:after:scale-x-100 xl:after:inset-x-2",
                    (mega === r.key || currentFor(pathname, r.href)) && "after:scale-x-100",
                  )}
                >
                  {r.label}
                </Link>
              ))}
              <Link
                href={nav.promotions.href}
                aria-current={currentFor(pathname, nav.promotions.href)}
                onMouseEnter={() => openMega(null)}
                className="text-promo hover:text-promo flex h-11 shrink-0 items-center px-1.5 xl:px-2"
              >
                {nav.promotions.label}
              </Link>
            </nav>

            <div className="flex shrink-0 items-center gap-1 lg:gap-1.5">
              {account}
              <button
                type="button"
                onClick={() => {
                  setMobileSearch(!mobileSearch);
                  setDrawer(false);
                }}
                aria-label="Rechercher"
                aria-expanded={mobileSearch}
                className={cn(iconButton, "lg:hidden")}
              >
                <SearchIcon size={22} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  closeAll();
                }}
                aria-label="Rechercher"
                aria-expanded={searchOpen}
                aria-controls="arfro-recherche"
                className={cn(iconButton, "hidden lg:flex", searchOpen && "bg-bg")}
              >
                <SearchIcon size={22} strokeWidth={2} />
              </button>
              <Link
                href={compare.length ? compareHref(compare) : "/comparer"}
                aria-label={compare.length ? `Comparer (${compare.length} produit${compare.length > 1 ? "s" : ""})` : "Comparer"}
                className={cn(iconButton, "hidden xl:flex")}
              >
                <svg
                  aria-hidden
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 4v16M17 4v16M3 8h8M13 16h8" />
                </svg>
                {compare.length > 0 && <Bubble n={compare.length} className="bg-ink text-white" />}
              </Link>
              <Link href="/espace-professionnel" aria-label="Espace professionnel" className={cn(iconButton, "hidden xl:flex")}>
                <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </Link>
              <Link
                href="/panier"
                aria-label={cartLabel}
                className="bg-accent hover:bg-accent-hover relative flex size-11 items-center justify-center gap-2 rounded-full text-sm font-bold text-white transition-colors hover:text-white min-[1360px]:w-auto min-[1360px]:pr-4 min-[1360px]:pl-3.5 lg:ml-1"
              >
                <CartIcon size={20} />
                <span className="hidden min-[1360px]:inline">Panier · {count}</span>
                {count > 0 && <Bubble n={count} className="text-accent ring-accent bg-white ring-2 min-[1360px]:hidden" />}
              </Link>
            </div>
          </div>

          {mobileSearch && (
            <form action="/recherche" role="search" className="pb-3 lg:hidden">
              <div className="border-ink flex h-12 items-center rounded-full border-[1.5px] bg-white pr-1.5 pl-[18px]">
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
                  aria-label="Fermer"
                  className="bg-bg flex size-9 items-center justify-center rounded-full"
                >
                  <CloseIcon size={16} />
                </button>
              </div>
            </form>
          )}
        </div>

        {searchOpen && (
          <div id="arfro-recherche" className="site-gutter border-border absolute inset-x-0 top-full hidden border-b bg-white pt-2 pb-6 lg:block">
            <div className="mx-auto flex max-w-[860px] items-center gap-3">
              <ScopedSearch
                scopes={nav.searchScopes}
                open={dropdown === "scope"}
                onOpenChange={(o) => setDropdown(o ? "scope" : null)}
                className="relative flex h-14 min-w-0 flex-1"
                autoFocus
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Fermer la recherche" className={iconButton}>
                <CloseIcon size={20} />
              </button>
            </div>
          </div>
        )}

        {activeRange?.mega && !searchOpen && (
          <div className="border-border absolute inset-x-0 top-full hidden border-b bg-white lg:block">
            <div className="site-gutter animate-rise grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_340px] gap-10 py-8">
              <div>
                <div className="text-muted mb-3 text-[13px] font-extrabold tracking-[0.08em] uppercase">{activeRange.mega.title}</div>
                <div className="grid grid-cols-2 gap-2">
                  {activeRange.mega.subs.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      prefetch={false}
                      className="rounded-16 bg-bg text-ink hover:bg-tint-blue hover:text-ink flex min-h-14 items-center px-4 py-3 text-base font-bold transition-colors"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
                <Link
                  href={activeRange.mega.href}
                  prefetch={false}
                  className="text-ink mt-4 inline-flex min-h-11 items-center text-[15px] font-bold underline underline-offset-4"
                >
                  Voir toute la gamme
                </Link>
              </div>
              <div>
                <div className="text-muted mb-3 text-[13px] font-extrabold tracking-[0.08em] uppercase">Marques</div>
                <div className="flex flex-wrap gap-2">
                  {activeRange.mega.brands.map((b) => (
                    <Link
                      key={b.label}
                      href={b.href}
                      prefetch={false}
                      className="bg-bg text-ink hover:bg-tint-blue hover:text-ink flex h-11 items-center rounded-full px-[18px] text-[15px] font-bold transition-colors"
                    >
                      {b.label}
                    </Link>
                  ))}
                </div>
              </div>
              {activeRange.mega.featured && (
                <div className="bg-bg flex flex-col gap-3 rounded-[24px] p-5">
                  <Link
                    href={activeRange.mega.featured.href}
                    prefetch={false}
                    tabIndex={-1}
                    aria-hidden
                    className="flex h-[160px] items-center justify-center p-2"
                  >
                    <ProductVisual
                      image={activeRange.mega.featured.image}
                      art={activeRange.mega.featured.art}
                      alt={activeRange.mega.featured.name}
                      shadow={false}
                    />
                  </Link>
                  <Link href={activeRange.mega.featured.href} prefetch={false} className="text-ink hover:text-ink text-base leading-[1.3] font-extrabold">
                    {activeRange.mega.featured.name}
                  </Link>
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-xl font-extrabold">{dh(activeRange.mega.featured.price)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(activeRange.mega!.featured!.sku);
                        toast(`${activeRange.mega!.featured!.name} ajouté au panier`);
                      }}
                      className="bg-accent hover:bg-accent-hover h-11 rounded-full px-4 text-sm font-bold text-white"
                    >
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} nav={nav} logo={logo} />
    </>
  );
}
