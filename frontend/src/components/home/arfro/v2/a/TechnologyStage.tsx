"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import type { TechnologyIcon } from "@/lib/home/arfro";
import type { ResolvedPhoto } from "./EnvironmentsTrack";
import { ArrowIcon, TechIcon } from "./icons";
import { reducedMotion } from "./reducedMotion";

export interface TechnologyPoint {
  icon: TechnologyIcon | null;
  title: string;
  text: string | null;
  href: string | null;
}

const two = (n: number) => String(n).padStart(2, "0");

/**
 * Hotspot geometry, in % of the stage box. Cut-out: the wall unit fills x 10–90 %, y 12–70 % of the
 * 3:1 image; dots sit on its front panel and the labels (desktop) above or below the unit, on navy.
 * Photo: dots and labels inside the frame.
 */
function geometry(count: number, cutout: boolean) {
  const [x0, x1] = cutout ? [18, 82] : [16, 84];
  return Array.from({ length: count }, (_, i) => {
    const x = count === 1 ? 50 : x0 + ((x1 - x0) * i) / (count - 1);
    const up = i % 2 === 0;
    const dot = cutout ? (up ? 32 : 44) : up ? 40 : 58;
    const label = cutout ? (up ? -18 : 124) : up ? 14 : 84;
    return { x, dot, label, up };
  });
}

/** Cool air leaving the louvre and spreading into the room (drawn from the unit, cut-out only). */
const FLOW_STARTS = [70, 180, 290, 400, 510, 620, 730];

function flowPath(x0: number): string {
  const spread = (x0 - 400) * 0.55;
  const x1 = x0 + spread;
  return `M${x0} 0 C ${x0 + spread * 0.15} 70, ${x0 + spread * 0.6 - 18} 150, ${x0 + spread * 0.75} 210 S ${x1 + 14} 280, ${x1} 320`;
}

function UnitAirflow({ activeX }: { activeX: number | null }) {
  const ref = useRef<SVGSVGElement>(null);
  const gradient = useId().replace(/:/g, "");
  useEffect(() => {
    const svg = ref.current;
    if (!svg || reducedMotion() || typeof IntersectionObserver === "undefined") return;
    let anims: Animation[] = [];
    const io = new IntersectionObserver((entries) => {
      const visible = entries.some((e) => e.isIntersecting);
      if (visible && anims.length === 0) {
        anims = Array.from(svg.querySelectorAll("path"))
          .map((p, i) =>
            typeof p.animate === "function"
              ? p.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: -40 }], { duration: 1500 + i * 90, iterations: Infinity, easing: "linear" })
              : null,
          )
          .filter((a): a is Animation => a !== null);
      } else if (!visible) {
        anims.forEach((a) => a.cancel());
        anims = [];
      }
    });
    io.observe(svg);
    return () => {
      io.disconnect();
      anims.forEach((a) => a.cancel());
    };
  }, []);
  // Nearest stream to the selected hotspot is brighter (x in % of the box; the louvre spans ~15–85 %).
  const nearest =
    activeX === null
      ? -1
      : FLOW_STARTS.reduce((best, x, i) => (Math.abs(15 + (x / 800) * 70 - activeX) < Math.abs(15 + (FLOW_STARTS[best] / 800) * 70 - activeX) ? i : best), 0);
  return (
    <svg
      ref={ref}
      aria-hidden
      focusable="false"
      viewBox="0 0 800 320"
      preserveAspectRatio="none"
      fill="none"
      className="pointer-events-none absolute top-[60%] left-[13%] h-[85%] w-[74%]"
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--color-arfro-sky)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--color-arfro-sky)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {FLOW_STARTS.map((x, i) => (
        <path
          key={x}
          d={flowPath(x)}
          stroke={`url(#${gradient})`}
          strokeWidth={i === nearest ? 1.75 : 1.1}
          strokeLinecap="round"
          strokeDasharray="8 12"
          opacity={i === nearest ? 1 : 0.5}
          className="transition-opacity duration-500"
        />
      ))}
    </svg>
  );
}

