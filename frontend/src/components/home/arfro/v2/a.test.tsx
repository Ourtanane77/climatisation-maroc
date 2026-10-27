import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ArfroHomeSections } from "@/lib/home/arfro";

vi.mock("server-only", () => ({}));

const { ArfroHeroV2, HERO_TITLE_ID } = await import("./Hero");
const { ArfroManifesto, MANIFESTO_TITLE_ID } = await import("./Manifesto");
const { ArfroEnvironments } = await import("./Environments");
const { ArfroTechnology } = await import("./Technology");

type Hero = NonNullable<ArfroHomeSections["hero"]>;
type Manifesto = NonNullable<ArfroHomeSections["manifesto"]>;
type Environments = NonNullable<ArfroHomeSections["environments"]>;
type Technology = NonNullable<ArfroHomeSections["technology"]>;

const hero: Hero = {
  eyebrow: "ARFRO — Expert du confort climatique",
  title: "Le confort qui change tout.",
  text: "Des solutions pensées pour rafraîchir, chauffer et améliorer votre quotidien.",
  cta: { label: "Découvrir nos solutions", href: "/climatisation" },
  secondary: { label: "Trouver ma climatisation", href: "/calculateur-puissance" },
  image: { design: "cover-ariha.png" },
};

const manifesto: Manifesto = {
  eyebrow: null,
  title: "Le confort ne se résume pas à une température.",
  text: "C’est la sensation d’être parfaitement bien chez soi.",
  cta: { label: "Découvrir ARFRO", href: "/a-propos" },
  image: { design: "cover-ariha.png" },
};

const environments: Environments = {
  eyebrow: null,
  title: "À chaque espace, son confort.",
  text: null,
  items: [
    {
      key: "maison",
      title: "Maison",
      text: "Un confort sur mesure pour votre quotidien.",
      href: "/climatisation/mural",
      ctaLabel: "Explorer les solutions maison",
      image: { design: "cover-ariha.png" },
    },
    { key: "bureaux", title: "Bureaux", text: "Des environnements pensés pour la performance.", href: "/solutions", ctaLabel: null, image: null },
    { key: "hotellerie", title: "Hôtellerie", text: null, href: null, ctaLabel: null, image: { design: "missing-photo.png" } },
  ],
};

const technology: Technology = {
  eyebrow: null,
  title: "La technologie au service de votre bien-être.",
  text: null,
  image: null,
  items: [
    { icon: "inverter", title: "Technologie Inverter", text: "Le compresseur ajuste sa vitesse.", href: "/climatisation/mural" },
    { icon: "connected", title: "Wi-Fi LG ThinQ", text: "Pilotez le climatiseur depuis votre téléphone.", href: "/produit/lg-dual-inverter" },
    { icon: null, title: "Fonctionnement silencieux", text: null, href: null },
  ],
};

describe("ArfroHeroV2", () => {
  it("renders the h1 in the server markup, the CTAs and the LCP photo", () => {
    const { container } = render(<ArfroHeroV2 data={hero} />);
    const h1 = screen.getByRole("heading", { level: 1, name: hero.title });
    expect(h1).toHaveAttribute("id", HERO_TITLE_ID);
    expect(h1).toHaveTextContent("Le confort qui change tout.");
    expect(container.querySelector("section")).toHaveAttribute("aria-labelledby", HERO_TITLE_ID);
    expect(screen.getByRole("link", { name: "Découvrir nos solutions" })).toHaveAttribute("href", "/climatisation");
    expect(screen.getByRole("link", { name: "Trouver ma climatisation" })).toHaveAttribute("href", "/calculateur-puissance");
    const img = screen.getByRole("img", { name: hero.title });
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
    expect(container.querySelector('a[href="#manifeste"]')).not.toBeNull();
    expect(container.querySelector(".arfro-airflow")).not.toBeNull();
  });

  it("falls back to the navy typographic hero without a photo", () => {
    const { container } = render(<ArfroHeroV2 data={{ ...hero, image: null, secondary: null }} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("section")).toHaveAttribute("data-tone", "navy");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Trouver ma climatisation" })).toBeNull();
  });
});

