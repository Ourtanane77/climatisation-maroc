import type { Metadata } from "next";
import Link from "next/link";
import { ContactCtaBand } from "@/components/blog/ContactCtaBand";
import { PowerCalculator } from "@/components/calculator/PowerCalculator";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getCalculatorTiers } from "@/lib/home/api";
import { seoMetadata } from "@/lib/seo/metadata";

const GUIDE = "/blog/quelle-puissance-de-climatiseur-pour-ma-piece";

export const metadata: Metadata = seoMetadata({
  title: "Quelle puissance de climatiseur pour votre pièce ?",
  description:
    "Calculez la puissance de climatiseur adaptée à votre pièce : surface, hauteur sous plafond, exposition, dernier étage et type de pièce. Résultat en BTU et climatiseurs correspondants.",
  path: "/calculateur-puissance",
});

/** Power calculator (design/Calculateur puissance.dc.html). */
export default async function CalculatorPage() {
  const tiers = await getCalculatorTiers();

  return (
    <>
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Climatisation", href: "/climatisation" }, { label: "Calculateur de puissance" }]} />
      <div className="max-w-[900px] pt-6">
        <h1 className="m-0 text-[34px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px] xl:text-[56px]">
          Quelle puissance de climatiseur pour votre pièce ?
        </h1>
      </div>

      <PowerCalculator tiers={tiers}>
        <div className="flex flex-col gap-4">
          <h2 className="m-0 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-[44px]">Comment l&apos;estimation est calculée</h2>
          <p className="m-0 max-w-[620px] text-[17px] leading-[1.7]">
            Le point de départ est de 600 BTU par m². Le besoin augmente pour une hauteur sous plafond haute, une pièce très ensoleillée, un dernier étage ou
            une cuisine ouverte, et diminue légèrement pour une pièce peu exposée. Le résultat est arrondi à la puissance disponible juste au-dessus.
          </p>
          <p className="m-0 text-[17px] leading-[1.7]">
            <Link href={GUIDE} className="font-bold underline">
              Lire le guide complet sur la puissance
            </Link>
          </p>
          <div className="bg-tint-orange-2 rounded-[18px] px-5 py-4 text-base leading-[1.55]">
            Estimation indicative. Un technicien peut confirmer lors d&apos;une visite technique (300 Dhs).
          </div>
        </div>
      </PowerCalculator>

      <ContactCtaBand title="Besoin d’aide pour choisir ?" whatsappText="Bonjour, j’ai besoin d’aide pour choisir la puissance de mon climatiseur." />
    </>
  );
}
