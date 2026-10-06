import { cn } from "@/lib/cn";

/** Outlined badge on product cards: discount (promo orange), brand / "Nouveau" (brand blue). */
export function Badge({ tone, children, className }: { tone: "promo" | "brand"; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-8 self-start border-[1.5px] px-2.5 py-1 text-sm leading-[1.2] font-bold",
        tone === "promo" ? "border-promo text-promo" : "border-brand text-brand",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Soft tag (category tags, "Distributeur officiel", eyebrows). */
export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("rounded-8 bg-tint-blue text-brand self-start px-2.5 py-1 text-sm font-bold", className)}>{children}</span>;
}
