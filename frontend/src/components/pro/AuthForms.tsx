"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, PasswordInput, TextInput } from "@/components/forms/fields";
import { Button } from "@/components/ui/Button";
import { ErrorIcon } from "@/components/ui/icons";
import { fieldError, submitForm, type FormErrors } from "@/lib/leads/client";

/** Card of the Connexion page (white, radius 24, padding 20/32). */
const AUTH_CARD = "rounded-24 box-border flex flex-col gap-5 bg-white p-5 md:p-8";
const AUTH_H1 = "m-0 text-[34px] font-bold tracking-[-0.02em]";

/** "Se connecter" (design: Connexion.dc.html, login mode). */
export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [bad, setBad] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    if (!login.trim() || !password) {
      setBad("Identifiants incorrects.");
      return;
    }
    setSending(true);
    const result = await submitForm("/api/auth/login", { login, password, next });
    setSending(false);
    if (result.ok) {
      router.replace(typeof result.data.next === "string" ? result.data.next : "/espace-professionnel/commande-rapide");
      router.refresh();
    } else {
      setBad(Object.keys(result.errors).length ? "Identifiants incorrects." : result.message);
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className={AUTH_CARD}>
      <div className="flex flex-col gap-2">
        <span className="text-brand text-sm font-bold">Espace professionnel</span>
        <h1 className={AUTH_H1}>Se connecter</h1>
      </div>
      {bad && (
        <div role="alert" className="rounded-14 bg-tint-orange flex items-start gap-2.5 px-4 py-3.5 text-[15px] leading-[1.5]">
          <ErrorIcon size={18} className="text-promo mt-0.5 shrink-0" />
          {bad === "Identifiants incorrects." ? (
            <span>
              <strong>Identifiants incorrects.</strong> Vérifiez votre e-mail ou téléphone et votre mot de passe.
            </span>
          ) : (
            <span>{bad}</span>
          )}
        </div>
      )}
      <Field label="E-mail ou téléphone" htmlFor="login">
        <TextInput
          id="login"
          autoComplete="username"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          style={bad ? { borderColor: "#C4501A" } : undefined}
        />
      </Field>
      <Field
        label="Mot de passe"
        htmlFor="password"
        labelAside={
          <Link href="/connexion/mot-de-passe-oublie" className="text-brand inline-flex min-h-6 items-center text-sm font-bold underline">
            Mot de passe oublié ?
          </Link>
        }
      >
        <PasswordInput
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setBad(null);
          }}
          style={bad ? { borderColor: "#C4501A" } : undefined}
        />
      </Field>
      <Button type="submit" variant="blue" full disabled={sending}>
        Se connecter
      </Button>
    </form>
  );
}

function BackToLogin() {
  return (
    <Link href="/connexion" className="text-ink hover:text-brand flex min-h-11 items-center gap-1.5 self-start text-[15px] font-bold">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 6l-6 6 6 6" />
      </svg>
      Retour à la connexion
    </Link>
  );
}

/** "Mot de passe oublié" (design: Connexion.dc.html?oubli=1). */
export function ForgotForm() {
  const [login, setLogin] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!login.trim() || sending) return;
    setSending(true);
    const result = await submitForm("/api/auth/forgot", { login });
    setSending(false);
    if (result.ok) setSent(login.trim());
    else setError(result.message);
  }

  return (
    <form noValidate onSubmit={onSubmit} className={AUTH_CARD}>
      <BackToLogin />
      <div className="flex flex-col gap-2">
        <h1 className={AUTH_H1}>Mot de passe oublié</h1>
        <p className="text-ink-2 m-0 text-base leading-[1.55]">
          Indiquez l&apos;e-mail ou le téléphone de votre compte. Nous vous envoyons un lien pour choisir un nouveau mot de passe.
        </p>
      </div>
      {sent ? (
        <div role="status" className="rounded-14 bg-success-bg p-4 text-[15px] leading-[1.5]">
          <strong>Lien envoyé.</strong> Si un compte correspond à {sent}, vous recevez le lien dans quelques minutes.
        </div>
      ) : (
        <>
          <Field label="E-mail ou téléphone" htmlFor="forgot-login" error={error}>
            <TextInput id="forgot-login" autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} />
          </Field>
          <Button type="submit" variant="blue" full disabled={sending}>
            Recevoir le lien
          </Button>
        </>
      )}
    </form>
  );
}

/** New password from the e-mailed link (not drawn: same card as Connexion). */
export function ResetForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    if (password.length < 8) {
      setErrors({ password: ["8 caractères minimum."] });
      return;
    }
    setSending(true);
    const result = await submitForm("/api/auth/reset", { token, email, password });
    setSending(false);
    if (result.ok) {
      setDone(true);
      setTimeout(() => router.push("/connexion"), 1500);
    } else setErrors(Object.keys(result.errors).length ? result.errors : { token: [result.message] });
  }

  const linkError = fieldError(errors, "token") ?? fieldError(errors, "email");

  return (
    <form noValidate onSubmit={onSubmit} className={AUTH_CARD}>
      <BackToLogin />
      <div className="flex flex-col gap-2">
        <span className="text-brand text-sm font-bold">Espace professionnel</span>
        <h1 className={AUTH_H1}>Nouveau mot de passe</h1>
      </div>
      {linkError && (
        <div role="alert" className="rounded-14 bg-tint-orange flex items-start gap-2.5 px-4 py-3.5 text-[15px] leading-[1.5]">
          <ErrorIcon size={18} className="text-promo mt-0.5 shrink-0" />
          <span>
            {linkError}{" "}
            <Link href="/connexion/mot-de-passe-oublie" className="font-bold underline">
              Mot de passe oublié ?
            </Link>
          </span>
        </div>
      )}
      {done ? (
        <div role="status" className="rounded-14 bg-success-bg p-4 text-[15px] leading-[1.5]">
          <strong>Mot de passe enregistré.</strong>
        </div>
      ) : (
        <>
          <Field label="Mot de passe souhaité" htmlFor="new-password" hint="8 caractères minimum." error={fieldError(errors, "password")}>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              invalid={!!fieldError(errors, "password")}
            />
          </Field>
          <Button type="submit" variant="blue" full disabled={sending}>
            Enregistrer
          </Button>
        </>
      )}
    </form>
  );
}
