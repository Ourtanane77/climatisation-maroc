"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/Toast";
import { BurgerIcon, CartIcon, ChevronDownIcon, CloseIcon, SearchIcon, WhatsAppIcon } from "@/components/ui/icons";
import { addToCart, useCartCount } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { dh } from "@/lib/format";
import type { SiteNavigation } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { Logo } from "./Logo";
import { MobileDrawer } from "./MobileDrawer";

/** aria-current for a navigation link: "page" on its own URL, "true" anywhere inside its section. */
export function currentFor(pathname: string, href: string): "page" | "true" | undefined {
  if (pathname === href) return "page";
  return href !== "/" && pathname.startsWith(`${href}/`) ? "true" : undefined;
}

/**
 * Site header (design: shared header of every page).
 * - ≥1000px: 76px row (logo, scoped search, WhatsApp, cart) + 52px nav with mega menus.
 * - 760–999: same row + scrolling nav with a "Plus" dropdown for the right-hand links.
 * - <760: burger, logo, search toggle, cart; mobile drawer.
 * After 140px of scroll the header becomes fixed and compact (64px, nav hidden); it slides
 * away when scrolling down past 320px and comes back on scroll up.
 */
export function SiteHeader({
  nav,
  logoSrc,
  initialCartCount = 0,
  account,
}: {
  nav: SiteNavigation;
  logoSrc: string | null;
  initialCartCount?: number;
  /** Logged-in reseller pill (Commande rapide design). */
  account?: React.ReactNode;
}) {
  const count = useCartCount(initialCartCount);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [dropdown, setDropdown] = useState<"scope" | "plus" | null>(null);
  const [scope, setScope] = useState(nav.searchScopes[0] ?? "Toutes");
  const [spacer, setSpacer] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);

  // Keep the page from jumping when the header switches to position: fixed.
  useLayoutEffect(() => {
    if (!scrolled && headerRef.current) setSpacer(headerRef.current.offsetHeight);
  }, [scrolled, mobileSearch]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const isScrolled = y > 140;
      const dir = y > lastY.current + 4 ? "down" : y < lastY.current - 4 ? "up" : null;
      lastY.current = y;
      setScrolled(isScrolled);
      setHidden((prev) => (isScrolled && dir === "down" && y > 320 ? true : dir === "up" || !isScrolled ? false : prev));
      if (dir) {
        setMega(null);
        setDropdown(null);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mega menu: opened on hover/focus of a range; closed a moment after the pointer leaves the
  // header (so moving from the nav item into the panel keeps it open), on a click or tap
  // anywhere outside the header, on Escape, on scroll and on navigation.
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const openMega = useCallback((key: string | null) => {
    clearTimeout(closeTimer.current);
    setMega(key);
  }, []);
  const scheduleClose = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(null), 150);
  }, []);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const closeAll = useCallback(() => {
    clearTimeout(closeTimer.current);
    setMega(null);
    setDropdown(null);
  }, []);

  useEffect(() => {
    if (!dropdown && !mega) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!headerRef.current?.contains(target)) {
        closeAll();
      } else if (dropdown && !target.closest?.("[data-dd]")) {
        setDropdown(null);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [dropdown, mega, closeAll]);

  // A new page (link in the mega menu, the drawer or anywhere else) closes every menu
  // (state adjusted during render, as React recommends, rather than in an effect).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMega(null);
    setDropdown(null);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeAll();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeAll]);

  const activeRange = nav.ranges.find((r) => r.key === mega && r.mega);
  const placeholder = scope === nav.searchScopes[0] ? "Rechercher un produit ou une référence" : `Rechercher dans ${scope}`;
  const logoHeight = scrolled ? 38 : 50;

  return (
    <>
      {scrolled && <div aria-hidden style={{ height: spacer }} />}
      <header
        ref={headerRef}
        onMouseLeave={scheduleClose}
        onMouseEnter={() => clearTimeout(closeTimer.current)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) closeAll();
        }}
        className={cn(
          "ease-design inset-x-0 top-0 z-30 bg-white transition-[transform,box-shadow] duration-350",
          scrolled ? "shadow-sticky-header fixed" : "shadow-hairline relative",
          scrolled && hidden && "-translate-y-[110%]",
        )}
      >
        <div className="site-gutter">
          <div className={cn("flex items-center gap-[clamp(12px,2vw,28px)] transition-[height] duration-300", scrolled ? "h-16" : "h-[76px]")}>
            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-label="Menu"
              aria-expanded={drawer}
              className="bg-bg flex size-11 shrink-0 items-center justify-center rounded-full md:hidden"
            >
              <BurgerIcon />
            </button>

            <Link href="/" className="flex shrink-0">
              <Logo src={logoSrc} height={36} className="md:hidden" />
              <Logo src={logoSrc} height={logoHeight} className="hidden md:flex" />
            </Link>

            <form
              action="/recherche"
              role="search"
              className="border-border bg-bg hover:border-hover-line relative hidden h-12 max-w-[600px] min-w-0 flex-1 items-center rounded-full border-[1.5px] md:flex"
            >
              <div data-dd className="relative flex h-full shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => setDropdown(dropdown === "scope" ? null : "scope")}
                  aria-haspopup="listbox"
                  aria-expanded={dropdown === "scope"}
                  aria-label={`Rayon de recherche : ${scope}`}
                  className="border-border flex h-full items-center gap-2 rounded-l-full border-r-[1.5px] bg-white pr-3.5 pl-5 text-[15px] font-bold whitespace-nowrap"
                >
                  {scope}
                  <ChevronDownIcon size={14} className={cn("transition-transform", dropdown === "scope" && "rotate-180")} />
                </button>
                {dropdown === "scope" && (
                  <ul
                    role="listbox"
                    aria-label="Rayon"
                    className="animate-rise rounded-18 shadow-dropdown absolute top-[calc(100%+8px)] left-0 z-50 flex min-w-60 flex-col gap-0.5 bg-white p-1.5"
                  >
                    {nav.searchScopes.map((s) => (
                      <li key={s} role="option" aria-selected={s === scope}>
                        <button
                          type="button"
                          onClick={() => {
                            setScope(s);
                            setDropdown(null);
                          }}
                          className={cn(
                            "rounded-12 hover:bg-tint-blue hover:text-brand flex h-[42px] w-full items-center justify-between gap-4 px-3.5 text-left text-[15px] font-semibold whitespace-nowrap",
                            s === scope ? "bg-tint-select text-brand" : "text-ink bg-white",
                          )}
                        >
                          {s}
                          <span className="text-brand font-extrabold">{s === scope ? "✓" : ""}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {scope !== nav.searchScopes[0] && <input type="hidden" name="gamme" value={scope} />}
              <Suspense fallback={<SearchInput placeholder={placeholder} />}>
                <SearchInputWithTerm placeholder={placeholder} />
              </Suspense>
              <button
                type="submit"
                aria-label="Lancer la recherche"
                className="bg-brand mr-1 flex size-10 shrink-0 items-center justify-center rounded-full text-white"
              >
                <SearchIcon size={18} />
              </button>
            </form>

            <div className="ml-auto flex items-center gap-3">
              {/* A logged-in reseller sees the account pill in its place (Commande rapide design). */}
              {!scrolled && !account && (
                <a
                  href={waLink(undefined, nav.whatsapp.number)}
                  target="_blank"
                  rel="noopener"
                  className="text-ink hover:text-brand hidden items-center gap-2 text-base font-bold whitespace-nowrap md:flex"
                >
                  <span className="bg-whatsapp flex size-9 items-center justify-center rounded-full text-white">
                    <WhatsAppIcon size={19} />
                  </span>
                  {nav.whatsapp.display}
                </a>
              )}
              {account}
              <button
                type="button"
                onClick={() => {
                  setMobileSearch(!mobileSearch);
                  setDrawer(false);
                }}
                aria-label="Rechercher"
                aria-expanded={mobileSearch}
                className="bg-bg flex size-11 items-center justify-center rounded-full md:hidden"
              >
                <SearchIcon />
              </button>
              <Link
                href="/panier"
                aria-label={`Panier ${count} article${count > 1 ? "s" : ""}`}
                className="bg-accent hover:bg-accent-hover flex h-11 items-center gap-2 rounded-full pr-1.5 pl-3 text-base font-bold text-white transition-colors hover:text-white md:h-12 md:pl-4"
              >
                <CartIcon size={22} />
                <span className="hidden md:inline">Panier</span>
                <span className="text-promo flex h-9 min-w-12 items-center justify-center rounded-[18px] bg-white px-1.5 text-sm">{count}</span>
              </Link>
            </div>
          </div>

          {mobileSearch && (
            <form action="/recherche" role="search" className="pb-3 md:hidden">
              <div className="border-brand flex h-12 items-center rounded-full border-[1.5px] bg-white pr-1.5 pl-[18px]">
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

          {!scrolled && (
            <nav
              aria-label="Principal"
              className="border-divider hidden h-[52px] items-center gap-2 border-t text-[15px] font-semibold whitespace-nowrap md:flex lg:hidden"
            >
              <div className="-ml-2.5 flex min-w-0 flex-1 scrollbar-none items-center overflow-x-auto [mask-image:linear-gradient(to_right,#000_90%,transparent)]">
                {nav.ranges.map((r) => (
                  <Link
                    key={r.key}
                    href={r.href}
                    aria-current={currentFor(pathname, r.href)}
                    className="text-ink hover:bg-tint-blue hover:text-ink shrink-0 rounded-full px-2.5 py-2.5"
                  >
                    {r.label}
                  </Link>
                ))}
                <Link
                  href={nav.promotions.href}
                  aria-current={currentFor(pathname, nav.promotions.href)}
                  className="text-promo hover:bg-tint-blue hover:text-promo shrink-0 rounded-full px-2.5 py-2.5"
                >
                  {nav.promotions.label}
                </Link>
              </div>
              <div data-dd className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setDropdown(dropdown === "plus" ? null : "plus")}
                  aria-expanded={dropdown === "plus"}
                  className="border-control flex h-10 items-center gap-1.5 rounded-full border-[1.5px] bg-white px-3.5 text-[15px] font-bold"
                >
                  Plus
                  <ChevronDownIcon size={12} />
                </button>
                {dropdown === "plus" && (
                  <div className="rounded-18 shadow-dropdown absolute top-[calc(100%+8px)] right-0 z-50 flex min-w-[220px] flex-col bg-white p-1.5">
                    {nav.rightLinks.map((l, i) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className={cn(
                          "rounded-12 hover:bg-tint-blue flex h-11 items-center px-3.5 text-[15px] font-semibold",
                          i === nav.rightLinks.length - 1 ? "text-promo" : "text-brand",
                        )}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          )}

          {!scrolled && (
            <nav
              aria-label="Principal"
              className="border-divider -mx-2.5 hidden h-[52px] items-center border-t text-sm font-semibold whitespace-nowrap lg:flex xl:text-[15px] 2xl:text-base"
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
                    "text-ink hover:bg-tint-blue hover:text-ink rounded-full px-[6px] py-[9px] transition-colors min-[1180px]:px-[9px] 2xl:px-3",
                    mega === r.key && "bg-tint-blue",
                  )}
                >
                  {r.label}
                </Link>
              ))}
              <Link
                href={nav.promotions.href}
                aria-current={currentFor(pathname, nav.promotions.href)}
                onMouseEnter={() => openMega(null)}
                className="text-promo hover:bg-tint-blue hover:text-promo rounded-full px-[6px] py-[9px] min-[1180px]:px-[9px] 2xl:px-3"
              >
                {nav.promotions.label}
              </Link>
              <span className="flex-1" />
              {nav.rightLinks.map((l, i) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={currentFor(pathname, l.href)}
                  onMouseEnter={() => openMega(null)}
                  className={cn(
                    "hover:bg-tint-blue rounded-full px-[6px] py-[9px] min-[1180px]:px-[9px] 2xl:px-3",
                    i === nav.rightLinks.length - 1 ? "text-promo hover:text-promo" : "text-brand hover:text-brand",
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {activeRange?.mega && !scrolled && (
          // The full-width wrapper lets the pointer through: only the panel itself keeps the menu open.
          <div className="site-gutter pointer-events-none absolute inset-x-0 top-full hidden lg:block">
            <div className="animate-rise rounded-b-24 shadow-mega pointer-events-auto grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_340px] gap-8 bg-white p-7">
              <div>
                <div className="text-muted mb-2.5 text-sm">{activeRange.mega.title}</div>
                <div className="grid grid-cols-2 gap-1">
                  {activeRange.mega.subs.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      prefetch={false}
                      className="rounded-12 text-ink hover:bg-tint-blue hover:text-brand px-3.5 py-3 text-[17px] font-semibold"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
                <Link href={activeRange.mega.href} prefetch={false} className="mt-3.5 ml-3.5 inline-block text-[15px] font-bold">
                  Voir toute la gamme →
                </Link>
              </div>
              <div>
                <div className="text-muted mb-2.5 text-sm">Marques</div>
                <div className="flex flex-wrap gap-2">
                  {activeRange.mega.brands.map((b) => (
                    <Link
                      key={b.label}
                      href={b.href}
                      prefetch={false}
                      className="bg-bg text-ink hover:bg-tint-blue hover:text-brand flex h-11 items-center rounded-full px-[18px] text-[15px] font-bold"
                    >
                      {b.label}
                    </Link>
                  ))}
                </div>
              </div>
              {activeRange.mega.featured && (
                <div className="rounded-20 bg-tint-blue flex flex-col gap-2.5 p-4">
                  <Link
                    href={activeRange.mega.featured.href}
                    prefetch={false}
                    tabIndex={-1}
                    aria-hidden
                    className="rounded-14 flex h-[170px] items-center justify-center bg-white p-3.5"
                  >
                    <ProductVisual
                      image={activeRange.mega.featured.image}
                      art={activeRange.mega.featured.art}
                      alt={activeRange.mega.featured.name}
                      shadow={false}
                    />
                  </Link>
                  <Link href={activeRange.mega.featured.href} prefetch={false} className="text-ink hover:text-brand text-base leading-[1.3] font-semibold">
                    {activeRange.mega.featured.name}
                  </Link>
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[22px] font-extrabold">{dh(activeRange.mega.featured.price)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(activeRange.mega!.featured!.sku);
                        toast(`${activeRange.mega!.featured!.name} ajouté au panier`);
                      }}
                      className="bg-brand hover:bg-brand-hover h-[42px] rounded-full px-4 text-sm font-bold text-white"
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

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} nav={nav} logoSrc={logoSrc} />
    </>
  );
}

const searchInputClass = "h-full min-w-0 flex-1 border-0 bg-transparent px-[18px] text-base outline-none";

function SearchInput({ placeholder, defaultValue }: { placeholder: string; defaultValue?: string }) {
  return (
    <input
      key={defaultValue}
      name="q"
      type="search"
      placeholder={placeholder}
      defaultValue={defaultValue}
      aria-label="Rechercher"
      autoComplete="off"
      className={searchInputClass}
    />
  );
}

/** On the results page the box keeps the searched term (design: Recherche). */
function SearchInputWithTerm({ placeholder }: { placeholder: string }) {
  const term = useSearchParams().get("q") ?? "";
  return <SearchInput placeholder={placeholder} defaultValue={term} />;
}
