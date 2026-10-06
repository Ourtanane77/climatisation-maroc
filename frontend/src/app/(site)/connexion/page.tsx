import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/pro/AuthShell";
import { LoginForm } from "@/components/pro/AuthForms";
import { projectsPhone } from "@/lib/leads/contacts";
import { getNavigation } from "@/lib/navigation";
import { safeNext } from "@/lib/pro/cookie";
import { getReseller } from "@/lib/pro/session";

export const metadata: Metadata = {
  title: "Connexion · Espace professionnel",
  robots: { index: false },
};

/** Reseller login (design: Connexion.dc.html). `?suite=` is where to go after logging in. */
export default async function LoginPage({ searchParams }: PageProps<"/connexion">) {
  const [nav, reseller, params] = await Promise.all([getNavigation(), getReseller(), searchParams]);
  const next = safeNext(params.suite);
  if (reseller) redirect(next);

  return (
    <AuthShell phone={projectsPhone(nav)}>
      <LoginForm next={next} />
    </AuthShell>
  );
}
