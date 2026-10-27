"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AirflowLines } from "@/components/arfro/AirflowLines";
import { cn } from "@/lib/cn";
import type { EnvironmentKey } from "@/lib/home/arfro";
import { ArrowIcon } from "./icons";
import { reducedMotion } from "./reducedMotion";

export interface ResolvedPhoto {
  src: string;
  srcSet?: string;
  width?: number;
  height?: number;
}

export interface EnvironmentPanel {
  key: EnvironmentKey | null;
  title: string;
  text: string | null;
  href: string | null;
  ctaLabel: string | null;
  photo: ResolvedPhoto | null;
}

type Tone = "navy" | "warm" | "white";

/** Tonal panel of an environment without a photo: strong, typographic, never a broken image. */
const KEY_TONE: Record<EnvironmentKey, Tone> = {
  maison: "warm",
  bureaux: "navy",
  hotellerie: "navy",
  restauration: "warm",
  commerce: "navy",
  autre: "white",
};

const TONE_CLASS: Record<Tone, string> = {
  navy: "bg-arfro-navy text-white",
  warm: "bg-arfro-warm text-arfro-graphite",
  white: "bg-white text-arfro-graphite",
};

function toneOf(panel: EnvironmentPanel, index: number): Tone {
  return panel.key ? KEY_TONE[panel.key] : index % 2 ? "warm" : "navy";
}

const two = (n: number) => String(n).padStart(2, "0");

/*
 * Text and CTA are always visible (content is never hover-only); hover or keyboard focus only adds
 * the photo zoom and the CTA arrow nudge, both without motion under prefers-reduced-motion.
 */

