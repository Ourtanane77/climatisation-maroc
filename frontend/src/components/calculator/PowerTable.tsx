import { cn } from "@/lib/cn";
import { POWER_TIERS } from "@/lib/power";

/**
 * "Tableau des puissances" (calculator page and article): the five tiers with their surface; the
 * row of the current result is highlighted.
 */
export function PowerTable({
  active,
  surfaceHeader = "Surface",
  ring = false,
}: {
  active?: number | null;
  surfaceHeader?: string;
  /** Article variant: thin outer ring and no-wrap row headers. */
  ring?: boolean;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[20px] bg-white", ring && "shadow-[0_0_0_1px_#E6EBF0]")}>
      <table className="w-full border-collapse text-[17px]">
        <thead>
          <tr className="bg-bg">
            <th scope="col" className="text-ink-2 px-5 py-3.5 text-left text-[15px] font-bold">
              Puissance
            </th>
            <th scope="col" className="text-ink-2 px-5 py-3.5 text-left text-[15px] font-bold">
              {surfaceHeader}
            </th>
          </tr>
        </thead>
        <tbody>
          {POWER_TIERS.map((t, i) => (
            <tr key={t.btu} className={cn("border-divider border-t", i === active ? "bg-tint-blue" : "bg-white")} aria-current={i === active || undefined}>
              <th scope="row" className={cn("px-5 py-3.5 text-left font-extrabold", ring && "whitespace-nowrap")}>
                {t.label}
              </th>
              <td className="px-5 py-3.5">{t.coverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
