import Link from "next/link";
import { BTU_PER_M2, POWER_TIERS } from "@/lib/power";

/** The four wall-unit tiers of the shared sizing model (lib/power.ts): "9 000" → "jusqu’à 15 m²". */
const TIERS = POWER_TIERS.slice(0, 4).map((t) => ({
  btu: t.label.replace(/\s*BTU$/, ""),
  coverage: t.coverage.charAt(0).toLocaleLowerCase("fr") + t.coverage.slice(1),
}));

const PER_M2 = BTU_PER_M2.toLocaleString("fr-FR");

/**
 * « Quelle puissance choisir ? » (Main.dc.html): blue panel with the four tiers and the calculator
 * link. Phones get the tiers as one sentence (Mobile.dc.html).
 */
export function PowerPanel() {
  return (
    <section aria-labelledby="h-pui" className="pt-11 md:pt-[88px]">
      <div className="flex flex-col gap-3.5 rounded-[24px] bg-[#0B5CAD] px-[22px] py-7 text-white md:flex-row md:flex-wrap md:items-center md:gap-12 md:rounded-[28px] md:p-14">
        <div className="flex flex-col gap-3.5 md:flex-[1_1_380px] md:gap-4">
          <h2 id="h-pui" className="m-0 text-[26px] leading-[1.1] font-extrabold tracking-[-0.02em] md:text-[38px]">
            Quelle puissance choisir ?
          </h2>
          <p className="m-0 text-[15px] leading-[1.55] text-[#E3ECF6] md:hidden">
            Environ {PER_M2} BTU par m² : {TIERS.map((t) => `${t.btu} BTU ${t.coverage}`).join(", ")}.
          </p>
          <p className="m-0 hidden text-[17px] leading-[1.55] text-[#E3ECF6] md:block">
            Environ {PER_M2} BTU par m². Le calculateur affine selon la hauteur sous plafond, l’ensoleillement et le dernier étage.
          </p>
          <Link
            href="/calculateur-puissance"
            className="text-brand hover:text-brand-hover flex h-[50px] items-center justify-center rounded-full bg-white px-[26px] text-[15px] font-extrabold md:mt-2 md:self-start"
          >
            Calculer ma puissance
          </Link>
        </div>
        <ul className="m-0 hidden list-none grid-cols-4 gap-3 p-0 md:grid md:flex-[1_1_480px]">
          {TIERS.map((t) => (
            <li key={t.btu} className="text-ink flex flex-col gap-1.5 rounded-[20px] bg-white px-[18px] py-[22px]">
              <span className="text-[26px] font-extrabold tracking-[-0.02em]">{t.btu}</span>
              <span className="text-muted text-[13px] font-bold">BTU</span>
              <span className="border-border mt-1.5 border-t pt-2.5 text-[15px] font-bold">{t.coverage}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