function Panel({ panel, index, total }: { panel: EnvironmentPanel; index: number; total: number }) {
  const textId = useId();
  const tone = toneOf(panel, index);
  const onPhoto = panel.photo !== null;
  const dark = onPhoto || tone === "navy";
  const linked = panel.href !== null;
  const cta = panel.ctaLabel ?? "Découvrir";

  return (
    <article
      className={cn(
        "group rounded-arfro-md relative isolate flex h-[min(74svh,620px)] flex-col justify-end overflow-hidden md:h-[min(76vh,700px)]",
        onPhoto ? "bg-arfro-navy text-white" : TONE_CLASS[tone],
      )}
    >
      {panel.photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized renditions (resolveArfroImage) */}
          <img
            src={panel.photo.src}
            srcSet={panel.photo.srcSet}
            sizes={panel.photo.srcSet ? "(min-width: 1024px) 44vw, 86vw" : undefined}
            width={panel.photo.width}
            height={panel.photo.height}
            alt={panel.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-arfro)] group-focus-within:scale-[1.045] group-hover:scale-[1.045] motion-reduce:transition-none"
          />
          <div aria-hidden className="from-arfro-navy/90 via-arfro-navy/25 absolute inset-0 -z-10 bg-linear-to-t to-transparent" />
        </>
      ) : (
        <>
          {/* Watermark number: CSS-generated content, pure decoration (no text node for screen readers or contrast checks). */}
          <span
            aria-hidden
            data-num={two(index + 1)}
            className={cn(
              "font-arfro absolute top-4 right-5 -z-10 text-[clamp(120px,16vw,240px)] leading-none font-extralight tracking-[-0.06em] before:content-[attr(data-num)] md:top-6 md:right-8",
              dark ? "text-white/[0.07]" : "text-arfro-graphite/[0.06]",
            )}
          />
          <AirflowLines variant="divider" className="absolute inset-x-0 top-[38%] -z-10 h-24 w-full" />
        </>
      )}

      <div className="p-6 md:p-10">
        <p aria-hidden className={cn("m-0 mb-4 text-[12px] font-bold tracking-[0.18em] tabular-nums", dark ? "text-white/85" : "text-arfro-graphite/80")}>
          {two(index + 1)} <span className={dark ? "text-white/65" : "text-arfro-muted"}>/ {two(total)}</span>
        </p>
        <h3 className="font-arfro m-0 text-[clamp(32px,3.6vw,56px)] leading-[1.02] font-extrabold tracking-[-0.03em]">
          {linked ? (
            <Link
              href={panel.href!}
              aria-describedby={panel.text ? textId : undefined}
              className={cn(
                "after:rounded-arfro-md outline-none after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-4",
                dark
                  ? "text-white hover:text-white focus-visible:after:outline-white"
                  : "text-arfro-graphite hover:text-arfro-graphite focus-visible:after:outline-arfro-blue",
              )}
            >
              {panel.title}
            </Link>
          ) : (
            panel.title
          )}
        </h3>
        <div className="mt-4 max-w-[34ch]">
          {panel.text ? (
            <p id={textId} className={cn("m-0 text-[16px] leading-[1.55] md:text-[18px]", dark ? "text-white/80" : "text-arfro-graphite/80")}>
              {panel.text}
            </p>
          ) : null}
          {linked ? (
            <span aria-hidden className={cn("mt-6 inline-flex items-center gap-2.5 text-[15px] font-bold", dark ? "text-white" : "text-arfro-blue")}>
              {cta}
              <ArrowIcon className="transition-transform duration-500 ease-[var(--ease-arfro)] group-focus-within:translate-x-1 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-focus-within:translate-x-0 motion-reduce:group-hover:translate-x-0" />
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/**
 * Horizontal editorial track of the environments: large panels on one line, native scroll with
 * snap (swipe on phones, trackpad / arrows / keyboard focus on desktop), previous / next buttons and
 * a visible progress line. Server HTML is complete and usable without JavaScript.
 */
export function EnvironmentsTrack({ items, header, labelledBy }: { items: EnvironmentPanel[]; header: ReactNode; labelledBy: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const trackId = useId();
  const [current, setCurrent] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: items.length <= 1 });

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const progress = max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 1;
    if (barRef.current) barRef.current.style.transform = `scaleX(${(1 / items.length + progress * (1 - 1 / items.length)).toFixed(4)})`;
    const first = el.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth : el.clientWidth;
    const index = progress >= 0.999 ? items.length - 1 : Math.round(el.scrollLeft / Math.max(1, step));
    setCurrent(Math.min(items.length - 1, Math.max(0, index)));
    setEdges({ start: el.scrollLeft <= 2, end: max <= 2 || el.scrollLeft >= max - 2 });
  }, [items.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          measure();
        });
    };
    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [measure]);

  const go = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el || typeof el.scrollBy !== "function") return;
    const first = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * ((first?.offsetWidth ?? el.clientWidth) + gap), behavior: reducedMotion() ? "auto" : "smooth" });
  };

  const navButton =
    "inline-flex size-12 items-center justify-center rounded-arfro-sm border border-arfro-graphite/25 text-arfro-graphite transition-colors duration-300 hover:border-arfro-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arfro-blue disabled:cursor-default disabled:opacity-35 disabled:hover:border-arfro-graphite/25";

  return (
    <div>
      <div className="site-gutter flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[820px]">{header}</div>
        {items.length > 1 ? (
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <button type="button" className={navButton} aria-controls={trackId} aria-label="Espace précédent" disabled={edges.start} onClick={() => go(-1)}>
              <ArrowIcon direction="left" />
            </button>
            <button type="button" className={navButton} aria-controls={trackId} aria-label="Espace suivant" disabled={edges.end} onClick={() => go(1)}>
              <ArrowIcon />
            </button>
          </div>
        ) : null}
      </div>

      <ul
        ref={trackRef}
        id={trackId}
        aria-labelledby={labelledBy}
        className="mt-10 flex snap-x snap-mandatory scroll-px-[max(var(--site-gutter),calc((100%_-_var(--site-max))/2))] [scrollbar-width:none] gap-3 overflow-x-auto overscroll-x-contain px-[max(var(--site-gutter),calc((100%_-_var(--site-max))/2))] md:mt-14 md:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((panel, i) => (
          <li key={`${panel.key ?? "env"}-${i}`} className="w-[86vw] shrink-0 snap-start sm:w-[62vw] lg:w-[min(42vw,620px)]">
            <Panel panel={panel} index={i} total={items.length} />
          </li>
        ))}
      </ul>

      {items.length > 1 ? (
        <div className="site-gutter mt-8 flex items-center gap-5">
          <span className="text-arfro-graphite text-[12px] font-bold tracking-[0.18em] tabular-nums" aria-live="polite" aria-atomic="true">
            <span className="sr-only">Espace </span>
            {two(current + 1)}
            <span className="text-arfro-muted"> / {two(items.length)}</span>
          </span>
          <span aria-hidden className="bg-arfro-graphite/15 relative h-px flex-1 overflow-hidden">
            <span
              ref={barRef}
              className="bg-arfro-graphite absolute inset-0 origin-left transition-transform duration-200 ease-out motion-reduce:transition-none"
              style={{ transform: `scaleX(${(1 / items.length).toFixed(4)})` }}
            />
          </span>
        </div>
      ) : null}
    </div>
  );
}
