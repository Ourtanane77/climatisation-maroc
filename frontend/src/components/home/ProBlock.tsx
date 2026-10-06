import { ButtonLink } from "@/components/ui/Button";
import { DuoIcon, IC } from "@/components/ui/icons";
import type { Phone } from "@/lib/types";

const PERKS = [
  { title: "Tarifs revendeur", text: "Prix professionnels sur tout le catalogue dès la connexion.", icon: IC.tag },
  { title: "Stock à jour", text: "Quantités disponibles dans nos deux magasins de Marrakech.", icon: IC.box },
  { title: "Commande rapide par référence", text: "Saisissez vos références et quantités, le panier se remplit.", icon: IC.list },
];

/** "Espace professionnel" block at the bottom of the home page (design `#pro`). */
export function ProBlock({ phone }: { phone: Phone | null }) {
  return (
    <section id="pro" aria-labelledby="h-esp" className="scroll-mt-24 pt-10 md:pt-14">
      <div className="bg-tint-orange-2 flex flex-col gap-10 rounded-[24px] p-6 md:p-14">
        <div className="flex flex-wrap items-start justify-between gap-6 gap-x-10">
          <div className="flex flex-col gap-2">
            <h2 id="h-esp" className="m-0 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] whitespace-nowrap md:text-[44px]">
              Espace professionnel
            </h2>
            <p className="text-ink-2 m-0 text-lg leading-7">Tarifs revendeur, stock à jour et commande rapide par référence, dans un seul espace.</p>
            {phone && (
              <a href={phone.href} className="text-ink hover:text-brand mt-2 flex flex-col self-start leading-[1.3]">
                <span className="text-muted text-sm">Projets, revendeurs et installateurs</span>
                <span className="text-xl font-semibold">{phone.display}</span>
              </a>
            )}
          </div>
          <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-4 gap-x-6 md:w-auto">
            <ButtonLink href="/devenir-revendeur" variant="orange" size="md" className="font-semibold">
              Devenir revendeur
            </ButtonLink>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PERKS.map((p) => (
            <div key={p.title} className="flex items-start gap-4">
              <span className="rounded-14 flex size-12 shrink-0 items-center justify-center bg-white">
                <DuoIcon paths={p.icon} size={26} />
              </span>
              <div>
                <h3 className="m-0 text-xl leading-7 font-semibold">{p.title}</h3>
                <p className="text-ink-2 m-0 mt-1 text-[15px] leading-6">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
