import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArfroButton, ArfroButtonLink, DisplayHeading, EditorialImage, Eyebrow, Lead, Section, arfroButtonClasses } from "@/components/arfro/ui";

vi.mock("server-only", () => ({}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("Arfro ui", () => {
  it("Section exposes its tone for the tone-aware text rules", () => {
    const { container } = render(
      <Section tone="navy" labelledBy="t">
        <DisplayHeading id="t" size="xl">
          Titre
        </DisplayHeading>
      </Section>,
    );
    const section = container.querySelector("section")!;
    expect(section).toHaveAttribute("data-tone", "navy");
    expect(section).toHaveClass("arfro-section", "bg-arfro-navy");
    expect(screen.getByRole("heading", { level: 2, name: "Titre" })).toHaveAttribute("data-size", "xl");
  });

  it("Eyebrow and Lead follow the tone unless onDark is explicit", () => {
    render(
      <>
        <Eyebrow>Auto</Eyebrow>
        <Eyebrow onDark>Sombre</Eyebrow>
        <Lead onDark={false}>Clair</Lead>
      </>,
    );
    expect(screen.getByText("Auto")).toHaveClass("arfro-eyebrow", "arfro-eyebrow-auto");
    expect(screen.getByText("Sombre")).not.toHaveClass("arfro-eyebrow-auto");
    expect(screen.getByText("Clair")).not.toHaveClass("arfro-lead-auto");
  });

  it("buttons carry the focus-ring class; external links open in a new tab", () => {
    render(
      <>
        <ArfroButtonLink href="/climatisation">Découvrir</ArfroButtonLink>
        <ArfroButtonLink href="https://wa.me/212600000000" variant="outline">
          WhatsApp
        </ArfroButtonLink>
        <ArfroButton variant="light" disabled>
          Calculer
        </ArfroButton>
      </>,
    );
    expect(screen.getByRole("link", { name: "Découvrir" })).toHaveClass("arfro-btn");
    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("target", "_blank");
    const button = screen.getByRole("button", { name: "Calculer" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toBeDisabled();
    expect(arfroButtonClasses("link")).toContain("arfro-link");
  });

  it("EditorialImage renders nothing for an empty slot", () => {
    const { container } = render(<EditorialImage image={undefined} alt="" />);
    expect(container.innerHTML).toBe("");
  });
});
