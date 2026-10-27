/** A city offered at step 3 (GET /cities, or the fallback below when the API is unreachable). */
export interface AdvisorCity {
  slug: string;
  name: string;
}

/** Same list and slugs as the cities seeded for delivery (GET /api/v1/cities). */
export const FALLBACK_CITIES: AdvisorCity[] = [
  { slug: "agadir", name: "Agadir" },
  { slug: "beni-mellal", name: "Béni Mellal" },
  { slug: "casablanca", name: "Casablanca" },
  { slug: "el-jadida", name: "El Jadida" },
  { slug: "essaouira", name: "Essaouira" },
  { slug: "fes", name: "Fès" },
  { slug: "kenitra", name: "Kénitra" },
  { slug: "marrakech", name: "Marrakech" },
  { slug: "meknes", name: "Meknès" },
  { slug: "mohammedia", name: "Mohammedia" },
  { slug: "ouarzazate", name: "Ouarzazate" },
  { slug: "oujda", name: "Oujda" },
  { slug: "rabat", name: "Rabat" },
  { slug: "safi", name: "Safi" },
  { slug: "sale", name: "Salé" },
  { slug: "tanger", name: "Tanger" },
  { slug: "tetouan", name: "Tétouan" },
  { slug: "autre-ville", name: "Autre ville" },
];
