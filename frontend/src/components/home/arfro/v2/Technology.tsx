import { AirflowLines } from "@/components/arfro/AirflowLines";
import { Reveal, SplitHeadline } from "@/components/arfro/motion";
import { Eyebrow, Lead, Section, resolveArfroImage } from "@/components/arfro/ui";
import type { ArfroHomeSections } from "@/lib/home/arfro";
import { TechnologyStage } from "./a/TechnologyStage";

export const TECHNOLOGY_ID = "technologie";
export const TECHNOLOGY_TITLE_ID = "arfro-technologie-title";

/** Product cut-out used when the back office gives the section no photo (public/design manifest). */
export const TECHNOLOGY_CUTOUT = "clima-cut2.png";

const H2 = "font-arfro m-0 font-extrabold text-balance text-[clamp(34px,5vw,72px)] leading-[1.02] tracking-[-0.03em]";

/**
 * Section 04 · Technology: the dark band of the home. A large product visual (the section photo,
 * else the wall-unit cut-out) with one hotspot per item of the payload, cool airflow streaming
 * from the louvre, and the selected item's detail below. Only `data.items` is rendered: no claim
 * is added here.
 */
export function ArfroTechnology({ data }: { data: NonNullable<ArfroHomeSections["technology"]> }) {
  if (data.items.length === 0) return null;
  const own = resolveArfroImage(data.image);
  const photo = own ?? resolveArfroImage({ design: TECHNOLOGY_CUTOUT });

  return (
    <Section id={TECHNOLOGY_ID} labelledBy={TECHNOLOGY_TITLE_ID} tone="navy" className="overflow-hidden">
      <AirflowLines variant="dark" className="absolute inset-x-0 top-[38%] h-[44%] w-full opacity-70" />
      <div className="relative grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          {data.eyebrow ? (
            <Eyebrow onDark className="mb-6">
              {data.eyebrow}
            </Eyebrow>
          ) : null}
          <SplitHeadline as="h2" id={TECHNOLOGY_TITLE_ID} text={data.title} className={H2} />
        </div>
        {data.text ? (
          <Lead onDark className="lg:col-span-4 lg:col-start-9">
            {data.text}
          </Lead>
        ) : null}
      </div>
      <Reveal className="relative">
        <TechnologyStage
          items={data.items.map(({ icon, title, text, href }) => ({ icon, title, text, href }))}
          photo={photo}
          cutout={own === null}
          alt={data.title}
        />
      </Reveal>
    </Section>
  );
}
