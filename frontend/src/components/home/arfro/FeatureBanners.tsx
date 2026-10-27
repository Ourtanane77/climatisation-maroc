import Link from "next/link";
import { DesignImg } from "@/components/ui/DesignImg";
import { dh, isOnRequest } from "@/lib/format";
import type { BentoTile, HomeData } from "@/lib/home/types";
import type { ProductCardData } from "@/lib/types";
import { rangeImage } from "./CategoryCircles";
import { Reveal } from "./motion";

const EYEBROW = "text-xs font-extrabold tracking-[0.08em] uppercase md:text-[13px]";

/** First home product of a range, matched on its name (« Chauffe-eau Solaire Simsek… »). */
function rangeProduct(tile: BentoTile, products: ProductCardData[]): ProductCardData | undefined {
  const prefix = tile.title.toLocaleLowerCase("fr");
  return products.find((p) => p.name.toLocaleLowerCase("fr").startsWith(prefix));
}

/**
 * The two feature banners of Main.dc.html: the water-heater range on a grey panel (with a real
 * product of the home lists and its server price when there is one) and the pro solutions photo
 * with the « Projets et revendeurs » phone. A banner without its range is left out. The two
 * banners rise in one after the other (globals.css « Arfro home motion »).
 */
export function FeatureBanners({ home }: { home: HomeData }) {
  const heater = home.bento.find((t) => t.key === "chauffe-eau");
  const solutions = home.bento.find((t) => t.key === "solutions");
  if (!heater && !solutions) return null;

  const fresh = heater ? rangeProduct(heater, home.newProducts) : undefined;
  const product = fresh ?? (heater ? rangeProduct(heater, home.promotions.products) : undefined);
  const heaterLine = product
    ? isOnRequest(product.price)
      ? product.name
      : `${product.name}, ${product.fromPrice ? "dès " : ""}${dh(product.price)}`
    : (heater?.text ?? heater?.types?.map((t) => t.label).join(" · "));
  const heaterImage = heater ? rangeImage(heater) : null;
  const solutionsImage = solutions ? rangeImage(solutions) : null;
  const phone = home.pro.phone;

  return (
    <Reveal group>
      <section aria-label="À la une" className="am-stagger grid grid-cols-1 gap-4 pt-11 md:grid-cols-2 md:gap-5 md:pt-[88px]">
        {heater && (
          <Link
            href={heater.href}
            className="group text-ink hover:text-ink relative flex min-h-[340px] flex-col justify-between gap-6 overflow-hidden rounded-[24px] bg-[#F2F4F7] p-7 md:min-h-[460px] md:rounded-[28px] md:p-11"
          >
            <div className="relative z-[1] flex max-w-[320px] flex-col gap-3">
              {fresh && <span className={`${EYEBROW} text-brand`}>Nouveauté</span>}
              <h2 className="m-0 text-[28px] leading-[1.1] font-extrabold tracking-[-0.02em] md:text-[34px]">{heater.title}</h2>
              {heaterLine && <p className="text-muted m-0 text-[15px] leading-normal md:text-base">{heaterLine}</p>}
            </div>
            <span className="bg-ink group-hover:bg-brand relative z-[1] flex h-[46px] items-center self-start rounded-full px-[22px] text-sm font-bold text-white transition-colors">
              Découvrir
            </span>
            {heaterImage && (
              <DesignImg
                photo={heaterImage}
                sizes="(max-width: 759px) 55vw, 400px"
                className="pointer-events-none absolute right-[-20px] bottom-[-10px] h-auto w-[52%] transition-transform duration-500 group-hover:scale-[1.03] md:w-[58%]"
              />
            )}
          </Link>
        )}
        {solutions && (
          <Link
            href={solutions.href}
            className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-[24px] bg-[#083F78] text-white hover:text-white md:min-h-[460px] md:rounded-[28px]"
          >
            {solutionsImage && (
              <DesignImg
                photo={solutionsImage}
                sizes="(max-width: 759px) 100vw, 700px"
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            )}
            <div className="relative m-4 flex flex-col gap-2.5 rounded-[20px] bg-[#083F78] p-6 md:m-6 md:p-7">
              <span className={`${EYEBROW} text-[#C9DDF2]`}>Professionnels</span>
              <h2 className="m-0 text-[26px] leading-[1.1] font-extrabold tracking-[-0.02em] md:text-[30px]">{solutions.title}</h2>
              {phone && (
                <p className="m-0 text-[15px] text-[#E3ECF6] md:text-base">
                  {phone.label} : {phone.display}
                </p>
              )}
            </div>
          </Link>
        )}
      </section>
    </Reveal>
  );
}
