import { cn } from "@/lib/cn";
import type { ArtKey } from "@/lib/types";
import { ProductArt } from "./ProductArt";

/**
 * Product picture as drawn in the design (`pic()` helper): the photo (multiply-blended so white
 * backgrounds melt into the card) or the line illustration, over a soft blurred floor shadow.
 * A photo always wins: the drawing only appears when the product has none.
 */
export function ProductVisual({
  image,
  srcSet,
  // Cards: 2 columns on phones, 3 on tablets, ~300 px from 1100 px.
  sizes = "(max-width: 759px) 45vw, (max-width: 1099px) 30vw, 300px",
  art,
  dark,
  alt,
  width = "100%",
  className,
  shadow = true,
  priority = false,
}: {
  image?: string | null;
  /** WebP renditions of `image`, with the rendered width in `sizes`. */
  srcSet?: string | null;
  sizes?: string;
  /** Drawing used without photo; null/absent → neutral placeholder (never a default appliance). */
  art?: ArtKey | null;
  dark?: boolean;
  alt: string;
  width?: string;
  className?: string;
  shadow?: boolean;
  priority?: boolean;
}) {
  return (
    <div className={cn("flex h-full max-w-full flex-col items-center justify-center", className)} style={{ width }}>
      <div className="flex min-h-0 w-full flex-1 basis-0 items-center justify-center">
        {image ? (
          // Images are served pre-sized by the API (see docs/plan.md, image pipeline).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            srcSet={srcSet ?? undefined}
            sizes={srcSet ? sizes : undefined}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="block h-full max-h-full w-full object-contain mix-blend-multiply"
          />
        ) : (
          <ProductArt art={art} dark={dark} className="h-auto w-full" title={alt} />
        )}
      </div>
      {shadow && <div aria-hidden className="-mt-0.5 h-3 w-[70%] rounded-[50%] bg-[rgba(14,40,70,0.2)] blur-[8px]" />}
    </div>
  );
}
