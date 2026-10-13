import type { FaqItem } from "@/lib/types";

/**
 * Arfro FAQ (Produit.dc.html): native details/summary rows separated by hairlines, the first one
 * open. Works without JavaScript and is keyboard accessible by default.
 */
export function FaqDetails({ items }: { items: FaqItem[] }) {
  if (!items.length) return null;
  return (
    <div className="border-border border-t">
      {items.map((item, i) => (
        <details key={item.question} open={i === 0} className="group border-border border-b">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-extrabold md:text-[17px] [&::-webkit-details-marker]:hidden">
            {item.question}
            <span aria-hidden className="text-brand text-2xl leading-none font-normal transition-transform duration-200 group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="text-ink-2 m-0 max-w-[760px] pb-5 text-base leading-[1.65]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
