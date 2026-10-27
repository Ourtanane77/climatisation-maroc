import { cn } from "@/lib/cn";
import { designPhoto } from "@/lib/design-assets";
import type { ArfroImage } from "@/lib/home/arfro";

/**
 * Editorial photos of the Arfro ui (docs/arfro-design-system.md). SERVER components only: the
 * design photo manifest (lib/design-assets) is server-only. A client component receives the
 * resolved { src, srcSet } from its server parent instead.
 */

/** Resolved photo of an ArfroImage, or null (empty slot: the caller renders its typographic layout). */
export function resolveArfroImage(image: ArfroImage | undefined): { src: string; srcSet?: string; width?: number; height?: number } | null {
  if (!image) return null;
  if ("src" in image) return { src: image.src };
  const photo = designPhoto(image.design);
  return photo ? { src: photo.src, srcSet: photo.srcSet, width: photo.width, height: photo.height } : null;
}

/**
 * Editorial photo (cover-fitted in its frame). Renders nothing when the slot is empty: never a
 * broken image. `priority` for the first-viewport image (LCP).
 */
export function EditorialImage({
  image,
  alt,
  sizes = "100vw",
  priority = false,
  className,
  imgClassName,
}: {
  image: ArfroImage | undefined;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  const photo = resolveArfroImage(image);
  if (!photo) return null;
  return (
    // cn() only joins classes: keep « relative » only when the caller sets no position of its own
    // (an « absolute inset-0 » frame would otherwise lose to it and collapse to 0px high).
    <div className={cn(!/(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className ?? "") && "relative", "overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized renditions, next/image unused (unoptimized) */}
      <img
        src={photo.src}
        srcSet={photo.srcSet}
        sizes={photo.srcSet ? sizes : undefined}
        width={photo.width}
        height={photo.height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={cn("absolute inset-0 size-full object-cover", imgClassName)}
      />
    </div>
  );
}
