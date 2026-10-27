/** Thin line icons of the Arfro chrome (decorative: aria-hidden, the link or button carries the name). */

type Props = { size?: number; className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ArrowRightIcon = ({ size = 16, className }: Props) => (
  <svg aria-hidden focusable="false" width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export const PhoneIcon = ({ size = 16, className }: Props) => (
  <svg aria-hidden focusable="false" width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

export const UserIcon = ({ size = 22, className }: Props) => (
  <svg aria-hidden focusable="false" width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const CompareIcon = ({ size = 22, className }: Props) => (
  <svg aria-hidden focusable="false" width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
    <path d="M7 4v16M17 4v16M3 8h8M13 16h8" />
  </svg>
);

export const ChevronIcon = ({ size = 14, className }: Props) => (
  <svg aria-hidden focusable="false" width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke} strokeWidth={2}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const PlusIcon = ({ size = 18, className }: Props) => (
  <svg aria-hidden focusable="false" width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
