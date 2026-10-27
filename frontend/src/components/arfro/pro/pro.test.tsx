import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SectorDetail, ServiceDetail } from "@/lib/content/types";
import type { ProLanding } from "@/lib/pro/types";
import { ResellerForm } from "@/components/leads/ResellerForm";
import { ArfroFormPage, ResellerPerks } from "./ArfroFormPage";
import { ArfroProLanding } from "./ArfroProLanding";
import { ArfroQuickOrderHeading } from "./ArfroQuickOrderHeading";
import { ArfroServicePage, ArfroServicesHub } from "./ArfroServices";
import { ArfroSectorPage, ArfroSolutionsHub } from "./ArfroSolutions";
import { QUICK_ORDER_PATH, journeySteps } from "./journey";
import { contactPhone } from "./parts";

vi.mock("server-only", () => ({}));

const PHONE = { label: "Projets et revendeurs", display: "0666-602599", href: "tel:+212666602599" };
const LANDING: ProLanding = {
  brands: [{ name: "LG", href: "/marques/lg", logo: "/storage/brands/lg-h96.webp", aspect: 2.05 }],
  faq: [],
  preview: [
    { ref: "CUIV0005", name: "Cuivre 1/4 Lafarga 15 m", qty: 4, total: 198000 },
    { ref: "GAZ00042", name: "Gaz R410A GS 11,3 kg", qty: 1, total: 500000 },
  ],
};

function landing(overrides: Partial<React.ComponentProps<typeof ArfroProLanding>> = {}) {
  return render(
    <ArfroProLanding
      phone={PHONE}
      hours="Lundi – Samedi, 9h – 19h"
      whatsappHref="https://wa.me/212666854184"
      signedIn={false}
      catalogueHref="/climatisation"
      sectorsHref={null}
      landing={LANDING}
      {...overrides}
    />,
  );
}