/**
 * Section 04 stage: the product (photo or cut-out), one hotspot per real item (buttons with
 * aria-expanded, arrow keys move between them), the airflow drawn from the unit, and the detail of
 * the selected item. Every item's text is in the server HTML (inactive ones `hidden`).
 */
export function TechnologyStage({ items, photo, cutout, alt }: { items: TechnologyPoint[]; photo: ResolvedPhoto | null; cutout: boolean; alt: string }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const first = useRef(true);
  const geo = geometry(items.length, cutout && photo !== null);
  const showStage = photo !== null;

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const panel = panels.current[active];
    if (!panel || reducedMotion() || typeof panel.animate !== "function") return;
    panel.animate(
      [
        { opacity: 0, transform: "translateY(10px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 450, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, [active]);

  const select = (i: number, focus = false) => {
    const next = (i + items.length) % items.length;
    setActive(next);
    if (focus) buttons.current[next]?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const moves: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: items.length - 1 };
    if (e.key in moves) {
      e.preventDefault();
      select(moves[e.key], true);
    }
  };

  const panelId = (i: number) => `${baseId}-panel-${i}`;
  const buttonId = (i: number) => `${baseId}-spot-${i}`;

  const spots = !showStage
    ? null
    : items.map((item, i) => {
        const g = geo[i];
        const on = i === active;
        const style = { "--x": `${g.x}%`, "--dot": `${g.dot}%`, "--label": `${g.label}%` } as CSSProperties;
        return (
          <button
            key={i}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            id={buttonId(i)}
            type="button"
            aria-expanded={on}
            aria-controls={panelId(i)}
            onClick={() => select(i)}
            onKeyDown={(e) => onKey(e, i)}
            style={style}
            className={cn(
              "group/spot absolute left-[var(--x)] z-10 flex size-11 -translate-x-1/2 items-center justify-center outline-none",
              "top-[var(--dot)] -translate-y-1/2 lg:w-auto lg:translate-y-0 lg:justify-between",
              g.up
                ? "lg:top-[var(--label)] lg:h-[calc(var(--dot)-var(--label)+22px)] lg:flex-col"
                : "lg:top-[calc(var(--dot)-22px)] lg:h-[calc(var(--label)-var(--dot)+22px)] lg:flex-col-reverse",
            )}
          >
            <span
              className={cn(
                "sr-only text-[12px] font-bold tracking-[0.14em] whitespace-nowrap uppercase transition-colors duration-300 lg:not-sr-only",
                on ? "text-white" : "text-arfro-on-navy group-hover/spot:text-white",
                !cutout && "[text-shadow:0_1px_8px_rgb(16_28_48/0.7)]",
              )}
            >
              {item.title}
            </span>
            <span aria-hidden className={cn("hidden w-px flex-1 transition-colors duration-300 lg:block", on ? "bg-arfro-sky" : "bg-white/25")} />
            <span aria-hidden className="relative flex size-11 shrink-0 items-center justify-center">
              {on ? <span className="bg-arfro-sky/25 absolute size-7 rounded-full motion-safe:animate-ping motion-safe:[animation-duration:2.4s]" /> : null}
              <span
                className={cn(
                  "relative block size-3.5 rounded-full ring-2 transition-[background-color,box-shadow,transform] duration-300 group-hover/spot:scale-125 group-focus-visible/spot:outline-2 group-focus-visible/spot:outline-offset-4 group-focus-visible/spot:outline-white",
                  on ? "bg-arfro-sky ring-arfro-sky/40" : cutout ? "bg-arfro-navy ring-arfro-navy/20" : "bg-white ring-white/40",
                )}
              />
            </span>
          </button>
        );
      });

  return (
    <div className="relative">
      {showStage ? (
        cutout ? (
          <div className="relative mx-auto mt-16 mb-24 max-w-[1120px] lg:mt-28 lg:mb-40">
            <div className="relative aspect-[3/1]">
              <UnitAirflow activeX={geo[active]?.x ?? null} />
              {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized renditions (resolveArfroImage) */}
              <img
                src={photo.src}
                srcSet={photo.srcSet}
                sizes={photo.srcSet ? "(min-width: 1200px) 1120px, 100vw" : undefined}
                width={photo.width}
                height={photo.height}
                alt={alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-contain"
              />
              {spots}
            </div>
          </div>
        ) : (
          <div className="rounded-arfro-md relative mt-14 aspect-[4/3] overflow-hidden md:mt-20 md:aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized renditions (resolveArfroImage) */}
            <img
              src={photo.src}
              srcSet={photo.srcSet}
              sizes={photo.srcSet ? "100vw" : undefined}
              width={photo.width}
              height={photo.height}
              alt={alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <div aria-hidden className="bg-arfro-navy/25 absolute inset-0" />
            {spots}
          </div>
        )
      ) : null}

      <div className={cn("border-arfro-line-dark grid gap-8 border-t pt-8 lg:grid-cols-12", showStage ? "mt-10" : "mt-14 md:mt-20")}>
        <div className="flex items-center justify-between gap-6 lg:col-span-3 lg:flex-col lg:items-start lg:justify-start">
          <p className="m-0 text-[12px] font-bold tracking-[0.18em] text-white tabular-nums">
            {two(active + 1)} <span className="text-arfro-on-navy">/ {two(items.length)}</span>
          </p>
          {items.length > 1 ? (
            <div className="flex gap-2">
              {(
                [
                  [-1, "Point précédent", "left"],
                  [1, "Point suivant", "right"],
                ] as const
              ).map(([dir, label, direction]) => (
                <button
                  key={dir}
                  type="button"
                  aria-label={label}
                  onClick={() => select(active + dir)}
                  className="rounded-arfro-sm inline-flex size-11 items-center justify-center border border-white/25 text-white transition-colors duration-300 hover:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <ArrowIcon direction={direction} />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-8 lg:col-start-5">
          {!showStage ? (
            // No product visual: the hotspots become a plain row of the items.
            <div className="mb-10 flex flex-wrap gap-2">
              {items.map((item, i) => (
                <button
                  key={i}
                  ref={(el) => {
                    buttons.current[i] = el;
                  }}
                  id={buttonId(i)}
                  type="button"
                  aria-expanded={i === active}
                  aria-controls={panelId(i)}
                  onClick={() => select(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={cn(
                    "rounded-arfro-sm inline-flex h-11 items-center gap-2.5 border px-4 text-[14px] font-bold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                    i === active ? "border-arfro-sky text-white" : "border-arfro-line-dark text-arfro-on-navy hover:text-white",
                  )}
                >
                  <TechIcon icon={item.icon} className="size-5" />
                  {item.title}
                </button>
              ))}
            </div>
          ) : null}
          {items.map((item, i) => (
            <div
              key={i}
              id={panelId(i)}
              ref={(el) => {
                panels.current[i] = el;
              }}
              role="region"
              aria-labelledby={buttonId(i)}
              hidden={i !== active}
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
                <span className="rounded-arfro-sm border-arfro-line-dark text-arfro-sky flex size-14 shrink-0 items-center justify-center border">
                  <TechIcon icon={item.icon} className="size-7" />
                </span>
                <div>
                  <h3 className="font-arfro m-0 text-[clamp(26px,2.8vw,40px)] leading-[1.1] font-extrabold tracking-[-0.02em] text-white">{item.title}</h3>
                  {item.text ? <p className="text-arfro-on-navy m-0 mt-4 max-w-[58ch] text-[17px] leading-[1.6] md:text-[18px]">{item.text}</p> : null}
                  {item.href ? (
                    <Link href={item.href} className="arfro-link text-arfro-sky mt-6 inline-flex items-center gap-2.5 text-[15px] font-bold hover:text-white">
                      En savoir plus
                      <span className="sr-only"> : {item.title}</span>
                      <ArrowIcon />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
