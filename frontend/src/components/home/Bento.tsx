import Link from "next/link";
import { DuoIcon, IC } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { DesignImg } from "@/components/ui/DesignImg";
import type { DesignPhoto } from "@/lib/design-assets";
import { BENTO_IMAGES, designPhoto } from "@/lib/home/assets";
import type { BentoTile } from "@/lib/home/types";

/**
 * Grid placement per tile, from the design's `bento.place` (desktop 4 columns) and the tablet
 * (2 columns, first tile full width) and mobile (1 column) overrides.
 */
const PLACE = [
  "col-span-full row-span-2 xl:col-[1/3] xl:row-[1/3]",
  "col-span-full row-span-1 md:col-span-1 xl:col-[3/4] xl:row-[1/3]",
  "col-span-full md:col-span-1 xl:col-[4/5] xl:row-[1/2]",
  "col-span-full md:col-span-1 xl:col-[4/5] xl:row-[2/3]",
  "col-span-full md:col-span-1 xl:col-[1/2] xl:row-[3/4]",
  "col-span-full md:col-span-1 xl:col-[2/3] xl:row-[3/4]",
  "col-span-full md:col-span-1 xl:col-[3/5] xl:row-[3/4]",
];

/**
 * Art position per tile (`artPos` in the design). Mobile tiles after the first put the art in a
 * right-hand column; the tablet second tile has its own position.
 */
const ART_POS = [
  "right-[-14%] bottom-[2%] w-[86%] md:w-[84%]",
  "max-md:top-3 max-md:right-3 max-md:bottom-3 max-md:w-[40%] md:right-[-4%] md:bottom-[-6%] md:w-[60%] xl:right-[-14%] xl:bottom-[-2%] xl:w-[112%]",
  "max-md:top-3 max-md:right-3 max-md:bottom-3 max-md:w-[40%] md:right-[-10%] md:bottom-[-12%] md:w-[60%]",
  "max-md:top-3 max-md:right-3 max-md:bottom-3 max-md:w-[40%] md:right-[-12%] md:bottom-[-10%] md:w-[66%]",
  "max-md:top-3 max-md:right-3 max-md:bottom-3 max-md:w-[40%] md:right-[-8%] md:bottom-[-12%] md:w-[56%]",
  "max-md:top-3 max-md:right-3 max-md:bottom-3 max-md:w-[40%] md:right-[2%] md:bottom-[-22%] md:w-[24%]",
  "max-md:top-3 max-md:right-3 max-md:bottom-3 max-md:w-[40%] md:top-0 md:right-0 md:bottom-0 md:w-[44%] xl:w-[56%]",
];

/**
 * Tile photo: the image uploaded on the category in the back office, else the design's photo
 * (design/uploads, synced to public/design/) when present, else none (plain tile).
 */
function tileImage(tile: BentoTile): DesignPhoto | null {
  if (tile.image) return { src: tile.image };
  return BENTO_IMAGES[tile.key] ? designPhoto(BENTO_IMAGES[tile.key]) : null;
}

/**
 * Cut-outs keep their transparency with a soft drop shadow; the solutions photo covers its area
 * and fades in from the left (design `catDef` and its mobile overrides).
 */
function TileArt({ photo, line, wide }: { photo: DesignPhoto; line: boolean; wide: boolean }) {
  return (
    <DesignImg
      photo={photo}
      alt={line ? "Climatisation d’un hall d’hôtel" : ""}
      // Rendered widths: tile art is 24–84 % of a 1–2 column tile (design `catDef`).
      sizes={line ? "(max-width: 759px) 100vw, 40vw" : wide ? "(max-width: 759px) 40vw, 45vw" : "(max-width: 759px) 40vw, 20vw"}
      className={
        line
          ? "block h-full w-full [mask-image:linear-gradient(to_right,transparent,#000_40%)] object-cover"
          : "block h-auto w-full drop-shadow-[0_14px_18px_rgba(14,40,70,0.22)] max-md:h-full max-md:object-contain"
      }
    />
  );
}

/** "Le catalogue" bento (design/Accueil.dc.html `#catalogue`): six ranges and the pro solutions tile. */
export function Bento({ tiles }: { tiles: BentoTile[] }) {
  return (
    <section id="catalogue" aria-labelledby="h-cat" className="pt-10 md:pt-14">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
        <h2 id="h-cat" className="m-0 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] md:text-[44px]">
          Le catalogue
        </h2>
        <Link href="/plan-du-site" className="-my-[3px] inline-block py-[3px] text-[15px] font-bold underline">
          Tout le catalogue
        </Link>
      </div>
      <div className="grid auto-rows-[168px] grid-cols-1 gap-4 md:auto-rows-[240px] md:grid-cols-2 xl:auto-rows-[230px] xl:grid-cols-4">
        {tiles.slice(0, 7).map((tile, i) => {
          const icon = tile.icon && tile.icon in IC ? IC[tile.icon as keyof typeof IC] : null;
          const line = tile.key === "solutions";
          const image = tileImage(tile);
          return (
            <div
              key={tile.key}
              className={cn(
                "ease-design relative flex flex-col gap-1 overflow-hidden rounded-[24px] p-6 transition-[transform,box-shadow] duration-350 hover:-translate-y-1 hover:shadow-[0_22px_44px_-28px_rgba(14,40,70,0.45)]",
                PLACE[i],
              )}
              style={{ background: tile.bg ?? "#E8EFF8" }}
            >
              {icon && (
                <span className="rounded-14 relative z-0 mb-3 hidden size-12 shrink-0 items-center justify-center bg-white md:flex">
                  <DuoIcon paths={icon} size={26} />
                </span>
              )}
              <Link
                href={tile.href}
                className="text-ink hover:text-brand shrink-0 text-2xl font-bold tracking-[-0.02em] after:absolute after:inset-0 after:z-[1] after:rounded-[24px] after:content-['']"
              >
                {tile.title}
              </Link>
              {line && tile.types && (
                <div className="relative z-[2] mt-1.5 flex max-w-full flex-wrap gap-y-1 text-[15px] leading-normal md:max-w-[66%]">
                  {tile.types.map((t, j, all) => (
                    <Link key={t.label} href={t.href} className="text-muted hover:text-brand -my-0.5 inline-block min-w-6 py-0.5 text-center whitespace-nowrap">
                      {t.label}
                      {j < all.length - 2 && <span className="text-line-strong px-[7px]">·</span>}
                    </Link>
                  ))}
                </div>
              )}
              {!line && tile.types && (
                <div
                  className={cn(
                    "relative z-[2] mt-2.5 flex flex-row flex-wrap items-start gap-1.5",
                    i === 0 ? "max-w-full md:max-w-[62%]" : "max-w-[56%] md:max-w-full xl:flex-col",
                  )}
                >
                  {tile.types.map((t) => (
                    <Link
                      key={t.href}
                      href={t.href}
                      className="text-ink hover:bg-brand flex h-[34px] items-center rounded-full bg-white px-[13px] text-sm font-semibold transition-colors duration-200 hover:text-white"
                    >
                      {t.label}
                    </Link>
                  ))}
                </div>
              )}
              {!tile.types && tile.text && <span className="text-muted pointer-events-none relative z-[2] line-clamp-2 text-sm">{tile.text}</span>}
              {image && (
                <div aria-hidden={!line || undefined} className={cn("pointer-events-none absolute", ART_POS[i])}>
                  <TileArt photo={image} line={line} wide={i === 0} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
