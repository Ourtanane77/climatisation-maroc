import { CARD_H2, IconTile } from "@/components/leads/ui";
import { PRO_PERKS, SI } from "@/lib/leads/contacts";

/** "Votre compte revendeur" card of Devenir revendeur: the three perks as rows. */
export function PerkList() {
  return (
    <div className="rounded-24 bg-tint-blue flex flex-col gap-5 p-6">
      <h2 className={CARD_H2}>Votre compte revendeur</h2>
      {PRO_PERKS.map((p) => (
        <div key={p.title} className="flex items-start gap-3.5">
          <IconTile paths={SI[p.icon]} size={44} icon={22} radius={14} bg="bg-white" />
          <span className="flex flex-col gap-0.5">
            <span className="text-[17px] font-bold">{p.title}</span>
            <span className="text-ink-2 text-[15px] leading-[1.45]">{p.text}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
