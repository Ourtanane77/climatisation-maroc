import { cn } from "@/lib/cn";

/**
 * Site logo (« Arfro by Ariha Froid », see logoSrc in src/lib/chrome.ts). `src` is null when no
 * logo file exists; a text wordmark of the same height is shown instead.
 */
export function Logo({ src, height, className }: { src: string | null; height: number; className?: string }) {
  if (src) {
    return (
      // SVG logo: next/image adds nothing for a vector file.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="Arfro by Ariha Froid · Climatisation Maroc"
        width={Math.round((height * 246.6) / 83.4)}
        height={height}
        style={{ height }}
        className={cn("block w-auto", className)}
      />
    );
  }
  return (
    // The wordmark is the logo (logotypes are exempt from contrast rules): one image to assistive tech.
    <span
      role="img"
      aria-label="Ariha Froid · Climatisation Maroc"
      className={cn("text-brand flex flex-col justify-center leading-none font-extrabold tracking-[-0.03em]", className)}
      style={{ height, fontSize: Math.round(height * 0.42) }}
    >
      Ariha Froid
      <span className="text-accent text-[0.55em] font-bold tracking-normal">Climatisation Maroc</span>
    </span>
  );
}
