import type { Metadata } from "next";
import { AuthShell } from "@/components/pro/AuthShell";
import { ForgotForm } from "@/components/pro/AuthForms";
import { projectsPhone } from "@/lib/leads/contacts";
import { getNavigation } from "@/lib/navigation";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Mot de passe oublié · Espace professionnel", noindex: true });

/** Forgot password (design: Connexion.dc.html?oubli=1). */
export default async function ForgotPage() {
  const nav = await getNavigation();
  return (
    <AuthShell phone={projectsPhone(nav)}>
      <ForgotForm />
    </AuthShell>
  );
}
