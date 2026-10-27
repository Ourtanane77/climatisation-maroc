import Link from "next/link";
import { AirflowLines } from "@/components/arfro/AirflowLines";
import { FacebookIcon, InstagramIcon, LinkedInIcon, PinterestIcon, ThreadsIcon, TikTokIcon, WhatsAppIcon, XIcon, YouTubeIcon } from "@/components/ui/icons";
import { SITE_NAME } from "@/lib/site";
import type { SiteNavigation, Social } from "@/lib/types";
import { Logo, type SiteLogo } from "../Logo";
import { BottomBarSpacer } from "../BottomBarSpacer";
import { LogicSignature } from "../LogicSignature";
import { ArfroFooterColumns } from "../chrome/arfro-client";
import { ArrowRightIcon, PhoneIcon } from "./icons";

const socialIcon: Record<Social["name"], React.ReactNode> = {
  Facebook: <FacebookIcon size={18} />,
  Instagram: <InstagramIcon size={18} />,
  TikTok: <TikTokIcon size={18} />,
  YouTube: <YouTubeIcon size={18} />,
  X: <XIcon size={18} />,
  Threads: <ThreadsIcon size={18} />,
  Pinterest: <PinterestIcon size={18} />,
  LinkedIn: <LinkedInIcon size={18} />,
  WhatsApp: <WhatsAppIcon size={18} />,
};

/** Brand signature (docs/arfro-creative-brief.md « Brand »). */
export const ARFRO_SIGNATURE = "Le confort, notre signature.";

const QUOTE_HREF = "/demander-un-devis";

/**
 * arfro.com footer (Deep Navy, editorial): the brand signature over the airflow lines with the
 * sales line and the quote link, then the logo, about text and social links beside the link
 * columns, every phone and the e-mail, the stores and hours, and the bottom row (copyright,
 * published legal pages, Logic Technologies signature). All content comes from the navigation API.
 */
export function ArfroFooter({ footer, logo }: { footer: SiteNavigation["footer"]; logo: SiteLogo }) {
  const sales = footer.phones.find((p) => !p.href.startsWith("mailto:"));
  const email = footer.phones.find((p) => p.href.startsWith("mailto:"));
  const phones = footer.phones.filter((p) => p !== email);
  const quote = footer.columns.flatMap((c) => c.links).find((l) => l.href === QUOTE_HREF);

  return (
    <footer className="bg-arfro-navy font-arfro text-arfro-on-navy relative isolate overflow-hidden">
      {/* Parent of the column headings (h3), so every page keeps a valid heading order. */}
      <h2 className="sr-only">Informations sur {SITE_NAME}</h2>

      <div className="border-arfro-line-dark relative border-b">
        <AirflowLines variant="dark" scrub={false} className="absolute inset-x-0 top-1/2 -z-1 h-[140%] w-full -translate-y-1/2" />
        <div className="site-gutter flex flex-col gap-8 py-14 md:py-20 lg:flex-row lg:items-end lg:justify-between">
          <p className="m-0 max-w-[14ch] text-[clamp(34px,5.2vw,72px)] leading-[1] font-extrabold tracking-[-0.035em] text-balance text-white">
            <span className="text-arfro-sky mb-4 block text-[12px] leading-none font-bold tracking-[0.22em] uppercase md:text-[13px]">ARFRO</span>
            {ARFRO_SIGNATURE}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
            {sales && (
              <a
                href={sales.href}
                className="rounded-arfro-sm flex h-[52px] items-center justify-center gap-2.5 border border-white/30 px-6 text-[15px] font-bold text-white transition-colors hover:border-white hover:text-white"
              >
                <PhoneIcon size={18} />
                {sales.display}
              </a>
            )}
            {quote && (
              <Link
                href={quote.href}
                prefetch={false}
                className="rounded-arfro-sm text-arfro-navy hover:bg-arfro-ice hover:text-arfro-navy flex h-[52px] items-center justify-center gap-2.5 bg-white px-6 text-[15px] font-bold transition-colors"
              >
                {quote.label}
                <ArrowRightIcon />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="site-gutter flex flex-col gap-8 pt-10 pb-8 md:gap-14 md:pt-16">
        <div className="flex flex-col gap-8 md:gap-12 xl:flex-row xl:gap-20">
          <div className="flex max-w-[420px] shrink-0 flex-col gap-5 xl:basis-[340px]">
            <Logo logo={logo} height={32} white className="self-start md:hidden" />
            <Logo logo={logo} height={38} white className="hidden self-start md:block" />
            <p className="m-0 text-[15px] leading-[1.65] text-pretty">{footer.about}</p>
            {footer.socials.length > 0 && (
              <ul aria-label="Réseaux sociaux" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {footer.socials.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.href}
                      aria-label={s.name}
                      target="_blank"
                      rel="noopener"
                      className="border-arfro-line-dark flex size-11 items-center justify-center rounded-full border text-white transition-colors hover:border-white/60 hover:text-white"
                    >
                      {socialIcon[s.name]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-arfro-line-dark min-w-0 flex-1 border-b md:border-0">
            <ArfroFooterColumns columns={footer.columns} />
          </div>
        </div>

        <div className="border-arfro-line-dark grid grid-cols-1 gap-6 text-sm md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-12 md:border-t md:pt-8">
          <div className="flex flex-col gap-3">
            <p className="text-arfro-sky m-0 text-[11px] font-bold tracking-[0.18em] uppercase">Nous joindre</p>
            <ul aria-label="Téléphones" className="m-0 grid list-none grid-cols-1 gap-x-8 gap-y-1.5 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {phones.map((p) => (
                <li key={p.label}>
                  <a href={p.href} className="inline-flex min-h-7 items-center gap-2 text-white hover:text-white hover:underline">
                    <span className="text-arfro-on-navy">{p.label}</span>
                    <span className="font-semibold">{p.display}</span>
                  </a>
                </li>
              ))}
              {email && (
                <li>
                  <a href={email.href} className="inline-flex min-h-7 items-center font-semibold text-white hover:text-white hover:underline">
                    {email.display}
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="flex flex-col gap-3 md:items-end md:text-right">
            <p className="text-arfro-sky m-0 text-[11px] font-bold tracking-[0.18em] uppercase">Nos magasins</p>
            {footer.stores.map((s) => (
              <address key={s.name} className="leading-relaxed not-italic">
                <span className="font-semibold text-white">{s.name}</span>, {s.address}
              </address>
            ))}
            <span>{footer.hours}</span>
          </div>
        </div>

        <div className="border-arfro-line-dark flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t pt-6 text-xs md:text-[13px]">
          <span>{footer.copyright}</span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {footer.legal.length > 0 && (
              <nav aria-label="Informations légales" className="flex flex-wrap gap-x-5 gap-y-1">
                {footer.legal.map((l) => (
                  <Link key={l.href} href={l.href} prefetch={false} className="text-arfro-on-navy inline-flex min-h-6 items-center hover:text-white">
                    {l.label}
                  </Link>
                ))}
              </nav>
            )}
            <LogicSignature />
          </div>
        </div>
      </div>
      <BottomBarSpacer />
    </footer>
  );
}
