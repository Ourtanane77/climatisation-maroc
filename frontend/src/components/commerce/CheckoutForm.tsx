"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Field, FieldError, Honeypot, Select, Textarea, TextInput } from "@/components/forms/fields";
import { MAT, MatIcon } from "@/components/ui/icons";
import { toast } from "@/components/ui/Toast";
import { clearCart, setTechnicalVisit } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { formMilliseconds, mapApiErrors, refusalToast, validateCheckout, type CheckoutErrors, type CheckoutValues } from "@/lib/commerce/checkout";
import type { City, PaymentMethodKey, Quote, ValidationErrorBody } from "@/lib/commerce/types";
import { dh } from "@/lib/format";
import { CardTitle, CompactLines, Divider, SummaryRow, TotalRow } from "./parts";

/**
 * Checkout form and order summary (design/Commande.dc.html). Payment on delivery; when the back
 * office turned card payment on, the customer chooses between on delivery and card (CMI), and a
 * card order goes on to /commande/paiement. The page checks the phone and the CGV box as drawn
 * (and the e-mail CMI needs for a card); the API re-validates and re-prices everything.
 */
export function CheckoutForm({
  quote,
  cities,
  initialVisit = false,
  cgvHref = null,
  onlinePayment = false,
}: {
  quote: Quote;
  cities: City[];
  initialVisit?: boolean;
  /** Linked only once the CGV page is published. */
  cgvHref?: string | null;
  /** Card payment (CMI) offered on this storefront. */
  onlinePayment?: boolean;
}) {
  const router = useRouter();
  // When the form appeared, for the API's minimum form time (`_t`).
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);
  const defaultCity = cities.find((c) => c.slug === "marrakech") ?? cities[0];
  const [v, setV] = useState<CheckoutValues>({
    name: "",
    phone: "",
    email: "",
    city: defaultCity?.slug ?? "",
    address: "",
    note: "",
    technicalVisit: initialVisit,
    installationQuote: false,
    cgv: false,
    paymentMethod: "livraison",
  });
  const [tried, setTried] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState<CheckoutErrors>({});
  const [sending, setSending] = useState(false);

  const lines = quote.lines.filter((l) => l.available);
  const visitPrice = quote.technicalVisit.price;
  const total = quote.subtotal + (v.technicalVisit ? visitPrice : 0);
  const card = onlinePayment && v.paymentMethod === "carte";

  const local = validateCheckout({ ...v, paymentMethod: card ? "carte" : "livraison" });
  const errors: CheckoutErrors = {
    ...serverErrors,
    ...(tried || phoneTouched ? { phone: local.phone } : {}),
    ...(tried ? { cgv: local.cgv } : {}),
    ...(tried && local.email ? { email: local.email } : {}),
  };

  function set<K extends keyof CheckoutValues>(key: K, value: CheckoutValues[K]) {
    setV((current) => ({ ...current, [key]: value }));
    setServerErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const refused = local;
    if (refused.phone || refused.cgv || refused.email) {
      setTried(true);
      toast(refusalToast(refused) ?? "");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v.name,
          phone: v.phone,
          email: v.email,
          city: v.city,
          address: v.address,
          note: v.note,
          technical_visit: v.technicalVisit,
          installation_quote: v.installationQuote,
          cgv: v.cgv,
          payment_method: card ? "carte" : "livraison",
          lines: lines.map((l) => ({ sku: l.sku, qty: l.qty })),
          website: (new FormData(e.currentTarget).get("website") as string | null) ?? "",
          _t: formMilliseconds(shownAt.current),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as ValidationErrorBody & {
        reference?: string;
        accessToken?: string;
        paymentMethod?: PaymentMethodKey;
      };
      if (res.status === 201 && body.reference && body.accessToken) {
        clearCart();
        const query = `ref=${encodeURIComponent(body.reference)}&t=${encodeURIComponent(body.accessToken)}`;
        router.push(body.paymentMethod === "carte" ? `/commande/paiement?${query}` : `/commande/confirmation?${query}`);
        return;
      }
      if (res.status === 422) {
        const mapped = mapApiErrors(body.errors);
        setServerErrors(mapped);
        setTried(true);
        toast(mapped.lines ?? mapped.form ?? refusalToast(mapped) ?? "Vérifiez les champs indiqués");
      } else if (res.status === 429) {
        toast("Trop de tentatives : réessayez dans une minute");
      } else {
        toast("La commande n'a pas pu être envoyée : réessayez");
      }
    } catch {
      toast("La commande n'a pas pu être envoyée : réessayez");
    }
    setSending(false);
  }

  return (
    <form onSubmit={submit} noValidate className="relative grid items-start gap-6 pt-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Honeypot />
      <div className="flex flex-col gap-4">
        <div className="rounded-24 box-border flex flex-col gap-5 bg-white p-5 md:p-8">
          <CardTitle>Vos coordonnées</CardTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nom complet" htmlFor="co-name" error={errors.name}>
              <TextInput id="co-name" autoComplete="name" value={v.name} invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Téléphone" htmlFor="co-tel" error={errors.phone}>
              <TextInput
                id="co-tel"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={v.phone}
                invalid={!!errors.phone}
                onChange={(e) => set("phone", e.target.value)}
                onBlur={() => setPhoneTouched(v.phone.trim() !== "")}
              />
            </Field>
            <Field label="E-mail" optional={!card} htmlFor="co-mail" error={errors.email} className="md:col-span-2">
              <TextInput
                id="co-mail"
                type="email"
                autoComplete="email"
                placeholder={card ? "Obligatoire pour le paiement par carte" : "Pour recevoir le récapitulatif"}
                value={v.email}
                invalid={!!errors.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-24 box-border flex flex-col gap-5 bg-white p-5 md:p-8">
          <CardTitle>Adresse de livraison</CardTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Ville" htmlFor="co-city" error={errors.city}>
              <Select id="co-city" value={v.city} invalid={!!errors.city} onChange={(e) => set("city", e.target.value)} className="cursor-pointer">
                {cities.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Adresse" htmlFor="co-adr" error={errors.address}>
              <TextInput
                id="co-adr"
                autoComplete="street-address"
                placeholder="Rue, quartier, immeuble"
                value={v.address}
                invalid={!!errors.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </Field>
            <Field label="Note pour le livreur" optional htmlFor="co-note" error={errors.note} className="md:col-span-2">
              <Textarea
                id="co-note"
                rows={3}
                placeholder="Étage, point de repère, horaires"
                value={v.note}
                onChange={(e) => set("note", e.target.value)}
                className="leading-normal"
              />
            </Field>
          </div>
        </div>

        {onlinePayment ? (
          <PaymentChoice value={v.paymentMethod ?? "livraison"} onChange={(m) => set("paymentMethod", m)} error={errors.paymentMethod} />
        ) : (
          <div className="rounded-24 bg-tint-blue flex items-center gap-4 px-6 py-5">
            <span className="text-brand flex size-12 shrink-0 items-center justify-center rounded-full bg-white">
              <MatIcon d={MAT.cash} size={24} />
            </span>
            <p className="m-0 text-[17px] leading-normal">
              <strong>Paiement à la livraison :</strong> vous réglez à la réception de votre commande.
            </p>
          </div>
        )}

        <div className="rounded-24 box-border flex flex-col gap-1 bg-white p-5 md:p-8">
          <OptionToggle
            checked={v.technicalVisit}
            onChange={(on) => {
              set("technicalVisit", on);
              setTechnicalVisit(on);
            }}
          >
            Ajouter la visite technique ({dh(visitPrice)})
          </OptionToggle>
          <OptionToggle checked={v.installationQuote} onChange={(on) => set("installationQuote", on)}>
            Je souhaite un devis de pose
          </OptionToggle>
          <Divider />
          <div className="flex min-h-[52px] items-center gap-3.5 pt-1 text-[16px] font-semibold">
            <button
              type="button"
              role="checkbox"
              aria-checked={v.cgv}
              aria-label="Accepter les conditions générales de vente"
              aria-invalid={!!errors.cgv || undefined}
              aria-describedby={errors.cgv ? "co-cgv-error" : undefined}
              onClick={() => set("cgv", !v.cgv)}
              className="-m-2.5 flex size-11 shrink-0 items-center justify-center"
            >
              <Box on={v.cgv} invalid={!!errors.cgv} />
            </button>
            <span>
              J&apos;accepte les{" "}
              {cgvHref ? (
                <Link href={cgvHref} className="underline">
                  conditions générales de vente
                </Link>
              ) : (
                "conditions générales de vente"
              )}
            </span>
          </div>
          {errors.cgv && (
            <span id="co-cgv-error" role="alert" className="text-promo pl-[38px] text-[14px] font-semibold">
              {errors.cgv}
            </span>
          )}
        </div>
      </div>

      <aside className="rounded-24 box-border flex flex-col gap-4 bg-white p-5 md:p-8 xl:sticky xl:top-6">
        <CardTitle>Votre commande</CardTitle>
        <CompactLines lines={lines} />
        {errors.lines && <FieldError>{errors.lines}</FieldError>}
        <Divider />
        <SummaryRow label="Sous-total">{dh(quote.subtotal)}</SummaryRow>
        {v.technicalVisit && <SummaryRow label="Visite technique">{dh(visitPrice)}</SummaryRow>}
        <SummaryRow label="Livraison" tone="success">
          Gratuite
        </SummaryRow>
        <Divider />
        <TotalRow total={total} />
        {errors.form && <FieldError>{errors.form}</FieldError>}
        <button
          type="submit"
          disabled={sending}
          className="bg-accent hover:bg-accent-hover flex h-14 items-center justify-center rounded-full px-7 text-[16px] font-bold text-white transition-colors disabled:opacity-60"
        >
          {card ? "Confirmer et payer par carte" : "Confirmer la commande"}
        </button>
        <span className="text-ink-2 text-center text-[14px]">
          {card ? "Vous allez être redirigé vers la page de paiement sécurisé du CMI." : "Rien à payer maintenant : vous réglez à la livraison."}
        </span>
      </aside>
    </form>
  );
}

function Box({ on, invalid }: { on: boolean; invalid?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "rounded-7 flex size-6 shrink-0 items-center justify-center border-[1.5px] text-[14px] font-bold text-white",
        on ? "border-brand bg-brand" : invalid ? "border-promo bg-white" : "border-check bg-white",
      )}
    >
      {on ? "✓" : ""}
    </span>
  );
}

