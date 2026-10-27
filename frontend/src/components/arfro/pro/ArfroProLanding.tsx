import Link from "next/link";
import { Reveal } from "@/components/arfro/motion";
import { ArfroButtonLink, Eyebrow } from "@/components/arfro/ui";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import type { ProLanding } from "@/lib/pro/types";
import type { Phone } from "@/lib/types";
import { ACCOUNT_STEPS, AUDIENCES, QUICK_ORDER_FEATURES, QUICK_ORDER_PATH, journeySteps } from "./journey";
import { ArrowRight, Band, ContactBand, NumberedList, PhoneBlock, ProHero, SectionHead } from "./parts";

export interface ArfroProLandingProps {
  /** « Projets et revendeurs » phone from Réglages. */
  phone: Phone;
  hours: string;
  whatsappHref: string;
  /** A validated reseller is signed in (only switches the calls to action; no account data here). */
  signedIn: boolean;
  /** First catalogue range of the navigation, null when there is none. */
  catalogueHref: string | null;
  /** /solutions when at least one sector page is published on this site, else null. */
  sectorsHref: string | null;
  landing: ProLanding;
}

/** Equal-area logo box (same rule as the Climatisation Maroc page), capped to the cell. */
function logoBox(aspect: number) {
  const area = 3600;
  let w = Math.sqrt(area * aspect);
  let h = Math.sqrt(area / aspect);
  const k = Math.min(1, 132 / w, 52 / h);
  w *= k;
  h *= k;
  return { w: Math.round(w), h: Math.round(h) };
}

/**
 * Arfro « Espace professionnel » (ARFRO Business): the professional journey of the owner's brief
 * (catalogue, specifications, documentation, pro prices, quotes, project follow-up), the quick
 * order that exists, account opening, brands, support. Pro prices are never shown here; the quick
 * order sample lists references and quantities only.
 */
