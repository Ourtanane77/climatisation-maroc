import { cn } from "@/lib/cn";
import type { TimelineStep } from "@/lib/commerce/types";

/**
 * Order status timeline (design/Suivi commande.dc.html): Reçue → Confirmée → Expédiée → Livrée.
 * Horizontal 4 columns from 760 px, vertical below. Done = blue dot with ✓, active = ringed dot.
 */
export function StatusTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="m-0 grid list-none grid-cols-1 p-0 md:grid-cols-4">
      {steps.map((s, i) => {
        const done = s.state === "done";
        const active = s.state === "active";
        const last = i === steps.length - 1;
        return (
          <li key={s.key} aria-current={active ? "step" : undefined} className="flex flex-row gap-3 md:flex-col">
            <div className="flex flex-col items-center gap-2 md:flex-row">
              <span
                className={cn(
                  "box-border flex size-9 shrink-0 items-center justify-center rounded-full border-[2.5px] text-[16px] font-extrabold text-white",
                  done ? "border-brand bg-brand" : active ? "border-brand bg-white" : "border-control bg-white",
                )}
              >
                {done && "✓"}
                {active && <span className="bg-brand size-3 rounded-full" />}
              </span>
              <span
                aria-hidden
                className={cn("min-h-7 w-[3px] flex-1 rounded-[2px] md:h-[3px] md:min-h-0 md:w-auto", done ? "bg-brand" : "bg-border", last && "invisible")}
              />
            </div>
            <div className="flex flex-col gap-0.5 pt-1 pb-5 md:pt-0 md:pr-3 md:pb-0">
              <span className={cn("text-[17px]", active ? "text-ink font-extrabold" : done ? "text-ink font-bold" : "text-muted-2 font-bold")}>{s.label}</span>
              <span className={cn("text-[14px]", active ? "text-brand" : "text-muted")}>{s.date ?? "À venir"}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
