import "server-only";
import { apiGet } from "@/lib/api";

/** City names for the form selects, in the API order ("Autre ville" last). */
export async function getCityNames(): Promise<string[]> {
  try {
    const { data } = await apiGet<{ data: { name: string }[] }>("/cities", { tags: ["cities"], revalidate: 3600 });
    return data.map((c) => c.name);
  } catch {
    return ["Marrakech", "Autre ville"];
  }
}