/** Option row drawn as a custom checkbox (role="checkbox"), 52px tall. */
function OptionToggle({ checked, onChange, children }: { checked: boolean; onChange: (on: boolean) => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="text-ink flex min-h-[52px] items-center gap-3.5 text-left text-[16px] font-semibold"
    >
      <Box on={checked} />
      {children}
    </button>
  );
}

const PAYMENT_OPTIONS: { key: PaymentMethodKey; icon: string; title: string; text: string }[] = [
  {
    key: "livraison",
    icon: MAT.cash,
    title: "Paiement à la livraison",
    text: "Rien à payer maintenant : nous vous appelons pour confirmer, vous réglez à la réception.",
  },
  {
    key: "carte",
    icon: MAT.card,
    title: "Carte bancaire",
    text: "Paiement en ligne sur la page sécurisée du CMI (Centre Monétique Interbancaire).",
  },
];

/** Payment method, shown only when card payment is on: two radio cards. */
function PaymentChoice({ value, onChange, error }: { value: PaymentMethodKey; onChange: (m: PaymentMethodKey) => void; error?: string }) {
  return (
    <div className="rounded-24 box-border flex flex-col gap-4 bg-white p-5 md:p-8">
      <CardTitle>Mode de paiement</CardTitle>
      <div role="radiogroup" aria-label="Mode de paiement" className="grid gap-3 md:grid-cols-2">
        {PAYMENT_OPTIONS.map((o) => {
          const on = value === o.key;
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.key)}
              className={cn(
                "rounded-20 flex items-start gap-4 border-[1.5px] p-4 text-left transition-colors",
                on ? "border-brand bg-tint-blue" : "border-check hover:border-brand bg-white",
              )}
            >
              <span className="text-brand flex size-12 shrink-0 items-center justify-center rounded-full bg-white">
                <MatIcon d={o.icon} size={24} />
              </span>
              <span className="flex flex-col gap-1">
                <strong className="text-[17px] leading-tight">{o.title}</strong>
                <span className="text-ink-2 text-[15px] leading-snug">{o.text}</span>
              </span>
            </button>
          );
        })}
      </div>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}
