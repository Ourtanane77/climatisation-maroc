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
      src: "/brand/cm/logo.png",
      white: "/brand/cm/logo-white.png",
      alt: "Ariha Froid · Climatisation Maroc",
      width: 621,
      height: 180,
    });
    expect(site.SITE.icons.favicon).toBe("/brand/cm/favicon-32.png");
  });

  it("serves Arfro with SITE_KEY=arfro, on its own base URL", async () => {
    const { site, chrome } = await load({ SITE_KEY: "arfro", SITE_URL: "https://arfro.com/" });
    expect(site.SITE_KEY).toBe("arfro");
    expect(site.SITE_NAME).toBe("Arfro");
    expect(site.SITE.orderPrefix).toBe("AR");
    expect(site.siteHeaders()).toEqual({ "X-Site": "arfro" });
    expect(site.siteUrl("/contact")).toBe("https://arfro.com/contact");
    expect(chrome.siteLogo()).toMatchObject({ src: "/brand/arfro/logo.png", white: "/brand/arfro/logo-white.png", alt: "Arfro by Ariha Froid" });
    expect(site.SITE.icons.icon).toBe("/brand/arfro/icon.png");
  });

  it("ships every logo and icon file it names", async () => {
    const { existsSync } = await import("node:fs");
    const path = await import("node:path");
    for (const key of ["cm", "arfro"] as const) {
      const { site } = await load({ SITE_KEY: key });
      const files = [site.SITE.logo.src, site.SITE.logo.white, ...Object.values(site.SITE.icons)];
      for (const file of files) expect(existsSync(path.join(process.cwd(), "public", file)), file).toBe(true);
    }
  });
});

describe("Google Tag Manager", () => {
  it("is each site's own container in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const arfro = await load({ SITE_KEY: "arfro" });
    expect(arfro.site.gtmId()).toBe("GTM-W8BQPKPX");
    const cm = await load({});
    vi.stubEnv("NODE_ENV", "production");
    expect(cm.site.gtmId()).toBe("GTM-M6CMD354");
  });

  it("stays off in development unless GTM_ID is set, and GTM_ID=off disables it", async () => {
    const { site } = await load({ SITE_KEY: "arfro" });
    vi.stubEnv("NODE_ENV", "development");
    expect(site.gtmId()).toBeNull();
    vi.stubEnv("GTM_ID", "GTM-TEST1");
    expect(site.gtmId()).toBe("GTM-TEST1");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("GTM_ID", "off");
    expect(site.gtmId()).toBeNull();
  });

  it("adds each site's own Clarity project in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const arfro = await load({ SITE_KEY: "arfro" });
    expect(arfro.site.clarityId()).toBe("yx5c5sr7f7");
    const cm = await load({});
    vi.stubEnv("NODE_ENV", "production");
    expect(cm.site.clarityId()).toBe("yzqjn5sv22");
    vi.stubEnv("CLARITY_ID", "off");
    expect(arfro.site.clarityId()).toBeNull();
    const { Clarity } = await import("@/components/analytics/Clarity");
    expect(Clarity({ id: 'x");alert(1);//' })).toBeNull();
    expect(Clarity({ id: "yx5c5sr7f7" })).not.toBeNull();
  });

  it("never gives a script an id that shadows the tracker's global (window.clarity, window.dataLayer)", async () => {
    const { CLARITY_SCRIPT_ID } = await import("@/components/analytics/Clarity");
    const { GTM_SCRIPT_ID } = await import("@/components/analytics/GoogleTagManager");
    for (const id of [CLARITY_SCRIPT_ID, GTM_SCRIPT_ID]) {
      expect(["clarity", "dataLayer", "gtm", "google_tag_manager"]).not.toContain(id);
    }
  });

  it("renders nothing for a malformed ID", async () => {
    const { GoogleTagManager, GoogleTagManagerNoScript } = await import("@/components/analytics/GoogleTagManager");
    expect(GoogleTagManager({ id: "GTM-X');alert(1);//" })).toBeNull();
    expect(GoogleTagManagerNoScript({ id: null })).toBeNull();
    expect(GoogleTagManagerNoScript({ id: "GTM-W8BQPKPX" })).not.toBeNull();
  });
});

describe("Meta Pixel", () => {
  it("is Climatisation Maroc's pixel in production, none for Arfro", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const cm = await load({});
    vi.stubEnv("NODE_ENV", "production");
    expect(cm.site.metaPixelId()).toBe("1103989458680997");
    const arfro = await load({ SITE_KEY: "arfro" });
    vi.stubEnv("NODE_ENV", "production");
    expect(arfro.site.metaPixelId()).toBeNull();
    vi.stubEnv("NODE_ENV", "development");
    expect(cm.site.metaPixelId()).toBeNull();
  });

  it("renders nothing for a malformed ID, and never shadows window.fbq", async () => {
    const { MetaPixel, MetaPixelNoScript, META_PIXEL_SCRIPT_ID } = await import("@/components/analytics/MetaPixel");
    expect(MetaPixel({ id: "1');alert(1);//" })).toBeNull();
    expect(MetaPixelNoScript({ id: null })).toBeNull();
    expect(MetaPixel({ id: "1103989458680997" })).not.toBeNull();
    expect(["fbq", "_fbq"]).not.toContain(META_PIXEL_SCRIPT_ID);
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
    expect(jsonld.organizationSchema(footer, "/brand/arfro/logo.png")).toMatchObject({
      name: "Ariha Froid",
      alternateName: "Arfro",
      "@id": "https://arfro.com/#organisation",
      logo: "https://arfro.com/brand/arfro/logo.png",
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

describe("site URL", () => {
  it("refuses the other storefront's domain and falls back to the site's own", async () => {
    const { site } = await load({});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(site.resolveSiteUrl("cm", { SITE_URL: "https://arfro.com", NODE_ENV: "production" })).toBe("https://climatisationmaroc.com");
    expect(site.resolveSiteUrl("cm", { NEXT_PUBLIC_SITE_URL: "https://www.arfro.com/" })).toBe("https://climatisationmaroc.com");
    expect(site.resolveSiteUrl("arfro", { SITE_URL: "https://climatisationmaroc.com" })).toBe("https://arfro.com");
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it("keeps a configured URL of its own, and falls back by environment", async () => {
    const { site } = await load({});
    expect(site.resolveSiteUrl("cm", { SITE_URL: "https://www.climatisationmaroc.com/" })).toBe("https://www.climatisationmaroc.com");
    expect(site.resolveSiteUrl("arfro", { SITE_URL: "http://arfro.localhost:8080" })).toBe("http://arfro.localhost:8080");
    expect(site.resolveSiteUrl("arfro", { NODE_ENV: "production" })).toBe("https://arfro.com");
    expect(site.resolveSiteUrl("cm", {})).toBe("http://localhost:8080");
  });
});
