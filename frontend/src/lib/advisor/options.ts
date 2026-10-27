/** Answer choices of the advisor, in display order (French copy). */
import type { AdvisorCeiling, AdvisorInsulation, AdvisorRoom, AdvisorSun, HeatSource } from "./model";

export interface Choice<T extends string> {
  value: T;
  label: string;
  sub?: string;
}

export const ROOM_CHOICES: Choice<AdvisorRoom>[] = [
  { value: "chambre", label: "Chambre", sub: "Repos, nuits calmes" },
  { value: "salon", label: "Salon", sub: "Pièce de vie, séjour" },
  { value: "bureau", label: "Bureau", sub: "Travail, à la maison ou en entreprise" },
  { value: "commerce", label: "Commerce", sub: "Boutique, café, cabinet" },
  { value: "autre", label: "Autre", sub: "Tout autre espace" },
];

export const CEILING_CHOICES: Choice<AdvisorCeiling>[] = [
  { value: "standard", label: "Standard", sub: "Jusqu’à 2,5 m" },
  { value: "haute", label: "Haute", sub: "De 2,5 à 3 m" },
  { value: "tres-haute", label: "Très haute", sub: "Plus de 3 m" },
];

export const SUN_CHOICES: Choice<AdvisorSun>[] = [
  { value: "faible", label: "Peu exposée", sub: "Ombre, nord" },
  { value: "normale", label: "Normale", sub: "Soleil une partie du jour" },
  { value: "forte", label: "Très ensoleillée", sub: "Plein sud, grandes baies" },
];

export const INSULATION_CHOICES: Choice<AdvisorInsulation>[] = [
  { value: "bonne", label: "Bonne", sub: "Double vitrage, murs isolés" },
  { value: "moyenne", label: "Moyenne", sub: "Construction courante" },
  { value: "faible", label: "Faible", sub: "Dernier étage, simple vitrage" },
];

export const HEAT_CHOICES: Choice<HeatSource>[] = [
  { value: "cuisine", label: "Cuisine ou plaques de cuisson", sub: "Cuisine ouverte sur la pièce" },
  { value: "electronique", label: "Équipements électroniques", sub: "Ordinateurs, écrans, serveur, vitrine" },
];

export function choiceLabel<T extends string>(choices: Choice<T>[], value: T | null): string {
  return choices.find((c) => c.value === value)?.label ?? "";
}
