import { cn } from "@/lib/cn";
import type { SiteLogo } from "@/lib/site";

export type { SiteLogo };

/**
 * A storefront's logo (src/lib/site.ts): the colour version, or the white one on the brand blue
 * (footer). Small PNG files at 180 px high: next/image (unoptimized here) would add nothing.
 */
export function Logo({ logo, height, white = false, className }: { logo: SiteLogo; height: number; white?: boolean; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={white ? logo.white : logo.src}
      alt={logo.alt}
      width={Math.round((height * logo.width) / logo.height)}
      height={height}
      style={{ height }}
      className={cn("block w-auto", className)}
    />
  );
}
