import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon, GRID_3, PageTitle, ProjectCtaBand, Section } from "@/components/content/blocks";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getServices } from "@/lib/content/api";
import { PROJECTS_PHONE_LABEL, phoneFor } from "@/lib/content/copy";
import { seoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = seoMetadata({ title: "Services", path: "/services" });

/**
 * Services hub. Not drawn (the design's breadcrumb "Services" points back to the Service page):
 * the published services as cards with their own title and intro, then the pro CTA band.
 */
export default async function ServicesPage() {
  const { data: services, contact } = await getServices();

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Services" }]} />
      <div className="pt-6">
        <PageTitle>Services</PageTitle>
      </div>
      <Section className="pt-8 md:pt-8">
        <div className={GRID_3}>
          {services.map((s) => (
            <Link
              key={s.slug}
              href={s.href}
              className="rounded-24 bg-tint-blue text-ink hover:text-ink ease-design hover:shadow-card-hover flex flex-col gap-4 p-6 transition-[box-shadow,transform] duration-350 hover:-translate-y-1 md:p-8"
            >
              <span className="rounded-8 text-brand self-start bg-white px-2.5 py-1 text-sm font-bold">Service · {s.name}</span>
              <h2 className="m-0 text-2xl leading-[1.2] font-bold tracking-[-0.01em]">{s.h1 ?? s.name}</h2>
              {s.heroText && <p className="m-0 text-base leading-[1.5]">{s.heroText}</p>}
              <span className="mt-auto flex size-11 items-center justify-center self-end rounded-full bg-white">
                <ArrowIcon />
              </span>
            </Link>
          ))}
        </div>
      </Section>
      <Section>
        <ProjectCtaBand phone={phoneFor(contact, PROJECTS_PHONE_LABEL)} />
      </Section>
    </>
  );
}
