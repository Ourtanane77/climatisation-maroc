import type { ArticleCardData } from "@/lib/blog/types";
import type { ProductCardData } from "@/lib/types";

/**
 * `arfro` block of GET /home on arfro.com: the editorial home of the owner's brief
 * (docs/arfro-creative-brief.md), built by App\Support\Home\ArfroHomeContent. A section is null when
 * it is switched off or has nothing real to show: the page simply leaves it out.
 */

export interface ArfroLink {
  label: string;
  href: string;
}

/** Back-office upload (`src`, absolute URL) or a site photo from public/design (`design`, file name). */
export type ArfroImage = { src: string } | { design: string } | null;

export interface ArfroSectionBase {
  eyebrow: string | null;
  title: string;
  text: string | null;
}

export type TechnologyIcon = "inverter" | "energy" | "regulation" | "quiet" | "filtration" | "connected" | "refrigerant" | "climate";
export type ServiceIcon = "installation" | "visit" | "advice" | "quote" | "delivery" | "payment" | "support";
export type EnvironmentKey = "maison" | "bureaux" | "hotellerie" | "restauration" | "commerce" | "autre";

export interface ArfroServiceItem {
  icon: ServiceIcon | null;
  title: string;
  text: string | null;
  cta: ArfroLink | null;
}

export interface ArfroHomeSections {
  hero: (ArfroSectionBase & { cta: ArfroLink | null; secondary: ArfroLink | null; image: ArfroImage }) | null;
  manifesto: (ArfroSectionBase & { cta: ArfroLink | null; image: ArfroImage }) | null;
  environments:
    | (ArfroSectionBase & {
        items: { key: EnvironmentKey | null; title: string; text: string | null; href: string | null; ctaLabel: string | null; image: ArfroImage }[];
      })
    | null;
  technology:
    | (ArfroSectionBase & { image: ArfroImage; items: { icon: TechnologyIcon | null; title: string; text: string | null; href: string | null }[] })
    | null;
  products: (ArfroSectionBase & { cta: ArfroLink | null; collections: { label: string; href: string | null; products: ProductCardData[] }[] }) | null;
  care: (ArfroSectionBase & { cta: ArfroLink | null; image: ArfroImage; items: ArfroServiceItem[] }) | null;
  advisor: ArfroSectionBase | null;
  projects:
    | (ArfroSectionBase & {
        items: { title: string; location: string | null; type: string | null; products: string | null; description: string | null; image: ArfroImage }[];
      })
    | null;
  business:
    | (ArfroSectionBase & { cta: ArfroLink | null; secondary: ArfroLink | null; image: ArfroImage; items: { title: string; text: string | null }[] })
    | null;
  /** Logos come from the top-level `brands` of GET /home. */
  brands: ArfroSectionBase | null;
  trust: (ArfroSectionBase & { items: ArfroServiceItem[] }) | null;
  testimonials:
    | (Omit<ArfroSectionBase, "title"> & {
        title: string | null;
        items: { author: string; location: string | null; type: string | null; products: string | null; quote: string; image: ArfroImage }[];
      })
    | null;
  journal: (ArfroSectionBase & { cta: ArfroLink | null; articles: ArticleCardData[] }) | null;
  final: (ArfroSectionBase & { cta: ArfroLink | null; secondary: ArfroLink | null; image: ArfroImage }) | null;
}

/** Real figures the sections may quote (Réglages and Paiement of the site). */
export interface ArfroHomeFacts {
  hours: string | null;
  cardPayment: boolean;
  /** Centimes. */
  technicalVisitPrice: number | null;
  advicePhone: { label: string; display: string; href: string } | null;
  whatsapp: string | null;
}

export interface ArfroHomeData {
  sections: ArfroHomeSections;
  facts: ArfroHomeFacts;
}
