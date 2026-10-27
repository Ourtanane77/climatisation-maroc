import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ArfroHomeFacts, ArfroHomeSections } from "@/lib/home/arfro";
import type { ProductCardData } from "@/lib/types";

vi.mock("server-only", () => ({}));

const { ArfroProducts } = await import("./Products");
const { ArfroCare } = await import("./Care");
const { ArfroBusiness } = await import("./Business");
const { ArfroBrands } = await import("./Brands");
const { ArfroTrust } = await import("./Trust");
const { ArfroTestimonials } = await import("./Testimonials");
const { ArfroProjects } = await import("./Projects");
const { ArfroJournal } = await import("./Journal");
const { ArfroFinal } = await import("./Final");

type S = ArfroHomeSections;

const facts: ArfroHomeFacts = {
  hours: "Lundi – Samedi, 9h – 19h",
  cardPayment: false,
  technicalVisitPrice: 30000,
  advicePhone: { label: "Conseil", display: "0666-088348", href: "tel:+212666088348" },
  whatsapp: "212666854184",
};

const product = (n: number, extra: Partial<ProductCardData> = {}): ProductCardData => ({
  name: `Produit ${n}`,
  href: `/produit/p-${n}`,
  brand: "LG",
  sku: `SKU-${n}`,
  price: 100000 * n,
  inStock: true,
  ...extra,
});

