import { cn } from "@/lib/cn";
import { logoBox } from "@/lib/product/logo";
import type { BrandSummary } from "@/lib/product/types";

export interface LogoSize {
  /** Visual area in px² (design `A`). */
  area: number;
  maxH: number;
  maxW: number;
}

/**
 * Brand logo with equal-area sizing (design `logo()` helper), one size below 760 px and one above.
 * Falls back to the brand name when there is no logo file.
 */
export function BrandLogo({
  brand,
  mobile,
  desktop,
  className,
}: {
  brand: Pick<BrandSummary, "name" | "logo" | "logoAspect">;
  mobile: LogoSize;
  desktop: LogoSize;
  className?: string;
}) {
  if (!brand.logo) {
    return <span className={cn("text-ink text-xl font-extrabold tracking-[-0.03em] md:text-2xl", className)}>{brand.name}</span>;
  }
  const m = logoBox(brand.logoAspect, mobile.area, mobile.maxH, mobile.maxW);
  const d = logoBox(brand.logoAspect, desktop.area, desktop.maxH, desktop.maxW);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brand.logo}
      alt={brand.name}
      width={d.width}
      height={d.height}
      loading="lazy"
      decoding="async"
      style={{ "--lw": `${m.width}px`, "--lh": `${m.height}px`, "--lw-d": `${d.width}px`, "--lh-d": `${d.height}px` } as React.CSSProperties}
      className={cn("block h-(--lh) w-(--lw) object-contain md:h-(--lh-d) md:w-(--lw-d)", className)}
    />
  );
}
