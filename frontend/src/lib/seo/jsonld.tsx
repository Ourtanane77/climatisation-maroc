import type { ProductPageData } from "@/lib/product/types";
import type { SiteNavigation } from "@/lib/types";
import { SITE_NAME, siteUrl } from "@/lib/site";

/**
 * Structured data built from real data only (shop settings, catalogue, articles): the company
 * (Organization), the site (WebSite), the two Marrakech stores (HVACBusiness), products and blog
 * posts. Never invented: no ratings, GTIN, coordinates or promo end dates (docs/audits/schema.md).
 */

type Footer = SiteNavigation["footer"];
type Json = Record<string, unknown>;

export const ORG_ID = siteUrl("/#organisation");
const WEBSITE_ID = siteUrl("/#website");

export function JsonLd({ data }: { data: Json | Json[] }) {
  // "<" is escaped so a value can never close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

function telephone(footer: Footer, label?: string): string | undefined {
  const phone = footer.phones.find((p) => p.href.startsWith("tel:") && (!label || p.label === label)) ?? footer.phones.find((p) => p.href.startsWith("tel:"));
  return phone?.href.replace(/^tel:/, "");
}

function email(footer: Footer): string | undefined {
  return footer.phones.find((p) => p.href.startsWith("mailto:"))?.href.replace(/^mailto:/, "");
}

/** Footer phone labels → schema.org contact types (only the numbers the site shows). */
const CONTACT_TYPES: Record<string, string> = {
  Ventes: "sales",
  Conseil: "customer support",
  "Projets et revendeurs": "sales",
  "Service facturation": "billing support",
};

function slug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Stable @id of a store, shared by /contact and /a-propos. */
export function storeId(name: string): string {
  return siteUrl(`/contact#${slug(name)}`);
}

export function organizationSchema(footer: Footer, logo: string | null): Json {
  const contactPoint = footer.phones
    .filter((p) => p.href.startsWith("tel:") && CONTACT_TYPES[p.label])
    .map((p) => ({
      "@type": "ContactPoint",
      contactType: CONTACT_TYPES[p.label],
      name: p.label,
      telephone: p.href.replace(/^tel:/, ""),
      areaServed: "MA",
      availableLanguage: "French",
    }));
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Ariha Froid",
    alternateName: SITE_NAME,
    url: siteUrl("/"),
    ...(logo ? { logo: siteUrl(logo) } : {}),
    ...(telephone(footer, "Ventes") ? { telephone: telephone(footer, "Ventes") } : {}),
    ...(email(footer) ? { email: email(footer) } : {}),
    ...(contactPoint.length ? { contactPoint } : {}),
    ...(footer.stores.length ? { subOrganization: footer.stores.map((s) => ({ "@id": storeId(s.name) })) } : {}),
    sameAs: footer.socials.filter((s) => s.name !== "WhatsApp").map((s) => s.href),
  };
}

/** The site itself. No SearchAction: Google retired the sitelinks search box (Nov 2024). */
export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: "Ariha Froid",
    url: siteUrl("/"),
    inLanguage: "fr-MA",
    publisher: { "@id": ORG_ID },
  };
}

