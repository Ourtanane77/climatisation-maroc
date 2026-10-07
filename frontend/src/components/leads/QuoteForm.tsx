"use client";

import { useRef, useState } from "react";
import { ChipGroup, Field, Honeypot, SegmentedToggle, Select, TextInput, Textarea } from "@/components/forms/fields";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { fieldError, submitForm, useFormTimer, type FormErrors } from "@/lib/leads/client";
import { PHONE_ERROR_CHECKOUT, isValidMoroccanPhone } from "@/lib/phone";
import { ActionRow, CARD, FIELDS, FORM_GRID, SuccessPanel } from "./ui";

/** Choice lists of design/Demander un devis.dc.html. */
const PROJECTS = ["Nouvelle installation", "Remplacement", "Entretien", "Fourniture seule"] as const;
const SPACES = ["Maison", "Appartement", "Bureau", "Commerce", "Restaurant", "Hôtel", "Autre"] as const;
type Who = "particulier" | "professionnel";

const DEFAULT_CITY = "Marrakech";

/**
 * "Demander un devis" form (Particulier / Professionnel toggle, chips, plan or photo upload) and its
 * "Demande envoyée" state. Posts multipart to /api/forms/quote.
 */
export function QuoteForm({
  cities,
  initialPro,
  initialMessage,
  whatsappHref,
  aside,
}: {
  cities: string[];
  initialPro: boolean;
  /** Prefilled message, e.g. a price request for a reference (« Demander un prix »). */
  initialMessage?: string;
  whatsappHref: string;
  aside: React.ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const antiSpam = useFormTimer();
  const [who, setWho] = useState<Who>(initialPro ? "professionnel" : "particulier");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState(cities.includes(DEFAULT_CITY) ? DEFAULT_CITY : (cities[0] ?? ""));
  const [surface, setSurface] = useState("");
  const [project, setProject] = useState<(typeof PROJECTS)[number] | null>("Nouvelle installation");
  const [space, setSpace] = useState<(typeof SPACES)[number] | null>("Maison");
  const [message, setMessage] = useState(initialMessage ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [tried, setTried] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ name: string; phone: string } | null>(null);

  const nameError = (tried && !name.trim() ? "Indiquez votre nom." : null) ?? fieldError(errors, "name");
  const phoneError = (tried && !isValidMoroccanPhone(phone) ? PHONE_ERROR_CHECKOUT : null) ?? fieldError(errors, "phone");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTried(true);
    setGeneral(null);
    if (!name.trim() || !isValidMoroccanPhone(phone) || sending) return;

    const data = new FormData();
    const fields: Record<string, string> = {
      customer_kind: who,
      name,
      phone,
      email,
      city,
      surface,
      project_type: project ?? "",
      space_type: space ?? "",
      message,
      ...(who === "professionnel" ? { company } : {}),
    };
    for (const [key, value] of Object.entries({ ...fields, ...antiSpam(formRef.current) })) {
      if (value !== undefined && value !== "") data.append(key, String(value));
    }
    if (file) data.append("attachment", file);

    setSending(true);
    const result = await submitForm("/api/forms/quote", data);
    setSending(false);
    if (result.ok) {
      setSent({ name: name.trim(), phone });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setErrors(result.errors);
      if (!Object.keys(result.errors).length) setGeneral(result.message);
    }
  }

  function again() {
    setName("");
    setPhone("");
    setCity(DEFAULT_CITY);
    setCompany("");
    setEmail("");
    setSurface("");
    setMessage("");
    setFile(null);
    setProject("Nouvelle installation");
    setSpace("Maison");
    setTried(false);
    setErrors({});
    setSent(null);
  }

  return (
    <>
      <div className="mt-7">
        <SegmentedToggle
          label="Vous êtes"
          value={who}
          onChange={setWho}
          options={[
            { value: "particulier", label: "Particulier" },
            { value: "professionnel", label: "Professionnel" },
          ]}
        />
      </div>
      <section className={cn(FORM_GRID, "pt-6")}>
        {sent ? (
          <SuccessPanel
            title="Demande envoyée"
            actions={
              <>
                <ActionRow>
                  <ButtonLink href={whatsappHref} variant="whatsapp">
                    Nous écrire sur WhatsApp
                  </ButtonLink>
                  <ButtonLink href="/climatisation" variant="outline">
                    Voir les climatiseurs
                  </ButtonLink>
                </ActionRow>
                <button type="button" onClick={again} className="text-brand min-h-11 text-[15px] font-bold underline">
                  Faire une autre demande
                </button>
              </>
            }
          >
            <p className="text-ink-2 m-0 max-w-[560px] text-[17px] leading-[1.55]">
              Merci {sent.name}. Nous vous rappelons au {sent.phone} pour parler de votre projet et, si besoin, organiser la visite technique.
            </p>
          </SuccessPanel>
        ) : (
          <form ref={formRef} noValidate onSubmit={onSubmit} className={cn(CARD, "relative flex flex-col gap-6")}>
            <Honeypot />
            <div className={FIELDS}>
              <Field label="Nom complet" htmlFor="q-name" error={nameError}>
                <TextInput id="q-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} invalid={!!nameError} />
              </Field>
              {who === "professionnel" && (
                <Field label="Société" htmlFor="q-company" error={fieldError(errors, "company")}>
                  <TextInput id="q-company" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
                </Field>
              )}
              <Field label="Téléphone" htmlFor="q-phone" error={phoneError}>
                <TextInput
                  id="q-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  invalid={!!phoneError}
                />
              </Field>
              <Field label="E-mail" optional htmlFor="q-email" error={fieldError(errors, "email")}>
                <TextInput id="q-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label="Ville" htmlFor="q-city">
                <Select id="q-city" value={city} onChange={(e) => setCity(e.target.value)}>
                  {cities.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Surface en m²" optional htmlFor="q-surface" error={fieldError(errors, "surface")}>
                <TextInput
                  id="q-surface"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="Par exemple 25"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                />
              </Field>
            </div>
            <ChipGroup label="Type de projet" options={PROJECTS} value={project} onChange={setProject} />
            <ChipGroup label="Type d'espace" options={SPACES} value={space} onChange={setSpace} />
            <Field label="Message" htmlFor="q-message">
              <Textarea
                id="q-message"
                rows={4}
                placeholder="Nombre de pièces, appareil souhaité, délais…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Field>
            <UploadTile file={file} onFile={setFile} error={fieldError(errors, "attachment")} />
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
    </>
  );
}

/** Dashed "Joindre un plan ou une photo" tile (label and file name inside the tile, as drawn). */
function UploadTile({ file, onFile, error }: { file: File | null; onFile: (file: File | null) => void; error: string | null }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className={cn(
          "rounded-16 bg-zebra hover:border-brand focus-within:border-brand relative box-border flex min-h-16 cursor-pointer items-center gap-3.5 border-[1.5px] border-dashed px-4 py-3",
          error ? "border-promo" : "border-upload-line",
        )}
      >
        <span aria-hidden className="rounded-12 bg-tint-blue flex size-11 shrink-0 items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B5CAD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.5l-8.5 8.5a5 5 0 0 1-7-7l9-9a3.3 3.3 0 0 1 4.7 4.7l-9 9a1.7 1.7 0 0 1-2.4-2.4L16 8.5" />
          </svg>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-base font-bold">
            Joindre un plan ou une photo <span className="text-muted font-medium">(optionnel)</span>
          </span>
          <span className="text-muted truncate text-sm">{file?.name ?? "Image ou PDF"}</span>
        </span>
        <input type="file" accept="image/*,.pdf" className="absolute size-px opacity-0" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      </label>
      {error && (
        <span role="alert" className="text-promo text-sm font-semibold">
          {error}
        </span>
      )}
    </div>
  );
}
