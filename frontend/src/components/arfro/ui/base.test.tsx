import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
// No server-only mock here: base must stay importable from client components.
import { ArfroButton, DisplayHeading } from "@/components/arfro/ui/base";

describe("Arfro ui/base (client-safe entry)", () => {
  it("imports and renders without any server-only module", () => {
    render(
      <>
        <DisplayHeading as="h3" size="s">
          Titre
        </DisplayHeading>
        <ArfroButton>Valider</ArfroButton>
      </>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Titre" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Valider" })).toHaveClass("arfro-btn");
  });
});
