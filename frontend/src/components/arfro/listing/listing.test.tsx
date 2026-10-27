import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArfroCategoryHeader, headerEyebrow } from "./ArfroCategoryHeader";

vi.mock("server-only", () => ({}));

const crumbs = [{ label: "Accueil", href: "/" }, { label: "Climatisation", href: "/climatisation" }, { label: "Climatiseurs muraux" }];

describe("ArfroCategoryHeader", () => {
  it("eyebrow is the parent range, else « Catalogue »", () => {
    expect(headerEyebrow(crumbs)).toBe("Climatisation");
    expect(headerEyebrow([{ label: "Accueil", href: "/" }, { label: "Climatisation" }])).toBe("Catalogue");
  });

  it("renders the H1, intro, count and the sub-category tab row with the current one marked", () => {
    render(
      <ArfroCategoryHeader
        title="Climatiseurs muraux"
        intro="Le mural, la solution la plus simple."
        breadcrumb={crumbs}
        href="/climatisation/zz-sans-photo"
        count={10}
        nav={[
          { label: "Mural", href: "/climatisation/mural", active: true },
          { label: "Cassette", href: "/climatisation/cassette", active: false },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Climatiseurs muraux" })).toBeInTheDocument();
    expect(screen.getByText("Le mural, la solution la plus simple.")).toBeInTheDocument();
    expect(screen.getByText("10 produits")).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Types" });
    expect(screen.getByRole("link", { name: "Mural" })).toHaveAttribute("aria-current", "page");
    expect(nav.querySelectorAll("a")).toHaveLength(2);
    // No photo for this category: no image, never a placeholder.
    expect(document.querySelector("img")).toBeNull();
  });

  it("hides a navigation with a single entry", () => {
    render(<ArfroCategoryHeader title="Cuivre" breadcrumb={crumbs} href="/cuivre" nav={[{ label: "Tout", href: "/cuivre", active: true }]} />);
    expect(screen.queryByRole("navigation")).toBeNull();
  });
});
