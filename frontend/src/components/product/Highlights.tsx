import { DuoIcon, IC } from "@/components/ui/icons";
import { Section } from "./Section";

/** Two-tone icon from the design set; unknown keys fall back to the tag icon (as the design does). */
export function iconPaths(key: string): readonly [string, string] {
  return key in IC ? IC[key as keyof typeof IC] : IC.tag;
}

/** "Points forts" (design: 5 tiles, 44px icon box) and the product description underneath. */
export function Highlights({ items, description }: { items: { title: string; icon: string }[]; description: string | null }) {
  if (!items.length && !description) return null;
  return (
    <Section id="points-forts" title="Points forts">
      {items.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-5">
          {items.map((item) => (
            <li key={item.title} className="rounded-20 flex flex-col gap-2.5 bg-white p-5">
              <span className="rounded-14 bg-tint-blue flex size-11 items-center justify-center">
                <DuoIcon paths={iconPaths(item.icon)} size={24} />
              </span>
              <h3 className="m-0 text-[17px] leading-[1.3] font-bold">{item.title}</h3>
            </li>
          ))}
        </ul>
      )}
      {description && <p className="text-ink-2 m-0 mt-6 max-w-[860px] text-base leading-[1.7] whitespace-pre-line">{description}</p>}
    </Section>
  );
}
