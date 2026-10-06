/**
 * Icons used across the design. Brand glyphs are inlined (the design loaded them from the
 * simpleicons CDN); the filled "MAT" paths and the two-tone line icons come from the design scripts.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number, rest: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  "aria-hidden": true as const,
  focusable: false as const,
  ...rest,
});

export function WhatsAppIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export function FacebookIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)} fill="currentColor">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)} fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)} fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

/** Filled Material paths from the design (reassurance, contact). */
export const MAT = {
  truck:
    "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
  cash: "M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z",
  verified:
    "M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z",
  phone:
    "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
} as const;

export function MatIcon({ d, size = 20, ...rest }: IconProps & { d: string }) {
  return (
    <svg {...base(size, rest)} fill="currentColor">
      <path d={d} />
    </svg>
  );
}

/** Two-tone line icon (first path brand blue, second accent orange), as in the design tiles. */
export function DuoIcon({ paths, size = 26, strokeWidth = 1.9, ...rest }: IconProps & { paths: readonly [string, string]; strokeWidth?: number }) {
  return (
    <svg {...base(size, rest)} fill="none" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[0]} stroke="#0B5CAD" />
      <path d={paths[1]} stroke="#F4731F" />
    </svg>
  );
}

const circ = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

/** Two-tone icon set from the design scripts (IC). */
export const IC = {
  snow: ["M10 13.5V5a2 2 0 0 0-4 0v8.5a4 4 0 1 0 4 0z", "M8 9v7 M18 3v8 M14.5 5l7 4 M14.5 9l7-4"],
  unit: ["M3 5h18v8H3z M6 10h12", "M7 16v3 M12 16v4 M17 16v3"],
  drop: ["M12 4c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z", "M9.5 15a2.5 2.5 0 0 0 2.5 2.5"],
  fan: [circ(12, 12, 9), "M12 12c0-4 2-6 4-6 M12 12c3.5 2 4.5 4.5 3.5 6.3 M12 12c-3.5 2-6 1.5-7-.3"],
  duct: ["M4 6h7a9 9 0 0 1 9 9v5 M4 12h7a3 3 0 0 1 3 3v5", "M4 6a1.2 3 0 0 0 0 6 M8 6v6 M12.5 6.2l-1.4 5.9 M16.6 8.4l-3.6 4.6 M19 12l-5.3 1.9"],
  coil: [circ(12, 12, 9) + " " + circ(12, 12, 5.5), circ(12, 12, 2)],
  gear: ["M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1", circ(12, 12, 3.5)],
  tag: ["M3 12V4h8l10 10-8 8z", circ(7.5, 8.5, 1.5)],
  box: ["M3 7l9-4 9 4v10l-9 4-9-4z", "M3 7l9 4 9-4 M12 11v10"],
  list: ["M8 6h13 M8 12h13 M8 18h13", "M3 6h.01 M3 12h.01 M3 18h.01"],
} as const satisfies Record<string, readonly [string, string]>;

type StrokeProps = IconProps & { strokeWidth?: number };

function Stroke({ size = 20, strokeWidth = 2.2, children, ...rest }: StrokeProps & { children: React.ReactNode }) {
  return (
    <svg {...base(size, rest)} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export const SearchIcon = (p: StrokeProps) => (
  <Stroke strokeWidth={2.4} {...p}>
    <path d="M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 1 0 0 15z M16 16l5 5" />
  </Stroke>
);
export const ChevronDownIcon = (p: StrokeProps) => (
  <Stroke strokeWidth={2.4} {...p}>
    <path d="M6 9l6 6 6-6" />
  </Stroke>
);
export const ChevronLeftIcon = (p: StrokeProps) => (
  <Stroke strokeWidth={2.4} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Stroke>
);
export const CloseIcon = (p: StrokeProps) => (
  <Stroke {...p}>
    <path d="M6 6l12 12 M18 6L6 18" />
  </Stroke>
);
export const BurgerIcon = (p: StrokeProps) => (
  <Stroke {...p}>
    <path d="M4 7h16 M4 12h16 M4 17h16" />
  </Stroke>
);
export const CartIcon = (p: StrokeProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" />
    <path d="M9 20.5a1 1 0 1 0 0.01 0 M17 20.5a1 1 0 1 0 0.01 0" />
  </Stroke>
);
export const TrashIcon = (p: StrokeProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M4 7h16 M10 11v6 M14 11v6 M6 7l1 13h10l1-13 M9 7V4h6v3" />
  </Stroke>
);
export const CheckIcon = (p: StrokeProps) => (
  <Stroke strokeWidth={2.6} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Stroke>
);
export const ClockIcon = (p: StrokeProps) => (
  <Stroke strokeWidth={2} {...p}>
    <path d="M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18z M12 7v5l3 2" />
  </Stroke>
);
export const ErrorIcon = ({ size = 18, ...rest }: IconProps) => (
  <svg {...base(size, rest)} fill="currentColor">
    <path d="M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zm-1 5h2v7h-2zm0 9h2v2h-2z" />
  </svg>
);
