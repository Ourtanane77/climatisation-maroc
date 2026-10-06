import "server-only";
import { apiGet } from "./api";
import type { SiteNavigation } from "./types";

/**
 * Header, drawer and footer data. Served by GET /api/v1/navigation (built in phase 3 from
 * categories and settings). Until then — and only if the API has no such endpoint yet — the
 * values below, taken verbatim from design/Accueil.dc.html, are used.
 */
export async function getNavigation(): Promise<SiteNavigation> {
  try {
    return await apiGet<SiteNavigation>("/navigation", { tags: ["navigation", "settings", "categories"] });
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    return DESIGN_NAVIGATION;
  }
}

const tel = (display: string) => `tel:+212${display.replace(/\D/g, "").replace(/^0/, "")}`;

export const DESIGN_NAVIGATION: SiteNavigation = {
  promoBar: { text: "Super promo : jusqu'à -30 % sur les climatiseurs", link: { label: "Voir les promotions", href: "/promotions" } },
  ranges: [
    {
      key: "clim",
      label: "Climatisation",
      href: "/climatisation",
      mega: {
        title: "Climatisation",
        href: "/climatisation",
        subs: [
          { label: "Mono split", href: "/climatisation/mural" },
          { label: "Gainable", href: "/climatisation/gainable" },
          { label: "Cassette", href: "/climatisation/cassette" },
          { label: "Console et armoire", href: "/climatisation/console-armoire" },
        ],
        brands: ["LG", "Carrier", "CIAT", "Fitco"].map((b) => ({ label: b, href: `/marques/${b.toLowerCase()}` })),
        featured: { name: "LG Dual Inverter 12000 BTU", sku: "D13AJH.N", price: 570000, art: "mural", href: "/produit/lg-dual-inverter" },
      },
    },
    {
      key: "eau",
      label: "Chauffe-eau",
      href: "/chauffe-eau",
      mega: {
        title: "Chauffe-eau",
        href: "/chauffe-eau",
        subs: [
          { label: "Électrique", href: "/chauffe-eau/electrique" },
          { label: "À gaz", href: "/chauffe-eau/gaz" },
          { label: "Solaire", href: "/chauffe-eau/solaire" },
          { label: "Chaudière", href: "/chauffe-eau/chaudiere" },
        ],
        brands: [{ label: "Simsek", href: "/marques/simsek" }],
        featured: {
          name: "Chauffe-eau solaire Simsek 300 L circuit fermé",
          sku: "CHAUFF0061",
          price: 1320000,
          art: "solaire",
          href: "/produit/chauffe-eau-solaire-simsek-circuit-ferme",
        },
      },
    },
    {
      key: "vent",
      label: "Ventilation",
      href: "/ventilation",
      mega: {
        title: "Ventilation",
        href: "/ventilation",
        subs: [
          { label: "Ventilateurs de gaine", href: "/ventilation/ventilateurs-de-gaine" },
          { label: "Multizone", href: "/ventilation/multizone" },
          { label: "Grilles et diffuseurs", href: "/ventilation/grilles-et-diffuseurs" },
        ],
        brands: [{ label: "Nanyo", href: "/ventilation" }],
        featured: {
          name: "Ventilateur de gaine Q125 Nanyo galvanisé",
          sku: "VENT0160",
          price: 60000,
          art: "vent",
          href: "/produit/ventilateur-de-gaine-nanyo-galvanise",
        },
      },
    },
    {
      key: "gaines",
      label: "Gaines",
      href: "/gaines",
      mega: {
        title: "Gaines",
        href: "/gaines",
        subs: [
          { label: "Gaines circulaires", href: "/gaines" },
          { label: "Flexibles souples", href: "/gaines/flexibles-souples" },
          { label: "Flexibles isolés", href: "/gaines/flexibles-isoles" },
        ],
        brands: [
          { label: "Esbo", href: "/gaines" },
          { label: "Arfro", href: "/marques/arfro" },
        ],
        featured: {
          name: "Flexible calorifugé Q160 Arfro 10 m",
          sku: "CLIM00319",
          price: 28000,
          art: "flex",
          href: "/produit/flexible-calorifuge-q160-arfro-10-m",
        },
      },
    },
    {
      key: "cuivre",
      label: "Cuivre et gaz",
      href: "/cuivre-et-gaz",
      mega: {
        title: "Cuivre et gaz",
        href: "/cuivre-et-gaz",
        subs: [
          { label: "Cuivre", href: "/cuivre-et-gaz/cuivre" },
          { label: "Kits duo", href: "/cuivre-et-gaz/kits-duo" },
          { label: "Isolant", href: "/cuivre-et-gaz/isolant" },
          { label: "Gaz frigorifique", href: "/cuivre-et-gaz/gaz-frigorifique" },
        ],
        brands: [
          { label: "Lafarga", href: "/marques/lafarga" },
          { label: "GS", href: "/marques/gs" },
        ],
        featured: { name: "Cuivre 3/8 Lafarga 15 m", sku: "CUIV0006", price: 75000, art: "duo", href: "/cuivre-et-gaz" },
      },
    },
    {
      key: "pieces",
      label: "Pièces de rechange",
      href: "/pieces-de-rechange",
      mega: {
        title: "Pièces de rechange",
        href: "/pieces-de-rechange",
        subs: [
          { label: "Télécommandes", href: "/pieces-de-rechange/telecommandes" },
          { label: "Supports", href: "/pieces-de-rechange/supports" },
          { label: "Adhésifs et mastics", href: "/pieces-de-rechange/adhesifs-et-mastics" },
          { label: "Trappes de visite", href: "/pieces-de-rechange/trappes-de-visite" },
          { label: "Outillage", href: "/pieces-de-rechange/outillage" },
        ],
        brands: [{ label: "Alpha", href: "/marques/alpha" }],
        featured: { name: "Télécommande universelle", sku: "CLIM00080", price: 7000, art: "remote", href: "/produit/telecommande-universelle-1-000" },
      },
    },
  ],
  promotions: { label: "Promotions", href: "/promotions" },
  rightLinks: [
    { label: "Demander un devis", href: "/demander-un-devis" },
    { label: "Contact", href: "/contact" },
    { label: "Devenir revendeur", href: "/devenir-revendeur" },
  ],
  searchScopes: ["Toutes", "Climatisation", "Chauffe-eau", "Ventilation", "Gaines", "Cuivre et gaz", "Pièces de rechange", "Froid"],
  whatsapp: { number: "212666854184", display: "0666-854184" },
  salesPhone: { label: "Ventes", display: "0666-854184", href: tel("0666-854184") },
  footer: {
    about:
      "Climatisation Maroc est un site e-commerce spécialisé dans la vente des systèmes de climatisation, avec livraison gratuite sur tout le Maroc. Le site est une propriété de la société Ariha Froid, fournisseur de climatisation et de froid à Marrakech depuis 2008, pour les professionnels comme les particuliers.",
    // Facebook, Instagram and TikTok have no URL in the design ("#"): added from Réglages once known.
    socials: [{ name: "WhatsApp", href: "https://wa.me/212666854184" }],
    columns: [
      {
        title: "Informations",
        links: [
          { label: "À propos", href: "/a-propos" },
          { label: "Contact", href: "/contact" },
          { label: "Espace revendeur", href: "/devenir-revendeur" },
          { label: "Demander un devis", href: "/demander-un-devis" },
        ],
      },
      {
        title: "Climatisation",
        links: [
          { label: "Mono split", href: "/climatisation/mural" },
          { label: "Gainable", href: "/climatisation/gainable" },
          { label: "Cassette", href: "/climatisation/cassette" },
          { label: "Console et armoire", href: "/climatisation/console-armoire" },
        ],
      },
      {
        title: "Chauffe-eau",
        links: [
          { label: "À gaz", href: "/chauffe-eau/gaz" },
          { label: "Électrique", href: "/chauffe-eau/electrique" },
          { label: "Solaire", href: "/chauffe-eau/solaire" },
          { label: "Chaudière", href: "/chauffe-eau/chaudiere" },
        ],
      },
      {
        title: "Autres produits",
        links: [
          { label: "Ventilation", href: "/ventilation" },
          { label: "Gaines circulaires", href: "/gaines" },
          { label: "Cuivre et gaz", href: "/cuivre-et-gaz" },
          { label: "Pièces de rechange", href: "/pieces-de-rechange" },
          { label: "Froid", href: "/froid" },
        ],
      },
    ],
    phones: [
      { label: "Ventes", display: "0666-854184", href: tel("0666-854184") },
      { label: "Conseil", display: "0666-088348", href: tel("0666-088348") },
      { label: "Projets et revendeurs", display: "0666-602599", href: tel("0666-602599") },
      { label: "Fixe", display: "0524-306850", href: tel("0524-306850") },
      { label: "Service facturation", display: "0666-661882", href: tel("0666-661882") },
      { label: "E-mail", display: "ecom@arihafroid.com", href: "mailto:ecom@arihafroid.com" },
    ],
    stores: [
      { name: "Magasin Sakar", address: "Lot Sakar Villa 107, Marrakech 40070" },
      { name: "Magasin Al Manar", address: "Magasin 60-2, Imm 50 Al Manar, Marrakech 40100" },
    ],
    hours: "Lundi – Samedi, 9h – 19h",
    legal: [
      { label: "Conditions générales d’utilisation", href: "/cgu" },
      { label: "Conditions générales de vente", href: "/cgv" },
      { label: "Informations légales", href: "/informations-legales" },
      { label: "Sécurité", href: "/securite" },
      { label: "Politique de confidentialité", href: "/confidentialite" },
      { label: "Service après-vente", href: "/services/service-apres-vente" },
    ],
    copyright: "© 2026 Ariha Froid · Climatisation Maroc",
  },
};