describe("ArfroManifesto", () => {
  it("is the #manifeste anchor with an h2, the photo and the CTA", () => {
    const { container } = render(<ArfroManifesto data={manifesto} />);
    const section = container.querySelector("section")!;
    expect(section).toHaveAttribute("id", "manifeste");
    expect(section).toHaveAttribute("aria-labelledby", MANIFESTO_TITLE_ID);
    expect(screen.getByRole("heading", { level: 2, name: manifesto.title })).toHaveAttribute("id", MANIFESTO_TITLE_ID);
    expect(screen.getByRole("img", { name: manifesto.title })).toHaveAttribute("loading", "lazy");
    expect(screen.getByRole("link", { name: "Découvrir ARFRO" })).toHaveAttribute("href", "/a-propos");
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("has no image and no CTA when the slots are empty", () => {
    const { container } = render(<ArfroManifesto data={{ ...manifesto, image: null, cta: null }} />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("ArfroEnvironments", () => {
  it("renders one panel per item, photo or tonal panel, never a broken image", () => {
    const { container } = render(<ArfroEnvironments data={environments} />);
    expect(screen.getByRole("heading", { level: 2, name: environments.title })).toBeInTheDocument();
    const list = screen.getByRole("list", { name: environments.title });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Maison", "Bureaux", "Hôtellerie"]);
    // Only the real photo renders an <img> (the unknown design file and the empty slot do not).
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(1);
    expect(imgs[0]).toHaveAttribute("alt", "Maison");
    expect(imgs[0].getAttribute("src")).toMatch(/^\/design\/cover-ariha/);
  });

  it("links titled panels, describes them with their text and shows the CTA label", () => {
    render(<ArfroEnvironments data={environments} />);
    const maison = screen.getByRole("link", { name: "Maison" });
    expect(maison).toHaveAttribute("href", "/climatisation/mural");
    expect(maison).toHaveAccessibleDescription("Un confort sur mesure pour votre quotidien.");
    expect(screen.getByText("Explorer les solutions maison")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bureaux" })).toHaveAttribute("href", "/solutions");
    expect(screen.queryByRole("link", { name: "Hôtellerie" })).toBeNull();
    expect(screen.getByRole("button", { name: "Espace précédent" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Espace suivant" })).toBeInTheDocument();
  });

  it("renders nothing without items", () => {
    const { container } = render(<ArfroEnvironments data={{ ...environments, items: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ArfroTechnology", () => {
  it("shows the cut-out with one hotspot per item and only the payload items", () => {
    const { container } = render(<ArfroTechnology data={technology} />);
    const section = container.querySelector("section")!;
    expect(section).toHaveAttribute("data-tone", "navy");
    expect(screen.getByRole("heading", { level: 2, name: technology.title })).toBeInTheDocument();
    const img = screen.getByRole("img", { name: technology.title });
    expect(img.getAttribute("src")).toMatch(/^\/design\/clima-cut2/);
    const spots = screen.getAllByRole("button", { expanded: false }).concat(screen.getAllByRole("button", { expanded: true }));
    expect(spots).toHaveLength(3);
    // Every item's detail is in the markup (inactive ones hidden), nothing else.
    expect(Array.from(container.querySelectorAll("h3")).map((h) => h.textContent)).toEqual(technology.items.map((i) => i.title));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
  });

  it("opens the selected hotspot (aria-expanded) and moves with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<ArfroTechnology data={technology} />);
    const inverter = screen.getByRole("button", { name: "Technologie Inverter" });
    const wifi = screen.getByRole("button", { name: "Wi-Fi LG ThinQ" });
    expect(inverter).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Technologie Inverter" })).toBeVisible();
    expect(screen.queryByRole("region", { name: "Wi-Fi LG ThinQ" })).toBeNull();

    await user.click(wifi);
    expect(wifi).toHaveAttribute("aria-expanded", "true");
    expect(inverter).toHaveAttribute("aria-expanded", "false");
    const region = screen.getByRole("region", { name: "Wi-Fi LG ThinQ" });
    expect(wifi).toHaveAttribute("aria-controls", region.id);
    expect(within(region).getByRole("link", { name: /En savoir plus/ })).toHaveAttribute("href", "/produit/lg-dual-inverter");

    await user.keyboard("{ArrowRight}");
    const quiet = screen.getByRole("button", { name: "Fonctionnement silencieux" });
    expect(quiet).toHaveFocus();
    expect(quiet).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "Point suivant" }));
    expect(inverter).toHaveAttribute("aria-expanded", "true");
  });

  it("uses the section photo when one is set", () => {
    render(<ArfroTechnology data={{ ...technology, image: { src: "https://cdn.example/tech.jpg" } }} />);
    expect(screen.getByRole("img", { name: technology.title })).toHaveAttribute("src", "https://cdn.example/tech.jpg");
  });
});
