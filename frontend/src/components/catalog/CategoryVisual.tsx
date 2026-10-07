import { DesignImg } from "@/components/ui/DesignImg";
import { cn } from "@/lib/cn";
import { categoryPhoto } from "@/lib/design-assets";
import type { ArtKey } from "@/lib/types";
import { ProductArt } from "./ProductArt";

/**
 * The picture of a category wherever a category or range is shown as a tile or card. Precedence:
 * the image uploaded on the category in the back office (multiply-blended: it may have a white
 * background), then the owner's photo for that category (transparent, shown in its own colours),
 * then the category's line drawing, else nothing.
 */
export function CategoryVisual({
  href,
  image,
  art,
  sizes,
  className,
  artClassName,
  artStyle,
}: {
  href: string;
  image?: string | null;
  art?: ArtKey | null;
  sizes: string;
  /** Classes of the photo (<img>). */
  className?: string;
  /** Classes and size of the drawing's wrapper, used only when there is no photo. */
  artClassName?: string;
  artStyle?: React.CSSProperties;
}) {
  if (image) {
    // Back-office upload (any size or format); next/image is not used for catalogue images.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" loading="lazy" decoding="async" className={cn(className, "mix-blend-multiply")} />;
  }
  const photo = categoryPhoto(href);
  if (photo) return <DesignImg photo={photo} sizes={sizes} className={className} />;
  if (!art) return null;
  return (
    <span aria-hidden className={artClassName} style={artStyle}>
      <ProductArt art={art} className="h-auto max-h-full w-full" />
    </span>
  );
}
