import { SplitHeadline } from "@/components/arfro/motion";
import { Eyebrow, Lead, Section, resolveArfroImage } from "@/components/arfro/ui";
import type { ArfroHomeSections } from "@/lib/home/arfro";
import { EnvironmentsTrack, type EnvironmentPanel } from "./a/EnvironmentsTrack";

export const ENVIRONMENTS_ID = "environnements";
export const ENVIRONMENTS_TITLE_ID = "arfro-environnements-title";

const H2 = "font-arfro m-0 font-extrabold text-balance text-[clamp(34px,5vw,72px)] leading-[1.02] tracking-[-0.03em]";

/**
 * Section 03 · Environments (« À chaque espace, son confort »). Not a card grid: a horizontal line of
 * tall editorial panels (photo, or a strong tonal panel when the slot is empty), text and CTA always
 * visible (hover / focus adds a photo zoom and the arrow nudge), swipeable with snap and a progress line on phones. Photos are
 * resolved here on the server (public/design manifest) and handed to the client track as URLs.
 */
export function ArfroEnvironments({ data }: { data: NonNullable<ArfroHomeSections["environments"]> }) {
  if (data.items.length === 0) return null;
  const items: EnvironmentPanel[] = data.items.map((item) => ({
    key: item.key,
    title: item.title,
    text: item.text,
    href: item.href,
    ctaLabel: item.ctaLabel,
    photo: resolveArfroImage(item.image),
  }));

  return (
    <Section id={ENVIRONMENTS_ID} labelledBy={ENVIRONMENTS_TITLE_ID} tone="ice" bleed className="overflow-hidden">
      <EnvironmentsTrack
        items={items}
        labelledBy={ENVIRONMENTS_TITLE_ID}
        header={
          <>
            {data.eyebrow ? <Eyebrow className="mb-6">{data.eyebrow}</Eyebrow> : null}
            <SplitHeadline as="h2" id={ENVIRONMENTS_TITLE_ID} text={data.title} className={H2} />
            {data.text ? <Lead className="mt-6">{data.text}</Lead> : null}
          </>
        }
      />
    </Section>
  );
}
