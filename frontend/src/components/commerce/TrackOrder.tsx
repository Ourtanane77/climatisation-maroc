"use client";

import { useRef, useState, type FormEvent } from "react";
import { Field, TextInput } from "@/components/forms/fields";
import { ButtonLink } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import type { OrderView, ValidationErrorBody } from "@/lib/commerce/types";
import { isValidMoroccanPhone, PHONE_ERROR_SHORT } from "@/lib/phone";
import { waLink } from "@/lib/whatsapp";
import { AddressBlock, CardTitle, CompactLines, Divider, TotalRow } from "./parts";
import { StatusTimeline } from "./StatusTimeline";

/** Lookup form and result (design/Suivi commande.dc.html). */
export function TrackOrder({ initialRef }: { initialRef: string }) {
  const [ref, setRef] = useState(initialRef);
  const [tel, setTel] = useState("");
  const [errors, setErrors] = useState<{ reference?: string; phone?: string }>({});
  const [order, setOrder] = useState<OrderView | null>(null);
  const [sending, setSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const local: typeof errors = {};
    if (!ref.trim()) local.reference = "Saisissez la référence de votre commande.";
    if (!isValidMoroccanPhone(tel)) local.phone = PHONE_ERROR_SHORT;
    setErrors(local);
    if (local.reference || local.phone) return;

    setSending(true);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: ref.trim(), phone: tel }),
      });
      const body = (await res.json().catch(() => ({}))) as OrderView & ValidationErrorBody;
      if (res.ok) {
        setOrder(body);
      } else if (res.status === 422) {
        setOrder(null);
        setErrors({ reference: body.errors?.reference?.[0], phone: body.errors?.phone?.[0] });
      } else if (res.status === 429) {
        toast("Trop de tentatives : réessayez dans une minute");
      } else {
        toast("La recherche n'a pas abouti : réessayez");
      }
    } catch {
      toast("La recherche n'a pas abouti : réessayez");
    }
    setSending(false);
  }

  function again() {
    setOrder(null);
    setRef("");
    setTel("");
    setErrors({});
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const waAbout = order ? waLink(`Bonjour, je vous écris au sujet de ma commande ${order.reference}`) : "";

  return (
    <>
      <section className="pt-8">
        <form ref={formRef} onSubmit={submit} noValidate className="rounded-24 box-border flex max-w-[640px] scroll-mt-24 flex-col gap-5 bg-white p-5 md:p-8">
          <p className="text-ink-2 m-0 text-[17px] leading-[1.55]">Saisissez la référence reçue à la commande et le numéro de téléphone utilisé.</p>
          <Field label="Référence de commande" htmlFor="tr-ref" error={errors.reference}>
            <TextInput
              id="tr-ref"
              value={ref}
              placeholder="CM-2026-01042"
              autoCapitalize="characters"
              invalid={!!errors.reference}
              onChange={(e) => setRef(e.target.value)}
            />
          </Field>
          <Field label="Téléphone" htmlFor="tr-tel" error={errors.phone}>
            <TextInput
              id="tr-tel"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="06 12 34 56 78"
              value={tel}
              invalid={!!errors.phone}
              onChange={(e) => setTel(e.target.value)}
            />
          </Field>
          <button
            type="submit"
            disabled={sending}
            className="bg-brand hover:bg-brand-hover flex h-14 items-center justify-center self-start rounded-full px-7 text-[16px] font-bold text-white transition-colors disabled:opacity-60"
          >
            Suivre ma commande
          </button>
          <a
            href={waLink("Bonjour, je ne retrouve pas la référence de ma commande.")}
            target="_blank"
            rel="noopener"
            className="flex min-h-11 items-center self-start text-[15px] font-bold underline"
          >
            Référence perdue ? Écrivez-nous sur WhatsApp
          </a>
        </form>
      </section>

      {order && (
        <section className="flex flex-col gap-4 pt-8" aria-live="polite">
          <div className="rounded-24 box-border flex flex-col gap-7 bg-white p-5 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
              <div className="flex flex-col gap-1">
                <h2 className="m-0 text-[28px] font-bold tracking-[-0.02em]">Commande {order.reference}</h2>
                {order.placedOn && <span className="text-muted text-[15px]">Passée le {order.placedOn}</span>}
              </div>
              <span
                className={cn(
                  "rounded-full px-4 py-2 text-[15px] font-bold",
                  order.status === "annulee"
                    ? "bg-tint-orange text-promo"
                    : order.status === "livree"
                      ? "bg-success-bg text-success"
                      : "bg-tint-blue text-brand",
                )}
              >
                {order.statusLabel}
              </span>
            </div>
            <StatusTimeline steps={order.timeline} />
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-2">
            <div className="rounded-24 box-border flex flex-col gap-4 bg-white p-5 md:p-8">
              <CardTitle>Articles</CardTitle>
              <CompactLines lines={order.lines} />
              <Divider />
              <TotalRow total={order.total} />
            </div>
            <div className="rounded-24 box-border flex flex-col gap-4 bg-white p-5 md:p-8">
              <CardTitle>Adresse de livraison</CardTitle>
              <AddressBlock name={order.customer.name} phone={order.customer.phone} address={order.address} city={order.city} />
              <Divider />
              <ButtonLink href={waAbout} variant="whatsapp">
                Nous écrire sur WhatsApp
              </ButtonLink>
              <button type="button" onClick={again} className="text-brand min-h-11 self-center text-[15px] font-bold underline">
                Suivre une autre commande
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
