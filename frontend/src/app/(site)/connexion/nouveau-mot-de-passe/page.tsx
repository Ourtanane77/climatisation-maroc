import type { Metadata } from "next";
import { AuthShell } from "@/components/pro/AuthShell";
import { ResetForm } from "@/components/pro/AuthForms";
import { projectsPhone } from "@/lib/leads/contacts";
import { getNavigation } from "@/lib/navigation";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Nouveau mot de passe · Espace professionnel", noindex: true });

/** New password from the e-mailed link (?token=&email=). */
export default async function ResetPage({ searchParams }: PageProps<"/connexion/nouveau-mot-de-passe">) {
  const [nav, params] = await Promise.all([getNavigation(), searchParams]);
  const token = typeof params.token === "string" ? params.token : "";
  const email = typeof params.email === "string" ? params.email : "";
  return (
    <AuthShell phone={projectsPhone(nav)}>
      <ResetForm token={token} email={email} />
    </AuthShell>
  );
}
