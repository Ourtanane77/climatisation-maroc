import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AdvisorCatalog, AdvisorProduct } from "@/lib/advisor/products";
import { STORAGE_KEY } from "@/lib/advisor/state";
import { ClimateAdvisor } from "./ClimateAdvisor";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const cities = [
  { slug: "marrakech", name: "Marrakech" },
  { slug: "casablanca", name: "Casablanca" },
  { slug: "autre-ville", name: "Autre ville" },
];

function p(name: string, btu: number, price: number, category: AdvisorProduct["category"] = "mural"): AdvisorProduct {
  return {
    name,
    brand: "LG",
    sku: `${name}-${btu}`,
    btu,
    price,
    regularPrice: null,
    href: `/produit/${name}?v=${name}-${btu}`,
    image: null,
    art: null,
    dark: false,
    category,
    family: `/produit/${name}`,
  };
}

const catalog: AdvisorCatalog = {
  categories: [
    { key: "mural", label: "Climatiseurs muraux", href: "/climatisation/mural", text: "Le plus courant, pour une chambre ou un salon." },
    { key: "gainable", label: "Gainable", href: "/climatisation/gainable", text: "Invisible, intégré au faux plafond." },
    { key: "cassette", label: "Cassette", href: "/climatisation/cassette", text: null },
  ],
  products: [p("eco", 12000, 395000), p("mid", 12000, 550000), p("top", 12000, 750000), p("big", 18000, 730000), p("gain", 36000, 1500000, "gainable")],
};

function setup() {
  const user = userEvent.setup();
  render(<ClimateAdvisor cities={cities} catalog={catalog} />);
  return user;
}

const next = () => screen.getByRole("button", { name: /Continuer|Voir ma recommandation/ });

describe("ClimateAdvisor", () => {
  beforeEach(() => window.sessionStorage.clear());
  afterEach(() => window.sessionStorage.clear());

  it("walks the five steps and shows a transparent result with real products", async () => {
    const user = setup();

    // 1 pièce: a choice is required.
    expect(screen.getByRole("group", { name: /Quel espace/ })).toBeInTheDocument();
    expect(next()).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: /Salon/ }));
    await user.click(next());

    // 2 superficie
    expect(screen.getByRole("heading", { name: /Étape 2 sur 5/ })).toHaveFocus();
    const area = screen.getByRole("spinbutton", { name: /Superficie en m²/ });
    expect(area).toHaveValue(20);
    await user.click(next());

    // 3 ville: a choice is required; coastal note.
    expect(next()).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: "Casablanca" }));
    expect(screen.getByText(/climat du littoral/)).toBeInTheDocument();
    await user.click(next());

    // 4 détails: defaults are valid.
    expect(screen.getByRole("group", { name: /Hauteur sous plafond/ })).toBeInTheDocument();
    await user.click(next());

    // 5 résultat: 20 m² × 600 × 0.9 = 10 800 → 12 000 BTU.
    expect(screen.getByRole("heading", { name: "Puissance estimée" })).toBeInTheDocument();
    expect(screen.getByText(/^12\s000\sBTU$/, { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText(/Ville du littoral/)).toBeInTheDocument();
    expect(screen.getByText(/Recommandation prête : 12/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Climatiseurs muraux/ })).toHaveAttribute("href", "/climatisation/mural");

    const cards = screen.getByRole("heading", { name: /Nos climatiseurs de 12/ }).parentElement!;
    const links = within(cards).getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/produit/eco?v=eco-12000", "/produit/mid?v=mid-12000", "/produit/top?v=top-12000"]);
    expect(within(links[0]).getByText("Essentiel")).toBeInTheDocument();
    expect(within(links[2]).getByText("Premium")).toBeInTheDocument();
    expect(within(links[0]).getByText(/^3\s950\sDhs$/)).toBeInTheDocument();

    expect(screen.getByText(/estimation indicative à partir de vos réponses, pas une étude thermique/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Demander une visite technique/ })).toHaveAttribute("href", "/demander-un-devis");
  });

  it("validates the surface input", async () => {
    const user = setup();
    await user.click(screen.getByRole("radio", { name: /Bureau/ }));
    await user.click(next());
    const area = screen.getByRole("spinbutton", { name: /Superficie en m²/ });
    await user.clear(area);
    await user.type(area, "500");
    expect(screen.getByText(/entre 8 et 150/)).toBeInTheDocument();
    expect(area).toHaveAttribute("aria-invalid", "true");
    expect(next()).toBeDisabled();
    await user.clear(area);
    await user.type(area, "75");
    expect(next()).toBeEnabled();
    expect(screen.getByText(/Au-delà de 60 m²/)).toBeInTheDocument();
  });

  it("recommends a technical visit for a large space and goes back to edit", async () => {
    const user = setup();
    await user.click(screen.getByRole("radio", { name: /Commerce/ }));
    await user.click(next());
    const area = screen.getByRole("spinbutton", { name: /Superficie en m²/ });
    await user.clear(area);
    await user.type(area, "60");
    await user.click(next());
    await user.click(screen.getByRole("radio", { name: "Marrakech" }));
    await user.click(next());
    await user.click(next());

    // 60 × 600 × 1.1 = 39 600 → 48 000 BTU: gainable first, visit advised.
    expect(screen.getByRole("heading", { name: "Une visite technique est conseillée" })).toBeInTheDocument();
    expect(screen.getByText(/un commerce reçoit du public/)).toBeInTheDocument();
    expect(screen.getAllByText("Recommandé")[0].closest("a")).toHaveAttribute("href", "/climatisation/gainable");

    await user.click(screen.getByRole("button", { name: /Modifier mes réponses/ }));
    expect(screen.getByRole("heading", { name: /Étape 4 sur 5/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Retour/ }));
    expect(screen.getByRole("heading", { name: /Étape 3 sur 5/ })).toBeInTheDocument();
  });

  it("keeps the progress in sessionStorage and restores it", async () => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step: 2, room: "chambre", area: 14, city: null }));
    const user = setup();
    expect(await screen.findByRole("heading", { name: /Étape 3 sur 5/ })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Marrakech" }));
    expect(JSON.parse(window.sessionStorage.getItem(STORAGE_KEY)!)).toMatchObject({ room: "chambre", area: 14, city: "marrakech" });
  });

  it("restarts from the first step", async () => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step: 4, room: "chambre", area: 14, city: "marrakech" }));
    const user = setup();
    await user.click(await screen.findByRole("button", { name: "Recommencer" }));
    expect(screen.getByRole("heading", { name: /Étape 1 sur 5/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Chambre/ })).not.toBeChecked();
  });
});
