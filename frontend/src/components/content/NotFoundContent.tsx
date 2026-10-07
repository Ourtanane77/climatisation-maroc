import Link from "next/link";
import { ProductArt } from "@/components/catalog/ProductArt";
import { ButtonLink } from "@/components/ui/Button";
import { SearchIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getSiteMap } from "@/lib/content/api";
import { DesignImg } from "@/components/ui/DesignImg";
import { categoryPhoto } from "@/lib/design-assets";
import type { ArtKey } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";

/**
 * 404 (design: Page introuvable.dc.html): "404" numeral, search, two buttons, "Nos gammes" tiles,
 * WhatsApp help line. Tiles show the design's cut-out photos (line drawings when a file is absent);
 * only active ranges are shown.
 */
const RANGE_TILES: { label: string; path: string; bg: string; art: ArtKey; width: string; photoWidth: string }[] = [
  { label: "Climatisation", path: "/climatisation", bg: "#DCE8F5", art: "mural", width: "80%", photoWidth: "90%" },
  { label: "Chauffe-eau", path: "/chauffe-eau", bg: "#FCE6D6", art: "solaire", width: "56%", photoWidth: "56%" },
  { label: "Ventilation", path: "/ventilation", bg: "#E8EFF8", art: "vent", width: "62%", photoWidth: "62%" },
  { label: "Gaines", path: "/gaines", bg: "#FDF0E6", art: "flex", width: "70%", photoWidth: "70%" },
  { label: "Cuivre et gaz", path: "/cuivre-et-gaz", bg: "#FCE6D6", art: "coilL", width: "50%", photoWidth: "62%" },
  { label: "Pièces de rechange", path: "/pieces-de-rechange", bg: "#DCE8F5", art: "remote", width: "28%", photoWidth: "28%" },
];

export async function NotFoundContent() {
  const ranges = await getSiteMap()
    .then((m) => m.ranges)
    .catch(() => []);
  const active = new Set(ranges.map((r) => r.href));
  const tiles = RANGE_TILES.filter((t) => active.has(t.path));

  return (
    <>
      <section className="flex flex-col items-center gap-5 pt-10 pb-8 text-center md:pt-[72px] md:pb-12">
        <p aria-hidden className="text-brand m-0 text-[112px] leading-[0.9] font-extrabold tracking-[-0.06em] md:text-[200px]">
          4<span className="text-accent">0</span>4
        </p>
        <h1 className="m-0 max-w-[640px] text-[26px] leading-[1.15] font-bold tracking-[-0.025em] text-balance md:text-4xl">
          Cette page n&apos;existe pas ou a été déplacée
        </h1>
        <form
          action="/recherche"
          role="search"
          className="border-input flex h-14 w-full max-w-[560px] items-center rounded-full border-[1.5px] bg-white pr-1.5 pl-5"
        >
          <input
            type="search"
            name="q"
            required
            aria-label="Rechercher"
            placeholder="Rechercher un produit ou une référence"
            className="placeholder:text-muted h-full min-w-0 flex-1 border-0 bg-transparent text-base outline-none"
          />
          <button type="submit" aria-label="Rechercher" className="bg-brand flex size-11 shrink-0 items-center justify-center rounded-full text-white">
            <SearchIcon size={20} />
          </button>
        </form>
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <ButtonLink href="/" variant="blue" mobileFull>
            Retour à l&apos;accueil
          </ButtonLink>
          <ButtonLink href="/climatisation/mural" variant="outline" mobileFull>
            Voir les climatiseurs
          </ButtonLink>
        </div>
      </section>

      {tiles.length > 0 && (
        <section aria-labelledby="nos-gammes">
          <h2 id="nos-gammes" className="m-0 mb-4 text-center text-xl font-bold">
            Nos gammes
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {tiles.map((t) => {
              // The range's photo (shared map with the home bento and the sector tiles).
              const photo = categoryPhoto(t.path);
              return (
                <Link
                  key={t.path}
                  href={t.path}
                  className="rounded-20 text-ink hover:text-ink relative h-[120px] overflow-hidden p-4 text-base font-bold hover:brightness-[0.97] md:h-[150px]"
                  style={{ background: t.bg }}
                >
                  {t.label}
                  {photo ? (
                    // Design: right -6 %, bottom -8 %, width per range, soft drop shadow.
                    <DesignImg
                      photo={photo}
                      sizes="(max-width: 759px) 45vw, 200px"
                      className="absolute right-[-6%] bottom-[-8%] block h-auto drop-shadow-[0_10px_14px_rgba(14,40,70,0.2)]"
                      style={{ width: t.photoWidth }}
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="absolute right-[6%] bottom-[8%] drop-shadow-[0_10px_14px_rgba(14,40,70,0.2)]"
                      style={{ width: `calc(${t.width} * 0.6)` }}
                    >
                      <ProductArt art={t.art} className="h-auto w-full" />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <p className="m-0 flex flex-wrap items-center justify-center gap-3 pt-10 text-center text-[17px]">
        <span className="bg-whatsapp flex size-11 items-center justify-center rounded-full text-white">
          <WhatsAppIcon size={22} />
        </span>
        <span>
          Vous cherchez un produit précis ?{" "}
          <a href={waLink("Bonjour, je cherche un produit sur votre site.")} target="_blank" rel="noopener" className="text-ink hover:text-brand font-bold">
            Écrivez-nous sur WhatsApp
          </a>
        </span>
      </p>
    </>
  );
}
