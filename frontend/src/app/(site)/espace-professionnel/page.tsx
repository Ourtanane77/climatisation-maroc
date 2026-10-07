import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { H1, H2, IconTile, Timeline } from "@/components/leads/ui";
import { ButtonLink } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { MAT, MatIcon } from "@/components/ui/icons";
import { apiGet } from "@/lib/api";
import { dh } from "@/lib/format";
import { PRO_PERKS, SI, projectsPhone } from "@/lib/leads/contacts";
import { getNavigation } from "@/lib/navigation";
import type { ProLanding } from "@/lib/pro/types";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({
  title: "Espace professionnel",
  description: "Installateurs, revendeurs et projets : vos prix, votre stock et vos commandes au même endroit.",
  path: "/espace-professionnel",
});

const AUDIENCE = [
  { title: "Installateurs", text: "Les appareils et le matériel de pose pour vos chantiers.", icon: "wrench", bg: "#DCE8F5" },
  { title: "Revendeurs", text: "LG, Carrier, CIAT et Fitco pour votre magasin.", icon: "store", bg: "#FCE6D6" },
  { title: "Projets et chantiers", text: "Hôtels, bureaux, restaurants : un interlocuteur pour tout le projet.", icon: "crane", bg: "#E8EFF8" },
] as const;

const STEPS = [
  { title: "Demande d’ouverture de compte", text: "Société, ICE, activité et contact." },
  { title: "Validation par notre équipe", text: "Nous vous contactons pour valider le compte." },
  { title: "Accès aux tarifs et à la commande rapide", text: "Vos prix et le stock s’affichent dès la connexion." },
] as const;

const C3 = "grid grid-cols-1 gap-4 md:grid-cols-3";

async function getLanding(): Promise<ProLanding> {
  try {
    return await apiGet<ProLanding>("/pro/landing", { tags: ["pro-landing", "brands", "pages", "products"] });
  } catch {
    return { brands: [], faq: [], preview: [] };
  }
}

/** Equal-area logo box (design: A = 4200, ×0.5 on mobile; max 140×60, 96×44 on mobile). */
function logoBox(aspect: number, area: number, maxW: number, maxH: number) {
  let w = Math.sqrt(area * aspect);
  let h = Math.sqrt(area / aspect);
  const k = Math.min(1, maxW / w, maxH / h);
  w *= k;
  h *= k;
  return { w: Math.round(w), h: Math.round(h) };
}

