import Link from "next/link";
import { FacebookIcon, InstagramIcon, PinterestIcon, ThreadsIcon, TikTokIcon, WhatsAppIcon, XIcon, YouTubeIcon } from "@/components/ui/icons";
import { SITE_NAME } from "@/lib/site";
import type { SiteNavigation, Social } from "@/lib/types";
import { Logo, type SiteLogo } from "../Logo";
import { LogicSignature } from "../LogicSignature";
import { ArfroFooterColumns } from "./ArfroFooterColumns";

const socialIcon: Record<Social["name"], React.ReactNode> = {
  Facebook: <FacebookIcon size={18} />,
  Instagram: <InstagramIcon size={18} />,
  TikTok: <TikTokIcon size={18} />,
  YouTube: <YouTubeIcon size={18} />,
  X: <XIcon size={18} />,
  Threads: <ThreadsIcon size={18} />,
  Pinterest: <PinterestIcon size={18} />,
  WhatsApp: <WhatsAppIcon size={18} />,
};

/**
 * arfro.com footer (deep navy): white logo and about text, link columns, a row with the phones and
 * e-mail then the stores and hours, the copyright and the published legal pages.
 */
export function ArfroFooter({ footer, logo }: { footer: SiteNavigation["footer"]; logo: SiteLogo }) {
  return (
    <footer className="bg-[#083f78] text-[#d5e2f1]">
      {/* Parent of the column headings (h3), so every page keeps a valid heading order. */}
      <h2 className="sr-only">Informations sur {SITE_NAME}</h2>
      <div className="site-gutter flex flex-col gap-5 pt-9 pb-10 md:gap-12 md:pt-16 md:pb-8">
        <div className="flex flex-col gap-5 md:gap-12 xl:flex-row">
          <div className="flex max-w-[400px] shrink-0 flex-col gap-5 xl:basis-[360px]">
            <Logo logo={logo} height={32} white className="self-start md:hidden" />
            <Logo logo={logo} height={40} white className="hidden self-start md:block" />
            <p className="m-0 text-sm leading-[1.6] text-pretty md:text-[15px]">{footer.about}</p>
            {footer.socials.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {footer.socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    aria-label={s.name}
                    target="_blank"
                    rel="noopener"
                    className="flex size-11 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20 hover:text-white"
                  >
                    {socialIcon[s.name]}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 border-b border-[#2a5a8f] md:border-0">
            <ArfroFooterColumns columns={footer.columns} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-10 md:border-t md:border-[#2a5a8f] md:pt-7">
          <ul aria-label="Téléphones" className="m-0 flex list-none flex-col gap-x-6 gap-y-1 p-0 md:flex-row md:flex-wrap md:self-start">
            {footer.phones.map((p) => (
              <li key={p.label}>
                <a href={p.href} className="inline-flex min-h-6 items-center gap-1.5 text-[#d5e2f1] hover:text-white">
                  {!p.href.startsWith("mailto:") && <span className="text-[#9fbcdd]">{p.label}</span>}
                  {p.display}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1 md:items-end md:text-right">
            {footer.stores.map((s) => (
              <address key={s.name} className="not-italic">
                {s.name}, {s.address}
              </address>
            ))}
            <span>{footer.hours}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs text-[#9fbcdd] md:text-[13px]">
          <span>{footer.copyright}</span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footer.legal.length > 0 && (
              <nav aria-label="Informations légales" className="flex flex-wrap gap-x-5 gap-y-1">
                {footer.legal.map((l) => (
                  <Link key={l.href} href={l.href} prefetch={false} className="inline-flex min-h-6 items-center text-[#9fbcdd] hover:text-white">
                    {l.label}
                  </Link>
                ))}
              </nav>
            )}
            <LogicSignature />
          </div>
        </div>
      </div>
    </footer>
  );
}
