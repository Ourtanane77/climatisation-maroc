import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { DESIGN_NAVIGATION } from "@/lib/navigation";
import { buildLlmsTxt } from "./llms";

describe("llms.txt", () => {
  const url = (path: string) => `https://arfro.com${path}`;
  const text = buildLlmsTxt(DESIGN_NAVIGATION, { name: "Arfro", description: "Boutique." }, url);

  it("names the storefront and links only to its own domain", () => {
    expect(text.startsWith("# Arfro\n\n> Boutique.\n")).toBe(true);
    const links = [...text.matchAll(/\]\((.+?)\)/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThan(5);
    expect(links.every((l) => l.startsWith("https://arfro.com/"))).toBe(true);
    expect(text).toContain("[Plan du site](https://arfro.com/sitemap.xml)");
  });

  it("lists the catalogue, legal pages and contact details from the navigation", () => {
    expect(text).toContain("## Catalogue");
    expect(text).toContain(`- [${DESIGN_NAVIGATION.ranges[0]!.label}](https://arfro.com${DESIGN_NAVIGATION.ranges[0]!.href})`);
    expect(text).toContain("## Contact");
    expect(text).toContain(DESIGN_NAVIGATION.footer.hours);
  });
});
