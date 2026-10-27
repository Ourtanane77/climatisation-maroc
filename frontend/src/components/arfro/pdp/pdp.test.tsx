import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArfroBuyBox } from "@/components/product/ArfroBuyBox";
import { ArfroKeyFacts, ArfroSpecs } from "@/components/product/ArfroSections";
import { ProductProvider } from "@/components/product/ProductContext";
import type { ProductPageData, ProductVariantData } from "@/lib/product/types";
import { ArfroAudience } from "./ArfroAudience";
import { ArfroCompareToggle } from "./ArfroCompare";
import { ArfroGallery } from "./ArfroGallery";
import { ArfroServices } from "./ArfroServices";
import { POWER_TIERS } from "@/lib/power";
import { audienceRows, btuOf, groupSpecs, keyFacts, surfaceRow } from "./data";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }) }));

function variant(sku: string, label: string, price: number, extra: Partial<ProductVariantData> = {}): ProductVariantData {
  return {
    sku,
    label,
    name: `LG Dual Inverter ${label}`,
    price,
    regularPrice: null,
    stock: "en_stock",
    stockLabel: "En stock",
    orderable: true,
    dark: false,
    image: null,
    specs: [
      { label: "Puissance frigorifique", value: `${label}/h` },
      { label: "Surface conseillée (estimation)", value: label.startsWith("9") ? "jusqu'à 15 m²" : "jusqu'à 20 m²" },
    ],
    ...extra,
  };
}

const base: ProductPageData = {
  name: "LG Dual Inverter",
  slug: "lg-dual-inverter",
  href: "/produit/lg-dual-inverter",
  shortDescription: "Mural (mono split) LG, technologie Inverter.",
  description: null,
  highlights: [],
  art: "mural",
  datasheet: null,
  brand: { name: "LG", slug: "lg", href: "/marques/lg", logo: null, logoAspect: null, caption: null, official: true },
  category: { label: "Climatiseurs muraux", href: "/climatisation/mural" },
  breadcrumb: [],
  defaultSku: "S09",
  selectorLabel: "Puissance",
  variants: [variant("S09", "9 000 BTU", 520000, { regularPrice: 630000 }), variant("S12", "12 000 BTU", 550000)],
  images: [
    { src: "/a-640.webp", thumb: "/a-320.webp", srcSet: "/a-320.webp 320w, /a-640.webp 640w", alt: "Vue A" },
    { src: "/b-640.webp", thumb: "/b-320.webp", srcSet: null, alt: "Vue B" },
  ],
  specs: [
    { label: "Type", value: "Mural (mono split)" },
    { label: "Technologie", value: "Inverter" },
  ],
  accessories: [],
  technicalVisitPrice: 30000,
  sameRange: [],
  faq: [],
  seo: { title: null, description: null, h1: null, canonical: null, ogImage: null, noindex: false },
  isReseller: false,
};

function withProduct(ui: React.ReactNode, product: ProductPageData = base, sku = product.defaultSku) {
  return render(
    <ProductProvider product={product} initialSku={sku}>
      {ui}
    </ProductProvider>,
  );
}

describe("Arfro product page helpers", () => {
  it("reads BTU values and recommended surfaces from the data", () => {
    expect(btuOf("12 000 BTU")).toBe(12000);
    expect(btuOf("9 000 BTU/h")).toBe(9000);
    expect(btuOf("Kit Duo")).toBeNull();
    expect(surfaceRow([{ label: "Surface conseillée (estimation)", value: "jusqu'à 15 m²" }])).toBe("Jusqu'à 15 m²");
    expect(surfaceRow([{ label: "Type", value: "Mural" }])).toBeNull();
  });

  it("picks key figures in order and only from existing rows", () => {
    const facts = keyFacts([
      { label: "Marque", value: "LG" },
      { label: "Technologie", value: "Inverter" },
      { label: "Puissance frigorifique", value: "9 000 BTU/h" },
    ]);
    expect(facts).toEqual([
      { label: "Froid", value: "9 000 BTU/h" },
      { label: "Technologie", value: "Inverter" },
    ]);
  });

  it("groups spec rows and drops empty groups", () => {
    const groups = groupSpecs([
      { label: "Marque", value: "LG" },
      { label: "Type", value: "Mural" },
      { label: "Puissance frigorifique", value: "9 000 BTU/h" },
      { label: "Référence", value: "S09" },
    ]);
    expect(groups.map((g) => g.title)).toEqual(["Performances", "Conception et technologie", "Identification"]);
    expect(groups[2].rows.map((r) => r.label)).toEqual(["Marque", "Référence"]);
    expect(groupSpecs([{ label: "Type", value: "Mural" }]).map((g) => g.title)).toEqual(["Conception et technologie"]);
  });

  it("derives « Pour qui ? » from surface rows, else the calculator tiers for air conditioners only", () => {
    expect(audienceRows(base).map((r) => r.surface)).toEqual(["Jusqu'à 15 m²", "Jusqu'à 20 m²"]);
    const noSurface = base.variants.map((v) => ({ ...v, specs: [] }));
    expect(audienceRows({ ...base, variants: noSurface }).map((r) => r.surface)).toEqual([POWER_TIERS[0].coverage, POWER_TIERS[1].coverage]);
    expect(audienceRows({ category: { label: "Chauffe-eau", href: "/chauffe-eau" }, variants: noSurface })).toEqual([]);
    // A power that is not one of the calculator's tiers: no guess, the section is left out.
    expect(audienceRows({ ...base, variants: [{ ...noSurface[0], label: "7 000 BTU" }] })).toEqual([]);
  });
});

