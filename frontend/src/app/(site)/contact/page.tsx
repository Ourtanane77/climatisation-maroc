import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ContactForm } from "@/components/leads/ContactForm";
import { H1, H2, IconTile } from "@/components/leads/ui";
import { ButtonLink } from "@/components/ui/Button";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/icons";
import { NEEDS, SI, findPhone } from "@/lib/leads/contacts";
import { getNavigation } from "@/lib/navigation";
import type { Social } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import { storesSchema, JsonLd } from "@/lib/seo/jsonld";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({
  title: "Contact et magasins",
  description: "Nos deux magasins à Marrakech, nos numéros selon votre besoin et un formulaire pour nous écrire.",
  path: "/contact",
});

/** Brand-coloured social circles of the Contact title row. */
const SOCIAL_STYLE: Record<Social["name"], { bg: string; icon: React.ReactNode }> = {
  Facebook: { bg: "#1877F2", icon: <FacebookIcon size={20} /> },
  Instagram: { bg: "#E4405F", icon: <InstagramIcon size={20} /> },
  TikTok: { bg: "#1A1A1A", icon: <TikTokIcon size={20} /> },
  WhatsApp: { bg: "#25D366", icon: <WhatsAppIcon size={20} /> },
};

const MAP_SRC = "https://www.openstreetmap.org/export/embed.html?bbox=-8.07%2C31.59%2C-7.95%2C31.67&layer=mapnik";

/** Contact et magasins (design: Contact.dc.html). */
export default async function ContactPage() {
  const nav = await getNavigation();
  const { stores, hours, socials } = nav.footer;
  const fixe = findPhone(nav, "Fixe");
  const email = findPhone(nav, "E-mail");
  const needs = NEEDS.map((n) => ({ ...n, phone: findPhone(nav, n.label) })).filter((n) => n.phone);

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Contact" }]} />
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pt-6">
        <h1 className={H1}>Contact et magasins</h1>
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href={waLink(undefined, nav.whatsapp.number)} variant="whatsapp">
            Nous écrire sur WhatsApp
          </ButtonLink>
          <div className="flex gap-2">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                target="_blank"
                rel="noopener"
                className="flex size-11 items-center justify-center rounded-full text-white hover:text-white hover:brightness-[0.92]"
                style={{ background: SOCIAL_STYLE[s.name].bg }}
              >
                {SOCIAL_STYLE[s.name].icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 items-stretch gap-4 pt-8 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-4">
          {stores.map((store, i) => (
            <article key={store.name} className="rounded-24 box-border flex flex-1 flex-col gap-3.5 bg-white p-5 md:p-8">
              <div className="flex items-center gap-3">
                <StorePin n={i + 1} size={36} />
                <h2 className="m-0 text-2xl font-bold tracking-[-0.01em]">{store.name}</h2>
              </div>
              <address className="text-[17px] leading-[1.5] not-italic">{store.address}</address>
              <span className="text-ink-2 text-[15px]">{hours}</span>
              <ButtonLink
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`}
                variant="outline"
                full
                icon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M3 11l18-8-8 18-2-8z" />
                  </svg>
                }
              >
                Itinéraire
              </ButtonLink>
            </article>
          ))}
        </div>
        <div className="rounded-24 bg-tint-blue-2 relative min-h-[360px] overflow-hidden xl:min-h-[480px]">
          <iframe title="Carte de Marrakech avec nos deux magasins" src={MAP_SRC} loading="lazy" className="absolute inset-0 block size-full border-0" />
          <div className="rounded-18 absolute right-4 bottom-4 left-4 flex max-w-[420px] flex-col gap-2.5 bg-white px-4 py-3.5 shadow-[0_20px_40px_-24px_rgba(14,40,70,0.5)]">
            {stores.map((store, i) => (
              <a
                key={store.name}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                target="_blank"
                rel="noopener"
                className="text-ink hover:text-brand flex min-h-8 items-center gap-2.5 text-[15px]"
              >
                <span className="bg-accent flex size-[26px] shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold text-white">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <strong>{store.name}</strong> · {store.address}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <h2 className={`${H2} mb-6`}>Contact selon votre besoin</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {needs.map((n) => (
            <a
              key={n.label}
              href={n.phone!.href}
              className="rounded-20 text-ink hover:text-ink hover:shadow-card-hover flex flex-col gap-3.5 bg-white p-5 transition-[box-shadow,transform] duration-300 hover:-translate-y-[3px]"
            >
              <IconTile paths={SI[n.icon]} size={48} icon={24} radius={14} />
              <span className="flex flex-col gap-1">
                <span className="text-[17px] font-bold">{n.title}</span>
                <span className="text-ink-2 text-[15px] leading-[1.4]">{n.text}</span>
              </span>
              <span className="text-brand mt-auto text-[22px] font-extrabold">{n.phone!.display}</span>
            </a>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-base">
          {fixe && (
            <a href={fixe.href} className="text-ink flex min-h-11 items-center gap-2">
              <span className="text-muted">Fixe</span>
              <strong>{fixe.display}</strong>
            </a>
          )}
          {email && (
            <a href={email.href} className="text-ink flex min-h-11 items-center gap-2">
              <span className="text-muted">E-mail</span>
              <strong>{email.display}</strong>
            </a>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 items-start gap-6 pt-10 md:pt-14 xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div className="flex flex-col gap-3">
          <h2 className={H2}>Écrivez-nous</h2>
          <p className="text-ink-2 m-0 max-w-[420px] text-[17px] leading-[1.55]">
            Une question sur un produit, une commande ou une facture. Pour un projet, utilisez plutôt{" "}
            <Link href="/demander-un-devis" className="font-bold underline">
              la demande de devis
            </Link>
            .
          </p>
        </div>
        <ContactForm />
      </section>
      <JsonLd data={storesSchema(nav.footer)} />
    </>
  );
}

/** Orange teardrop pin with the store number. */
function StorePin({ n, size }: { n: number; size: number }) {
  return (
    <span
      aria-hidden
      className="bg-accent flex shrink-0 -rotate-45 items-center justify-center"
      style={{ width: size, height: size, borderRadius: "50% 50% 50% 0" }}
    >
      <span className="rotate-45 text-[15px] font-extrabold text-white">{n}</span>
    </span>
  );
}
