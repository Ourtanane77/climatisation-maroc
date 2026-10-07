import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DenseRow, DenseRowHeader } from "@/components/catalog/DenseRow";
import { FilterColumn } from "@/components/catalog/FilterColumn";
import { ProductArt } from "@/components/catalog/ProductArt";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Badge, Tag } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { StyleguideForms } from "./StyleguideForms";
import type { ArtKey, ProductCardData } from "@/lib/types";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Composants", noindex: true, follow: false });

/**
 * Component gallery (development only): every shared component with design data, for the
 * visual checks at 1440 and 390 against design/*.dc.html. Not available in production.
 */

// LG Dual Inverter from data/catalog.json (regular / selling prices, in centimes).
const lgDual: ProductCardData = {
  name: "LG Dual Inverter",
  href: "#",
  brand: "LG",
  refText: "4 puissances",
  price: 540000,
  fromPrice: true,
  art: "mural",
  badge: { text: "−13 %", tone: "promo" },
  options: [
    { label: "9K", fullLabel: "9 000 BTU", sku: "D10AWH.NW0", price: 540000, regularPrice: 620000 },
    { label: "12K", fullLabel: "12 000 BTU", sku: "D13AJH.N", price: 570000, regularPrice: 650000, image: "/design/clima-cut2-480.webp" },
    { label: "18K", fullLabel: "18 000 BTU", sku: "D19AKH.NK0", price: 760000, regularPrice: 810000 },
    { label: "24K", fullLabel: "24 000 BTU", sku: "D24AKH-N", price: 890000, regularPrice: 950000 },
  ],
};

const cards: ProductCardData[] = [
  lgDual,
  {
    name: "Carrier Mural Inverter R32 9 000 BTU",
    href: "#",
    sku: "42QHG009D8SC-R32",
    price: 420000,
    regularPrice: 505000,
    art: "mural",
    badge: { text: "−17 %", tone: "promo" },
  },
  { name: "LG Cassette Inverter 18000 BTU", href: "#", sku: "ATNW18GPLS1", price: 1250000, art: "cassette", badge: { text: "LG", tone: "brand" } },
  {
    name: "Fitco Mural Inverter 24 000 BTU Noir",
    href: "#",
    sku: "FSW24T23PM/N",
    price: 700000,
    regularPrice: 780000,
    art: "mural",
    dark: true,
    badge: { text: "−10 %", tone: "promo" },
  },
];

const arts: ArtKey[] = [
  "mural",
  "gainable",
  "cassette",
  "console",
  "solaire",
  "vent",
  "flex",
  "coilS",
  "coilL",
  "duo",
  "gaz",
  "support",
  "scotch",
  "remote",
  "iso",
];

export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="flex flex-col gap-14">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Climatisation", href: "/climatisation" }, { label: "Composants" }]} />
      <h1 className="m-0 text-[34px] leading-[1.05] font-bold tracking-[-0.03em] md:text-[44px] xl:text-[56px]">Composants</h1>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-[32px] font-bold tracking-[-0.03em] md:text-[44px]">Boutons et badges</h2>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="#" variant="orange">
            Demander un devis
          </ButtonLink>
          <ButtonLink href="#" variant="blue">
            Suivre ma commande
          </ButtonLink>
          <ButtonLink href="https://wa.me/212666854184" variant="whatsapp">
            Nous écrire sur WhatsApp
          </ButtonLink>
          <ButtonLink href="#" variant="outline">
            Voir les climatiseurs
          </ButtonLink>
          <ButtonLink href="#" variant="white">
            Se connecter
          </ButtonLink>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge tone="promo">{"−12 %"}</Badge>
          <Badge tone="brand">LG</Badge>
          <Badge tone="brand">Nouveau</Badge>
          <Tag>Distributeur officiel</Tag>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-[32px] font-bold tracking-[-0.03em] md:text-[44px]">Fiches produit (cartes)</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ProductCard product={cards[0]} action="add" />
          <ProductCard product={cards[1]} />
          <ProductCard product={cards[2]} />
          <ProductCard product={cards[3]} action="add" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-[280px_minmax(0,1fr)]">
        <FilterColumn
          hrefFor={() => "#"}
          facets={[
            {
              key: "power",
              label: "Puissance",
              values: ["9 000 BTU", "12 000 BTU", "18 000 BTU", "24 000 BTU"].map((v, i) => ({ value: v, label: v, selected: i === 1 })),
            },
            {
              key: "brand",
              label: "Marque",
              values: [
                { value: "lg", label: "LG", count: 3, selected: false },
                { value: "carrier", label: "Carrier", count: 3, selected: false },
                { value: "ciat", label: "CIAT", count: 1, selected: false },
                { value: "fitco", label: "Fitco", count: 2, selected: false },
              ],
            },
            { key: "tech", label: "Technologie", values: ["Inverter", "On/Off"].map((v) => ({ value: v, label: v, selected: true })) },
          ]}
        />
        <div className="rounded-24 bg-white px-4 py-1 md:px-6 md:py-4">
          <DenseRowHeader />
          <DenseRow item={{ name: "Cuivre 1/4 Lafarga 15 m", sku: "CUIV0005", price: 49500, art: "coilS", inStock: true }} />
          <DenseRow item={{ name: "Kit duo 1/4-3/8 20 m", sku: "CUIV0018", price: 113000, art: "duo", inStock: true }} inSelection />
          <DenseRow item={{ name: "Cuivre 3/4 15 m", sku: "CUIV0009", price: 187500, art: "coilL", inStock: false }} />
          <DenseRow item={{ name: "Armaflex 9/6", sku: "CLIM00008", price: 350, art: "iso", inStock: true }} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-[32px] font-bold tracking-[-0.03em] md:text-[44px]">Questions fréquentes</h2>
        <FaqAccordion
          jsonLd={false}
          items={[
            {
              question: "Quelle puissance choisir ?",
              answer:
                "Environ 600 BTU par m² : 9 000 BTU jusqu’à 15 m², 12 000 jusqu’à 20 m², 18 000 jusqu’à 30 m², 24 000 jusqu’à 40 m², 30 000 et plus au-delà. Une taille au-dessus pour une pièce très ensoleillée ou au dernier étage.",
            },
            { question: "La livraison est-elle gratuite ?", answer: "Oui, partout au Maroc, sous 48 heures." },
            { question: "Proposez-vous la pose ?", answer: "Oui, par nos propres techniciens, sur devis." },
          ]}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-[32px] font-bold tracking-[-0.03em] md:text-[44px]">Formulaires</h2>
        <StyleguideForms />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-[32px] font-bold tracking-[-0.03em] md:text-[44px]">Illustrations</h2>
        <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
          {arts.map((a) => (
            <figure key={a} className="rounded-20 m-0 flex h-36 flex-col items-center justify-center gap-2 bg-white p-4">
              <ProductArt art={a} className="h-20 w-auto" />
              <figcaption className="text-muted text-sm">{a}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
