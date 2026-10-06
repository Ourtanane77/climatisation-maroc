import type { Metadata } from "next";
import { ProjectCtaBand, PageTitle, Section, SectionTitle, SectorCard, StepList, GRID_4 } from "@/components/content/blocks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ButtonLink } from "@/components/ui/Button";
import { getSectors } from "@/lib/content/api";
import { PROJECT_STEPS, PROJECTS_PHONE_LABEL, phoneFor } from "@/lib/content/copy";
import { telHref } from "@/lib/phone";

export const metadata: Metadata = {
  title: { absolute: "Climatisation professionnelle au Maroc · Ariha Froid" },
  description:
    "Hôtels, restaurants, bureaux, commerces : chaque espace a ses contraintes. Ariha Froid étudie, fournit et installe la solution adaptée, partout au Maroc, depuis 2008.",
  alternates: { canonical: "/solutions" },
};

/** Solutions professionnelles (design: Solutions professionnelles.dc.html). Only published sectors are listed. */
export default async function SolutionsPage() {
  const { data: sectors, contact } = await getSectors();
  const phone = phoneFor(contact, PROJECTS_PHONE_LABEL);

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Solutions professionnelles" }]} />
      <section className="grid grid-cols-1 items-end gap-x-12 gap-y-6 pt-6 xl:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex flex-col gap-4">
          <PageTitle>Climatisation professionnelle au Maroc</PageTitle>
          <p className="text-ink-2 m-0 max-w-[720px] text-[19px] leading-[1.55] text-pretty">
            Hôtels, restaurants, bureaux, commerces : chaque espace a ses contraintes. Ariha Froid étudie, fournit et installe la solution adaptée, partout au
            Maroc, depuis 2008.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <ButtonLink href="/demander-un-devis?pro=1" variant="orange" mobileFull>
            Demander un devis
          </ButtonLink>
          <ButtonLink href={telHref(phone)} variant="outline" mobileFull>
            Appeler le {phone}
          </ButtonLink>
        </div>
      </section>

      {sectors.length > 0 && (
        <section className="pt-10" aria-labelledby="secteurs">
          <h2 id="secteurs" className="sr-only">
            Secteurs
          </h2>
          <div className={GRID_4}>
            {sectors.map((s) => (
              <SectorCard key={s.slug} sector={s} />
            ))}
          </div>
        </section>
      )}

      <Section>
        <SectionTitle>Comment se déroule un projet</SectionTitle>
        <StepList items={PROJECT_STEPS} />
      </Section>

      <Section>
        <ProjectCtaBand phone={phone} />
      </Section>
    </>
  );
}
