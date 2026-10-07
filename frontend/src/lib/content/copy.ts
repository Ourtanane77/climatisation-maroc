/**
 * Fixed copy of the content templates, verbatim from the design files (Solutions professionnelles,
 * Restaurants, Service, Page introuvable). Editable page text comes from the API.
 */
import type { Contact } from "./types";

/** "Comment se déroule un projet" (PSTEPS), shared by the sector hub and the sector pages. */
export const PROJECT_STEPS = [
  { title: "Visite technique", text: "300 Dhs. Un technicien mesure les lieux et vous conseille." },
  { title: "Devis détaillé", text: "Appareils, accessoires et pose, ligne par ligne." },
  { title: "Livraison et installation", text: "Livraison gratuite et pose par nos techniciens." },
  { title: "Service après-vente", text: "Nous restons joignables après la pose." },
] as const;

export const PROJECT_TYPES = ["Nouvelle installation", "Remplacement", "Entretien", "Fourniture seule"] as const;

export const PROJECTS_PHONE_LABEL = "Projets et revendeurs";
export const SALES_PHONE_LABEL = "Ventes";

/** Display number of a phone role from Réglages ("Projets et revendeurs" → "0666-602599"). */
export function phoneFor(contact: Pick<Contact, "phones" | "salesPhone">, label: string): string {
  return contact.phones.find((p) => p.label === label)?.display ?? contact.salesPhone;
}
