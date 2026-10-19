import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { formatWhatsApp } from "@/lib/whatsapp";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { HeroWhatsAppMenu } from "./HeroWhatsAppMenu";
import { HomeHero } from "./HomeHero";

vi.mock("server-only", () => ({}));
vi.mock("./PowerFinder", () => ({ PowerFinder: () => null }));

const HERO = { title: "Climatisation", subtitle: null, image: null, cta: null };

describe("formatWhatsApp", () => {
  it("reads a Moroccan number the local way", () => {
    expect(formatWhatsApp("212666854184")).toBe("0666 85 41 84");
    expect(formatWhatsApp("212666088348")).toBe("0666 08 83 48");
  });

  it("shows any other number with its + sign", () => {
    expect(formatWhatsApp("33612345678")).toBe("+33612345678");
  });
});

describe("HeroWhatsAppMenu", () => {
  const numbers = [
    { number: "212666854184", label: null },
    { number: "212666088348", label: "Ventes" },
  ];

  it("opens a menu with one wa.me link per number and closes on Escape", async () => {
    render(<HeroWhatsAppMenu numbers={numbers} />);
    const button = screen.getByRole("button", { name: "WhatsApp" });
    expect(button).toHaveAttribute("aria-haspopup", "menu");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).toBeNull();

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    const links = screen.getAllByRole("menuitem");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["https://wa.me/212666854184", "https://wa.me/212666088348"]);
    expect(links[0]).toHaveTextContent("0666 85 41 84");
    expect(links[1]).toHaveTextContent("Ventes · 0666 08 83 48");
    expect(links[0]).toHaveAttribute("target", "_blank");

    await userEvent.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on an outside click", async () => {
    render(
      <>
        <HeroWhatsAppMenu numbers={numbers} />
        <p>Ailleurs</p>
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "WhatsApp" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Ailleurs"));
    expect(screen.queryByRole("menu")).toBeNull();
  });
});

describe("HomeHero WhatsApp button", () => {
  it("renders a menu for two numbers", () => {
    render(
      <HomeHero
        hero={HERO}
        whatsapp="212600000000"
        heroWhatsapp={[
          { number: "212666854184", label: null },
          { number: "212666088348", label: null },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "WhatsApp" })).toHaveAttribute("aria-haspopup", "menu");
  });

  it("keeps a direct link with one number or none", () => {
    const { unmount } = render(<HomeHero hero={HERO} whatsapp="212600000000" heroWhatsapp={[{ number: "212666854184", label: null }]} />);
    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", "https://wa.me/212666854184");
    unmount();

    render(<HomeHero hero={HERO} whatsapp="212600000000" heroWhatsapp={[]} />);
    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", "https://wa.me/212600000000");
  });
});

describe("FloatingWhatsApp", () => {
  it("links to the number in a new tab", () => {
    render(<FloatingWhatsApp number="212666774394" />);
    const link = screen.getByRole("link", { name: "Nous écrire sur WhatsApp" });
    expect(link).toHaveAttribute("href", "https://wa.me/212666774394");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("is absent without a number", () => {
    const { container } = render(
      <>
        <FloatingWhatsApp number={null} />
        <FloatingWhatsApp />
        <FloatingWhatsApp number="" />
      </>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("is lifted above a visible bottom bar", async () => {
    const bar = document.createElement("div");
    bar.setAttribute("data-bottom-bar", "");
    Object.defineProperty(bar, "offsetHeight", { value: 72 });
    bar.getClientRects = () => [{}] as unknown as DOMRectList;
    document.body.appendChild(bar);
    render(<FloatingWhatsApp number="212666774394" />);
    const link = screen.getByRole("link", { name: "Nous écrire sur WhatsApp" });
    await vi.waitFor(() => expect(link.style.bottom).toBe("84px"));
    bar.remove();
  });
});
