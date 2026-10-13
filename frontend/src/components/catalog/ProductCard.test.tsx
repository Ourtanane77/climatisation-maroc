import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteKeyProvider } from "@/lib/site-context";
import type { ProductCardData } from "@/lib/types";
import { ProductCard } from "./ProductCard";

const product: ProductCardData = {
  name: "LG Dual Inverter",
  href: "/produit/lg-dual-inverter",
  brand: "LG",
  refText: "2 puissances",
  price: 520000,
  fromPrice: true,
  badge: { text: "−18 %", tone: "promo" },
  options: [
    { label: "9K", fullLabel: "9 000 BTU", sku: "S09", price: 520000, regularPrice: 630000 },
    { label: "12K", fullLabel: "12 000 BTU", sku: "S12", price: 570000, regularPrice: 690000 },
  ],
};

describe("ProductCard per storefront", () => {
  it("keeps the Climatisation Maroc card by default", () => {
    render(<ProductCard product={product} />);
    expect(screen.getByRole("link", { name: "Voir le produit" })).toHaveAttribute("href", product.href);
    expect(screen.queryByText("Acheter")).toBeNull();
  });

  it("renders the Arfro card: badge pill, « dès » price, Acheter and Comparer", () => {
    render(
      <SiteKeyProvider value="arfro">
        <ProductCard product={product} />
      </SiteKeyProvider>,
    );
    expect(screen.getByText("−18 %")).toBeInTheDocument();
    expect(screen.getByText("dès")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Acheter" })).toHaveAttribute("href", product.href);
    const compare = screen.getByRole("checkbox", { name: "Comparer LG Dual Inverter" });
    expect(compare).toHaveAttribute("aria-checked", "false");
    fireEvent.click(compare);
    expect(compare).toHaveAttribute("aria-checked", "true");

    // Picking a variant shows its price and the struck regular price, without « dès ».
    fireEvent.click(screen.getByRole("button", { name: "12K" }));
    expect(screen.queryByText("dès")).toBeNull();
    expect(screen.getByText("5 700 Dhs")).toBeInTheDocument();
    expect(screen.getByText(/6 900 Dhs/)).toBeInTheDocument();
  });
});
