import { cn } from "@/lib/cn";

/** A storefront's logo (built on the server by siteLogo in src/lib/chrome.ts). */
export interface SiteLogo {
  /** Logo file, or null when none exists (text wordmark). */
  src: string | null;
  alt: string;
  wordmark: { text: string; tagline: string | null; label: string };
}

/**
 * Site logo (« Arfro by Ariha Froid » today on both storefronts). When no logo file exists, a text
 * wordmark of the same height is shown instead.
 */
export function Logo({ logo, height, className }: { logo: SiteLogo; height: number; className?: string }) {
  if (logo.src) {
    return (
      // SVG logo: next/image adds nothing for a vector file.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo.src}
        alt={logo.alt}
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
      aria-label={logo.wordmark.label}
      className={cn("text-brand flex flex-col justify-center leading-none font-extrabold tracking-[-0.03em]", className)}
      style={{ height, fontSize: Math.round(height * 0.42) }}
    >
      {logo.wordmark.text}
      {logo.wordmark.tagline ? <span className="text-accent text-[0.55em] font-bold tracking-normal">{logo.wordmark.tagline}</span> : null}
    </span>
  );
}
