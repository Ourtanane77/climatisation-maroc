import type { Metadata } from "next";
import Link from "next/link";
import { CategoryVisual } from "@/components/catalog/CategoryVisual";
import { ProductArt } from "@/components/catalog/ProductArt";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ArrowIcon, GRID_2, GRID_3, GRID_4, IconTile, PageTitle, Section, SectionTitle, SectorCard, SectorScene, StepList } from "@/components/content/blocks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { SectorQuoteForm } from "@/components/sector/SectorQuoteForm";
import { StickyQuoteBar } from "@/components/sector/StickyQuoteBar";
import { ButtonLink } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { MAT, MatIcon } from "@/components/ui/icons";
import { apiGet } from "@/lib/api";
import { getSector } from "@/lib/content/api";
import { withSectorPhoto } from "@/lib/content/sector-images";
import { DesignImg } from "@/components/ui/DesignImg";
import { designPhoto } from "@/lib/design-assets";
import { PROJECT_STEPS, PROJECTS_PHONE_LABEL, phoneFor } from "@/lib/content/copy";
import { telHref } from "@/lib/phone";
import { waLink } from "@/lib/whatsapp";
import { seoMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/solutions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const sector = await getSector(slug);
  return seoMetadata({
    title: sector.seo.title ?? sector.name,
    description: sector.seo.description ?? sector.heroText,
    path: sector.href,
    noindex: sector.seo.noindex,
  });
}

