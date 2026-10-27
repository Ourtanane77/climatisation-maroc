import type { ListItem } from "./parts";

/**
 * Copy of the Arfro professional journey (docs/arfro-creative-brief.md, « ARFRO Business » and
 * « Later rounds »). Only what the site really does: the catalogue, the specifications and the
 * manufacturer datasheets shown on product pages (where one was uploaded), reseller prices after
 * validation (never shown publicly), professional quotes, project follow-up, quick order by
 * reference. Not advertised because they do not exist: quote history, document library, account
 * dashboard, volume discounts, credit terms.
 */

export const QUICK_ORDER_PATH = "/espace-professionnel/commande-rapide";

/** The six steps of « Le parcours professionnel ». `sectorsHref` only when sector pages are published. */
export function journeySteps({ catalogueHref, sectorsHref }: { catalogueHref: string | null; sectorsHref: string | null }): ListItem[] {
  return [
    {
      title: "Le catalogue complet",
      text: "Climatisation, chauffe-eau, ventilation, gaines, cuivre et accessoires frigorifiques : les marques internationales que nous distribuons, au même endroit.",
      link: catalogueHref ? { label: "Parcourir le catalogue", href: catalogueHref } : null,
    },
    {
      title: "Les caractéristiques techniques",
      text: "Chaque fiche produit réunit les caractéristiques communiquées par le fabricant, pour comparer les appareils avant de les prescrire.",
    },
    {
      title: "La documentation fabricant",
      text: "Quand nous disposons de la fiche technique du fabricant, elle est téléchargeable depuis la page du produit.",
    },
    {
      title: "Vos tarifs professionnels",
      text: "Une fois votre compte validé, votre tarif revendeur s’affiche à côté du prix public, sur tout le catalogue, dès la connexion.",
      link: { label: "Ouvrir un compte", href: "/devenir-revendeur" },
    },
    {
      title: "Des devis pour vos projets",
      text: "Décrivez votre projet : nous vous rappelons avec une proposition détaillée, appareil, matériel et pose, poste par poste.",
      link: { label: "Demander un devis", href: "/demander-un-devis?pro=1" },
    },
    {
      title: "Un accompagnement de projet",
      text: "Hôtels, bureaux, restaurants : un interlocuteur pour tout le projet, de la visite technique à l’installation et au service après-vente.",
      link: sectorsHref ? { label: "Voir les solutions professionnelles", href: sectorsHref } : null,
    },
  ];
}

/**
 * « Comment se déroule un projet » (Climatisation Maroc's PROJECT_STEPS without the figures that
 * live elsewhere: the visit price is a Réglages value, delivery terms depend on the order).
 */
export const PROJECT_STEPS: ListItem[] = [
  { title: "Visite technique", text: "Un technicien mesure les lieux et vous conseille." },
  { title: "Devis détaillé", text: "Appareils, accessoires et pose, ligne par ligne." },
  { title: "Livraison et installation", text: "Livraison et pose par nos techniciens." },
  { title: "Service après-vente", text: "Nous restons joignables après la pose." },
];

/** « Pour qui ? » (Climatisation Maroc's copy of the Espace professionnel page). */
export const AUDIENCES = [
  { title: "Installateurs", text: "Les appareils et le matériel de pose pour vos chantiers." },
  { title: "Revendeurs", text: "Les marques que nous distribuons, pour votre magasin." },
  { title: "Projets et chantiers", text: "Hôtels, bureaux, restaurants : un interlocuteur pour tout le projet." },
] as const;

/** « Comment ça marche » (account opening). */
export const ACCOUNT_STEPS: ListItem[] = [
  { title: "Demande d’ouverture de compte", text: "Société, ICE, activité et contact." },
  { title: "Validation par notre équipe", text: "Nous vous contactons pour valider le compte." },
  { title: "Accès aux tarifs et à la commande rapide", text: "Vos prix et le stock s’affichent dès la connexion." },
];

/** Quick order: features that exist in components/pro/QuickOrder.tsx. */
export const QUICK_ORDER_FEATURES = [
  "Une référence et une quantité par ligne : le panier se remplit.",
  "Collez une liste de références d’un seul coup.",
  "Retrouvez vos références fréquentes.",
] as const;
