"use client";

import { useRef, useState } from "react";
import { Field, Honeypot, Select, TextInput, Textarea } from "@/components/forms/fields";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { fieldError, submitForm, useFormTimer, type FormErrors } from "@/lib/leads/client";
import { PHONE_ERROR_SHORT, isValidMoroccanPhone } from "@/lib/phone";
import { CheckIcon } from "./ui";

const SUBJECTS = ["Question sur un produit", "Suivi de commande", "Facturation", "Service après-vente", "Autre"] as const;

/** "Écrivez-nous" form of the Contact page and its "Message envoyé" state. Posts to /api/forms/contact. */
export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const antiSpam = useFormTimer();
  const [values, setValues] = useState({ name: "", phone: "", email: "", subject: SUBJECTS[0] as string, message: "" });
  const [tried, setTried] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));
  const phoneError = (tried && !isValidMoroccanPhone(values.phone) ? PHONE_ERROR_SHORT : null) ?? fieldError(errors, "phone");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTried(true);
    setGeneral(null);
    if (!isValidMoroccanPhone(values.phone) || sending) return;
    setSending(true);
    const result = await submitForm("/api/forms/contact", { ...values, ...antiSpam(formRef.current) });
    setSending(false);
    if (result.ok) setSent(true);
    else {
      setErrors(result.errors);
      if (!Object.keys(result.errors).length) setGeneral(result.message);
    }
  }

  if (sent) {
    return (
      <div role="status" className="rounded-24 box-border flex items-center gap-4 bg-white p-5 md:p-8">
        <span className="bg-success-bg flex size-14 shrink-0 items-center justify-center rounded-full">
          <CheckIcon size={28} />
        </span>
        <span className="flex flex-col gap-1">
          <strong className="text-xl">Message envoyé</strong>
          <span className="text-ink-2 text-base">Nous vous répondons du lundi au samedi, de 9h à 19h.</span>
        </span>
      </div>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="rounded-24 relative box-border grid grid-cols-1 gap-4 bg-white p-5 md:grid-cols-2 md:p-8">
      <Honeypot />
      <Field label="Nom" htmlFor="c-name">
        <TextInput id="c-name" autoComplete="name" value={values.name} onChange={set("name")} />
      </Field>
      <Field label="Téléphone" htmlFor="c-phone" error={phoneError}>
        <TextInput id="c-phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} invalid={!!phoneError} />
      </Field>
      <Field label="E-mail" optional htmlFor="c-email" error={fieldError(errors, "email")}>
        <TextInput id="c-email" type="email" autoComplete="email" value={values.email} onChange={set("email")} />
      </Field>
      <Field label="Sujet" htmlFor="c-subject">
        <Select id="c-subject" value={values.subject} onChange={set("subject")}>
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </Field>
      <Field label="Message" htmlFor="c-message" className="md:col-span-2">
        <Textarea id="c-message" rows={4} value={values.message} onChange={set("message")} className="leading-[1.5]" />
      </Field>
      {general && (
        <p role="alert" className={cn("text-promo m-0 text-[15px] font-semibold md:col-span-2")}>
          {general}
        </p>
      )}
      <Button type="submit" variant="blue" disabled={sending}>
        Envoyer le message
      </Button>
    </form>
  );
}
