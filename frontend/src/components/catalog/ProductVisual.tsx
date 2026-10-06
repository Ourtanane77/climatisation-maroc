import { cn } from "@/lib/cn";
import type { ArtKey } from "@/lib/types";
import { ProductArt } from "./ProductArt";

/**
 * Product picture as drawn in the design (`pic()` helper): the photo (multiply-blended so white
 * backgrounds melt into the card) or the line illustration, over a soft blurred floor shadow.
 */
export function ProductVisual({
  image,
  art = "mural",
  dark,
  alt,
  width = "100%",
  className,
  shadow = true,
  priority = false,
}: {
  image?: string | null;
  art?: ArtKey;
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
