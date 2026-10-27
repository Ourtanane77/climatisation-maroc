import type { Metadata } from "next";
import { ArfroFormPage, AsideList, QUOTE_STEPS } from "@/components/arfro/pro/ArfroFormPage";
import { ContactAside } from "@/components/arfro/pro/parts";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { QuoteForm } from "@/components/leads/QuoteForm";
import { CallbackCard, CARD, CARD_H2, PageIntro, Timeline } from "@/components/leads/ui";
import { cn } from "@/lib/cn";
import { projectsPhone } from "@/lib/leads/contacts";
import { getCityNames } from "@/lib/leads/data";
import { getNavigation } from "@/lib/navigation";
import { waLink } from "@/lib/whatsapp";
import { seoMetadata } from "@/lib/seo/metadata";
import { SITE_KEY } from "@/lib/site";

export const metadata: Metadata = seoMetadata({
  title: "Demander un devis",
  description: "Décrivez votre projet de climatisation, nous vous rappelons avec une proposition.",
  path: "/demander-un-devis",
});

const STEPS = [
  { title: "Demande", text: "Vous décrivez votre projet, nous vous rappelons." },
  { title: "Visite technique", text: "300 Dhs. Un technicien mesure et conseille." },
  { title: "Devis détaillé", text: "Appareil, matériel et pose, poste par poste." },
] as const;

/** Demander un devis (design: Demander un devis.dc.html). `?pro=1` preselects Professionnel. */
export default async function QuotePage({ searchParams }: PageProps<"/demander-un-devis">) {
  const [nav, cities, params] = await Promise.all([getNavigation(), getCityNames(), searchParams]);
  const wa = waLink("Bonjour, je souhaite un devis pour un projet de climatisation.", nav.whatsapp.number);
  const initialMessage = typeof params.ref === "string" && params.ref ? `Demande de prix pour la référence ${params.ref.slice(0, 64)}.` : undefined;

  if (SITE_KEY === "arfro") {
    // Same form (fields, validation, POST /api/forms/quote, ?pro=1 and ?ref=); Arfro heading, frame and aside.
    return (
      <>
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Demander un devis" }]} />
        <ArfroFormPage
          eyebrow={params.pro === "1" ? "ARFRO Business · Devis professionnel" : "ARFRO · Devis"}
          title="Demander un devis"
          lead="Décrivez votre projet de climatisation, nous vous rappelons avec une proposition."
        >
          <QuoteForm
            cities={cities}
            initialPro={params.pro === "1"}
            initialMessage={initialMessage}
            whatsappHref={wa}
            aside={
              <ContactAside title="Nous vous rappelons rapidement" phone={projectsPhone(nav)} hours={nav.footer.hours} whatsappHref={wa}>
                <AsideList title="Comment ça se passe" items={QUOTE_STEPS} />
              </ContactAside>
            }
          />
        </ArfroFormPage>
      </>
    );
  }

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Demander un devis" }]} />
      <PageIntro title="Demander un devis">Décrivez votre projet de climatisation, nous vous rappelons avec une proposition.</PageIntro>
      <QuoteForm
        cities={cities}
        initialPro={params.pro === "1"}
        // « Demander un prix » links (items « Prix sur demande ») pass the reference in ?ref=.
        initialMessage={initialMessage}
        whatsappHref={wa}
        aside={
          <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
            <CallbackCard title="Nous vous rappelons rapidement" phone={projectsPhone(nav)} whatsappHref={wa} hours={nav.footer.hours} />
            <div className={cn(CARD, "flex flex-col gap-1")}>
              <h2 className={cn(CARD_H2, "mb-3")}>Comment ça se passe</h2>
              <Timeline steps={STEPS} />
            </div>
          </aside>
        }
      />
    </>
  );
}