export function ArfroProLanding({ phone, hours, whatsappHref, signedIn, catalogueHref, sectorsHref, landing }: ArfroProLandingProps) {
  return (
    <>
      <ProHero
        tone="navy"
        eyebrow="ARFRO Business · Espace professionnel"
        title="La performance climatique au service de vos projets."
        lead="Installateurs, revendeurs et projets : vos prix, votre stock et vos commandes au même endroit."
        actions={
          signedIn ? (
            <>
              <ArfroButtonLink href={QUICK_ORDER_PATH} variant="light" icon={<ArrowRight />}>
                Commande rapide
              </ArfroButtonLink>
              <ArfroButtonLink href="/demander-un-devis?pro=1" variant="outline-light">
                Demander un devis
              </ArfroButtonLink>
            </>
          ) : (
            <>
              <ArfroButtonLink href="/devenir-revendeur" variant="light" icon={<ArrowRight />}>
                Devenir revendeur
              </ArfroButtonLink>
              <ArfroButtonLink href="/connexion" variant="outline-light">
                Se connecter
              </ArfroButtonLink>
            </>
          )
        }
        aside={
          <div className="border-arfro-line-dark flex flex-col gap-5 border-t pt-8 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-12">
            <PhoneBlock phone={phone} hours={hours} onDark />
            <ArfroButtonLink href={whatsappHref} variant="link-light" className="self-start" icon={<ArrowRight />}>
              Écrire sur WhatsApp
            </ArfroButtonLink>
          </div>
        }
      />

      <Band tone="white" labelledBy="pro-parcours">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] xl:gap-20">
          <SectionHead
            id="pro-parcours"
            eyebrow="Le parcours professionnel"
            title="Du choix de l’équipement au devis."
            lead="Ce que l’espace professionnel met à votre disposition, de la sélection des appareils au suivi de vos projets."
            className="xl:sticky xl:top-28 xl:self-start"
          />
          <NumberedList items={journeySteps({ catalogueHref, sectorsHref })} />
        </div>
      </Band>

      <Band tone="ice" labelledBy="pro-commande">
        <div className="grid grid-cols-1 items-center gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:gap-20">
          <div className="flex flex-col gap-8">
            <SectionHead
              id="pro-commande"
              eyebrow="Commande en volume"
              title="La commande rapide par référence."
              lead="Réservée aux comptes revendeurs validés. Prix publics affichés, votre tarif revendeur apparaît à côté."
            />
            <ul className="m-0 flex list-none flex-col p-0">
              {QUICK_ORDER_FEATURES.map((f) => (
                <li key={f} className="border-arfro-line text-arfro-graphite flex items-start gap-4 border-t py-4 text-[17px] leading-[1.5]">
                  <span aria-hidden className="bg-arfro-electric mt-[11px] block h-px w-6 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <ArfroButtonLink href={QUICK_ORDER_PATH} variant="primary" className="self-start" icon={<ArrowRight />}>
              {signedIn ? "Ouvrir la commande rapide" : "Se connecter pour commander"}
            </ArfroButtonLink>
          </div>
          {landing.preview.length > 0 && (
            <Reveal>
              <figure className="rounded-arfro-md border-arfro-line m-0 border bg-white p-5 md:p-8">
                <figcaption className="border-arfro-line flex items-baseline justify-between gap-4 border-b pb-4">
                  <span className="font-arfro text-arfro-navy text-[17px] font-extrabold">Exemple de saisie</span>
                  <span className="text-arfro-muted text-sm">Référence · quantité</span>
                </figcaption>
                <ol className="m-0 list-none p-0">
                  {landing.preview.map((r) => (
                    <li key={r.ref} className="border-arfro-line grid grid-cols-[104px_minmax(0,1fr)_auto] items-center gap-4 border-b py-3.5 text-[15px] last:border-b-0 md:grid-cols-[128px_minmax(0,1fr)_auto]">
                      <span className="text-arfro-navy font-bold tracking-[0.02em] tabular-nums">{r.ref}</span>
                      <span className="text-arfro-graphite min-w-0 truncate">{r.name}</span>
                      <span className="text-arfro-muted font-bold tabular-nums">× {r.qty}</span>
                    </li>
                  ))}
                </ol>
              </figure>
            </Reveal>
          )}
        </div>
      </Band>

      <Band tone="warm" labelledBy="pro-audience">
        <SectionHead id="pro-audience" eyebrow="Pour qui ?" title="Un espace pensé pour les professionnels du confort." />
        <Reveal as="ul" stagger className="m-0 mt-12 grid list-none grid-cols-1 gap-x-12 p-0 md:mt-16 md:grid-cols-3">
          {AUDIENCES.map((a) => (
            <li key={a.title} className="border-arfro-graphite/15 flex flex-col gap-3 border-t py-7">
              <h3 className="font-arfro text-arfro-navy m-0 text-[24px] leading-[1.2] font-extrabold tracking-[-0.015em]">{a.title}</h3>
              <p className="text-arfro-muted m-0 text-base leading-[1.6]">{a.text}</p>
            </li>
          ))}
        </Reveal>
      </Band>

      <Band tone="white" labelledBy="pro-compte">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] xl:gap-20">
          <div className="flex flex-col gap-8">
            <SectionHead id="pro-compte" eyebrow="Ouverture de compte" title="Comment ça marche." />
            {!signedIn && (
              <ArfroButtonLink href="/devenir-revendeur" variant="primary" className="self-start" icon={<ArrowRight />}>
                Devenir revendeur
              </ArfroButtonLink>
            )}
          </div>
          <NumberedList items={ACCOUNT_STEPS} />
        </div>
      </Band>

      {landing.brands.length > 0 && (
        <Band tone="white" labelledBy="pro-marques" innerClassName="pt-0 md:pt-0 xl:pt-0">
          <div className="border-arfro-line flex flex-col gap-10 border-t pt-14 md:pt-20">
            <div className="flex flex-col gap-3">
              <Eyebrow>Marques distribuées</Eyebrow>
              <h2 id="pro-marques" className="font-arfro text-arfro-navy m-0 text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em] md:text-[32px]">
                Des marques reconnues.
              </h2>
            </div>
            <ul className="m-0 grid list-none grid-cols-3 items-center gap-x-6 gap-y-8 p-0 md:grid-cols-5 xl:grid-cols-9">
              {landing.brands.map((b) => {
                const box = logoBox(b.aspect);
                return (
                  <li key={b.href} className="flex h-16 items-center justify-center">
                    <Link href={b.href} aria-label={b.name} className="flex items-center justify-center opacity-80 transition-opacity duration-300 hover:opacity-100">
                      {b.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- pre-sized logo renditions from the API
                        <img src={b.logo} alt={b.name} loading="lazy" width={box.w} height={box.h} className="block max-w-full object-contain" style={{ width: box.w, height: box.h }} />
                      ) : (
                        <span className="text-arfro-navy text-[15px] font-bold">{b.name}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </Band>
      )}

      {landing.faq.length > 0 && (
        <Band tone="ice" labelledBy="pro-faq">
          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] xl:gap-20">
            <SectionHead id="pro-faq" eyebrow="Questions fréquentes" title="Vos questions." />
            <FaqAccordion items={landing.faq} />
          </div>
        </Band>
      )}

      <ContactBand
        phone={phone}
        hours={hours}
        whatsappHref={whatsappHref}
        title="Un interlocuteur pour vos projets."
        text="Une question sur un équipement, un devis ou l’ouverture de votre compte : appelez notre équipe projets et revendeurs."
      />
    </>
  );
}