/** One HVACBusiness per store ("Lot Sakar Villa 107, Marrakech 40070"), with a stable @id. */
export function storesSchema(footer: Footer): Json[] {
  const hours = openingHoursSpecification(footer.hours);
  return footer.stores.map((store) => {
    const match = store.address.match(/^(.*),\s*([^,\d]+?)\s*(\d{5})?$/);
    const id = storeId(store.name);
    return {
      "@context": "https://schema.org",
      "@type": "HVACBusiness",
      "@id": id,
      name: `Ariha Froid · ${store.name}`,
      url: id,
      parentOrganization: { "@id": ORG_ID },
      ...(telephone(footer, "Fixe") ? { telephone: telephone(footer, "Fixe") } : {}),
      ...(email(footer) ? { email: email(footer) } : {}),
      address: {
        "@type": "PostalAddress",
        streetAddress: match?.[1] ?? store.address,
        addressLocality: match?.[2] ?? "Marrakech",
        ...(match?.[3] ? { postalCode: match[3] } : {}),
        addressCountry: "MA",
      },
      // A map search of the visible address (no coordinates are known: none are invented).
      hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`,
      ...(hours ? { openingHoursSpecification: [hours] } : {}),
      areaServed: { "@type": "Country", name: "Maroc" },
    };
  });
}

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] as const;
const DAY_CODES: Record<string, string> = { lundi: "Mo", mardi: "Tu", mercredi: "We", jeudi: "Th", vendredi: "Fr", samedi: "Sa", dimanche: "Su" };
const DAY_URLS: Record<string, string> = {
  lundi: "Monday",
  mardi: "Tuesday",
  mercredi: "Wednesday",
  jeudi: "Thursday",
  vendredi: "Friday",
  samedi: "Saturday",
  dimanche: "Sunday",
};

/** "Lundi – Samedi, 9h – 19h" (also « à », « au », "-") → day range and times; null for another shape. */
function parseHours(text: string): { from: string; to: string; opens: string; closes: string } | null {
  const day = DAYS.join("|");
  const sep = "(?:à|au|[-–—])";
  const m = text.toLowerCase().match(new RegExp(`(${day})\\s*${sep}\\s*(${day})\\D*(\\d{1,2})\\s*h\\s*(\\d{2})?\\s*${sep}\\s*(\\d{1,2})\\s*h\\s*(\\d{2})?`));
  if (!m) return null;
  const time = (h: string, min?: string) => `${h.padStart(2, "0")}:${min ?? "00"}`;
  return { from: m[1], to: m[2], opens: time(m[3], m[4]), closes: time(m[5], m[6]) };
}

/** "Lundi à Samedi, 9h à 19h" → "Mo-Sa 09:00-19:00"; null when the text has another shape. */
export function openingHours(text: string): string | null {
  const h = parseHours(text);
  return h ? `${DAY_CODES[h.from]}-${DAY_CODES[h.to]} ${h.opens}-${h.closes}` : null;
}

function openingHoursSpecification(text: string): Json | null {
  const h = parseHours(text);
  if (!h) return null;
  const order: readonly string[] = DAYS;
  const days = order.slice(order.indexOf(h.from), order.indexOf(h.to) + 1);
  if (!days.length) return null;
  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: days.map((d) => `https://schema.org/${DAY_URLS[d]}`),
    opens: h.opens,
    closes: h.closes,
  };
}

const AVAILABILITY: Record<ProductPageData["variants"][number]["stock"], string> = {
  en_stock: "https://schema.org/InStock",
  sur_commande: "https://schema.org/BackOrder",
  rupture: "https://schema.org/OutOfStock",
};

/** Free delivery across Morocco, as stated on every product page and on /livraison-et-paiement. */
const FREE_SHIPPING = {
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "MAD" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "MA" },
};

/** Size-like variant labels ("Ø 160", "300 L") are a valid `variesBy: size`; powers (BTU) are not. */
const SIZE_LABEL = /^(Ø\s*\d+|\d+\s*L)$/;

/**
 * Product markup from the public product page data. « Prix sur demande » variants (price 0) get no
 * Offer, since there is no valid markup for a price on request: they are left out, and a product
 * with no priced variant gets no Product block at all (null). One priced variant → `Product`;
 * several → `ProductGroup` with `hasVariant`.
 */
export function productSchema(product: ProductPageData): Json | null {
  const priced = product.variants.filter((v) => !v.onRequest && v.price > 0);
  if (!priced.length) return null;

  const url = siteUrl(product.href);
  const images = product.images
    .map((i) => i.src)
    .filter((src): src is string => !!src)
    .map((src) => siteUrl(src));
  const brand = product.brand ? { "@type": "Brand", name: product.brand.name } : undefined;
  const description = product.description ?? product.shortDescription ?? undefined;

  const offer = (v: (typeof priced)[number], offerUrl: string): Json => ({
    "@type": "Offer",
    url: offerUrl,
    priceCurrency: "MAD",
    price: (v.price / 100).toFixed(2),
    ...(v.regularPrice && v.regularPrice > v.price
      ? {
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            priceType: "https://schema.org/StrikethroughPrice",
            price: (v.regularPrice / 100).toFixed(2),
            priceCurrency: "MAD",
          },
        }
      : {}),
    availability: AVAILABILITY[v.stock] ?? "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@id": ORG_ID },
    shippingDetails: FREE_SHIPPING,
  });

  const variantImage = (v: (typeof priced)[number]) => (v.image != null && product.images[v.image]?.src ? siteUrl(product.images[v.image].src!) : undefined);

  if (product.variants.length === 1) {
    const v = priced[0];
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${url}#product`,
      name: product.name,
      ...(description ? { description } : {}),
      ...(images.length ? { image: images } : {}),
      sku: v.sku,
      ...(brand ? { brand } : {}),
      url,
      offers: offer(v, url),
    };
  }

  const bySize = priced.every((v) => v.label && SIZE_LABEL.test(v.label.trim()));
  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    "@id": `${url}#product`,
    name: product.name,
    ...(description ? { description } : {}),
    ...(images.length ? { image: images } : {}),
    url,
    ...(brand ? { brand } : {}),
    productGroupID: product.slug,
    ...(bySize ? { variesBy: ["https://schema.org/size"] } : {}),
    hasVariant: priced.map((v) => {
      const power = v.label?.match(/^([\d\s  ]+)\s*BTU/i)?.[1]?.replace(/\D/g, "");
      return {
        "@type": "Product",
        name: v.name,
        sku: v.sku,
        inProductGroupWithID: product.slug,
        ...(variantImage(v) ? { image: variantImage(v) } : {}),
        ...(bySize && v.label ? { size: v.label.trim() } : {}),
        ...(power ? { additionalProperty: { "@type": "PropertyValue", name: "Puissance", value: Number(power), unitText: "BTU" } } : {}),
        offers: offer(v, siteUrl(`${product.href}?v=${encodeURIComponent(v.sku)}`)),
      };
    }),
  };
}

/** Blog post: the publisher is the site's Organization (one entity, by @id). */
export function blogPostingSchema(article: {
  title: string;
  description: string | null;
  href: string;
  publishedAt: string | null;
  updatedAt: string | null;
  category: string | null;
  image: string | null;
  /** Named author when the article has one; otherwise the Organization. */
  author: string | null;
}): Json {
  const url = siteUrl(article.href);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: article.title,
    ...(article.description ? { description: article.description } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "fr-MA",
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
    ...(article.image ? { image: siteUrl(article.image) } : {}),
    ...(article.category ? { articleSection: article.category } : {}),
    author: article.author ? { "@type": "Person", name: article.author } : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}
