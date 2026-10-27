import type { ReactNode } from "react";
import { DisplayHeading, Eyebrow, Lead, type DisplaySize } from "@/components/arfro/ui";
import { Reveal } from "@/components/arfro/motion";
import { cn } from "@/lib/cn";

/**
 * Shared opening of the home sections 05–13: eyebrow and an editorial h2 on the left (7 of 12
 * columns), the intro text and an optional action on the right, bottom-aligned like a magazine
 * spread. Stacks on phones. The h2 carries `id` for the section's aria-labelledby.
 */
export function SectionHeader({
  id,
  eyebrow,
  title,
  text,
  action,
  onDark = false,
  size = "l",
  className,
}: {
  id: string;
  eyebrow?: string | null;
  title: string;
  text?: string | null;
  action?: ReactNode;
  onDark?: boolean;
  size?: DisplaySize;
  className?: string;
}) {
  const aside = text || action;
  return (
    <Reveal stagger className={cn("grid gap-x-12 gap-y-6 lg:grid-cols-12 lg:items-end", className)}>
      <div className="lg:col-span-7">
        {eyebrow && <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow>}
        <DisplayHeading id={id} size={size} className={cn(eyebrow && "mt-5", "max-w-[18ch]")}>
          {title}
        </DisplayHeading>
      </div>
      {aside && (
        <div className="flex flex-col items-start gap-6 lg:col-span-5 lg:items-end lg:text-right">
          {text && (
            <Lead onDark={onDark} className="lg:ml-auto">
              {text}
            </Lead>
          )}
          {action}
        </div>
      )}
    </Reveal>
  );
}