describe("ArfroProLanding", () => {
  it("lays out the professional journey with the real phone and no price", () => {
    const { container } = landing();
    expect(screen.getByRole("heading", { level: 1, name: "La performance climatique au service de vos projets." })).toBeInTheDocument();
    for (const step of journeySteps({ catalogueHref: "/climatisation", sectorsHref: null })) {
      expect(screen.getByRole("heading", { level: 3, name: step.title })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("link", { name: "0666-602599" })[0]).toHaveAttribute("href", "tel:+212666602599");
    // Quick-order sample: references and quantities only, never an amount (public or pro).
    expect(screen.getByText("CUIV0005")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Dhs|1 980|5 000/);
    // No fake action in the sample.
    expect(screen.queryByText("Ajouter au panier")).toBeNull();
  });

  it("links the sector pages only when some are published", () => {
    landing();
    expect(screen.queryByRole("link", { name: /Voir les solutions professionnelles/ })).toBeNull();
    landing({ sectorsHref: "/solutions" });
    expect(screen.getByRole("link", { name: /Voir les solutions professionnelles/ })).toHaveAttribute("href", "/solutions");
  });

  it("offers sign-up and login to visitors, the quick order to signed-in resellers", () => {
    const visitor = landing();
    expect(within(visitor.container).getByRole("link", { name: "Se connecter" })).toHaveAttribute("href", "/connexion");
    expect(within(visitor.container).getByRole("link", { name: /Se connecter pour commander/ })).toHaveAttribute("href", QUICK_ORDER_PATH);
    visitor.unmount();

    const reseller = landing({ signedIn: true });
    expect(within(reseller.container).queryByRole("link", { name: "Se connecter" })).toBeNull();
    expect(within(reseller.container).getByRole("link", { name: /^Commande rapide/ })).toHaveAttribute("href", QUICK_ORDER_PATH);
  });

  it("does not advertise features the site does not have", () => {
    const { container } = landing();
    expect(container.textContent).not.toMatch(/historique|bibliothèque|remise sur volume|tableau de bord/i);
  });
});

describe("ArfroFormPage", () => {
  it("keeps the shared reseller form and its fields", () => {
    render(
      <ArfroFormPage eyebrow="ARFRO Business" title="Devenir revendeur" lead="Ouvrez votre compte.">
        <ResellerForm cities={["Marrakech"]} aside={<ResellerPerks />} />
      </ArfroFormPage>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Devenir revendeur" })).toBeInTheDocument();
    expect(screen.getByLabelText("ICE")).toBeInTheDocument();
    expect(screen.getByLabelText("Société")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Envoyer ma demande" })).toBeInTheDocument();
    expect(screen.getByText("Tarifs revendeur")).toBeInTheDocument();
  });
});

describe("ArfroQuickOrderHeading", () => {
  it("shows the signed-in account", () => {
    render(<ArfroQuickOrderHeading account="Froid Atlas SARL" logout={<button type="button">Se déconnecter</button>} />);
    expect(screen.getByRole("heading", { level: 1, name: "Commande rapide par référence" })).toBeInTheDocument();
    expect(screen.getByText("Froid Atlas SARL")).toBeInTheDocument();
  });
});

const CONTACT = {
  phones: [
    { label: "Conseil", display: "0666-088348" },
    { label: "Projets et revendeurs", display: "0666-602599" },
  ],
  salesPhone: "0666-854184",
  whatsapp: "212666854184",
  hours: "Lundi – Samedi, 9h – 19h",
  stores: [],
  email: "ecom@arihafroid.com",
};

describe("contactPhone", () => {
  it("reads the role from Réglages and builds the tel: link", () => {
    expect(contactPhone(CONTACT, "Conseil")).toEqual({ label: "Conseil", display: "0666-088348", href: "tel:+212666088348" });
  });
});

describe("ArfroServicesHub", () => {
  it("without published services, only offers the ways to reach the team", () => {
    const { container } = render(
      <ArfroServicesHub services={[]} advice={contactPhone(CONTACT, "Conseil")} projects={PHONE} hours={CONTACT.hours} whatsappHref="https://wa.me/1" />,
    );
    expect(screen.queryByRole("heading", { name: "Nos services" })).toBeNull();
    expect(screen.getByRole("link", { name: "Conseil : 0666-088348" })).toHaveAttribute("href", "tel:+212666088348");
    expect(container.textContent).not.toMatch(/entretien|maintenance|réparation/i);
  });

  it("lists the published services", () => {
    render(
      <ArfroServicesHub
        services={[{ slug: "installation", name: "Installation", h1: "Installation de climatisation", heroText: "Pose et mise en service.", href: "/services/installation" }]}
        advice={contactPhone(CONTACT, "Conseil")}
        projects={PHONE}
        hours={CONTACT.hours}
        whatsappHref="https://wa.me/1"
      />,
    );
    expect(screen.getByRole("link", { name: /Installation de climatisation/ })).toHaveAttribute("href", "/services/installation");
  });
});

describe("ArfroServicePage", () => {
  it("renders the API blocks and leaves the empty ones out", () => {
    const service: ServiceDetail = {
      slug: "visite-technique",
      name: "Visite technique",
      href: "/services/visite-technique",
      heroText: "Un technicien se déplace.",
      image: null,
      whatsappText: null,
      included: [{ title: "Mesure de la pièce" }],
      steps: [],
      prices: [{ label: "Visite", value: "300 Dhs" }],
      showSupplies: false,
      products: [],
      faq: [],
      seo: { title: null, description: null, h1: null, noindex: false },
      contact: CONTACT,
    };
    render(<ArfroServicePage service={service} h1="Visite technique avant installation" phone={PHONE} whatsappHref="https://wa.me/1" />);
    expect(screen.getByRole("heading", { level: 1, name: "Visite technique avant installation" })).toBeInTheDocument();
    expect(screen.getByText("Mesure de la pièce")).toBeInTheDocument();
    expect(screen.getByText("300 Dhs")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Comment ça se passe." })).toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
  });
});

describe("Arfro solutions", () => {
  const sector: SectorDetail = {
    slug: "restaurants",
    name: "Restaurants et cafés",
    tagline: "Salle fraîche",
    scene: "resto",
    bg: null,
    image: null,
    href: "/solutions/restaurants",
    heroText: "Une salle fraîche.",
    intro: "Un restaurant a ses contraintes.",
    problems: [{ title: "Chaleur de la cuisine", text: "Les fourneaux chauffent la salle." }],
    solutions: [],
    products: [],
    rangeTiles: [],
    imageBand: [{ caption: "Salle", bg: null, scene: "resto", image: null, alt: null }],
    quoteTitle: null,
    whatsappText: null,
    faq: [],
    seo: { title: null, description: null, h1: null, noindex: false },
    others: [],
    contact: CONTACT,
  };

  it("hub: typographic sector tiles when there is no photo", () => {
    render(<ArfroSolutionsHub sectors={[sector]} phone={PHONE} hours={CONTACT.hours} whatsappHref="https://wa.me/1" />);
    expect(screen.getByRole("link", { name: /Restaurants et cafés/ })).toHaveAttribute("href", "/solutions/restaurants");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("sector page: real blocks only, the quote form, no image band without photos", () => {
    render(<ArfroSectorPage sector={sector} h1="Climatisation pour restaurants" heroImage={null} cities={["Marrakech"]} phone={PHONE} whatsappHref="https://wa.me/1" />);
    expect(screen.getByRole("heading", { level: 1, name: "Climatisation pour restaurants" })).toBeInTheDocument();
    expect(screen.getByText("Chaleur de la cuisine")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "En images" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Demander un devis" })).toBeInTheDocument();
    expect(document.getElementById("devis")).not.toBeNull();
  });
});
