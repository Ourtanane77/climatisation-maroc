"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { CartIcon, MAT, MatIcon, TrashIcon } from "@/components/ui/icons";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { toast } from "@/components/ui/Toast";
import type { CartLine } from "@/lib/cart/cookie";
import { addToCart, removeFromCart, setQty, useCartLines } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import type { Quote, QuoteLine } from "@/lib/commerce/types";
import { dh, plural } from "@/lib/format";
import { Divider, PageTitle, SummaryRow, Thumb, TotalRow } from "./parts";

/**
 * Basket (design/Panier.dc.html): lines with steppers, reassurance, sticky summary, "Pour
 * l'installation" suggestions, and the empty state. Quantities live in the `cm_cart` cookie;
 * prices always come from the server quote, refreshed after every change.
 */
export function CartView({ initialQuote }: { initialQuote: Quote | null }) {
  const cookieLines = useCartLines();
  const [quote, setQuote] = useState<Quote | null>(initialQuote);
  // Suggestions stay put once shown, so an added one turns into "Ajouté ✓" instead of vanishing.
  const [suggestions, setSuggestions] = useState(initialQuote?.suggestions ?? []);
  const cart: CartLine[] = useMemo(() => cookieLines ?? initialQuote?.lines.map((l) => ({ sku: l.sku, qty: l.qty })) ?? [], [cookieLines, initialQuote]);
  const cartKey = JSON.stringify(cart);
  const firstKey = useRef(cartKey);

  // Re-quote whenever the basket changes (after a short pause while the stepper is clicked).
  useEffect(() => {
    if (cartKey === firstKey.current && quote) return;
    firstKey.current = "";
    if (cart.length === 0) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/cart/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: cart }),
          signal: controller.signal,
        });
        if (res.ok) {
          const next = (await res.json()) as Quote;
          setQuote(next);
          setSuggestions((current) => (current.length > 0 ? current : (next.suggestions ?? [])));
        }
      } catch {
        /* aborted or offline: keep the last quote */
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey]);

  // References no longer sold are dropped from the basket.
  useEffect(() => {
    quote?.invalid.forEach((i) => removeFromCart(i.sku));
  }, [quote]);

  const priced = new Map((quote?.lines ?? []).map((l) => [l.sku, l]));
  const lines = cart.flatMap((c) => {
    const q = priced.get(c.sku);
    return q ? [{ ...q, qty: c.qty, lineTotal: q.unitPrice * c.qty }] : [];
  });
  const orderable = lines.filter((l) => l.available);
  const subtotal = orderable.reduce((n, l) => n + l.lineTotal, 0);
  const count = orderable.reduce((n, l) => n + l.qty, 0);

  if (cart.length === 0) return <EmptyCart />;

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-4 pt-6">
        <PageTitle>Votre panier</PageTitle>
        <span className="text-muted text-[17px]">{plural(count, "article")}</span>
      </div>

      <section className="grid items-start gap-6 pt-8 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex flex-col gap-4">
          <div className="rounded-24 bg-white px-5 py-1 md:px-8">
            {lines.map((l, i) => (
              <CartLineRow key={l.sku} line={l} last={i === lines.length - 1} />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-3 px-2 py-1">
            {(
              [
                ["Paiement à la livraison", MAT.cash],
                ["Livraison gratuite partout au Maroc", MAT.truck],
              ] as const
            ).map(([label, d]) => (
              <span key={label} className="flex items-center gap-2.5 text-[15px] font-semibold">
                <MatIcon d={d} size={22} className="text-brand" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <aside className="rounded-24 box-border flex flex-col gap-4 bg-white p-5 md:p-8 xl:sticky xl:top-[88px]">
          <h2 className="m-0 text-[24px] font-bold tracking-[-0.01em]">Récapitulatif</h2>
          <SummaryRow label="Sous-total">{dh(subtotal)}</SummaryRow>
          <SummaryRow label="Livraison" tone="success">
            Gratuite
          </SummaryRow>
          <Divider />
          <TotalRow total={subtotal} />
          {orderable.length > 0 ? (
            <ButtonLink href="/commande" variant="orange" full>
              Passer la commande
            </ButtonLink>
          ) : (
            <span aria-disabled className="bg-accent flex h-14 items-center justify-center rounded-full text-[16px] font-bold text-white opacity-50">
              Passer la commande
            </span>
          )}
          <Link href="/climatisation" className="flex min-h-11 items-center self-center text-[15px] font-bold underline">
            Continuer mes achats
          </Link>
        </aside>
      </section>

      {suggestions.length > 0 && (
        <section className="pt-10 md:pt-14">
          <h2 className="m-0 mb-6 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] md:text-[44px]">Pour l&apos;installation</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {suggestions.map((s) => {
              const inCart = cart.some((c) => c.sku === s.sku);
              return (
                <div key={s.sku} className="rounded-20 flex items-center gap-4 bg-white p-4">
                  <Link href={s.href} tabIndex={-1} aria-hidden className="contents">
                    <Thumb image={s.image} art={s.art} dark={s.dark} alt={s.name} className="rounded-14 h-[68px] w-20 p-2" />
                  </Link>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <Link href={s.href} className="text-ink hover:text-brand text-[16px] leading-[1.3] font-bold">
                      {s.name}
                    </Link>
                    <span className="text-[18px] font-extrabold">{dh(s.price)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(s.sku, 1);
                      toast(`${s.name} ajouté au panier`);
                    }}
                    className={cn(
                      "h-11 shrink-0 rounded-full border-[1.5px] px-4 text-[15px] font-bold whitespace-nowrap transition-colors",
                      inCart ? "border-success bg-success text-white" : "border-line-strong text-ink hover:border-ink bg-white",
                    )}
                  >
                    {inCart ? "Ajouté ✓" : "Ajouter"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

function CartLineRow({ line, last }: { line: QuoteLine; last: boolean }) {
  return (
    <div
      className={cn(
        "grid items-center gap-x-5 gap-y-3.5 py-5",
        "grid-cols-[72px_minmax(0,1fr)_auto] [grid-template-areas:'img_info_rm'_'qty_qty_tot']",
        "md:grid-cols-[96px_minmax(0,1fr)_auto_130px_44px] md:[grid-template-areas:'img_info_qty_tot_rm']",
        !last && "border-divider border-b",
      )}
    >
      <Link href={line.href} tabIndex={-1} aria-hidden className="rounded-16 [grid-area:img]">
        <Thumb image={line.image} art={line.art} dark={line.dark} alt={line.name} className="rounded-16 h-[60px] w-[72px] p-2.5 md:h-[76px] md:w-24" />
      </Link>
      <div className="flex min-w-0 flex-col gap-1 [grid-area:info]">
        <Link href={line.href} className="text-ink hover:text-brand text-[18px] leading-[1.3] font-bold">
          {line.name}
        </Link>
        <span className="text-muted text-[14px]">Réf. {line.sku}</span>
        {line.option && <span className="text-ink-2 text-[14px]">{line.option}</span>}
        {!line.available && <span className="text-promo text-[14px] font-semibold">Rupture de stock</span>}
      </div>
      <QtyStepper
        value={line.qty}
        onChange={(n) => setQty(line.sku, n)}
        size={48}
        label={`Quantité · ${line.name}`}
        className="justify-self-start [grid-area:qty]"
      />
      <div className="flex flex-col gap-0.5 justify-self-end text-right [grid-area:tot]">
        <span className={cn("text-[20px] font-extrabold whitespace-nowrap", !line.available && "text-muted line-through")}>{dh(line.lineTotal)}</span>
        {line.qty > 1 && (
          <span className="text-muted text-[13px] whitespace-nowrap">
            {line.qty} × {dh(line.unitPrice)}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => removeFromCart(line.sku)}
        aria-label="Retirer l'article"
        className="bg-bg hover:bg-tint-orange text-ink-2 flex size-11 items-center justify-center justify-self-end rounded-full transition-colors [grid-area:rm]"
      >
        <TrashIcon size={20} strokeWidth={1.9} />
      </button>
    </div>
  );
}

function EmptyCart() {
  return (
    <section className="pt-8">
      <div className="rounded-24 flex flex-col items-center gap-4 bg-white px-5 py-10 text-center md:px-8 md:py-[72px]">
        <span className="bg-tint-orange text-accent flex size-[88px] items-center justify-center rounded-full">
          <CartIcon size={40} strokeWidth={1.9} />
        </span>
        <PageTitle>Votre panier est vide</PageTitle>
        <p className="text-ink-2 m-0 max-w-[520px] text-[17px] leading-[1.55] text-pretty">
          Ajoutez un climatiseur ou un accessoire. La livraison est gratuite partout au Maroc et vous payez à la livraison.
        </p>
        <div className="flex w-full flex-col gap-3 pt-2 md:w-auto md:flex-row">
          <ButtonLink href="/climatisation/mural" variant="blue">
            Voir les climatiseurs
          </ButtonLink>
          <ButtonLink href="/promotions" variant="outline">
            Voir les promotions
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
