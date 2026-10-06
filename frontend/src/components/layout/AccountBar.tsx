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
 * Account pill of a logged-in reseller (design: Commande rapide header, W ≥ 1100): user icon,
 * company, "Se déconnecter". Rendered under the header, right-aligned (see docs/deviations.md).
 */
export function AccountBar({ reseller }: { reseller: Reseller }) {
  return (
    <div className="hidden justify-end px-10 pt-3 xl:flex">
      <div className="bg-bg flex h-12 items-center gap-2.5 rounded-full py-0 pr-1.5 pl-4 shadow-[inset_0_0_0_1px_#E6EBF0]">
        <span aria-hidden className="bg-brand flex size-7 items-center justify-center rounded-full text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0" />
          </svg>
        </span>
        <span className="text-[15px] font-bold">{reseller.company ?? reseller.name}</span>
        <LogoutButton className="hover:bg-tint-blue h-9 rounded-full bg-white px-3.5 text-sm font-bold" />
      </div>
    </div>
  );
}