describe("Arfro product page components", () => {
  it("buy box: server prices, struck regular price, capacity selector, add to cart", () => {
    withProduct(<ArfroBuyBox />);
    expect(screen.getByRole("heading", { level: 1, name: "LG Dual Inverter" })).toBeInTheDocument();
    expect(screen.getByText("Distributeur officiel")).toBeInTheDocument();
    expect(screen.getByText("6 300 Dhs").tagName).toBe("S");
    const group = screen.getByRole("group", { name: "Puissance" });
    expect(within(group).getAllByRole("radio")).toHaveLength(2);
    fireEvent.click(within(group).getByRole("radio", { name: /12 000 BTU/ }));
    expect(screen.getAllByText("5 500 Dhs").length).toBeGreaterThan(1);
    expect(screen.getByRole("button", { name: "Ajouter au panier" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Commander sur WhatsApp/ })).toBeInTheDocument();
  });

  it("buy box: « Prix sur demande » gets the quote link, never add to cart", () => {
    const product = { ...base, variants: [variant("REF1", "9 000 BTU", 0)], defaultSku: "REF1" };
    withProduct(<ArfroBuyBox />, product);
    expect(screen.getByRole("link", { name: "Demander un prix" })).toHaveAttribute("href", "/demander-un-devis?ref=REF1");
    expect(screen.queryByRole("button", { name: "Ajouter au panier" })).toBeNull();
  });

  it("gallery: fixed-ratio frame, srcset on the main photo, arrows and thumbnails", () => {
    withProduct(<ArfroGallery />);
    const main = screen.getByAltText("Vue A");
    expect(main).toHaveAttribute("srcset", "/a-320.webp 320w, /a-640.webp 640w");
    expect(main).toHaveAttribute("loading", "eager");
    fireEvent.click(screen.getByRole("button", { name: "Photo suivante" }));
    expect(screen.getByAltText("Vue B")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vue 2" })).toHaveAttribute("aria-pressed", "true");
  });

  it("key figures, grouped specs and the datasheet follow the selected variant", () => {
    withProduct(
      <>
        <ArfroKeyFacts id="en-bref" />
        <ArfroSpecs id="specifications" />
      </>,
      { ...base, datasheet: "/storage/fiche.pdf" },
      "S12",
    );
    expect(screen.getByRole("heading", { name: "LG Dual Inverter 12 000 BTU" })).toBeInTheDocument();
    expect(screen.getAllByText("12 000 BTU/h").length).toBe(2);
    expect(screen.getByRole("heading", { name: "Performances" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Télécharger la fiche technique/ })).toHaveAttribute("href", "/storage/fiche.pdf");
  });

  it("no datasheet link and no key figures band without the data", () => {
    withProduct(
      <>
        <ArfroKeyFacts id="en-bref" />
        <ArfroSpecs id="specifications" />
      </>,
      { ...base, specs: [], variants: [variant("S09", "9 000 BTU", 520000, { specs: [] })], brand: null },
    );
    expect(screen.queryByRole("link", { name: /fiche technique/ })).toBeNull();
    expect(screen.queryByText("En bref")).toBeNull();
  });

  it("« Pour qui ? » rows select the power", () => {
    withProduct(<ArfroAudience id="pour-qui" />);
    const row = screen.getByRole("button", { name: /12 000 BTU/ });
    expect(row).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(row);
    expect(row).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "Calculer la puissance nécessaire" })).toHaveAttribute("href", "/calculateur-puissance");
  });

  it("services only for installable products; the visit shows its price", () => {
    const { container } = render(<ArfroServices id="installation" accessories={[]} visitPrice={30000} />);
    expect(container).toBeEmptyDOMElement();
    render(
      <ArfroServices
        id="installation"
        accessories={[{ name: "Support GT", sku: "GT1", href: "/produit/support-gt", price: 15000, image: null, art: null, orderable: true }]}
        visitPrice={30000}
      />,
    );
    expect(screen.getByRole("heading", { name: /^Visite technique · 300\s*Dhs$/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Demander un devis" })).toHaveAttribute("href", "/demander-un-devis");
    expect(screen.getByRole("button", { name: "Ajouter Support GT au panier" })).toBeInTheDocument();
  });

  it("compare toggle uses the shared selection", () => {
    window.localStorage.clear();
    withProduct(<ArfroCompareToggle addHref="/climatisation/mural?comparer=1" />);
    const toggle = screen.getByRole("checkbox", { name: "Comparer ce produit" });
    expect(screen.getByRole("link", { name: /Choisir d.autres produits/ })).toHaveAttribute("href", "/climatisation/mural?comparer=1");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(JSON.parse(window.localStorage.getItem("cm_compare") ?? "[]")).toEqual([{ sku: "S09", name: "LG Dual Inverter 9 000 BTU" }]);
  });
});
