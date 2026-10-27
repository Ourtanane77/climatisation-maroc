import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { ProductCardData } from "@/lib/types";
import { ArfroProductCard, specLine } from "./ArfroProductCard";

const family: ProductCardData = {
  name: "LG Dual Inverter",
  href: "/produit/lg-dual-inverter",
  brand: "LG",
  refText: "4 puissances",
  price: 520000,
  regularPrice: null,
  fromPrice: true,
  image: "/storage/products/lg.webp",
  badge: { text: "−18 %", tone: "promo" },
  inStock: true,
  options: [
    { label: "9K", fullLabel: "9 000 BTU", sku: "S09", price: 520000, regularPrice: 630000 },
    { label: "12K", fullLabel: "12 000 BTU", sku: "S12", price: 550000, regularPrice: 670000 },
  ],
};

beforeEach(() => window.localStorage.clear());

describe("ArfroProductCard", () => {
  it("shows brand, model, power chips, « dès » price with the cheapest variant's regular price struck", () => {
    render(<ArfroProductCard product={family} />);
    expect(screen.getByText("LG")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "LG Dual Inverter" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Choisir une puissance : LG Dual Inverter" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "9 000 BTU" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("dès")).toBeInTheDocument();
    expect(screen.getByText("5 200 Dhs")).toBeInTheDocument();
    expect(screen.getByText("6 300 Dhs").closest("s")).not.toBeNull();
    expect(screen.getByText("En stock")).toBeInTheDocument();
    expect(screen.getByText("−18 %")).toBeInTheDocument();
  });

  it("shows the specs line for a single-variant product", () => {
    render(<ArfroProductCard product={{ ...family, fromPrice: false, options: [family.options![1]] }} />);
    expect(screen.getByText("12 000 BTU")).toBeInTheDocument();
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("picks a power (price follows) and « Acheter » adds that variant to the cart", () => {
    document.cookie = "cm_cart=; Path=/; Max-Age=0";
    render(<ArfroProductCard product={family} />);
    fireEvent.click(screen.getByRole("button", { name: "12 000 BTU" }));
    expect(screen.getByText("5 500 Dhs")).toBeInTheDocument();
    expect(screen.queryByText("dès")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Acheter LG Dual Inverter 12 000 BTU" }));
    expect(decodeURIComponent(document.cookie)).toContain("S12");
    expect(screen.getByText("Ajouté ✓")).toBeInTheDocument();
  });

  it("without a pick, « Acheter » adds the first priced variant", () => {
    document.cookie = "cm_cart=; Path=/; Max-Age=0";
    render(<ArfroProductCard product={family} />);
    fireEvent.click(screen.getByRole("button", { name: "Acheter LG Dual Inverter" }));
    expect(decodeURIComponent(document.cookie)).toContain("S09");
    expect(screen.getByRole("button", { name: "9 000 BTU" })).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles the shared compare selection", () => {
    render(<ArfroProductCard product={family} />);
    const compare = screen.getByRole("checkbox", { name: "Comparer LG Dual Inverter" });
    expect(compare).toHaveAttribute("aria-checked", "false");
    fireEvent.click(compare);
    expect(compare).toHaveAttribute("aria-checked", "true");
    expect(JSON.parse(window.localStorage.getItem("cm_compare") ?? "[]")).toEqual([{ sku: "S09", name: "LG Dual Inverter" }]);
  });

  it("hides a brand badge that repeats the brand, shows « Prix sur demande » and out of stock", () => {
    render(
      <ArfroProductCard
        product={{ name: "Ventouse Q100", href: "/produit/ventouse", brand: "Arfro", sku: "V100", price: 0, badge: { text: "Arfro", tone: "brand" }, inStock: false }}
      />,
    );
    expect(screen.getAllByText("Arfro")).toHaveLength(1);
    expect(screen.getByText("Prix sur demande")).toBeInTheDocument();
    expect(screen.getByText("Rupture de stock")).toBeInTheDocument();
    expect(screen.queryByText("dès")).toBeNull();
    // Out of stock: no purchase, the primary action opens the product page.
    expect(screen.queryByRole("button", { name: /Acheter/ })).toBeNull();
    expect(screen.getByRole("link", { name: "Découvrir Ventouse Q100" })).toHaveAttribute("href", "/produit/ventouse");
  });

  it("offers « Demander un prix » for an item on request in stock", () => {
    render(<ArfroProductCard product={{ name: "Ventouse Q100", href: "/produit/ventouse", sku: "V100", price: 0, inStock: true }} />);
    expect(screen.getByRole("link", { name: "Demander un prix : Ventouse Q100" })).toHaveAttribute("href", "/demander-un-devis?ref=V100");
    expect(screen.queryByRole("button", { name: /Acheter/ })).toBeNull();
  });

  it("condenses spec lines", () => {
    expect(specLine(undefined)).toBeNull();
    expect(specLine([{ label: "Q100", fullLabel: "Ø 100 mm", sku: "a", price: 1 }])).toBe("Q100");
    const many = [9, 12, 18, 24, 30, 36].map((k) => ({ label: `${k}K`, fullLabel: `${k} 000 BTU`, sku: String(k), price: 1 }));
    expect(specLine(many)).toBe("9 000 · 12 000 · 18 000 · 24 000 · 30 000 BTU · +1");
  });
});
