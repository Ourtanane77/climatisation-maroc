import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { clampDescription, seoMetadata } = await import("./metadata");
const { openingHours, productSchema, storesSchema, websiteSchema } = await import("./jsonld");

describe("seoMetadata", () => {
  it("adds the site name, and drops it when the title would pass 60 characters", () => {
    expect(seoMetadata({ title: "Marques", path: "/marques" }).title).toEqual({ absolute: "Marques · Climatisation Maroc" });
    const long = "Installation de climatisation par nos techniciens";
    expect(seoMetadata({ title: long }).title).toEqual({ absolute: long });
  });

  it("sets canonical and Open Graph for indexable pages, robots for the others", () => {
    const page = seoMetadata({ title: "Contact", description: "Nos magasins.", path: "/contact", image: "/design/a.png" });
    expect(page.alternates).toEqual({ canonical: "/contact" });
    expect(page.robots).toBeUndefined();
    expect(page.openGraph).toMatchObject({ locale: "fr_MA", siteName: "Climatisation Maroc", url: expect.stringMatching(/\/contact$/) });
    expect(JSON.stringify(page.openGraph)).toContain("/design/a.png");

    const basket = seoMetadata({ title: "Votre panier", path: "/panier", noindex: true });
    expect(basket.alternates).toBeUndefined();
    expect(basket.robots).toEqual({ index: false, follow: true });
  });

  it("falls back to a description built from the title", () => {
    expect(seoMetadata({ title: "Services" }).description).toMatch(/^Services · Climatisation Maroc\. Boutique d'Ariha Froid/);
  });

  it("cuts long descriptions at a word boundary", () => {
    const text = "mot ".repeat(80);
    const cut = clampDescription(text);
    expect(cut.length).toBeLessThanOrEqual(160);
    expect(cut.endsWith("mot…")).toBe(true);
    expect(clampDescription("Court.")).toBe("Court.");
  });
});

describe("structured data", () => {
  it("reads the opening hours from the settings text", () => {
    expect(openingHours("Lundi à Samedi, 9h à 19h")).toBe("Mo-Sa 09:00-19:00");
    expect(openingHours("Lundi au vendredi, 8h30 - 18h")).toBe("Mo-Fr 08:30-18:00");
    expect(openingHours("Lundi – Samedi, 9h – 19h")).toBe("Mo-Sa 09:00-19:00");
    expect(openingHours("Sur rendez-vous")).toBeNull();
  });

  it("describes each store with a postal address", () => {
    const [sakar] = storesSchema({
      stores: [{ name: "Magasin Sakar", address: "Lot Sakar Villa 107, Marrakech 40070" }],
      phones: [{ label: "Fixe", display: "0524-306850", href: "tel:+212524306850" }],
      hours: "Lundi à Samedi, 9h à 19h",
    } as never);
    expect(sakar).toMatchObject({
      "@type": "HVACBusiness",
      telephone: "+212524306850",
      "@id": expect.stringMatching(/\/contact#magasin-sakar$/),
      openingHoursSpecification: [expect.objectContaining({ opens: "09:00", closes: "19:00" })],
      address: { streetAddress: "Lot Sakar Villa 107", addressLocality: "Marrakech", postalCode: "40070", addressCountry: "MA" },
    });
  });

  it("declares the site without the retired search action", () => {
    expect(websiteSchema()).toMatchObject({ "@type": "WebSite", "@id": expect.stringMatching(/#website$/) });
    expect(JSON.stringify(websiteSchema())).not.toContain("SearchAction");
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- loose view of the JSON-LD tree in tests
  type Schema = Record<string, any>;
  const variant = (over: Record<string, unknown>) => ({
    sku: "A1",
    label: null,
    name: "Produit",
    price: 520000,
    regularPrice: null,
    stock: "en_stock",
    stockLabel: "En stock",
    orderable: true,
    onRequest: false,
    dark: false,
    image: null,
    specs: [],
    ...over,
  });
  const product = (variants: unknown[]) =>
    ({ name: "Produit", slug: "produit", href: "/produit/produit", description: null, shortDescription: null, brand: null, images: [], variants }) as never;

  it("emits no Product for « Prix sur demande » items, and drops them from mixed groups", () => {
    expect(productSchema(product([variant({ price: 0, onRequest: true })]))).toBeNull();
    const group = productSchema(product([variant({ sku: "A", label: "Ø 160" }), variant({ sku: "B", label: "Ø 200", price: 0, onRequest: true })]));
    expect(JSON.stringify(group)).not.toContain('"sku":"B"');
  });

  it("maps the stock status and the struck price", () => {
    const single = productSchema(product([variant({ stock: "sur_commande", regularPrice: 630000 })])) as Schema;
    expect(single["@type"]).toBe("Product");
    expect(single.offers.availability).toBe("https://schema.org/BackOrder");
    expect(single.offers.priceSpecification).toMatchObject({ priceType: "https://schema.org/StrikethroughPrice", price: "6300.00" });
    const sizes = productSchema(product([variant({ sku: "A", label: "Ø 160" }), variant({ sku: "B", label: "Ø 200" })])) as Schema;
    expect(sizes.variesBy).toEqual(["https://schema.org/size"]);
    expect(sizes.hasVariant[0]).toMatchObject({ size: "Ø 160", inProductGroupWithID: "produit" });
  });
});
