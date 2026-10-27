"use client";

import Link from "next/link";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { cn } from "@/lib/cn";
import { dh } from "@/lib/format";
import { BTU_PER_M2 } from "@/lib/power";
import { VISIT_REASON_TEXT, btuLabel, clampArea, type Advice, type AdvisorAnswers } from "@/lib/advisor/model";
import { TIER_LABEL, TIER_TEXT, pickTiers, type AdvisorCatalog } from "@/lib/advisor/products";

const NBSP = " ";

/** Where the professional assessment is requested (quote form, which includes the technical visit). */
export const VISIT_HREF = "/demander-un-devis";

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  );
}

/** Step 5: estimate, how it was computed, recommended types, three real products, technical visit. */
export function AdvisorResult({
  answers,
  advice,
  catalog,
  cityName,
  headingId,
}: {
  answers: AdvisorAnswers;
  advice: Advice;
  catalog: AdvisorCatalog;
  cityName: string;
  headingId: string;
}) {
  const area = clampArea(answers.area);
  const types = advice.categories.flatMap((key) => catalog.categories.filter((c) => c.key === key));
  const selection = pickTiers(catalog.products, advice.size, advice.categories);
  const otherSize = selection.btu !== null && advice.size !== null && selection.btu !== advice.size;

  return (
    <div className="flex flex-col gap-10">
      {/* Estimate */}
      <div className="bg-arfro-navy rounded-arfro-md grid gap-8 p-6 text-white md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:p-10">
        <div className="flex flex-col gap-3">
          <h3 id={headingId} tabIndex={-1} className="text-arfro-sky m-0 text-[12px] font-bold tracking-[0.18em] uppercase outline-none md:text-[13px]">
            Puissance estimée
          </h3>
          <p className="font-arfro m-0 text-[clamp(44px,6vw,76px)] leading-[0.95] font-extrabold tracking-[-0.035em]">
            {advice.size ? btuLabel(advice.size) : `Plus de 60${NBSP}000${NBSP}BTU`}
          </p>
          <p className="text-arfro-on-navy m-0 text-[15px] leading-relaxed">
            Besoin calculé : environ {btuLabel(advice.needRounded)}
            {advice.size ? `, arrondi à la taille standard au-dessus.` : `. Il faut plusieurs unités ou un système centralisé.`}
          </p>
        </div>
        <div>
          <h4 className="m-0 mb-3 text-[15px] font-bold">Comment nous l’avons estimé</h4>
          <dl className="border-arfro-line-dark m-0 border-t text-[15px]">
            <div className="border-arfro-line-dark flex justify-between gap-4 border-b py-2.5">
              <dt className="text-arfro-on-navy">
                {area}
                {NBSP}m² × {BTU_PER_M2}
                {NBSP}BTU (règle de base)
              </dt>
              <dd className="m-0 font-bold whitespace-nowrap tabular-nums">{btuLabel(advice.base)}</dd>
            </div>
            {advice.factors.map((f) => (
              <div key={f.label} className="border-arfro-line-dark flex justify-between gap-4 border-b py-2.5">
                <dt className="text-arfro-on-navy">{f.label}</dt>
                <dd className="m-0 font-bold whitespace-nowrap tabular-nums">{f.effect}</dd>
              </div>
            ))}
            {advice.factors.length === 0 && (
              <div className="border-arfro-line-dark border-b py-2.5">
                <dt className="text-arfro-on-navy">Aucun facteur aggravant ou atténuant</dt>
                <dd className="sr-only">×{NBSP}1</dd>
              </div>
            )}
          </dl>
          <p className="text-arfro-on-navy m-0 mt-3 text-[13px] leading-relaxed">
            {advice.zone === "littoral"
              ? `${cityName} : ville du littoral, nous retirons 10${NBSP}% à la règle de base, établie pour les étés de l’intérieur.`
              : `${cityName} : nous gardons la règle de base, établie pour les étés chauds de l’intérieur (Marrakech).`}
          </p>
        </div>
      </div>

      {/* Recommended types */}
      {types.length > 0 && (
        <div>
          <h4 className="font-arfro text-arfro-graphite m-0 mb-4 text-[20px] font-extrabold tracking-[-0.01em]">Types de climatiseur adaptés</h4>
          <ul className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {types.map((t, i) => (
              <li key={t.key}>
                <Link
                  href={t.href}
                  className="group border-arfro-line rounded-arfro-sm hover:border-arfro-blue text-arfro-graphite hover:text-arfro-graphite flex h-full flex-col gap-1 border bg-white px-4 py-3.5"
                >
                  <span className="text-arfro-muted text-[12px] font-bold tracking-[0.12em] uppercase">{i === 0 ? "Recommandé" : "Possible aussi"}</span>
                  <span className="flex items-center justify-between gap-3 text-[16px] font-bold">
                    {t.label}
                    <span className="text-arfro-blue transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none">
                      <Arrow />
                    </span>
                  </span>
                  {t.text && <span className="text-arfro-muted text-[14px] leading-snug">{t.text}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Products */}
      {selection.picks.length > 0 && selection.btu !== null && (
        <div>
          <h4 className="font-arfro text-arfro-graphite m-0 text-[20px] font-extrabold tracking-[-0.01em]">Nos climatiseurs de {btuLabel(selection.btu)}</h4>
          {otherSize && advice.size !== null && (
            <p className="text-arfro-muted m-0 mt-1.5 text-[15px]">
              Aucun modèle de {btuLabel(advice.size)} dans ces types : voici la puissance disponible juste au-dessus.
            </p>
          )}
          <ul
            className={cn("m-0 mt-5 grid list-none gap-3 p-0", selection.picks.length > 1 && "sm:grid-cols-2", selection.picks.length > 2 && "lg:grid-cols-3")}
          >
            {selection.picks.map(({ level, product }) => (
              <li key={product.sku}>
                <Link
                  href={product.href}
                  className="group border-arfro-line rounded-arfro-md hover:border-arfro-blue text-arfro-graphite hover:text-arfro-graphite flex h-full flex-col border bg-white"
                >
                  <span className="border-arfro-line flex items-baseline justify-between gap-3 border-b px-5 py-3">
                    <span className="text-arfro-blue text-[12px] font-bold tracking-[0.16em] uppercase">{TIER_LABEL[level]}</span>
                    <span className="text-arfro-muted text-[12px]">{TIER_TEXT[level]}</span>
                  </span>
                  <span className="bg-arfro-ice flex h-[150px] items-center justify-center px-6 py-4">
                    <ProductVisual image={product.image} art={product.art} dark={product.dark} alt="" shadow={false} />
                  </span>
                  <span className="flex flex-1 flex-col gap-1 px-5 pt-4 pb-5">
                    {product.brand && <span className="text-arfro-muted text-[13px] font-bold tracking-[0.08em] uppercase">{product.brand}</span>}
                    <span className="text-[16px] leading-snug font-bold">{product.name}</span>
                    <span className="text-arfro-muted text-[14px]">{btuLabel(product.btu)}</span>
                    <span className="mt-auto flex items-baseline gap-2 pt-3">
                      <span className="text-[20px] font-extrabold tabular-nums">{dh(product.price)}</span>
                      {product.regularPrice && product.regularPrice > product.price && (
                        <span className="text-arfro-muted text-[14px] tabular-nums line-through">
                          <span className="sr-only">Au lieu de </span>
                          {dh(product.regularPrice)}
                        </span>
                      )}
                    </span>
                    <span className="text-arfro-blue mt-2 inline-flex items-center gap-2 text-[14px] font-bold">
                      Voir le produit <Arrow />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Professional assessment */}
      <div
        className={cn(
          "rounded-arfro-md flex flex-col gap-5 border p-6 md:flex-row md:items-center md:justify-between md:p-8",
          advice.visitRecommended ? "border-arfro-blue bg-arfro-ice" : "border-arfro-line bg-white",
        )}
      >
        <div className="max-w-[60ch]">
          <h4 className="font-arfro text-arfro-graphite m-0 text-[20px] font-extrabold tracking-[-0.01em]">
            {advice.visitRecommended ? "Une visite technique est conseillée" : "Faites confirmer par un technicien"}
          </h4>
          <p className="text-arfro-graphite/80 m-0 mt-2 text-[15px] leading-relaxed">
            {advice.visitRecommended
              ? `Pour cet espace, ${advice.visitReasons.map((r) => VISIT_REASON_TEXT[r]).join(" ; ")}. Un technicien mesure sur place et dimensionne l’installation.`
              : "Un technicien peut mesurer la pièce et confirmer la puissance avant l’achat."}
          </p>
          <p className="text-arfro-muted m-0 mt-2 text-[13px] leading-relaxed">
            Ce résultat est une estimation indicative à partir de vos réponses, pas une étude thermique.
          </p>
        </div>
        {/* Same look as ArfroButtonLink (components/arfro/ui is server-only: it reads the photo manifest). */}
        <Link
          href={VISIT_HREF}
          className={cn(
            "rounded-arfro-sm inline-flex h-[52px] shrink-0 items-center justify-center gap-2.5 px-7 text-[15px] font-bold whitespace-nowrap transition-[background-color,border-color,color] duration-300 ease-[var(--ease-arfro)] motion-reduce:transition-none",
            advice.visitRecommended
              ? "bg-arfro-blue hover:bg-arfro-blue-hover text-white hover:text-white"
              : "border-arfro-graphite/30 text-arfro-graphite hover:border-arfro-graphite hover:text-arfro-graphite border",
          )}
        >
          Demander une visite technique
          <Arrow />
        </Link>
      </div>
    </div>
  );
}