/** Sector page (design: Restaurants.dc.html). */
export default async function SectorPage({ params }: PageProps<"/solutions/[slug]">) {
  const { slug } = await params;
  const [sector, cities] = await Promise.all([getSector(slug), apiGet<{ data: { name: string }[] }>("/cities", { tags: ["cities"] })]);
  const phone = phoneFor(sector.contact, PROJECTS_PHONE_LABEL);
  const h1 = sector.seo.h1 ?? sector.name;
  const wa = waLink(sector.whatsappText ?? undefined, sector.contact.whatsapp);
  const heroImage = withSectorPhoto(sector).image;

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Solutions professionnelles", href: "/solutions" }, { label: sector.name }]} />

      <section
        className="rounded-28 relative mt-6 grid grid-cols-1 items-center overflow-hidden xl:min-h-[480px] xl:grid-cols-2"
        style={{ background: sector.bg ?? "#FCE6D6" }}
      >
        <div className="relative z-[1] flex flex-col gap-5 px-5 pt-7 md:px-10 md:pt-10 xl:p-14">
          <span className="rounded-8 text-promo self-start bg-white px-2.5 py-1 text-sm font-bold">Solutions professionnelles</span>
          <PageTitle>{h1}</PageTitle>
          {sector.heroText && <p className="m-0 max-w-[560px] text-[19px] leading-[1.55] text-pretty">{sector.heroText}</p>}
          <div className="flex flex-col gap-3 pt-1 md:flex-row">
            <ButtonLink href="#devis" variant="orange" mobileFull>
              Demander un devis
            </ButtonLink>
            <ButtonLink href={wa} variant="whatsapp" mobileFull>
              Commander par WhatsApp
            </ButtonLink>
          </div>
        </div>
        <div aria-hidden className="flex h-full min-h-[200px] items-center justify-center px-5 pt-3 pb-6 md:min-h-[280px] md:px-12 md:py-6 xl:min-h-[380px]">
          {heroImage ? (
            // Photo set in the back office (Secteurs › Photo), else the design's line scene.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt="" fetchPriority="high" className="rounded-24 block aspect-[4/3] w-full max-w-[560px] object-cover" />
          ) : (
            <SectorScene scene={sector.scene} width="100%" strokeWidth={2} style={{ maxWidth: 560, maxHeight: "none" }} />
          )}
        </div>
      </section>

      {sector.intro && (
        <Section className="max-w-[860px]">
          <p className="m-0 text-[19px] leading-[1.65] text-pretty">{sector.intro}</p>
        </Section>
      )}

      {sector.problems.length > 0 && (
        <Section>
          <SectionTitle>Les contraintes d&apos;un restaurant</SectionTitle>
          <div className={GRID_4}>
            {sector.problems.map((p) => (
              <div key={p.title} className="rounded-20 flex flex-col gap-3.5 bg-white p-6">
                <IconTile icon={p.icon} bg="#FDF0E6" />
                <h3 className="m-0 text-[19px] font-bold">{p.title}</h3>
                {p.text && <p className="text-ink-2 m-0 text-base leading-[1.5]">{p.text}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {sector.solutions.length > 0 && (
        <Section>
          <SectionTitle>Quelle climatisation choisir ?</SectionTitle>
          <div className={GRID_3}>
            {sector.solutions.map((s) => {
              const body = (
                <>
                  <div className="flex h-[170px] items-center justify-center">
                    {s.image ? (
                      // Photo uploaded on this block in the back office (Secteurs › Solutions).
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.image} alt="" loading="lazy" className="block h-auto max-h-full w-auto max-w-full object-contain" />
                    ) : s.href ? (
                      // The category's photo (back office, then the owner's), else its drawing.
                      <CategoryVisual
                        href={s.href}
                        art={s.art}
                        sizes="(min-width: 760px) 30vw, 90vw"
                        className="h-auto max-h-full w-auto max-w-full object-contain"
                        artClassName="flex h-full items-center justify-center"
                        artStyle={{ width: s.art === "cassette" ? "52%" : "100%" }}
                      />
                    ) : (
                      s.art && (
                        <div className="flex h-full items-center justify-center" style={{ width: s.art === "cassette" ? "52%" : "100%" }}>
                          <ProductArt art={s.art} className="h-auto max-h-full w-full" />
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="m-0 text-2xl font-bold tracking-[-0.01em]">{s.title}</h3>
                    {s.text && <p className="m-0 text-base leading-[1.5]">{s.text}</p>}
                  </div>
                  {s.href && s.cta && (
                    <span className="text-brand mt-auto flex items-center gap-2 text-base font-bold">
                      {s.cta}
                      <ArrowIcon />
                    </span>
                  )}
                </>
              );
              const cls = "rounded-24 text-ink hover:text-ink flex flex-col gap-4 p-6 hover:brightness-[0.98]";
              return s.href ? (
                <Link key={s.title} href={s.href} className={cls} style={{ background: s.bg ?? "#E8EFF8" }}>
                  {body}
                </Link>
              ) : (
                <div key={s.title} className={cls} style={{ background: s.bg ?? "#E8EFF8" }}>
                  {body}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {sector.products.length > 0 && (
        <Section>
          <SectionTitle>Produits recommandés</SectionTitle>
          <div className={GRID_4}>
            {sector.products.map((p) => (
              <ProductCard key={p.href} product={{ ...p, badge: p.badge ?? (p.brand ? { text: p.brand, tone: "brand" } : null) }} action="add" />
            ))}
          </div>
        </Section>
      )}

      {sector.rangeTiles.length > 0 && (
        <Section>
          <SectionTitle>Ventilation et extraction</SectionTitle>
          <div className={GRID_2}>
            {sector.rangeTiles.map((t) => (
              <Link
                key={t.title}
                href={t.href}
                className="rounded-24 text-ink hover:text-ink relative box-border flex min-h-[240px] flex-col justify-between gap-4 overflow-hidden p-7 hover:brightness-[0.98] md:min-h-[280px]"
                style={{ background: t.bg ?? "#E8EFF8" }}
              >
                <div className="relative z-[1] flex max-w-[62%] flex-col gap-1.5 md:max-w-[56%]">
                  <h3 className="m-0 text-[26px] font-bold tracking-[-0.01em]">{t.title}</h3>
                  {t.text && <p className="m-0 text-base leading-[1.5]">{t.text}</p>}
                </div>
                {t.cta && (
                  <span className="relative z-[1] flex h-12 items-center gap-2 self-start rounded-full bg-white px-5 text-[15px] font-bold">
                    {t.cta}
                    <ArrowIcon />
                  </span>
                )}
                {t.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.image}
                    alt=""
                    aria-hidden
                    className="absolute right-[-4%] bottom-[-8%] block w-[46%] drop-shadow-[0_14px_18px_rgba(14,40,70,0.22)] md:w-[42%]"
                  />
                ) : (
                  // The range's photo (as on the home page), else the line drawing kept inside the tile.
                  <CategoryVisual
                    href={t.href}
                    art={t.art}
                    sizes="(min-width: 760px) 25vw, 45vw"
                    className="absolute right-[-4%] bottom-[-8%] block h-auto w-[46%] drop-shadow-[0_14px_18px_rgba(14,40,70,0.22)] md:w-[42%]"
                    artClassName="absolute right-[5%] bottom-[10%] w-[34%] md:w-[30%]"
                  />
                )}
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section>
        <SectionTitle>Comment se déroule un projet</SectionTitle>
        <StepList items={PROJECT_STEPS} />
      </Section>

      {sector.imageBand.length > 0 && (
        <Section aria-labelledby="en-images">
          <h2 id="en-images" className="sr-only">
            En images
          </h2>
          <div className={GRID_3}>
            {sector.imageBand.map((b) => {
              // A tile with neither image nor scene is the design's photo slot (hotel lobby photo).
              const photo = b.image ? { src: b.image } : b.scene ? null : designPhoto("solutions-category.png");
              return (
                <figure
                  key={b.caption}
                  className="rounded-24 relative m-0 flex aspect-[4/3] items-center justify-center overflow-hidden"
                  style={{ background: b.bg ?? "#E8EFF8" }}
                >
                  {photo ? (
                    <DesignImg photo={photo} alt={b.alt ?? ""} sizes="(max-width: 759px) 100vw, 33vw" className="block size-full object-cover" />
                  ) : (
                    <SectorScene scene={b.scene} width="72%" />
                  )}
                  <figcaption className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1.5 text-sm font-bold">{b.caption}</figcaption>
                </figure>
              );
            })}
          </div>
        </Section>
      )}

      <Section id="devis" className="scroll-mt-24">
        <div className="rounded-28 bg-tint-blue grid grid-cols-1 items-start gap-6 p-6 md:p-12 xl:grid-cols-[minmax(0,1fr)_320px]">
          <SectorQuoteForm sectorSlug={sector.slug} title={sector.quoteTitle ?? "Demander un devis"} cities={cities.data.map((c) => c.name)} />
          <aside className="flex flex-col gap-4 xl:pt-2">
            <h2 className="m-0 text-2xl font-bold tracking-[-0.01em]">Nous vous rappelons rapidement</h2>
            <a href={telHref(phone)} className="text-ink hover:text-brand flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white">
                <MatIcon d={MAT.phone} size={22} className="text-brand" />
              </span>
              <span className="flex flex-col">
                <span className="text-ink-2 text-sm">{PROJECTS_PHONE_LABEL}</span>
                <span className="text-2xl font-extrabold">{phone}</span>
              </span>
            </a>
            <ButtonLink href={wa} variant="whatsapp">
              WhatsApp
            </ButtonLink>
            <span className="text-ink-2 text-[15px]">{sector.contact.hours}</span>
          </aside>
        </div>
      </Section>

      {sector.faq.length > 0 && (
        <Section>
          <SectionTitle>Questions fréquentes</SectionTitle>
          <FaqAccordion items={sector.faq} />
        </Section>
      )}

      {sector.others.length > 0 && (
        <Section>
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
            <SectionTitle className="mb-0">Autres secteurs</SectionTitle>
            <Link href="/solutions" className="text-base font-bold underline">
              Tous les secteurs
            </Link>
          </div>
          <div className={GRID_4}>
            {sector.others.map((s) => (
              <SectorCard key={s.slug} sector={withSectorPhoto(s)} />
            ))}
          </div>
        </Section>
      )}

      <StickyQuoteBar title={h1.replace(/ au Maroc$/, "")} subtitle={`Visite technique 300 Dhs · ${phone}`} />
    </>
  );
}
