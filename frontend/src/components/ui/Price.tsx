import { cn } from "@/lib/cn";
import { dh, savingText } from "@/lib/format";

/**
 * Price block of the product card: optional "À partir de", price 28/800, struck regular price,
 * and the orange saving line. Fixed min-heights keep cards in a row aligned, as in the design.
 */
export function PriceBlock({
  price,
  regularPrice,
  from = false,
  size = "card",
  className,
}: {
  price: number;
  regularPrice?: number | null;
  from?: boolean;
  size?: "card" | "pdp" | "mini";
  className?: string;
}) {
  const discounted = !from && regularPrice != null && regularPrice > price;
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {size === "card" && <span className="text-muted min-h-4 text-sm md:text-[13px]">{from ? "À partir de" : ""}</span>}
      <div className="flex flex-wrap items-baseline gap-2.5">
        {from && size !== "card" && <span className="text-muted text-sm">À partir de</span>}
        <span
          className={cn(
            "leading-[1.1] font-extrabold tracking-[-0.02em]",
            size === "pdp" ? "text-[40px] tracking-[-0.03em]" : size === "mini" ? "text-2xl" : "text-[28px]",
          )}
        >
          {dh(price)}
        </span>
        {discounted && <span className={cn("text-muted-2 line-through", size === "pdp" ? "text-lg" : "text-[15px]")}>{dh(regularPrice!)}</span>}
      </div>
      {size !== "mini" && (
        <span className={cn("text-promo min-h-[18px] font-bold", size === "pdp" ? "text-[15px]" : "text-sm")}>
          {discounted ? savingText(regularPrice!, price) : ""}
        </span>
      )}
    </div>
  );
}