describe("ArfroProducts", () => {
  const data: NonNullable<S["products"]> = {
    eyebrow: null,
    title: "Des équipements sélectionnés pour votre confort.",
    text: null,
    cta: null,
    collections: [
      { label: "Climatisation", href: "/climatisation", products: [1, 2, 3, 4, 5, 6].map((n) => product(n)) },
      { label: "Chauffe-eau", href: "/chauffe-eau", products: [product(7)] },
      { label: "Solutions professionnelles", href: "/solutions", products: [] },
    ],
  };

  it("renders a labelled section with a tablist of non-empty collections", () => {
    render(<ArfroProducts data={data} />);
    const section = screen.getByRole("region", { name: data.title });
    expect(section).toHaveAttribute("id", "produits");
    const tabs = screen.getAllByRole("tab");
    // The visible « 06 » is decoration; the name says the count in words.
    expect(screen.getByRole("tab", { name: /^Climatisation ?\(6 produits\)$/ })).toBe(tabs[0]);
    expect(screen.getByRole("tab", { name: /^Chauffe-eau ?\(1 produit\)$/ })).toBe(tabs[1]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", tabs[0].id);
  });

  it("keeps an inactive collection as a plain crawlable link list until it is first shown", () => {
    const { container } = render(<ArfroProducts data={data} />);
    const inactive = container.querySelector<HTMLElement>("#arfro-products-panel-1")!;
    expect(inactive).not.toBeVisible();
    expect(inactive.querySelector('a[href="/produit/p-7"]')).not.toBeNull();
    expect(inactive.querySelector("article")).toBeNull();
    fireEvent.click(screen.getAllByRole("tab")[1]);
    expect(inactive.querySelector("article")).not.toBeNull();
  });

  it("switches collections by click and arrow keys, each with « Voir toute la collection »", () => {
    render(<ArfroProducts data={data} />);
    const tabs = screen.getAllByRole("tab");
    fireEvent.click(tabs[1]);
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByRole("link", { name: "Produit 7" })).toHaveAttribute("href", "/produit/p-7");
    expect(within(panel).getAllByRole("link", { name: /Voir toute la collection/ })[0]).toHaveAttribute("href", "/chauffe-eau");
    fireEvent.keyDown(tabs[1], { key: "ArrowRight" });
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveFocus();
  });

  it("renders nothing without products", () => {
    const { container } = render(<ArfroProducts data={{ ...data, collections: [{ label: "Vide", href: null, products: [] }] }} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ArfroCare", () => {
  const data: NonNullable<S["care"]> = {
    eyebrow: "ARFRO Care",
    title: "Votre confort mérite un accompagnement durable.",
    text: null,
    cta: { label: "Découvrir nos services", href: "/services" },
    image: null,
    items: [
      { icon: "installation", title: "Installation", text: "Sur devis.", cta: { label: "Demander un devis", href: "/demander-un-devis" } },
      { icon: "advice", title: "Conseil", text: "Par téléphone ou WhatsApp.", cta: null },
    ],
  };

  it("lists the real services and links advice to the real phone and WhatsApp", () => {
    render(<ArfroCare data={data} facts={facts} />);
    expect(screen.getByRole("region", { name: data.title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Installation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Appeler le 0666-088348/ })).toHaveAttribute("href", "tel:+212666088348");
    expect(screen.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", "https://wa.me/212666854184");
    expect(screen.getByRole("link", { name: /Découvrir nos services/ })).toHaveAttribute("href", "/services");
    expect(document.querySelector("img")).toBeNull();
  });
});

describe("ArfroBusiness", () => {
  it("renders the numbered offer and both CTAs", () => {
    const data: NonNullable<S["business"]> = {
      eyebrow: "ARFRO Business",
      title: "La performance climatique au service de vos projets.",
      text: null,
      cta: { label: "Parler à un expert", href: "/contact" },
      secondary: { label: "Demander un devis", href: "/demander-un-devis" },
      image: { src: "https://example.test/lobby.jpg" },
      items: [
        { title: "Consultation", text: null },
        { title: "Devis professionnels", text: null },
      ],
    };
    render(<ArfroBusiness data={data} />);
    expect(screen.getByRole("region", { name: data.title })).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Devis professionnels" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Parler à un expert/ })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: /Demander un devis/ })).toHaveAttribute("href", "/demander-un-devis");
  });
});

describe("ArfroBrands", () => {
  const data: NonNullable<S["brands"]> = { eyebrow: null, title: "Des marques reconnues. Une expertise de confiance.", text: null };

  it("links every official logo to its brand page", () => {
    render(
      <ArfroBrands
        data={data}
        brands={[
          { name: "LG", href: "/marques/lg", logo: "/storage/brands/lg-h96.webp", aspect: 2.05 },
          { name: "Sans logo", href: "/marques/x", logo: null, aspect: null },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "LG" })).toHaveAttribute("href", "/marques/lg");
    expect(screen.getByText("Sans logo")).toBeInTheDocument();
  });

  it("renders nothing without brands", () => {
    const { container } = render(<ArfroBrands data={data} brands={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ArfroTrust", () => {
  it("shows the commitments without numbers", () => {
    const data: NonNullable<S["trust"]> = {
      eyebrow: null,
      title: "Votre confiance fait notre différence.",
      text: null,
      items: [
        { icon: "delivery", title: "Livraison gratuite partout au Maroc", text: null, cta: null },
        { icon: "support", title: "Un conseiller à votre écoute", text: null, cta: null },
      ],
    };
    render(<ArfroTrust data={data} facts={facts} />);
    expect(screen.getByRole("region", { name: data.title })).toBeInTheDocument();
    expect(screen.queryByText("01")).toBeNull();
    expect(screen.getByRole("link", { name: /Appeler le/ })).toBeInTheDocument();
  });
});

describe("hidden-until-real sections", () => {
  it("testimonials and projects render nothing without items", () => {
    const t = render(<ArfroTestimonials data={{ eyebrow: null, title: null, text: null, items: [] }} />);
    expect(t.container).toBeEmptyDOMElement();
    const p = render(<ArfroProjects data={{ eyebrow: null, title: "Le confort prend vie.", text: null, items: [] }} />);
    expect(p.container).toBeEmptyDOMElement();
  });

  it("renders a real testimonial as a quote with its author", () => {
    render(
      <ArfroTestimonials
        data={{
          eyebrow: null,
          title: null,
          text: null,
          items: [{ author: "Client A", location: "Marrakech", type: "Villa", products: null, quote: "Très bon service.", image: null }],
        }}
      />,
    );
    expect(screen.getByText("Très bon service.").tagName).toBe("BLOCKQUOTE");
    expect(screen.getByText("Client A")).toBeInTheDocument();
    expect(screen.getByText("Marrakech · Villa")).toBeInTheDocument();
  });

  it("renders a real project with a typographic panel when it has no photo", () => {
    render(
      <ArfroProjects
        data={{
          eyebrow: null,
          title: "Le confort prend vie.",
          text: null,
          items: [{ title: "Riad climatisé", location: "Marrakech", type: "Hôtellerie", products: "LG Dual Inverter", description: null, image: null }],
        }}
      />,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Riad climatisé" })).toBeInTheDocument();
    expect(screen.getByText("LG Dual Inverter")).toBeInTheDocument();
    expect(document.querySelector("img")).toBeNull();
  });
});

describe("ArfroJournal", () => {
  const article = (n: number) => ({
    title: `Article ${n}`,
    slug: `a-${n}`,
    href: `/conseils/a-${n}`,
    excerpt: n === 1 ? "Résumé." : null,
    category: { name: "Guides", slug: "guides", href: "/conseils/guides", description: null },
    readingTime: 5,
    cover: null,
    art: null,
    bg: null,
  });

  it("lays out one lead story and the others, with the CTA", () => {
    render(
      <ArfroJournal
        data={{
          eyebrow: null,
          title: "Mieux comprendre le confort.",
          text: null,
          cta: { label: "Explorer nos conseils", href: "/conseils" },
          articles: [1, 2, 3, 4, 5].map(article),
        }}
      />,
    );
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "Article 1" })).toHaveAttribute("href", "/conseils/a-1");
    expect(screen.getAllByText("5 min de lecture")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /Explorer nos conseils/ })).toHaveAttribute("href", "/conseils");
  });

  it("renders nothing without articles", () => {
    const { container } = render(<ArfroJournal data={{ eyebrow: null, title: "x", text: null, cta: null, articles: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ArfroFinal", () => {
  it("renders the statement and both CTAs over the airflow visual when no photo", () => {
    const data: NonNullable<S["final"]> = {
      eyebrow: null,
      title: "Le confort commence ici.",
      text: "Avec ARFRO, chaque espace devient un lieu où il fait bon vivre.",
      cta: { label: "Découvrir nos solutions", href: "/climatisation" },
      secondary: { label: "Contacter ARFRO", href: "/contact" },
      image: null,
    };
    render(<ArfroFinal data={data} />);
    expect(screen.getByRole("heading", { level: 2, name: data.title })).toHaveAttribute("id", "arfro-final-title");
    expect(screen.getByRole("link", { name: /Découvrir nos solutions/ })).toHaveAttribute("href", "/climatisation");
    expect(screen.getByRole("link", { name: /Contacter ARFRO/ })).toHaveAttribute("href", "/contact");
    expect(document.querySelector("img")).toBeNull();
  });
});
