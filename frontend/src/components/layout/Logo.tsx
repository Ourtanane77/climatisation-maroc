import { cn } from "@/lib/cn";

/**
 * Ariha Froid logo. `src` is null until the logo file exists in public/brand/
 * (design/uploads/pasted-1791221833312-0.png, synced by scripts/sync-design-assets.mjs);
 * meanwhile a text wordmark of the same height is shown.
 */
export function Logo({ src, height, className }: { src: string | null; height: number; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="Climatisation Maroc · Ariha Froid" style={{ height }} className={cn("block w-auto", className)} />;
  }
  return (
    <span
      className={cn("text-brand flex flex-col justify-center leading-none font-extrabold tracking-[-0.03em]", className)}
      style={{ height, fontSize: Math.round(height * 0.42) }}
    >
      Ariha Froid
      <span className="text-accent text-[0.55em] font-bold tracking-normal">Climatisation Maroc</span>
    </span>
  );
}
