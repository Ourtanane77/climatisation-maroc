import { cn } from "@/lib/cn";

/** Page section with the design's H2 (32 mobile / 44, −0.03em) and section gap (40 / 56). */
export function Section({
  id,
  title,
  aside,
  titleClassName,
  className,
  children,
}: {
  id?: string;
  title: string;
  /** Rendered next to the heading (e.g. the datasheet button), baseline-aligned. */
  aside?: React.ReactNode;
  titleClassName?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const heading = (
    <h2 className={cn("m-0 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px]", !aside && "mb-8", titleClassName)}>{title}</h2>
  );
  return (
    <section id={id} className={cn("pt-10 md:pt-14", className)}>
      {aside ? (
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          {heading}
          {aside}
        </div>
      ) : (
        heading
      )}
      {children}
    </section>
  );
}
