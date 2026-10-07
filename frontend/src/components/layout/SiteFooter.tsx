import Link from "next/link";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { SiteNavigation, Social } from "@/lib/types";
import { FooterColumns } from "./FooterColumns";
import { Logo } from "./Logo";

const socialIcon: Record<Social["name"], React.ReactNode> = {
  Facebook: <FacebookIcon size={20} />,
  Instagram: <InstagramIcon size={20} />,
  TikTok: <TikTokIcon size={20} />,
  WhatsApp: <WhatsAppIcon size={20} />,
};

/** Blue footer (design: Accueil): about + socials, link columns, phones by role, stores, legal links. */
export function SiteFooter({ footer, logoSrc, bottomPadding = 0 }: { footer: SiteNavigation["footer"]; logoSrc: string | null; bottomPadding?: number }) {
  return (
    <footer className="bg-brand text-white" style={{ paddingBottom: bottomPadding }}>
      {/* Parent of the column headings (h3), so every page keeps a valid heading order. */}
      <h2 className="sr-only">Informations sur Climatisation Maroc</h2>
      <div className="site-gutter flex flex-col gap-8 pt-10 md:gap-12 md:pt-16">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div className="flex max-w-[420px] flex-col gap-5">
            <span className="rounded-14 flex self-start bg-white px-3.5 py-2">
              <Logo src={logoSrc} height={48} />
            </span>
            <p className="text-footer-text-2 m-0 text-[15px] leading-6 text-pretty">{footer.about}</p>
            <div className="flex gap-2">
              {footer.socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  target="_blank"
                  rel="noopener"
                  className="flex size-10 items-center justify-center rounded-full bg-white/14 text-white transition-transform hover:-translate-y-0.5 hover:text-white"
                >
                  {socialIcon[s.name]}
                </a>
              ))}
            </div>
          </div>
          <FooterColumns columns={footer.columns} />
        </div>

        <div className="grid grid-cols-1 gap-6 border-y border-white/18 py-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            <h3 className="text-footer-text mt-0 mb-4 text-[13px] font-bold tracking-[0.04em]">Téléphones</h3>
            <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
              {footer.phones.map((p) => (
                <a key={p.label} href={p.href} className="hover:text-tint-orange flex min-h-11 items-center justify-between gap-4 text-white md:min-h-0">
                  <span className="text-footer-text text-sm">{p.label}</span>
                  <span className="text-[15px] font-bold whitespace-nowrap">{p.display}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-footer-text mt-0 mb-4 text-[13px] font-bold tracking-[0.04em]">Magasins à Marrakech</h3>
            <div className="flex flex-col gap-2 text-[15px] leading-[22px]">
              {footer.stores.map((s) => (
                <address key={s.name} className="not-italic">
                  {s.address}
                </address>
              ))}
              <span className="text-footer-text">{footer.hours}</span>
            </div>
          </div>
        </div>

        <div className="text-footer-text flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-8 text-sm">
          <span>{footer.copyright}</span>
          <nav aria-label="Informations légales" className="flex flex-wrap gap-x-5 gap-y-2">
            {footer.legal.map((l) => (
              <Link key={l.href} href={l.href} prefetch={false} className="text-footer-text hover:text-tint-orange inline-flex min-h-6 items-center">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
