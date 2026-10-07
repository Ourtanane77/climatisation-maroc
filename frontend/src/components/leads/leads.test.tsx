import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "./ContactForm";
import { QuoteForm } from "./QuoteForm";
import { iceError } from "./ResellerForm";

afterEach(() => vi.restoreAllMocks());

describe("iceError", () => {
  it("uses the design message with the digit count", () => {
    expect(iceError("00152874900")).toBe("L’ICE comporte 15 chiffres. Vous en avez saisi 11.");
    expect(iceError("001 528 749 000 012")).toBeNull();
  });
});

describe("QuoteForm", () => {
  it("shows the design errors and does not post an invalid form", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    render(<QuoteForm cities={["Marrakech", "Autre ville"]} initialPro={false} whatsappHref="#" aside={null} />);

    await userEvent.type(screen.getByLabelText("Téléphone"), "06 61 2");
    await userEvent.click(screen.getByRole("button", { name: "Envoyer ma demande" }));

    expect(screen.getByText("Indiquez votre nom.")).toBeInTheDocument();
    expect(screen.getByText("Numéro incomplet : saisissez 10 chiffres, par exemple 06 12 34 56 78.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the Société field for professionals only", async () => {
    render(<QuoteForm cities={["Marrakech"]} initialPro={false} whatsappHref="#" aside={null} />);
    expect(screen.queryByLabelText("Société")).toBeNull();
    await userEvent.click(screen.getByRole("radio", { name: "Professionnel" }));
    expect(screen.getByLabelText("Société")).toBeInTheDocument();
  });

  it("posts the request and shows the confirmation", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ ok: true }));
    window.scrollTo = vi.fn();
    render(<QuoteForm cities={["Marrakech"]} initialPro whatsappHref="#" aside={null} />);

    await userEvent.type(screen.getByLabelText("Nom complet"), "Karim Benali");
    await userEvent.type(screen.getByLabelText("Téléphone"), "06 61 23 45 67");
    await userEvent.click(screen.getByRole("button", { name: "Envoyer ma demande" }));

    expect(await screen.findByText("Demande envoyée")).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/forms/quote");
    const body = init?.body as FormData;
    expect(body.get("customer_kind")).toBe("professionnel");
    expect(body.get("city")).toBe("Marrakech");
    expect(body.get("project_type")).toBe("Nouvelle installation");
    expect(Number(body.get("_t"))).toBeGreaterThanOrEqual(0);
  });
});

describe("ContactForm", () => {
  it("maps API field errors under the field", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ errors: { email: ["Indiquez une adresse e-mail valide."] } }, { status: 422 }));
    render(<ContactForm />);

    await userEvent.type(screen.getByLabelText("Téléphone"), "0612345678");
    await userEvent.click(screen.getByRole("button", { name: "Envoyer le message" }));

    expect(await screen.findByText("Indiquez une adresse e-mail valide.")).toBeInTheDocument();
  });
});
