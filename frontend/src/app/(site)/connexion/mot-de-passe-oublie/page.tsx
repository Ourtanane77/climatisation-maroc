import type { Metadata } from "next";
import { AuthShell } from "@/components/pro/AuthShell";
import { ForgotForm } from "@/components/pro/AuthForms";
import { projectsPhone } from "@/lib/leads/contacts";
import { getNavigation } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Mot de passe oublié · Espace professionnel",
  robots: { index: false },
};

/** Forgot password (design: Connexion.dc.html?oubli=1). */
export default async function ForgotPage() {
  const nav = await getNavigation();
  return (
    <AuthShell phone={projectsPhone(nav)}>
      <ForgotForm />
    </AuthShell>
  );
}
