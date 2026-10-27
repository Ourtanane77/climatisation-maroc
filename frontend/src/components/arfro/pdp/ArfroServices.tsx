import Link from "next/link";
import { ArfroInstall } from "@/components/product/ArfroSections";
import { cn } from "@/lib/cn";
import { ARFRO_PDP_H2, PDP_SPLIT, PdpEyebrow } from "./styles";
import { dh } from "@/lib/format";
import type { AccessoryData } from "@/lib/product/types";

/**
 * « Installation et services » (products with an installation kit): the services the site already
 * offers (installation on quote, the priced technical visit of Réglages, picked in the buy panel)
 * and the installation accessories, each added on its own.
 */
export function ArfroServices({ id, accessories, visitPrice }: { id: string; accessories: AccessoryData[]; visitPrice: number }) {
  if (!accessories.length) return null;
  const services = [
    {
      title: "Installation sur devis",
      text: "Pose par nos techniciens, chiffrée selon votre logement.",
      link: { href: "/demander-un-devis", label: "Demander un devis" },
    },
    ...(visitPrice > 0
      ? [
          {
            title: `Visite technique · ${dh(visitPrice)}`,
            text: "Avant l’installation, à cocher au moment d’ajouter l’appareil au panier.",
            link: null,
          },
        ]
      : []),
  ];

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="bleed bg-arfro-warm mt-14 scroll-mt-28 md:mt-20">
      <div className={cn("site-gutter py-14 md:py-20", PDP_SPLIT)}>
        <div className="flex flex-col gap-8">
          <div>
            <PdpEyebrow>Services</PdpEyebrow>
            <h2 id={`${id}-title`} className={ARFRO_PDP_H2}>
              Installation et services
            </h2>
          </div>
          <ul className="border-arfro-line m-0 flex list-none flex-col border-t p-0">
            {services.map((s) => (
              <li key={s.title} className="border-arfro-line flex flex-col gap-1.5 border-b py-5">
                <h3 className="m-0 text-[17px] font-bold">{s.title}</h3>
                <p className="text-arfro-muted m-0 text-[15px] leading-[1.55]">{s.text}</p>
                {s.link && (
                  <Link
                    href={s.link.href}
                    className="text-arfro-blue hover:text-arfro-blue-hover mt-1 inline-flex min-h-6 items-center self-start text-[15px] font-bold underline underline-offset-4"
                  >
                    {s.link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0">
          <h3 className="text-arfro-muted m-0 mb-2 text-[13px] font-bold tracking-[0.14em] uppercase">Pour l&apos;installation</h3>
          <ArfroInstall accessories={accessories} />
        </div>
      </div>
    </section>
  );
}
