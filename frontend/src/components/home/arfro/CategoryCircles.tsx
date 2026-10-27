import Link from "next/link";
import { DesignImg } from "@/components/ui/DesignImg";
import type { DesignPhoto } from "@/lib/design-assets";
import { BENTO_IMAGES, designPhoto } from "@/lib/home/assets";
import type { BentoTile } from "@/lib/home/types";
import { Reveal } from "./motion";

/** Range picture: the image uploaded on the category, else the design cut-out (as the bento). */
export function rangeImage(tile: BentoTile): DesignPhoto | null {
  if (tile.image) return { src: tile.image };
  return BENTO_IMAGES[tile.key] ? designPhoto(BENTO_IMAGES[tile.key]) : null;
}

/**
 * « Explorer par catégorie » (Main.dc.html): the home ranges as grey circles with their cut-out,
 * seven across on desktop, a horizontal scroller on phones (Mobile.dc.html). The circles pop in
 * one after the other and rise with a blue ring on hover (globals.css « Arfro home motion »).
 */
export function CategoryCircles({ tiles }: { tiles: BentoTile[] }) {
  return (
    <Reveal group>
      <section aria-labelledby="h-cat" className="pt-10 md:pt-14">
        <h2 id="h-cat" className="am-fade m-0 mb-[18px] text-2xl font-extrabold tracking-[-0.02em] md:mb-7 md:text-center md:text-[34px]">
          Explorer par catégorie
        </h2>
        <ul className="am-stagger am-from-scale -mx-[var(--site-gutter)] -mt-2 mb-0 flex scrollbar-none list-none gap-3.5 overflow-x-auto px-[var(--site-gutter)] pt-2 pb-1 xl:mx-0 xl:grid xl:grid-cols-7 xl:gap-4 xl:overflow-visible xl:px-0">
          {tiles.slice(0, 7).map((tile) => {
            const image = rangeImage(tile);
            // The pro solutions picture is a photo, not a cut-out: it fills the circle.
            const photo = tile.key === "solutions";
            return (
              <li key={tile.key} className="flex-[0_0_92px] md:flex-[0_0_128px] xl:flex-auto">
                <Link href={tile.href} className="group text-ink hover:text-brand flex flex-col items-center gap-2.5 xl:gap-3.5">
                  <span className="am-circle flex aspect-square w-full items-center justify-center overflow-hidden rounded-full bg-[#F2F4F7]">
                    {image && (
                      <DesignImg
                        photo={image}
                        sizes="(max-width: 1099px) 128px, 180px"
                        className={
                          photo ? "size-full object-cover" : "size-[70%] object-contain transition-transform duration-300 group-hover:scale-105 xl:size-[72%]"
                        }
                      />
                    )}
                  </span>
                  <span className="text-center text-[13px] font-bold xl:text-[15px]">{tile.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </Reveal>
  );
}
