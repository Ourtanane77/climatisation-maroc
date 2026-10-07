import type { Reseller } from "@/lib/pro/types";

/** "Se déconnecter": a plain form post, so it works without JavaScript (redirects to /connexion). */
export function LogoutButton({ className, children = "Se déconnecter" }: { className?: string; children?: React.ReactNode }) {
  return (
    <form action="/api/auth/logout" method="post" className="contents">
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}

/**
 * Account pill of a logged-in reseller in the header's right-hand group (design: Commande rapide,
 * W ≥ 1100): user icon, company, "Se déconnecter". Below 1100 px the quick order page shows the
 * company and the logout link in its own header row, as drawn.
 */
export function AccountPill({ reseller }: { reseller: Reseller }) {
  return (
    <div className="bg-bg hidden h-12 items-center gap-2 rounded-full pr-1.5 pl-4 xl:flex">
      <span aria-hidden className="bg-brand flex size-7 shrink-0 items-center justify-center rounded-full text-white">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0" />
        </svg>
      </span>
      <span className="text-[15px] font-bold whitespace-nowrap">{reseller.company ?? reseller.name}</span>
      <LogoutButton className="text-ink hover:text-brand h-9 rounded-full bg-white px-3 text-sm font-bold whitespace-nowrap" />
    </div>
  );
}
