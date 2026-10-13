import type { Phone } from "@/lib/types";

const ICON = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#0B5CAD",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * Promises strip at the bottom of the Arfro home (Main.dc.html): the facts the site already states
 * (free delivery, cash on delivery, installation on quote) and the « Conseil » phone of the
 * settings.
 */
export function Promises({ phone }: { phone: Phone | null }) {
  const items = [
    {
      title: "Livraison gratuite",
      text: "Partout au Maroc",
      icon: (
        <>
          <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" />
          <circle cx="5.5" cy="18.5" r="2" />
          <circle cx="18.5" cy="18.5" r="2" />
        </>
      ),
    },
    {
      title: "Paiement à la livraison",
      text: "Vous payez à réception",
      icon: (
        <>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 12h.01M18 12h.01" />
        </>
      ),
    },
    {
      title: "Installation",
      text: "Par nos techniciens, sur devis",
      icon: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />,
    },
    ...(phone
      ? [
          {
            title: "Conseil",
            text: (
              <a href={phone.href} className="text-muted hover:text-brand -my-3 inline-flex min-h-11 items-center">
                {phone.display}
              </a>
            ),
            icon: <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z" />,
          },
        ]
      : []),
  ];

  return (
    <section aria-label="Nos engagements" className="pt-9 md:pt-[72px]">
      <ul className="border-border m-0 grid list-none grid-cols-2 gap-x-3 gap-y-5 p-0 md:grid-cols-4 md:gap-4 md:border-t md:pt-10">
        {items.map((it) => (
          <li key={it.title} className="flex flex-col gap-2 md:flex-row md:items-start md:gap-3.5">
            <svg aria-hidden {...ICON} className="size-[26px] shrink-0 md:size-7">
              {it.icon}
            </svg>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-extrabold md:text-base">{it.title}</span>
              <span className="text-muted text-[13px] md:text-sm">{it.text}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
