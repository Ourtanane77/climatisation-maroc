import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ResellerForm } from "@/components/leads/ResellerForm";
import { CallbackCard, PageIntro } from "@/components/leads/ui";
import { PerkList } from "@/components/pro/PerkList";
import { projectsPhone } from "@/lib/leads/contacts";
import { getCityNames } from "@/lib/leads/data";
import { getNavigation } from "@/lib/navigation";
import { waLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Devenir revendeur",
  description: "Ouvrez votre compte professionnel pour accéder aux tarifs revendeur, au stock et à la commande rapide.",
  alternates: { canonical: "/devenir-revendeur" },
};

/** Devenir revendeur (design: Devenir revendeur.dc.html). */
export default async function ResellerPage() {
  const [nav, cities] = await Promise.all([getNavigation(), getCityNames()]);
  const wa = waLink("Bonjour, je souhaite ouvrir un compte revendeur.", nav.whatsapp.number);

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Espace professionnel", href: "/espace-professionnel" }, { label: "Devenir revendeur" }]} />
      <PageIntro title="Devenir revendeur">Ouvrez votre compte professionnel pour accéder aux tarifs revendeur, au stock et à la commande rapide.</PageIntro>
      <ResellerForm
        cities={cities}
        aside={
          <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
            <PerkList />
            <CallbackCard tone="white" phone={projectsPhone(nav)} whatsappHref={wa} hours={nav.footer.hours} />
          </aside>
        }
      />
    </>
  );
}
