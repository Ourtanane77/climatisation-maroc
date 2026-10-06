"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ProductArt } from "@/components/catalog/ProductArt";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorIcon } from "@/components/ui/icons";
import { toast } from "@/components/ui/Toast";
import { addToCart } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { dh, plural } from "@/lib/format";
import type { QuickItem } from "@/lib/pro/types";
import { waLink } from "@/lib/whatsapp";

/**
 * Commande rapide par référence (design: Commande rapide.dc.html): reference rows with autocomplete,
 * quantity steppers, a pasted list, frequent references, the summary and the mobile order bar.
 * Prices come from the API: public price, and the reseller's own price in the dashed badge.
 */

interface Row {
  id: number;
  ref: string;
  qty: number;
  /** undefined: not looked up yet; null: unknown reference. */
  item?: QuickItem | null;
}

const MAX_QTY = 9999;
let nextId = 1;
const newRow = (ref = "", qty = 1, item?: QuickItem | null): Row => ({ id: nextId++, ref, qty, item });
const norm = (ref: string) => ref.trim().toUpperCase();

async function resolve(body: { lines?: { ref: string; qty: number }[]; paste?: string }) {
  const res = await fetch("/api/pro/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  if (!res?.ok) return null;
  return ((await res.json()) as { lines: { ref: string; qty: number; item: QuickItem | null }[] }).lines;
}

export function QuickOrder({ frequent, whatsappNumber }: { frequent: QuickItem[]; whatsappNumber: string }) {
  const [rows, setRows] = useState<Row[]>(() => [newRow()]);
  const [active, setActive] = useState<number | null>(null);
  const [matches, setMatches] = useState<QuickItem[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const blurTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputs = useRef(new Map<number, HTMLInputElement>());
  const focusId = useRef<number | null>(null);
  const listId = useId();

  useEffect(() => {
    if (focusId.current != null) {
      inputs.current.get(focusId.current)?.focus();
      focusId.current = null;
    }
  });
  useEffect(
    () => () => {
      clearTimeout(blurTimer.current);
      clearTimeout(searchTimer.current);
    },
    [],
  );

  const update = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  function onRefChange(row: Row, value: string) {
    update(row.id, { ref: value.toUpperCase(), item: undefined });
    setActive(row.id);
    setHighlight(0);
    clearTimeout(searchTimer.current);
    const q = norm(value);
    if (!q) {
      setMatches([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      const res = await fetch(`/api/pro/references?q=${encodeURIComponent(q)}`).catch(() => null);
      const json = res?.ok ? ((await res.json()) as { data: QuickItem[] }) : { data: [] };
      setMatches(json.data);
    }, 150);
  }

  function pick(row: Row, item: QuickItem) {
    clearTimeout(blurTimer.current);
    update(row.id, { ref: item.sku, item });
    setActive(null);
    setMatches([]);
  }

  function onBlur(row: Row) {
    blurTimer.current = setTimeout(async () => {
      setActive((a) => (a === row.id ? null : a));
      const ref = norm(row.ref);
      if (!ref) return;
      const current = rows.find((r) => r.id === row.id);
      if (current?.item) return;
      const lines = await resolve({ lines: [{ ref, qty: 1 }] });
      setRows((rs) => rs.map((r) => (r.id === row.id && norm(r.ref) === ref && r.item === undefined ? { ...r, item: lines?.[0]?.item ?? null } : r)));
    }, 120);
  }

  function onKeyDown(row: Row, e: React.KeyboardEvent<HTMLInputElement>) {
    if (active !== row.id || !matches.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(row, matches[highlight] ?? matches[0]);
    } else if (e.key === "Escape") {
      setActive(null);
    }
  }

  function addRow() {
    const row = newRow();
    setRows((rs) => [...rs, row]);
    setActive(row.id);
    setMatches([]);
    focusId.current = row.id;
  }

  function removeRow(id: number) {
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : [newRow()]));
  }

  async function applyPaste() {
    if (!pasteText.trim()) return;
    const lines = await resolve({ paste: pasteText });
    if (!lines) return;
    setRows((rs) => {
      let next = rs.filter((r) => r.ref.trim() !== "");
      for (const line of lines) {
        const existing = next.find((r) => norm(r.ref) === line.ref);
        next = existing
          ? next.map((r) => (r === existing ? { ...r, qty: Math.min(MAX_QTY, r.qty + line.qty), item: r.item ?? line.item } : r))
          : [...next, newRow(line.ref, line.qty, line.item)];
      }
      return next.length ? next : [newRow()];
    });
    setPasteOpen(false);
    setPasteText("");
  }

  function addFrequent(item: QuickItem) {
    setRows((rs) => {
      const kept = rs.filter((r) => r.ref.trim() !== "");
      const existing = kept.find((r) => norm(r.ref) === item.sku.toUpperCase());
      return existing
        ? kept.map((r) => (r === existing ? { ...r, qty: Math.min(MAX_QTY, r.qty + 1), item } : r))
        : [...kept, newRow(item.sku, 1, item)];
    });
  }

  const valid = rows.filter((r): r is Row & { item: QuickItem } => !!r.item);
  const toFix = rows.filter((r) => r.item === null).length;
  const articles = valid.reduce((n, r) => n + r.qty, 0);
  const total = valid.reduce((n, r) => n + r.item.price * r.qty, 0);
  const proTotal = valid.reduce((n, r) => n + r.item.proPrice * r.qty, 0);
  const inList = new Set(rows.map((r) => norm(r.ref)));

  function toCart() {
    if (!valid.length) return;
    for (const r of valid) addToCart(r.item.sku, r.qty);
    toast(valid.length > 1 ? `${valid.length} lignes ajoutées au panier` : "1 ligne ajoutée au panier");
  }

  return (
    <>
      <section className="grid grid-cols-1 items-start gap-6 pt-7 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-24 flex flex-col gap-2.5 lg:gap-0 lg:bg-white lg:px-8 lg:pt-5 lg:pb-6">
            <div className="text-muted border-divider hidden grid-cols-[200px_minmax(0,1fr)_150px_140px_110px_44px] gap-4 border-b pb-3 text-[13px] font-bold tracking-[0.02em] lg:grid">
              <span>Référence</span>
              <span>Produit</span>
              <span>Prix unitaire</span>
              <span>Quantité</span>
              <span className="text-right">Total</span>
              <span />
            </div>
            {rows.map((row) => {
              const open = active === row.id && !!norm(row.ref) && row.item === undefined;
              const error = row.item === null;
              const item = row.item ?? null;
              return (
                <div
                  key={row.id}
                  className={cn(
                    "rounded-18 grid grid-cols-[minmax(0,1fr)_auto_44px] gap-2.5 bg-white p-4 shadow-[0_1px_0_#E6EBF0] [grid-template-areas:'ref_ref_rm''name_name_name''qty_tot_tot']",
                    "lg:border-divider lg:grid-cols-[200px_minmax(0,1fr)_150px_140px_110px_44px] lg:gap-4 lg:rounded-none lg:border-b lg:px-0 lg:py-4 lg:shadow-none lg:[grid-template-areas:'ref_name_unit_qty_tot_rm']",
                  )}
                >
                  <div className="relative flex flex-col gap-1.5 [grid-area:ref]">
                    <input
                      ref={(el) => {
                        if (el) inputs.current.set(row.id, el);
                        else inputs.current.delete(row.id);
                      }}
                      value={row.ref}
                      onChange={(e) => onRefChange(row, e.target.value)}
                      onFocus={() => setActive(row.id)}
                      onBlur={() => onBlur(row)}
                      onKeyDown={(e) => onKeyDown(row, e)}
                      aria-label="Référence"
                      aria-invalid={error || undefined}
                      role="combobox"
                      aria-expanded={open && matches.length > 0}
                      aria-controls={`${listId}-${row.id}`}
                      aria-autocomplete="list"
                      aria-activedescendant={open && matches.length ? `${listId}-${row.id}-${highlight}` : undefined}
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="Ex. CUIV0005"
                      className={cn(
                        "rounded-12 h-12 w-full border-[1.5px] bg-white px-4 text-base font-bold tracking-[0.02em] uppercase outline-none placeholder:font-medium placeholder:normal-case",
                        error ? "border-promo bg-error-bg" : open ? "border-brand" : "border-input focus:border-brand",
                      )}
                    />
                    {open && matches.length > 0 && (
                      <div
                        id={`${listId}-${row.id}`}
                        role="listbox"
                        className="rounded-16 shadow-dropdown absolute top-[54px] left-0 z-20 flex w-full flex-col bg-white p-1.5 lg:w-[420px]"
                      >
                        {matches.map((m, i) => (
                          <button
                            key={m.sku}
                            id={`${listId}-${row.id}-${i}`}
                            type="button"
                            role="option"
                            aria-selected={i === highlight}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              pick(row, m);
                            }}
                            className={cn("rounded-12 hover:bg-tint-blue flex min-h-[52px] items-center gap-3 px-2.5 py-1.5 text-left", i === highlight && "bg-tint-select")}
                          >
                            <Thumb item={m} w={44} h={36} radius={8} />
                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="text-sm font-extrabold tracking-[0.02em]">{m.sku}</span>
                              <span className="text-ink-2 truncate text-sm">{m.name}</span>
                            </span>
                            <span className="text-sm font-bold whitespace-nowrap">{dh(m.price)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {error && (
                      <span className="text-promo flex items-start gap-1.5 text-sm leading-[1.35] font-semibold">
                        <ErrorIcon size={18} className="shrink-0" />
                        Référence inconnue.
                      </span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-1 [grid-area:name] lg:pt-3">
                    {item ? (
                      <>
                        <Link href={item.href} className="text-ink hover:text-brand text-base leading-[1.35] font-semibold">
                          {item.name}
                        </Link>
                        <span className="text-ink-2 flex flex-wrap items-center gap-2 text-sm lg:hidden">
                          {dh(item.price)} / unité <ProBadge price={item.proPrice} />
                        </span>
                      </>
                    ) : error ? (
                      <>
                        <span className="text-promo text-base leading-[1.35] font-semibold">Aucun produit pour cette référence</span>
                        <a href={waLink(`Bonjour, je cherche la référence ${norm(row.ref)}`, whatsappNumber)} target="_blank" rel="noopener" className="text-sm font-bold underline">
                          Demander sur WhatsApp
                        </a>
                      </>
                    ) : (
                      <span className={cn("text-base leading-[1.35] font-semibold", norm(row.ref) ? "text-muted-2" : "text-ink")}>
                        {norm(row.ref) ? "Choisissez une référence dans la liste" : "—"}
                      </span>
                    )}
                  </div>
                  <div className="hidden flex-col items-start gap-1.5 pt-3.5 [grid-area:unit] lg:flex">
                    <span className="text-base font-bold whitespace-nowrap">{item ? dh(item.price) : "—"}</span>
                    {item && <ProBadge price={item.proPrice} />}
                  </div>
                  <div className={cn("border-control flex h-12 items-center self-start rounded-full border-[1.5px] [grid-area:qty] lg:w-fit", !item && "opacity-45")}>
                    <button
                      type="button"
                      aria-label="Diminuer"
                      onClick={() => update(row.id, { qty: Math.max(1, row.qty - 1) })}
                      className="size-11 text-xl"
                    >
                      −
                    </button>
                    <input
                      value={row.qty}
                      onChange={(e) => update(row.id, { qty: Math.min(MAX_QTY, Math.max(1, parseInt(e.target.value.replace(/\D/g, ""), 10) || 1)) })}
                      inputMode="numeric"
                      aria-label="Quantité"
                      className="w-9 border-0 bg-transparent text-center text-base font-bold outline-none"
                    />
                    <button type="button" aria-label="Augmenter" onClick={() => update(row.id, { qty: Math.min(MAX_QTY, row.qty + 1) })} className="size-11 text-xl">
                      +
                    </button>
                  </div>
                  <span className="justify-self-end pt-3 text-lg font-extrabold whitespace-nowrap [grid-area:tot]">{item ? dh(item.price * row.qty) : "—"}</span>
                  <button
                    type="button"
                    aria-label="Supprimer la ligne"
                    onClick={() => removeRow(row.id)}
                    className="bg-bg hover:bg-tint-orange mt-0.5 flex size-11 items-center justify-center justify-self-end rounded-full [grid-area:rm]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3C4043" strokeWidth="2" strokeLinecap="round" aria-hidden>
                      <path d="M6 6l12 12 M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              );
            })}
            <div className="flex flex-wrap gap-2.5 pt-1 lg:pt-5">
              <button
                type="button"
                onClick={addRow}
                className="border-ink hover:bg-ink flex h-12 items-center gap-2 rounded-full border-[1.5px] bg-white px-5 text-[15px] font-bold hover:text-white"
              >
                <span className="text-xl leading-none">+</span>Ajouter une ligne
              </button>
              <button
                type="button"
                onClick={() => setPasteOpen(!pasteOpen)}
                aria-expanded={pasteOpen}
                className="border-control hover:border-ink h-12 rounded-full border-[1.5px] bg-white px-5 text-[15px] font-bold"
              >
                Coller une liste de références
              </button>
            </div>
            {pasteOpen && (
              <div className="rounded-18 bg-bg mt-2.5 flex flex-col gap-3 p-4">
                <label className="flex flex-col gap-2 text-[15px] font-bold">
                  Une référence et une quantité par ligne
                  <textarea
                    rows={5}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder={"CUIV0006 3\nCLIM00080 5"}
                    className="rounded-12 border-input focus:border-brand w-full border-[1.5px] bg-white px-4 py-3 text-base leading-[1.6] font-normal tabular-nums outline-none"
                  />
                </label>
                <Button variant="blue" onClick={applyPaste}>
                  Ajouter à la liste
                </Button>
              </div>
            )}
          </div>

          {frequent.length > 0 && (
            <section className="rounded-24 box-border bg-white p-5 md:p-8">
              <h2 className="m-0 mb-2 text-2xl font-bold tracking-[-0.01em]">Vos références fréquentes</h2>
              {frequent.map((f, i) => {
                const listed = inList.has(f.sku.toUpperCase());
                return (
                  <div key={f.sku} className={cn("flex items-center gap-3.5 py-2", i < frequent.length - 1 && "border-divider border-b")}>
                    <Thumb item={f} w={52} h={42} radius={10} />
                    <span className="flex min-w-0 flex-1 flex-col gap-x-3.5 gap-y-0.5 md:flex-row md:items-center">
                      <span className="min-w-[104px] text-sm font-extrabold tracking-[0.02em]">{f.sku}</span>
                      <span className="text-ink truncate text-[15px]">{f.name}</span>
                    </span>
                    <span className="text-[15px] font-bold whitespace-nowrap">{dh(f.price)}</span>
                    <button
                      type="button"
                      onClick={() => addFrequent(f)}
                      aria-label={listed ? `Ajouter 1 ${f.sku}` : `Ajouter ${f.sku} à la liste`}
                      className={cn(
                        "hover:border-ink h-10 rounded-full border-[1.5px] px-3.5 text-sm font-bold",
                        listed ? "border-brand bg-tint-blue text-brand" : "border-control bg-white",
                      )}
                    >
                      {listed ? "+1" : "Ajouter"}
                    </button>
                  </div>
                );
              })}
            </section>
          )}
        </div>

        <aside className="rounded-24 box-border hidden flex-col gap-4 bg-white p-5 md:flex md:p-8 xl:sticky xl:top-[88px]">
          <h2 className="m-0 text-2xl font-bold tracking-[-0.01em]">Récapitulatif</h2>
          <div className="flex justify-between text-base">
            <span className="text-ink-2">Lignes valides</span>
            <strong>{valid.length}</strong>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-ink-2">Articles</span>
            <strong>{articles}</strong>
          </div>
          {toFix > 0 && (
            <div className="text-promo flex items-start gap-2 text-sm leading-[1.4] font-semibold">
              <ErrorIcon size={18} className="shrink-0" />
              {toFix > 1 ? `${toFix} lignes à corriger ne seront pas ajoutées.` : "1 ligne à corriger ne sera pas ajoutée."}
            </div>
          )}
          <div className="bg-divider h-px" />
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-ink-2 text-base">Total prix public</span>
            <span className="text-[30px] font-extrabold tracking-[-0.02em]">{dh(total)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-base font-bold">Votre prix</span>
            <ProBadge price={proTotal} />
          </div>
          <Button variant="orange" full onClick={toCart} disabled={!valid.length}>
            Ajouter au panier
          </Button>
          <ButtonLink href="/demander-un-devis?pro=1" variant="outline" full>
            Demander un devis pour cette liste
          </ButtonLink>
        </aside>
      </section>

      <div className="shadow-bottom-bar fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 bg-white px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] md:hidden">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-ink-2 text-[13px]">
            {plural(valid.length, "ligne")} · {plural(articles, "article")}
          </span>
          <span className="text-[22px] font-extrabold whitespace-nowrap">{dh(total)}</span>
        </span>
        <Button variant="orange" onClick={toCart} disabled={!valid.length}>
          Ajouter au panier
        </Button>
      </div>
      <div aria-hidden className="h-14 md:hidden" />
    </>
  );
}

/** Reseller price in the dashed badge (the design's "[TARIF REVENDEUR]" placeholder). */
function ProBadge({ price }: { price: number }) {
  return (
    <span className="border-line-strong text-muted inline-flex items-center rounded-6 border-[1.5px] border-dashed px-2 py-0.5 text-xs font-bold whitespace-nowrap" title="Votre prix revendeur">
      {dh(price)}
    </span>
  );
}

function Thumb({ item, w, h, radius }: { item: QuickItem; w: number; h: number; radius: number }) {
  return (
    <span aria-hidden className="bg-tint-thumb flex shrink-0 items-center justify-center overflow-hidden p-1" style={{ width: w, height: h, borderRadius: radius }}>
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt="" className="size-full object-contain mix-blend-multiply" loading="lazy" />
      ) : item.art ? (
        <ProductArt art={item.art} className="h-full w-auto" />
      ) : null}
    </span>
  );
}
