import Link from "next/link";
import { CategoryVisual } from "@/components/catalog/CategoryVisual";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ClipReveal, Reveal } from "@/components/arfro/motion";
import { ArfroButtonLink, EditorialImage, Eyebrow } from "@/components/arfro/ui";
import { SectorQuoteForm } from "@/components/sector/SectorQuoteForm";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { cn } from "@/lib/cn";
import type { SectorCardData, SectorDetail } from "@/lib/content/types";
import type { Phone } from "@/lib/types";
import { PROJECT_STEPS } from "./journey";
import { ArrowRight, Band, ContactAside, ContactBand, FormFrame, NumberedList, ProHero, SectionHead } from "./parts";

/** One sector of the hub or of « Autres secteurs »: its photo when there is one, else a typographic tile. */
export function SectorTile({ sector, priority = false }: { sector: SectorCardData; priority?: boolean }) {
  return (
    <Link href={sector.href} className="group text-arfro-graphite hover:text-arfro-graphite flex flex-col gap-5">
      {sector.image ? (
        <ClipReveal className="rounded-arfro-md">
          <EditorialImage
            image={{ src: sector.image }}
            alt=""
            sizes="(min-width: 1100px) 45vw, 100vw"
            priority={priority}
            className="rounded-arfro-md bg-arfro-ice aspect-[4/3]"
            imgClassName="transition-transform duration-700 ease-[var(--ease-arfro)] group-hover:scale-[1.03]"
          />
        </ClipReveal>
      ) : null}
      {/* No photo: the typographic version (hairline and name), never an empty frame. */}
      <span className="border-arfro-line flex items-start justify-between gap-6 border-t pt-5">
        <span className="flex flex-col gap-1.5">
          <span
            className={cn(
              "font-arfro text-arfro-navy leading-[1.2] font-extrabold tracking-[-0.015em]",
              sector.image ? "text-[24px] md:text-[28px]" : "text-[28px] md:text-[40px] md:leading-[1.08]",
            )}
          >
            {sector.name}
          </span>
          {sector.tagline && <span className="text-arfro-muted text-base leading-[1.5]">{sector.tagline}</span>}
        </span>
        <ArrowRight size={22} className="text-arfro-blue mt-1.5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

/** Arfro « Solutions professionnelles » hub: only the sectors published on this site. */
export function ArfroSolutionsHub({ sectors, phone, hours, whatsappHref }: { sectors: SectorCardData[]; phone: Phone; hours: string; whatsappHref: string }) {
  return (
    <>
      <ProHero
        eyebrow="ARFRO Business · Solutions professionnelles"
        title="Climatisation professionnelle au Maroc"
        lead="Hôtels, restaurants, bureaux, commerces : chaque espace a ses contraintes. Ariha Froid étudie, fournit et installe la solution adaptée, partout au Maroc, depuis 2008."
        actions={
          <>
            <ArfroButtonLink href="/demander-un-devis?pro=1" icon={<ArrowRight />}>
              Demander un devis
            </ArfroButtonLink>
            <ArfroButtonLink href={phone.href} variant="outline">
              Appeler le {phone.display}
            </ArfroButtonLink>
          </>
        }
      />

      {sectors.length > 0 && (
        <Band tone="white" labelledBy="secteurs" innerClassName="pt-0 md:pt-0 xl:pt-0">
          <h2 id="secteurs" className="sr-only">
            Secteurs
          </h2>
          <Reveal as="ul" stagger className="m-0 grid list-none grid-cols-1 gap-x-10 gap-y-14 p-0 md:grid-cols-2">
            {sectors.map((s, i) => (
              <li key={s.slug}>
                <SectorTile sector={s} priority={i === 0} />
              </li>
            ))}
          </Reveal>
        </Band>
      )}

      <Band tone="warm" labelledBy="projet-etapes">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] xl:gap-20">
          <SectionHead id="projet-etapes" eyebrow="Méthode" title="Comment se déroule un projet." className="xl:sticky xl:top-28 xl:self-start" />
          <NumberedList items={PROJECT_STEPS} />
        </div>
      </Band>

      <ContactBand phone={phone} hours={hours} whatsappHref={whatsappHref} />
    </>
  );
}

/**
 * Arfro sector page (« Restaurants et cafés »…): same API data as Climatisation Maroc. Blocks
 * without content are left out; image-band tiles show only photos uploaded in the back office.
 */
export function ArfroSectorPage({
  sector,
  h1,
  heroImage,
  cities,
  phone,
  whatsappHref,
}: {
  sector: SectorDetail;
  h1: string;
  heroImage: string | null;
  cities: string[];
  phone: Phone;
  whatsappHref: string;
}) {
  const photos = sector.imageBand.filter((b) => b.image);
  return (
    <>
      <ProHero
        eyebrow="Solutions professionnelles"
        title={h1}
        lead={sector.heroText ?? undefined}
        actions={
          <>
            <ArfroButtonLink href="#devis" icon={<ArrowRight />}>
              Demander un devis
            </ArfroButtonLink>
            <ArfroButtonLink href={whatsappHref} variant="outline">
              Écrire sur WhatsApp
            </ArfroButtonLink>
          </>
        }
        aside={
          heroImage ? (
            <EditorialImage image={{ src: heroImage }} alt="" priority sizes="(min-width: 1100px) 40vw, 100vw" className="rounded-arfro-md bg-arfro-ice aspect-[4/3] w-full" />
          ) : undefined
        }
      />

      {sector.intro && (
        <Band tone="white" innerClassName="pt-0 md:pt-0 xl:pt-0">
          <Reveal>
            <p className="font-arfro text-arfro-navy m-0 max-w-[30ch] text-[clamp(24px,2.8vw,40px)] leading-[1.3] font-semibold tracking-[-0.02em] text-pretty">{sector.intro}</p>
          </Reveal>
        </Band>
      )}

      {sector.problems.length > 0 && (
        <Band tone="warm" labelledBy="contraintes">
          <SectionHead id="contraintes" eyebrow={sector.name} title="Les contraintes à prendre en compte." />
          <div className="mt-10 md:mt-14">
            <NumberedList items={sector.problems} columns={2} />
          </div>
        </Band>
      )}

      {sector.solutions.length > 0 && (
        <Band tone="white" labelledBy="solutions-choix">
          <SectionHead id="solutions-choix" eyebrow="Équipements" title="Quelle climatisation choisir ?" />
          <Reveal as="ul" stagger className="m-0 mt-12 grid list-none grid-cols-1 gap-x-10 gap-y-12 p-0 md:mt-16 md:grid-cols-3">
            {sector.solutions.map((s) => {
              const body = (
                <>
                  <span className="rounded-arfro-md bg-arfro-ice flex h-[220px] items-center justify-center p-6">
                    {s.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- back-office upload (Secteurs › Solutions)
                      <img src={s.image} alt="" loading="lazy" className="block h-auto max-h-full w-auto max-w-full object-contain" />
                    ) : s.href ? (
                      <CategoryVisual
                        href={s.href}
                        art={s.art}
                        sizes="(min-width: 760px) 30vw, 90vw"
                        className="h-auto max-h-full w-auto max-w-full object-contain"
                        artClassName="flex h-full w-full items-center justify-center"
                      />
                    ) : null}
                  </span>
                  <span className="flex flex-col gap-2 pt-1">
                    <span className="font-arfro text-arfro-navy text-[22px] leading-[1.2] font-extrabold tracking-[-0.015em]">{s.title}</span>
                    {s.text && <span className="text-arfro-muted text-base leading-[1.6]">{s.text}</span>}
                  </span>
                  {s.href && s.cta && (
                    <span className="arfro-link text-arfro-blue mt-auto inline-flex items-center gap-2 text-[15px] font-bold">
                      {s.cta}
                      <ArrowRight />
                    </span>
                  )}
                </>
              );
              return (
                <li key={s.title}>
                  {s.href ? (
                    <Link href={s.href} className="text-arfro-graphite hover:text-arfro-graphite flex h-full flex-col gap-4">
                      {body}
                    </Link>
                  ) : (
                    <div className="flex h-full flex-col gap-4">{body}</div>
                  )}
                </li>
              );
            })}
          </Reveal>
        </Band>
      )}

      {sector.products.length > 0 && (
        <Band tone="ice" labelledBy="produits-recommandes">
          <SectionHead id="produits-recommandes" eyebrow="Sélection" title="Produits recommandés." />
          <div className="mt-10 grid grid-cols-2 gap-4 md:mt-14 md:grid-cols-3 xl:grid-cols-4">
            {sector.products.map((p) => (
              <ProductCard key={p.href} product={p} action="add" />
            ))}
          </div>
        </Band>
      )}

      {sector.rangeTiles.length > 0 && (
        <Band tone="white" labelledBy="gammes">
          <SectionHead id="gammes" eyebrow="Gammes associées" title="Pour compléter l’installation." />
          <ul className="m-0 mt-10 list-none p-0 md:mt-14">
            {sector.rangeTiles.map((t) => (
              <li key={t.title} className="border-arfro-line border-t last:border-b">
                <Link href={t.href} className="group text-arfro-graphite hover:text-arfro-graphite flex items-center justify-between gap-6 py-7">
                  <span className="flex flex-col gap-1.5">
                    <span className="font-arfro text-arfro-navy text-[22px] font-extrabold tracking-[-0.015em] md:text-[26px]">{t.title}</span>
                    {t.text && <span className="text-arfro-muted max-w-[62ch] text-base leading-[1.6]">{t.text}</span>}
                  </span>
                  <span className="text-arfro-blue flex shrink-0 items-center gap-2 text-[15px] font-bold">
                    <span className="hidden md:inline">{t.cta ?? "Voir la gamme"}</span>
                    <ArrowRight size={22} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Band>
      )}

      <Band tone="warm" labelledBy="projet-etapes">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] xl:gap-20">
          <SectionHead id="projet-etapes" eyebrow="Méthode" title="Comment se déroule un projet." className="xl:sticky xl:top-28 xl:self-start" />
          <NumberedList items={PROJECT_STEPS} />
        </div>
      </Band>

      {photos.length > 0 && (
        <Band tone="white" labelledBy="en-images">
          <h2 id="en-images" className="sr-only">
            En images
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {photos.map((b) => (
              <figure key={b.caption} className="m-0 flex flex-col gap-3">
                <ClipReveal className="rounded-arfro-md">
                  <EditorialImage image={{ src: b.image! }} alt={b.alt ?? ""} sizes="(min-width: 760px) 33vw, 100vw" className="rounded-arfro-md bg-arfro-ice aspect-[4/3]" />
                </ClipReveal>
                <figcaption className="text-arfro-muted text-sm font-bold tracking-[0.04em]">{b.caption}</figcaption>
              </figure>
            ))}
          </div>
        </Band>
      )}

      <Band tone="ice" id="devis" className="scroll-mt-24">
        <Eyebrow className="mb-6">Devis professionnel</Eyebrow>
        <FormFrame className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
          <SectorQuoteForm sectorSlug={sector.slug} title={sector.quoteTitle ?? "Demander un devis"} cities={cities} />
          <ContactAside title="Nous vous rappelons rapidement" phone={phone} hours={sector.contact.hours} whatsappHref={whatsappHref} />
        </FormFrame>
      </Band>

      {sector.faq.length > 0 && (
        <Band tone="white" labelledBy="faq">
          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] xl:gap-20">
            <SectionHead id="faq" eyebrow="Questions fréquentes" title="Vos questions." />
            <FaqAccordion items={sector.faq} />
          </div>
        </Band>
      )}

      {sector.others.length > 0 && (
        <Band tone="white" labelledBy="autres-secteurs" innerClassName={sector.faq.length > 0 ? "pt-0 md:pt-0 xl:pt-0" : undefined}>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHead id="autres-secteurs" eyebrow="Solutions professionnelles" title="Autres secteurs." />
            <ArfroButtonLink href="/solutions" variant="link" icon={<ArrowRight />}>
              Tous les secteurs
            </ArfroButtonLink>
          </div>
          <ul className="m-0 grid list-none grid-cols-1 gap-x-10 gap-y-12 p-0 md:grid-cols-2 xl:grid-cols-3">
            {sector.others.map((s) => (
              <li key={s.slug}>
                <SectorTile sector={s} />
              </li>
            ))}
          </ul>
        </Band>
      )}
    </>
  );
}
