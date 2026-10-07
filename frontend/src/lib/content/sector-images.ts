import "server-only";
import { designImage } from "@/lib/design-assets";
import type { SectorCardData } from "./types";

/** Design photos per sector (Solutions professionnelles.dc.html: the hotel lobby on "Hôtels et riads"). */
const SECTOR_DESIGN_PHOTOS: Record<string, string> = {
  "hotels-riads": "solutions-category.png",
};

/** A back-office photo first, then the design's photo for that sector; null keeps the line scene. */
export function withSectorPhoto<T extends SectorCardData>(sector: T): T {
  if (sector.image) return sector;
  const file = SECTOR_DESIGN_PHOTOS[sector.slug];
  return { ...sector, image: file ? designImage(file) : null };
}
