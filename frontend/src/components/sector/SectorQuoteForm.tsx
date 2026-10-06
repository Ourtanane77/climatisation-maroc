"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Field, FieldError, Honeypot, Select, TextInput, Textarea } from "@/components/forms/fields";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import { PROJECT_TYPES } from "@/lib/content/copy";
import { PHONE_ERROR_SHORT, isValidMoroccanPhone } from "@/lib/phone";

interface Values {
  name: string;
  company: string;
  phone: string;
  email: string;
  city: string;
  surface: string;
  project_type: string;
  message: string;
}

/**
 * On-page quote form of a sector page (design: Restaurants.dc.html, section #devis). Only the
 * phone is validated on the client (shown after the first submit); the server checks the rest.
 * Posts JSON to the Next route handler /api/forms/sector, which forwards it to the Laravel API.
 */
export function SectorQuoteForm({ sectorSlug, title, cities }: { sectorSlug: string; title: string; cities: string[] }) {
  // When the form was shown, for the API's minimum fill time (_t, milliseconds; see FormGuard).
  const started = useRef(0);
  useEffect(() => {
    started.current = Date.now();
  }, []);
  const [values, setValues] = useState<Values>({
    name: "",
    company: "",
    phone: "",
    email: "",
    city: cities.includes("Marrakech") ? "Marrakech" : (cities[0] ?? ""),
    surface: "",
    project_type: PROJECT_TYPES[0],
    message: "",
  });
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);

  const set = (key: keyof Values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const phoneError = tried && !isValidMoroccanPhone(values.phone) ? PHONE_ERROR_SHORT : (errors.phone ?? null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTried(true);
    setFailure(null);
    if (!isValidMoroccanPhone(values.phone)) return;
    const website = (new FormData(e.currentTarget).get("website") as string | null) ?? "";
    setSending(true);
    try {
      const res = await fetch("/api/forms/sector", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...values,
          surface: values.surface ? Number(values.surface) : null,
          sector_slug: sectorSlug,
          website,
          _t: Date.now() - started.current,
        }),
      });
      if (res.ok) {
        setSent(true);
        return;
      }
      const body = (await res.json().catch(() => null)) as { errors?: Record<string, string[]>; message?: string } | null;
      if (res.status === 422 && body?.errors) {
        setErrors(Object.fromEntries(Object.entries(body.errors).map(([k, v]) => [k, v[0] ?? ""])));
      } else {
        setFailure(body?.message ?? "L’envoi a échoué. Réessayez ou appelez-nous.");
      }
    } catch {
      setFailure("L’envoi a échoué. Réessayez ou appelez-nous.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="rounded-24 flex flex-col gap-3 bg-white p-5 md:p-8">
        <span className="bg-success-bg flex size-16 items-center justify-center rounded-full">
          <CheckIcon size={32} className="text-success" />
        </span>
        <h2 className="m-0 text-2xl font-bold tracking-[-0.01em]">Demande envoyée</h2>
        <p className="text-ink-2 m-0 text-[17px] leading-[1.55]">Nous vous rappelons pour organiser la visite technique.</p>
      </div>
    );
  }

  const err = (k: string) => errors[k] ?? null;

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-24 relative flex flex-col gap-5 bg-white p-5 md:p-8">
      <h2 className="m-0 text-2xl font-bold tracking-[-0.01em]">{title}</h2>
      <Honeypot />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Nom" htmlFor="sq-name" error={err("name")}>
          <TextInput id="sq-name" autoComplete="name" value={values.name} onChange={set("name")} invalid={!!err("name")} />
        </Field>
        <Field label="Établissement" htmlFor="sq-company" error={err("company")}>
          <TextInput id="sq-company" autoComplete="organization" value={values.company} onChange={set("company")} invalid={!!err("company")} />
        </Field>
        <Field label="Téléphone" htmlFor="sq-phone" error={phoneError}>
          <TextInput id="sq-phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} invalid={!!phoneError} />
        </Field>
        <Field label="E-mail" optional htmlFor="sq-email" error={err("email")}>
          <TextInput id="sq-email" type="email" autoComplete="email" value={values.email} onChange={set("email")} invalid={!!err("email")} />
        </Field>
        <Field label="Ville" htmlFor="sq-city" error={err("city")}>
          <Select id="sq-city" value={values.city} onChange={set("city")} invalid={!!err("city")}>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Surface de la salle en m²" optional htmlFor="sq-surface" error={err("surface")}>
          <TextInput id="sq-surface" type="number" inputMode="numeric" min={1} value={values.surface} onChange={set("surface")} invalid={!!err("surface")} />
        </Field>
        <Field label="Type de projet" htmlFor="sq-project" className="md:col-span-2" error={err("project_type")}>
          <Select id="sq-project" value={values.project_type} onChange={set("project_type")}>
            {PROJECT_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Message" optional htmlFor="sq-message" className="md:col-span-2" error={err("message")}>
          <Textarea id="sq-message" rows={3} placeholder="Nombre de couverts, cuisine ouverte, terrasse…" value={values.message} onChange={set("message")} />
        </Field>
      </div>
      {failure && <FieldError>{failure}</FieldError>}
      <Button type="submit" variant="orange" disabled={sending}>
        Envoyer ma demande
      </Button>
    </form>
  );
}
