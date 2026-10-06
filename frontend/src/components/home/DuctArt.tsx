/**
 * Flexible duct drawing of the "Gaines circulaires" rail (design `duct(d, f)`): a curved ribbed
 * pipe whose thickness follows the diameter; souple (grey ribs), calorifugé (insulated jacket) or
 * aluminium.
 */
export function DuctArt({ diameter, kind }: { diameter: number; kind: "souple" | "calo" | "alu" }) {
  const sw = 18 + diameter * 0.17;
  const path = "M30 112C80 112 92 56 150 56S206 80 222 80";
  const body = kind === "alu" ? "#C5CCD3" : kind === "calo" ? "#F2F4F6" : "#D6DCE2";
  const rib = kind === "alu" ? "#E9EDF0" : kind === "calo" ? "#D9DFE5" : "#BAC4CD";
  const er = (kind === "calo" ? sw + 16 : sw) / 2;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <svg
        viewBox="0 0 260 170"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        className="block h-auto max-h-[calc(100%_-_14px)] min-h-0 w-full flex-[0_1_auto]"
      >
        {kind === "calo" && <path d={path} stroke="#E3E8ED" strokeWidth={sw + 16} fill="none" strokeLinecap="butt" />}
        <path d={path} stroke={body} strokeWidth={sw} fill="none" strokeLinecap="butt" />
        <path d={path} stroke={rib} strokeWidth={sw} fill="none" strokeDasharray="2.5 7" />
        <ellipse cx={224} cy={80} rx={er * 0.34} ry={er} fill={kind === "calo" ? "#E3E8ED" : body} />
        <ellipse cx={225} cy={80} rx={sw * 0.13} ry={sw * 0.4} fill={kind === "alu" ? "#8E99A4" : "#5E6B78"} />
        {kind === "calo" && <ellipse cx={225} cy={80} rx={sw * 0.2} ry={sw * 0.5} fill="none" stroke="#C5CCD3" strokeWidth={3} />}
      </svg>
      <div className="mt-1 h-2.5 w-[60%] shrink-0 rounded-[50%] bg-[rgba(14,40,70,0.18)] blur-[7px]" />
    </div>
  );
}