/** Espace professionnel (design: Espace professionnel.dc.html). */
export default async function ProPage() {
  const [nav, landing] = await Promise.all([getNavigation(), getLanding()]);
  const phone = projectsPhone(nav);
  const previewTotal = landing.preview.reduce((sum, r) => sum + r.total, 0);

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Espace professionnel" }]} />

      <section className="rounded-28 bg-brand mt-6 grid grid-cols-1 items-center gap-8 px-5 py-8 text-white md:px-10 md:py-12 xl:grid-cols-[minmax(0,1fr)_auto] xl:p-16">
        <div className="flex flex-col gap-5">
          <h1 className={`${H1} text-white`}>Espace professionnel</h1>
          <p className="text-footer-text-2 m-0 max-w-[600px] text-xl leading-[1.5] text-pretty">
            Installateurs, revendeurs et projets : vos prix, votre stock et vos commandes au même endroit.
          </p>
          <div className="flex flex-col gap-3 pt-1 md:flex-row">
            <ButtonLink href="/devenir-revendeur" variant="orange">
              Devenir revendeur
            </ButtonLink>
            <ButtonLink href="/connexion" variant="white">
              Se connecter
            </ButtonLink>
          </div>
        </div>
        <a
          href={phone.href}
          className="rounded-20 flex items-center gap-4 justify-self-start bg-white/12 px-6 py-5 text-white hover:bg-white/20 hover:text-white xl:justify-self-end"
        >
          <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-white">
            <MatIcon d={MAT.phone} size={24} className="text-brand" />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-[15px] text-white">{phone.label}</span>
            <span className="text-[28px] font-extrabold tracking-[-0.01em]">{phone.display}</span>
            <span className="text-sm text-white">{nav.footer.hours}</span>
          </span>
        </a>
      </section>

      <section className="pt-10 md:pt-14">
        <div className={C3}>
          {PRO_PERKS.map((p) => (
            <div key={p.title} className="rounded-20 flex flex-col gap-3.5 bg-white p-6">
              <IconTile paths={SI[p.icon]} />
              <h2 className="m-0 text-xl font-bold">{p.title}</h2>
              <p className="text-ink-2 m-0 text-base leading-[1.5]">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <h2 className={`${H2} mb-6`}>Pour qui ?</h2>
        <div className={C3}>
          {AUDIENCE.map((a) => (
            <div key={a.title} className="rounded-24 flex min-h-[200px] flex-col justify-between gap-6 p-7 md:min-h-[260px]" style={{ background: a.bg }}>
              <IconTile paths={SI[a.icon]} size={56} icon={28} bg="bg-white" />
              <div className="flex flex-col gap-1.5">
                <h3 className="m-0 text-2xl font-bold tracking-[-0.01em]">{a.title}</h3>
                <p className="text-ink m-0 text-base leading-[1.5]">{a.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 items-center gap-8 pt-10 md:pt-14 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <h2 className={`${H2} mb-6`}>Comment ça marche</h2>
          <Timeline steps={STEPS} size="lg" />
        </div>
        {landing.preview.length > 0 && (
          <figure aria-label="Aperçu de la commande rapide" className="rounded-28 bg-tint-blue m-0 p-4 md:p-8">
            <div className="rounded-20 flex flex-col gap-1 bg-white p-5 shadow-[0_30px_60px_-36px_rgba(14,40,70,0.45)]">
              <div className="border-divider flex items-center justify-between border-b pb-3">
                <span className="text-[17px] font-bold">Commande rapide</span>
                <span className="text-muted text-sm">{landing.preview.length} lignes</span>
              </div>
              {landing.preview.map((r) => (
                <div
                  key={r.ref}
                  className="border-divider grid grid-cols-[92px_minmax(0,1fr)_72px] items-center gap-3 border-b py-2.5 text-sm md:grid-cols-[110px_minmax(0,1fr)_48px_90px]"
                >
                  <span className="rounded-8 border-input flex h-9 items-center border-[1.5px] px-2 font-bold tabular-nums">{r.ref}</span>
                  <span className="min-w-0 truncate">{r.name}</span>
                  <span className="hidden text-center font-bold md:block">× {r.qty}</span>
                  <span className="text-right font-extrabold whitespace-nowrap">{dh(r.total)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 pt-3">
                <span className="text-ink-2 text-[15px]">
                  Total <strong className="text-ink text-xl">{dh(previewTotal)}</strong>
                </span>
                <span className="bg-accent flex h-10 items-center rounded-full px-4 text-sm font-bold text-white">Ajouter au panier</span>
              </div>
            </div>
          </figure>
        )}
      </section>

      {landing.brands.length > 0 && (
        <section className="pt-10 md:pt-14">
          <h2 className={`${H2} mb-6`}>Nos marques</h2>
          <div className="rounded-24 grid grid-cols-3 items-center justify-items-center gap-6 bg-white p-6 md:grid-cols-5 xl:grid-cols-9">
            {landing.brands.map((b) => {
              const desk = logoBox(b.aspect, 4200, 140, 60);
              const mob = logoBox(b.aspect, 2100, 96, 44);
              return (
                <Link key={b.href} href={b.href} aria-label={b.name} className="flex h-[72px] items-center justify-center">
                  {b.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.logo}
                      alt={b.name}
                      loading="lazy"
                      className="block h-(--mh) w-(--mw) object-contain md:h-(--dh) md:w-(--dw)"
                      style={{ "--mw": `${mob.w}px`, "--mh": `${mob.h}px`, "--dw": `${desk.w}px`, "--dh": `${desk.h}px` } as React.CSSProperties}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {landing.faq.length > 0 && (
        <section className="pt-10 md:pt-14">
          <h2 className={`${H2} mb-6`}>Questions fréquentes</h2>
          <FaqAccordion items={landing.faq} />
        </section>
      )}

      <section className="pt-10 md:pt-14">
        <div className="rounded-28 bg-tint-orange-2 flex flex-wrap items-center justify-between gap-6 p-6 md:p-12">
          <div className="flex max-w-[620px] flex-col gap-2">
            <h2 className={H2}>Ouvrez votre compte professionnel</h2>
            <p className="text-ink-2 m-0 text-[17px] leading-[1.55]">Une question avant de commencer ? Appelez le {phone.display}.</p>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <ButtonLink href="/devenir-revendeur" variant="orange">
              Devenir revendeur
            </ButtonLink>
            <ButtonLink href="/connexion" variant="outline">
              Se connecter
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
