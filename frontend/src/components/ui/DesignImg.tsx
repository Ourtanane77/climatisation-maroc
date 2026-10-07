import type { DesignPhoto } from "@/lib/design-assets";

/**
 * A design photo with its WebP `srcset` and intrinsic size (no layout shift). Below-the-fold
 * photos load lazily; pass `priority` for the LCP image.
 */
export function DesignImg({
  photo,
  sizes,
  alt = "",
  className,
  style,
  priority = false,
}: {
  photo: DesignPhoto;
  sizes: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}) {
  return (
    // Pre-sized WebP renditions (scripts/sync-design-assets.mjs); next/image is not used.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={photo.srcSet ? sizes : undefined}
      width={photo.width}
      height={photo.height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? undefined : "async"}
      className={className}
      style={style}
    />
  );
}
