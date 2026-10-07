"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Field, FieldError, Honeypot, PasswordInput, Select, TextInput, Textarea } from "@/components/forms/fields";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { fieldError, submitForm, useFormTimer, type FormErrors } from "@/lib/leads/client";
import { PHONE_ERROR_SHORT, isValidMoroccanPhone } from "@/lib/phone";
import { ActionRow, CARD, FIELDS, FORM_GRID, SuccessPanel } from "./ui";

/** "Activité" options (design: Devenir revendeur; keys match ResellerAccount::ACTIVITIES). */
const ACTIVITIES = [
  { value: "installateur", label: "Installateur" },
  { value: "revendeur", label: "Revendeur" },
  { value: "bureau_etudes", label: "Bureau d’études" },
  { value: "promoteur", label: "Promoteur" },
  { value: "autre", label: "Autre" },
] as const;

const DEFAULT_CITY = "Marrakech";

export function iceError(ice: string): string | null {
  const n = ice.replace(/\D/g, "").length;
  return n === 15 ? null : `L’ICE comporte 15 chiffres. Vous en avez saisi ${n}.`;
}

/** Reseller application (design: Devenir revendeur.dc.html) and its confirmation. Posts to /api/forms/reseller. */
export function ResellerForm({ cities, aside, cgvHref = null }: { cities: string[]; aside: React.ReactNode; cgvHref?: string | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const antiSpam = useFormTimer();
  const [v, setV] = useState({
    company: "",
    ice: "",
    city: cities.includes(DEFAULT_CITY) ? DEFAULT_CITY : (cities[0] ?? ""),
    activity: "installateur",
    contact_name: "",
    phone: "",
    email: "",
    password: "",
    message: "",
  });
  const [cgv, setCgv] = useState(false);
  const [tried, setTried] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setV((old) => ({ ...old, [key]: value }));
    if (errors[key]) {
      setErrors((old) => {
        const next = { ...old };
        delete next[key];
        return next;
      });
    }
  };

  const err = {
    company: (tried && !v.company.trim() ? "Indiquez le nom de la société." : null) ?? fieldError(errors, "company"),
    ice: (tried ? iceError(v.ice) : null) ?? fieldError(errors, "ice"),
    phone: (tried && !isValidMoroccanPhone(v.phone) ? PHONE_ERROR_SHORT : null) ?? fieldError(errors, "phone"),
    cgv: (tried && !cgv ? "Cochez cette case pour envoyer la demande." : null) ?? fieldError(errors, "cgv"),
    email: fieldError(errors, "email"),
    password: fieldError(errors, "password"),
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTried(true);
    setGeneral(null);
    if (!v.company.trim() || iceError(v.ice) || !isValidMoroccanPhone(v.phone) || !cgv || sending) return;
    setSending(true);
    const result = await submitForm("/api/forms/reseller", { ...v, cgv, ...antiSpam(formRef.current) });
    setSending(false);
    if (result.ok) {
      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setErrors(result.errors);
      if (!Object.keys(result.errors).length) setGeneral(result.message);
    }
  }

  return (
    <section className={cn(FORM_GRID, "pt-8")}>
      {sent ? (
        <SuccessPanel
          title="Votre demande est enregistrée."
          actions={
            <ActionRow>
              <ButtonLink href="/espace-professionnel" variant="outline">
                Retour à l&apos;espace professionnel
              </ButtonLink>
              <ButtonLink href="/climatisation" variant="blue">
                Voir le catalogue
              </ButtonLink>
            </ActionRow>
          }
        >
          <p className="text-ink-2 m-0 max-w-[560px] text-lg leading-[1.55]">Nous vous contactons pour valider votre compte.</p>
        </SuccessPanel>
      ) : (
        <form ref={formRef} noValidate onSubmit={onSubmit} className={cn(CARD, "relative flex flex-col gap-7")}>
          <Honeypot />
          <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
            <legend className="m-0 mb-4 p-0 text-2xl font-bold tracking-[-0.01em]">Votre société</legend>
            <div className={FIELDS}>
              <Field label="Société" htmlFor="r-company" error={err.company}>
                <TextInput id="r-company" autoComplete="organization" required value={v.company} onChange={set("company")} invalid={!!err.company} />
              </Field>
              <Field label="ICE" htmlFor="r-ice" error={err.ice}>
                <TextInput
                  id="r-ice"
                  inputMode="numeric"
                  required
                  placeholder="15 chiffres"
                  className="tabular-nums"
                  value={v.ice}
                  onChange={set("ice")}
                  invalid={!!err.ice}
                />
              </Field>
              <Field label="Ville" htmlFor="r-city">
                <Select id="r-city" value={v.city} onChange={set("city")}>
                  {cities.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Activité" htmlFor="r-activity">
                <Select id="r-activity" value={v.activity} onChange={set("activity")}>
                  {ACTIVITIES.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </fieldset>
          <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
            <legend className="m-0 mb-4 p-0 text-2xl font-bold tracking-[-0.01em]">Contact et accès</legend>
            <div className={FIELDS}>
              <Field label="Nom du contact" htmlFor="r-name">
                <TextInput id="r-name" autoComplete="name" value={v.contact_name} onChange={set("contact_name")} />
              </Field>
              <Field label="Téléphone" htmlFor="r-phone" error={err.phone}>
                <TextInput id="r-phone" type="tel" inputMode="tel" autoComplete="tel" required value={v.phone} onChange={set("phone")} invalid={!!err.phone} />
              </Field>
              <Field label="E-mail" htmlFor="r-email" error={err.email}>
                <TextInput id="r-email" type="email" autoComplete="email" value={v.email} onChange={set("email")} invalid={!!err.email} />
              </Field>
              <Field label="Mot de passe souhaité" htmlFor="r-password" hint="8 caractères minimum." error={err.password}>
                <PasswordInput id="r-password" autoComplete="new-password" value={v.password} onChange={set("password")} invalid={!!err.password} />
              </Field>
              <Field label="Message" optional htmlFor="r-message" className="md:col-span-2">
                <Textarea
                  id="r-message"
                  rows={3}
                  placeholder="Marques travaillées, volumes, zone d'intervention…"
                  value={v.message}
                  onChange={set("message")}
                />
              </Field>
            </div>
          </fieldset>
          <div className="flex flex-col gap-1.5">
            <ConsentBox checked={cgv} onChange={setCgv} invalid={!!err.cgv} cgvHref={cgvHref} />
            {err.cgv && <FieldError>{err.cgv}</FieldError>}
          </div>
          {general && (
            <p role="alert" className="text-promo m-0 text-[15px] font-semibold">
              {general}
            </p>
          )}
          <Button type="submit" variant="orange" full disabled={sending}>
            Envoyer ma demande
          </Button>
        </form>
      )}
      {aside}
    </section>
  );
}

/** "J'accepte les conditions générales de vente": 44px hit area, 24px box (radius 7), as drawn. */
function ConsentBox({ checked, onChange, invalid, cgvHref }: { checked: boolean; onChange: (v: boolean) => void; invalid: boolean; cgvHref: string | null }) {
  return (
    <div className="flex min-h-11 items-center gap-3.5 text-base font-semibold">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label="Accepter les conditions"
        aria-invalid={invalid || undefined}
        onClick={() => onChange(!checked)}
        className="-m-2.5 flex size-11 shrink-0 items-center justify-center"
      >
        <span
          className={cn(
            "rounded-7 flex size-6 items-center justify-center border-[1.5px] text-sm text-white",
            checked ? "border-brand bg-brand" : invalid ? "border-promo bg-white" : "border-check bg-white",
          )}
        >
          {checked ? "✓" : ""}
        </span>
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
  );
}
