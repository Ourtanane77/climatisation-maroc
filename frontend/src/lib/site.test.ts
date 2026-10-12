import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

/** Fresh modules for one storefront: SITE_KEY / SITE_URL are read when ./site is first imported. */
async function load(env: { SITE_KEY?: string; SITE_URL?: string }) {
  vi.resetModules();
  vi.stubEnv("SITE_KEY", env.SITE_KEY ?? "");
  vi.stubEnv("SITE_URL", env.SITE_URL ?? "");
  return {
    site: await import("./site"),
    chrome: await import("./chrome"),
    metadata: await import("./seo/metadata"),
    jsonld: await import("./seo/jsonld"),
  };
}

const footer = { phones: [], socials: [], stores: [], hours: "" } as never;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.doUnmock("next/navigation");
});

describe("site config", () => {
  it("defaults to Climatisation Maroc (missing or unknown SITE_KEY)", async () => {
    const { site, chrome } = await load({});
    expect(site.SITE_KEY).toBe("cm");
    expect(site.SITE_NAME).toBe("Climatisation Maroc");
    expect(site.resolveSiteKey("autre")).toBe("cm");
    expect(site.resolveSiteKey(" ARFRO ")).toBe("arfro");
    expect(site.siteHeaders()).toEqual({ "X-Site": "cm" });
    expect(chrome.siteLogo()).toEqual({
      src: "/logo-arfro.svg",
      alt: "Arfro by Ariha Froid · Climatisation Maroc",
      wordmark: { text: "Ariha Froid", tagline: "Climatisation Maroc", label: "Ariha Froid · Climatisation Maroc" },
    });
  });

  it("serves Arfro with SITE_KEY=arfro, on its own base URL", async () => {
    const { site, chrome } = await load({ SITE_KEY: "arfro", SITE_URL: "https://arfro.com/" });
    expect(site.SITE_KEY).toBe("arfro");
    expect(site.SITE_NAME).toBe("Arfro");
    expect(site.SITE.orderPrefix).toBe("AR");
    expect(site.siteHeaders()).toEqual({ "X-Site": "arfro" });
    expect(site.siteUrl("/contact")).toBe("https://arfro.com/contact");
    expect(chrome.siteLogo()).toMatchObject({ src: "/logo-arfro.svg", alt: "Arfro by Ariha Froid", wordmark: { text: "Arfro" } });
  });

  it("falls back to the wordmark when none of the logo files exists", async () => {
    const { site, chrome } = await load({});
    expect(chrome.logoSrc({ ...site.SITE, logoFiles: ["/absent.svg"] })).toBeNull();
  });
});

describe("API calls name the storefront", () => {
  it("sends X-Site on every apiGet", async () => {
    await load({ SITE_KEY: "arfro" });
    const fetch = vi.fn(async () => Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetch);
    const { apiGet } = await import("./api");
    await apiGet("/navigation");
    await apiGet("/auth/me", { token: "t" });
    for (const call of fetch.mock.calls as unknown as [string, RequestInit][]) {
      expect(call[1].headers).toMatchObject({ "X-Site": "arfro", Accept: "application/json" });
    }
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("sends X-Site from the BFF route handlers (forms, cart, orders, auth)", async () => {
    await load({ SITE_KEY: "arfro" });
    vi.doMock("next/headers", () => ({ headers: async () => new Headers(), cookies: async () => ({ get: () => undefined }) }));
    vi.doMock("@/lib/auth", () => ({ getToken: async () => null }));
    const fetch = vi.fn(async () => Response.json({}));
    vi.stubGlobal("fetch", fetch);
    const { forward } = await import("./leads/server");
    const { apiForward } = await import("./commerce/server");
    await forward("/forms/contact", { name: "A" });
    await apiForward("POST", "/orders", {});
    for (const call of fetch.mock.calls as unknown as [string, RequestInit][]) {
      expect(call[1].headers).toMatchObject({ "X-Site": "arfro" });
    }
    expect(fetch).toHaveBeenCalledTimes(2);
    vi.doUnmock("next/headers");
    vi.doUnmock("@/lib/auth");
  });

  it("defaults to X-Site: cm", async () => {
    await load({});
    const fetch = vi.fn(async () => Response.json({}));
    vi.stubGlobal("fetch", fetch);
    const { apiGet } = await import("./api");
    await apiGet("/home");
    expect((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].headers).toMatchObject({ "X-Site": "cm" });
  });
});

describe("SEO per storefront", () => {
  it("uses the site name in titles, Open Graph and JSON-LD", async () => {
    const { metadata, jsonld } = await load({ SITE_KEY: "arfro", SITE_URL: "https://arfro.com" });
    const page = metadata.seoMetadata({ title: "Marques", path: "/marques" });
    expect(page.title).toEqual({ absolute: "Marques · Arfro" });
    expect(page.openGraph).toMatchObject({ siteName: "Arfro", url: "https://arfro.com/marques" });
    expect(metadata.fallbackDescription("Services")).toMatch(/^Services · Arfro\. /);

    expect(jsonld.websiteSchema()).toMatchObject({ name: "Arfro", alternateName: "Ariha Froid", url: "https://arfro.com/" });
    expect(jsonld.organizationSchema(footer, "/logo-arfro.svg")).toMatchObject({
      name: "Ariha Froid",
      alternateName: "Arfro",
      "@id": "https://arfro.com/#organisation",
      logo: "https://arfro.com/logo-arfro.svg",
    });
  });

  it("keeps Climatisation Maroc by default", async () => {
    const { jsonld } = await load({});
    expect(jsonld.websiteSchema()).toMatchObject({ name: "Climatisation Maroc", alternateName: "Ariha Froid" });
  });

  it("answers 404 to old climatisationmaroc.com URLs on another storefront, without calling the API", async () => {
    await load({ SITE_KEY: "arfro" });
    vi.doMock("next/navigation", () => ({
      notFound: () => {
        throw new Error("NEXT_NOT_FOUND");
      },
      permanentRedirect: vi.fn(),
      redirect: vi.fn(),
    }));
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const { redirectLegacy } = await import("./seo/legacy");
    await expect(redirectLegacy("/home/contact")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(fetch).not.toHaveBeenCalled();
  });
});
