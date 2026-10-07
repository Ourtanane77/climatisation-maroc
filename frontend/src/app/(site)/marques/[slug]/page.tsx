import type { Metadata } from "next";
import Link from "next/link";
import { ProductArt } from "@/components/catalog/ProductArt";
import { BrandGroups } from "@/components/brand/BrandGroups";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { BrandTiles } from "@/components/brand/BrandTiles";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { iconPaths } from "@/components/product/Highlights";
import { Section } from "@/components/product/Section";
import { DuoIcon, WhatsAppIcon } from "@/components/ui/icons";
import { DesignImg } from "@/components/ui/DesignImg";
import { designPhoto } from "@/lib/design-assets";
import { getBrand } from "@/lib/product/api";
import { waLink } from "@/lib/whatsapp";
import { seoMetadata } from "@/lib/seo/metadata";

/** Brand page (design: Marque LG). */
export async function generateMetadata({ params }: PageProps<"/marques/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { brand, seo } = await getBrand(slug);
  return seoMetadata({
    title: seo.title ?? `${brand.name} au Maroc`,
    description: seo.description ?? brand.intro,
    path: seo.canonical ?? brand.href,
    noindex: seo.noindex,
    image: seo.ogImage,
  });
}

export default async function BrandPage({ params }: PageProps<"/marques/[slug]">) {
  const { slug } = await params;
  const data = await getBrand(slug);
  // Marque LG.dc.html shows the design's LG wall-unit cut-out; other brands use their own product photo.
  const heroPhoto = (data.brand.slug === "lg" ? designPhoto("clima-cut2.png") : null) ?? (data.heroImage ? { src: data.heroImage } : null);
  const { brand } = data;
  const h1 = data.seo.h1 ?? brand.name;
  // The design's WhatsApp text names the product kind ("un climatiseur LG"); other brands get "un produit".
  const kind = brand.caption === "Climatisation" ? "un climatiseur" : "un produit";

  return (
    <div>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Marques", href: "/marques" }, { label: brand.name }]} />

      <section className="rounded-28 mt-6 grid grid-cols-1 items-center gap-x-12 gap-y-6 bg-white px-5 py-6 md:p-12 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="flex flex-col gap-[18px]">
          <div className="flex flex-wrap items-center gap-3.5">
            <BrandLogo brand={brand} mobile={{ area: 2600, maxH: 40, maxW: 140 }} desktop={{ area: 4200, maxH: 56, maxW: 140 }} />
            {brand.official && <span className="rounded-8 bg-tint-blue text-brand px-3 py-[5px] text-sm font-bold">Distributeur officiel</span>}
          </div>
          <h1 className="m-0 text-[34px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px] xl:text-[56px]">{h1}</h1>
          {brand.intro && <p className="text-ink-2 m-0 max-w-[620px] text-[19px] leading-[1.55] text-pretty">{brand.intro}</p>}
        </div>
        <div aria-hidden className="rounded-24 bg-tint-blue-2 box-border flex min-h-[180px] items-center justify-center p-6 md:min-h-[300px]">
          {heroPhoto ? (
            <DesignImg
              photo={heroPhoto}
              sizes="(max-width: 999px) 90vw, 520px"
              priority
              className="block h-auto max-h-[200px] w-auto max-w-full object-contain mix-blend-multiply md:max-h-[300px] xl:max-w-[520px]"
            />
          ) : (
            <ProductArt art="mural" className="h-auto w-full max-w-[520px]" />
          )}
        </div>
      </section>

      <BrandGroups groups={data.groups} />

      {brand.features.length > 0 && (
        <Section title={`Les technologies ${brand.name}`} titleClassName="mb-6">
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 xl:grid-cols-4">
            {brand.features.map((f) => (
              <li key={f.title} className="rounded-20 flex flex-col gap-3.5 bg-white p-6">
                <span className="rounded-16 bg-tint-blue flex size-[52px] items-center justify-center">
                  <DuoIcon paths={iconPaths(f.icon)} size={26} />
                </span>
                <h3 className="m-0 text-[19px] font-bold">{f.title}</h3>
                <p className="text-ink-2 m-0 text-base leading-normal">{f.text}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.others.length > 0 && (
        <Section title="Autres marques" titleClassName="mb-6">
          <BrandTiles brands={data.others} />
        </Section>
      )}

      <section className="pt-10 md:pt-14">
        <div className="rounded-28 bg-tint-blue flex flex-wrap items-center justify-between gap-6 p-6 md:p-12">
          <div className="flex max-w-[620px] flex-col gap-2">
            <h2 className="m-0 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px]">Un projet avec du {brand.name} ?</h2>
            {data.advicePhone && (
              <p className="text-ink-2 m-0 text-[17px] leading-[1.55]">
                Conseil et devis au{" "}
                <a href={data.advicePhone.href} className="text-ink-2 hover:text-brand whitespace-nowrap">
                  {data.advicePhone.display}
                </a>
                , du lundi au samedi de 9h à 19h.
              </p>
            )}
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <a
              href={waLink(`Bonjour, je cherche ${kind} ${brand.name}.`, data.whatsapp)}
              target="_blank"
              rel="noopener"
              className="bg-whatsapp flex h-14 items-center justify-center gap-2.5 rounded-full px-7 text-base font-bold whitespace-nowrap text-white hover:text-white hover:brightness-95"
            >
              <WhatsAppIcon size={20} />
              Nous écrire sur WhatsApp
            </a>
            <Link
              href="/demander-un-devis"
              className="bg-accent hover:bg-accent-hover flex h-14 items-center justify-center rounded-full px-7 text-base font-bold whitespace-nowrap text-white hover:text-white"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
