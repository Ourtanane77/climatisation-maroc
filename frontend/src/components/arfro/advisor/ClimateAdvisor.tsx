"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import type { AdvisorCity } from "@/lib/advisor/cities";
import { AREA_MAX, AREA_MIN, OCCUPANTS_MAX, OCCUPANTS_MIN, clampArea, climateZone, computeAdvice } from "@/lib/advisor/model";
import { CEILING_CHOICES, HEAT_CHOICES, INSULATION_CHOICES, ROOM_CHOICES, SUN_CHOICES, choiceLabel, type Choice } from "@/lib/advisor/options";
import type { AdvisorCatalog } from "@/lib/advisor/products";
import { INITIAL_STATE, RESULT_STEP, STEP_COUNT, answersOf, canAdvance, clearState, loadState, saveState, type AdvisorState } from "@/lib/advisor/state";
import { AdvisorResult } from "./AdvisorResult";
import { ChoiceGroup, CheckGroup, Legend, Stepper } from "./controls";

const STEPS = ["Pièce", "Superficie", "Ville", "Détails", "Solution"] as const;

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

/** Progress: numbered steps, the current one marked for assistive technologies. */
function Progress({ step, onJump }: { step: number; onJump: (step: number) => void }) {
  return (
    <nav aria-label="Étapes du conseil">
      <ol className="m-0 grid list-none grid-cols-5 gap-1.5 p-0">
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          const content = (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  "block h-[3px] w-full transition-colors duration-300 motion-reduce:transition-none",
                  done || current ? "bg-arfro-blue" : "bg-arfro-line",
                )}
              />
              <span className="mt-2.5 flex items-baseline gap-1.5 text-[12px] font-bold tracking-[0.04em]">
                <span className={cn("tabular-nums", current ? "text-arfro-blue" : "text-arfro-muted")}>{String(i + 1).padStart(2, "0")}</span>
                <span className={cn("max-sm:sr-only", current ? "text-arfro-graphite" : "text-arfro-muted")}>{label}</span>
              </span>
            </>
          );
          return (
            <li key={label} aria-current={current ? "step" : undefined}>
              {done ? (
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  className="block w-full cursor-pointer border-0 bg-transparent p-0 text-left hover:opacity-80"
                  aria-label={`Revenir à l’étape ${i + 1} : ${label}`}
                >
                  {content}
                </button>
              ) : (
                <span className="block">{content}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Summary of the answers given so far (desktop side column). */
function Summary({ state, cities }: { state: AdvisorState; cities: AdvisorCity[] }) {
  const rows: [string, string][] = [
    ["Pièce", choiceLabel(ROOM_CHOICES as Choice<string>[], state.room)],
    ["Superficie", state.step > 1 ? `${state.area} m²` : ""],
    ["Ville", cities.find((c) => c.slug === state.city)?.name ?? ""],
    ["Plafond", state.step > 3 ? choiceLabel(CEILING_CHOICES as Choice<string>[], state.ceiling) : ""],
  ];
  return (
    <dl className="border-arfro-line m-0 border-t text-[15px]">
      {rows.map(([k, v]) => (
        <div key={k} className="border-arfro-line flex justify-between gap-4 border-b py-3">
          <dt className="text-arfro-muted">{k}</dt>
          <dd className="text-arfro-graphite m-0 font-bold">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Climate advisor (« Le bon climatiseur. Pour le bon espace. »): a five-step consultation, pièce →
 * superficie → ville → détails → solution. The logic lives in lib/advisor; the progress is kept in
 * sessionStorage. Without JavaScript the first step shows (the section stays readable).
 */
export function ClimateAdvisor({ cities, catalog }: { cities: AdvisorCity[]; catalog: AdvisorCatalog }) {
  const uid = useId();
  const [state, setState] = useState<AdvisorState>(INITIAL_STATE);
  const [areaText, setAreaText] = useState(String(INITIAL_STATE.area));
  const [announce, setAnnounce] = useState("");
  const loaded = useRef(false);
  const navigated = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const slugs = cities.map((c) => c.slug).join(",");

  // Restore after hydration (the server renders the first step).
  // Read in a microtask (still before paint) so the restore is one batched update after hydration.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const restored = loadState(slugs.split(","));
      setState(restored);
      setAreaText(String(restored.area));
      loaded.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [slugs]);

  useEffect(() => {
    if (loaded.current) saveState(state);
  }, [state]);

  // Step change after a visitor action: focus the new step's heading, announce it, animate in.
  useIsoLayoutEffect(() => {
    if (!navigated.current) return;
    navigated.current = false;
    const el = panel.current;
    if (!el) return;
    el.querySelector<HTMLElement>("[data-step-focus]")?.focus({ preventScroll: true });
    const rect = top.current?.getBoundingClientRect();
    if (rect && rect.top < 0) top.current?.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
    if (reducedMotion()) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    el.style.transition = "none";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 420ms var(--ease-arfro), transform 420ms var(--ease-arfro)";
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }, [state.step]);

  const update = (patch: Partial<AdvisorState>) => setState((s) => ({ ...s, ...patch }));

  const go = (step: number) => {
    navigated.current = true;
    const next = Math.max(0, Math.min(RESULT_STEP, step));
    setState((s) => ({ ...s, step: next }));
    if (next === RESULT_STEP) {
      const answers = answersOf(state);
      const advice = answers && computeAdvice(answers);
      setAnnounce(advice ? `Recommandation prête : ${advice.size ? `${advice.size.toLocaleString("fr-FR")} BTU` : "plus de 60 000 BTU"}.` : "");
    } else {
      setAnnounce(`Étape ${next + 1} sur ${STEP_COUNT} : ${STEPS[next]}.`);
    }
  };

  const areaValid = (() => {
    const n = Number(areaText.replace(",", "."));
    return areaText.trim() !== "" && Number.isFinite(n) && n >= AREA_MIN && n <= AREA_MAX;
  })();
  const ready = canAdvance(state) && (state.step !== 1 || areaValid);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (state.step === 1 && areaValid) update({ area: clampArea(Number(areaText.replace(",", "."))) });
    if (ready) go(state.step + 1);
  };

  const restart = () => {
    clearState();
    navigated.current = true;
    setState(INITIAL_STATE);
    setAreaText(String(INITIAL_STATE.area));
    setAnnounce(`Nouveau conseil. Étape 1 sur ${STEP_COUNT} : ${STEPS[0]}.`);
  };

  const answers = answersOf(state);
  const city = cities.find((c) => c.slug === state.city);
  const headingId = `${uid}-step`;
  const areaId = `${uid}-area`;
  const areaError = `${uid}-area-error`;

  return (
    <div ref={top} className="scroll-mt-24">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announce}
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form noValidate onSubmit={submit} className="rounded-arfro-md border-arfro-line min-w-0 border bg-white" aria-label="Conseil climatisation">
          <div className="border-arfro-line border-b px-5 pt-5 pb-4 md:px-8 md:pt-7">
            <Progress step={state.step} onJump={go} />
          </div>

          <div ref={panel} className="px-5 py-7 md:px-8 md:py-9">
            {/* The heading that receives focus on each step change. */}
            {state.step < RESULT_STEP && (
              <h3
                id={headingId}
                data-step-focus
                tabIndex={-1}
                className="text-arfro-blue m-0 mb-6 text-[12px] font-bold tracking-[0.18em] uppercase outline-none md:text-[13px]"
              >
                Étape {state.step + 1} sur {STEP_COUNT} · {STEPS[state.step]}
              </h3>
            )}

            {state.step === 0 && (
              <ChoiceGroup
                name={`${uid}-room`}
                legend="Quel espace souhaitez-vous climatiser ?"
                choices={ROOM_CHOICES}
                value={state.room}
                onChange={(room) => update({ room })}
                columns="sm:grid-cols-3"
                index
              />
            )}

            {state.step === 1 && (
              <fieldset className="m-0 min-w-0 border-0 p-0">
                <Legend hint="Longueur × largeur de la pièce. Pour un espace en L, additionnez les deux parties.">Quelle est sa superficie ?</Legend>
                <div className="flex flex-col gap-6">
                  <div className="flex items-end gap-3">
                    <label htmlFor={areaId} className="sr-only">
                      Superficie en m², de {AREA_MIN} à {AREA_MAX}
                    </label>
                    <input
                      id={areaId}
                      type="number"
                      inputMode="numeric"
                      min={AREA_MIN}
                      max={AREA_MAX}
                      step={1}
                      value={areaText}
                      aria-invalid={!areaValid}
                      aria-describedby={areaValid ? undefined : areaError}
                      onChange={(e) => {
                        setAreaText(e.target.value);
                        const n = Number(e.target.value);
                        if (e.target.value !== "" && n >= AREA_MIN && n <= AREA_MAX) update({ area: clampArea(n) });
                      }}
                      onBlur={() => {
                        if (areaValid) setAreaText(String(clampArea(Number(areaText.replace(",", ".")))));
                      }}
                      className={cn(
                        "font-arfro text-arfro-graphite rounded-arfro-sm focus-visible:outline-arfro-blue h-[76px] w-[150px] [appearance:textfield] border bg-white px-4 text-[44px] font-extrabold tracking-[-0.03em] tabular-nums outline-none focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                        areaValid ? "border-arfro-line" : "border-red-700",
                      )}
                    />
                    <span aria-hidden="true" className="font-arfro text-arfro-muted pb-3 text-[22px] font-bold">
                      m²
                    </span>
                  </div>
                  {!areaValid && (
                    <p id={areaError} className="m-0 text-[15px] font-semibold text-red-700">
                      Indiquez une superficie entre {AREA_MIN} et {AREA_MAX}
                      {" "}m².
                    </p>
                  )}
                  <div>
                    <input
                      type="range"
                      min={AREA_MIN}
                      max={AREA_MAX}
                      step={1}
                      value={state.area}
                      aria-label="Superficie en m²"
                      aria-valuetext={`${state.area} m²`}
                      onChange={(e) => {
                        const area = clampArea(Number(e.target.value));
                        update({ area });
                        setAreaText(String(area));
                      }}
                      className="accent-arfro-blue h-10 w-full cursor-pointer"
                    />
                    <div className="text-arfro-muted flex justify-between text-[13px] tabular-nums" aria-hidden="true">
                      <span>{AREA_MIN} m²</span>
                      <span>{AREA_MAX} m²</span>
                    </div>
                  </div>
                  {state.area > 60 && areaValid && (
                    <p className="text-arfro-graphite/80 border-arfro-blue m-0 border-l-2 pl-3 text-[15px] leading-relaxed">
                      Au-delà de 60 m², nous vous conseillerons une visite technique pour dimensionner l’installation.
                    </p>
                  )}
                </div>
              </fieldset>
            )}

            {state.step === 2 && (
              <div className="flex flex-col gap-5">
                <ChoiceGroup
                  name={`${uid}-city`}
                  legend="Dans quelle ville ?"
                  hint="Le climat change le besoin : les étés sont plus doux sur le littoral qu’à l’intérieur du pays."
                  choices={cities.map((c) => ({ value: c.slug, label: c.name }))}
                  value={state.city}
                  onChange={(c) => update({ city: c })}
                  columns="sm:grid-cols-3 lg:grid-cols-4"
                />
                {city && (
                  <p className="text-arfro-graphite/80 border-arfro-blue m-0 border-l-2 pl-3 text-[15px] leading-relaxed">
                    {climateZone(city.slug) === "littoral"
                      ? `${city.name} : climat du littoral, besoin réduit de 10 %.`
                      : `${city.name} : nous gardons la règle de base, prévue pour les étés chauds de l’intérieur.`}
                  </p>
                )}
              </div>
            )}

            {state.step === 3 && (
              <div className="flex flex-col gap-10">
                <ChoiceGroup
                  name={`${uid}-ceiling`}
                  legend="Hauteur sous plafond"
                  choices={CEILING_CHOICES}
                  value={state.ceiling}
                  onChange={(ceiling) => update({ ceiling })}
                />
                <ChoiceGroup name={`${uid}-sun`} legend="Exposition au soleil" choices={SUN_CHOICES} value={state.sun} onChange={(sun) => update({ sun })} />
                <ChoiceGroup
                  name={`${uid}-insulation`}
                  legend="Isolation"
                  choices={INSULATION_CHOICES}
                  value={state.insulation}
                  onChange={(insulation) => update({ insulation })}
                />
                <Stepper
                  id={`${uid}-occupants`}
                  label="Occupants"
                  hint="Personnes présentes en même temps, habituellement."
                  value={state.occupants}
                  min={OCCUPANTS_MIN}
                  max={OCCUPANTS_MAX}
                  onChange={(occupants) => update({ occupants })}
                />
                <CheckGroup
                  legend="Sources de chaleur"
                  hint="Facultatif : cochez ce qui se trouve dans la pièce."
                  choices={HEAT_CHOICES}
                  values={state.heat}
                  onChange={(heat) => update({ heat })}
                />
              </div>
            )}

            {state.step === RESULT_STEP && answers && (
              <div data-step-focus tabIndex={-1} className="outline-none">
                <AdvisorResult answers={answers} advice={computeAdvice(answers)} catalog={catalog} cityName={city?.name ?? ""} headingId={headingId} />
              </div>
            )}
          </div>

          <div className="border-arfro-line flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 md:px-8">
            {state.step > 0 ? (
              <button
                type="button"
                onClick={() => go(state.step === RESULT_STEP ? 3 : state.step - 1)}
                className="text-arfro-graphite hover:text-arfro-blue inline-flex h-12 cursor-pointer items-center gap-2 border-0 bg-transparent px-1 text-[15px] font-bold"
              >
                <span aria-hidden="true">←</span> {state.step === RESULT_STEP ? "Modifier mes réponses" : "Retour"}
              </button>
            ) : (
              <span />
            )}
            {state.step < RESULT_STEP ? (
              <button
                type="submit"
                disabled={!ready}
                className="bg-arfro-blue hover:bg-arfro-blue-hover rounded-arfro-sm inline-flex h-[52px] cursor-pointer items-center gap-2.5 border-0 px-7 text-[15px] font-bold text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
              >
                {state.step === 3 ? "Voir ma recommandation" : "Continuer"} <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={restart}
                className="border-arfro-graphite/30 hover:border-arfro-graphite text-arfro-graphite rounded-arfro-sm inline-flex h-[52px] cursor-pointer items-center border bg-transparent px-7 text-[15px] font-bold"
              >
                Recommencer
              </button>
            )}
          </div>
        </form>

        <aside className="hidden lg:block" aria-label="Vos réponses">
          <div className="sticky top-28 flex flex-col gap-5">
            <p className="text-arfro-muted m-0 text-[12px] font-bold tracking-[0.18em] uppercase">Votre espace</p>
            <Summary state={state} cities={cities} />
            <p className="text-arfro-muted m-0 text-[13px] leading-relaxed">
              Estimation indicative fondée sur des règles simples et visibles. Elle ne remplace pas une étude thermique.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
