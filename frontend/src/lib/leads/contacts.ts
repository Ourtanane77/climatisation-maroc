import { telHref } from "@/lib/phone";
import type { Phone, SiteNavigation } from "@/lib/types";

/**
 * Contact data of the lead and pro pages. Numbers, hours and stores come from Réglages (navigation
 * API); descriptions and icons are the fixed copy of design/Contact.dc.html.
 */

export const PROJECTS_LABEL = "Projets et revendeurs";

/** Two-tone stroke icons (SI in the design scripts): first path blue, second orange. */
export const SI = {
  cart: ["M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2", "M9 20.5h.01 M17 20.5h.01"],
  chat: ["M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z", "M9 12h.01 M12 12h.01 M15 12h.01"],
  handshake: ["M3 12l4-4 4 3 4-4 6 6", "M7 16l2 2 M10 15l2 2 M13 14l2 2"],
  receipt: ["M6 3h12v18l-3-2-3 2-3-2-3 2z", "M9 8h6 M9 12h6"],
  tag: ["M3 12V4h8l10 10-8 8z", "M7.5 8.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0"],
  box: ["M3 7l9-4 9 4v10l-9 4-9-4z", "M3 7l9 4 9-4 M12 11v10"],
  list: ["M8 6h13 M8 12h13 M8 18h13", "M3 6h.01 M3 12h.01 M3 18h.01"],
  wrench: ["M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z", "M19 3v0"],
  store: ["M4 9l1.5-5h13L20 9 M4 9v11h16V9 M4 9a2.7 2.7 0 0 0 5.3 0a2.7 2.7 0 0 0 5.4 0a2.7 2.7 0 0 0 5.3 0", "M10 20v-5h4v5"],
  crane: ["M4 21h16 M6 21V8h4v13 M10 8h10l-3 4", "M8 4v4 M17 12v3 M15.5 15h3"],
} as const satisfies Record<string, readonly [string, string]>;

/** "Contact selon votre besoin" (design: Contact). */
export const NEEDS = [
  { label: "Ventes", title: "Ventes", text: "Commander, disponibilité, livraison", icon: "cart" },
  { label: "Conseil", title: "Conseil", text: "Choisir un appareil, une puissance", icon: "chat" },
  { label: PROJECTS_LABEL, title: "Projets et revendeurs", text: "Devis, chantiers, tarifs revendeur", icon: "handshake" },
  { label: "Service facturation", title: "Service facturation", text: "Factures et paiements", icon: "receipt" },
] as const;

/** Reseller perks (BEN), shared by Espace professionnel and Devenir revendeur. */
export const PRO_PERKS = [
  { title: "Tarifs revendeur", text: "Prix professionnels sur tout le catalogue dès la connexion.", icon: "tag" },
  { title: "Stock à jour", text: "Quantités disponibles dans nos deux magasins de Marrakech.", icon: "box" },
  { title: "Commande rapide par référence", text: "Saisissez vos références et quantités, le panier se remplit.", icon: "list" },
] as const;

export function findPhone(nav: SiteNavigation, label: string): Phone | null {
  return nav.footer.phones.find((p) => p.label === label) ?? null;
}

/** "Projets et revendeurs" line (devis, revendeur, pro pages). */
export function projectsPhone(nav: SiteNavigation): Phone {
  return findPhone(nav, PROJECTS_LABEL) ?? { label: PROJECTS_LABEL, display: nav.salesPhone.display, href: telHref(nav.salesPhone.display) };
}
