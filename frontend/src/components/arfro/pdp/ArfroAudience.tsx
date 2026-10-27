"use client";

import Link from "next/link";
import { ARFRO_PDP_H2, PDP_SPLIT, PdpEyebrow } from "./styles";
import { useProduct } from "@/components/product/ProductContext";
import { cn } from "@/lib/cn";
import { audienceRows } from "./data";

/**
 * « Pour qui ? »: recommended surface per power, from the variants' « Surface conseillée » rows (or
 * the power calculator's tiers for air conditioners). Picking a row selects that power. Left out
 * when the product has no such data.
 */
export function ArfroAudience({ id }: { id: string }) {
  const { product, variant, selectVariant } = useProduct();
  const rows = audienceRows(product);
  if (!rows.length) return null;
  const multi = rows.length > 1;

  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn(PDP_SPLIT, "scroll-mt-28 pt-14 md:pt-20")}>
      <div className="flex flex-col gap-5">
        <div>
          <PdpEyebrow>Bien choisir</PdpEyebrow>
          <h2 id={`${id}-title`} className={ARFRO_PDP_H2}>
            Pour qui ?
          </h2>
        </div>
        <p className="text-arfro-graphite/80 m-0 max-w-[52ch] text-[16px] leading-[1.65]">
          Surfaces indicatives pour une pièce standard. Plafond haut, pièce très ensoleillée ou dernier étage : vérifiez la puissance avec notre calculateur.
        </p>
        <Link
          href="/calculateur-puissance"
          className="text-arfro-blue hover:text-arfro-blue-hover inline-flex min-h-6 items-center self-start text-[15px] font-bold underline underline-offset-4"
        >
          Calculer la puissance nécessaire
        </Link>
      </div>
      <ul className="border-arfro-line m-0 flex list-none flex-col border-t p-0">
        {rows.map((r) => {
          const on = r.sku === variant.sku;
          const content = (
            <>
              <span className="flex items-center gap-3 text-[16px] font-bold">
                {multi && <span aria-hidden className={cn("size-2 rounded-full", on ? "bg-arfro-blue" : "bg-arfro-line")} />}
                {r.label}
              </span>
              <span className={cn("text-[16px]", on ? "text-arfro-graphite font-bold" : "text-arfro-muted")}>{r.surface}</span>
            </>
          );
          return (
            <li key={r.sku} className="border-arfro-line border-b">
              {multi ? (
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => selectVariant(r.sku)}
                  className={cn(
                    "flex min-h-14 w-full items-center justify-between gap-4 px-3 py-4 text-left transition-colors duration-300",
                    on ? "bg-arfro-ice" : "hover:bg-arfro-ice/60",
                  )}
                >
                  {content}
                </button>
              ) : (
                <div className="flex min-h-14 items-center justify-between gap-4 px-3 py-4">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
