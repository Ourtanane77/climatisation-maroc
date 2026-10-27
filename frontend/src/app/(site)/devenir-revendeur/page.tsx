import type { Metadata } from "next";
import { ArfroFormPage, ResellerPerks } from "@/components/arfro/pro/ArfroFormPage";
import { ContactAside } from "@/components/arfro/pro/parts";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ResellerForm } from "@/components/leads/ResellerForm";
import { CallbackCard, PageIntro } from "@/components/leads/ui";
import { PerkList } from "@/components/pro/PerkList";
import { projectsPhone } from "@/lib/leads/contacts";
import { getCityNames } from "@/lib/leads/data";
import { getNavigation, publishedLegalHref } from "@/lib/navigation";
import { waLink } from "@/lib/whatsapp";
import { seoMetadata } from "@/lib/seo/metadata";
import { SITE_KEY } from "@/lib/site";

export const metadata: Metadata = seoMetadata({
  title: "Devenir revendeur",
  description: "Ouvrez votre compte professionnel pour accéder aux tarifs revendeur, au stock et à la commande rapide.",
  path: "/devenir-revendeur",
});

/** Devenir revendeur (design: Devenir revendeur.dc.html). */
export default async function ResellerPage() {
  const [nav, cities] = await Promise.all([getNavigation(), getCityNames()]);
  const wa = waLink("Bonjour, je souhaite ouvrir un compte revendeur.", nav.whatsapp.number);

  if (SITE_KEY === "arfro") {
    // Same form (fields, validation, POST /api/forms/reseller); Arfro heading, frame and aside.
    return (
      <>
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Espace professionnel", href: "/espace-professionnel" }, { label: "Devenir revendeur" }]} />
        <ArfroFormPage
          eyebrow="ARFRO Business · Compte professionnel"
          title="Devenir revendeur"
          lead="Ouvrez votre compte professionnel pour accéder aux tarifs revendeur, au stock et à la commande rapide."
        >
          <ResellerForm
            cities={cities}
            cgvHref={publishedLegalHref(nav, "/cgv")}
            aside={
              <ContactAside title="Une question avant de commencer ?" phone={projectsPhone(nav)} hours={nav.footer.hours} whatsappHref={wa}>
                <ResellerPerks />
              </ContactAside>
            }
          />
        </ArfroFormPage>
      </>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Espace professionnel", href: "/espace-professionnel" }, { label: "Devenir revendeur" }]} />
      <PageIntro title="Devenir revendeur">Ouvrez votre compte professionnel pour accéder aux tarifs revendeur, au stock et à la commande rapide.</PageIntro>
      <ResellerForm
        cities={cities}
        cgvHref={publishedLegalHref(nav, "/cgv")}
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
