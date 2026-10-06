import { Fragment } from "react";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import type { ArticleBlock } from "@/lib/blog/types";
import { ArticlePowerTable, InlineCalculator } from "./ArticleCalculator";
import { InlineProductCard } from "./ArticleInteractive";
import { MobileToc } from "./ArticleToc";

const p = "m-0 text-lg leading-[1.75] text-ink text-pretty";

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className={p}>{block.text}</p>;
    case "h2":
      return (
        <h2
          id={block.id ?? undefined}
          className="m-0 mt-12 scroll-mt-[110px] text-[28px] leading-[1.15] font-bold tracking-[-0.02em] text-balance md:text-[34px]"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return <h3 className="m-0 mt-3 text-[21px] leading-[1.3] font-bold">{block.text}</h3>;
    case "callout":
      return (
        <aside aria-label={block.title} className="flex flex-col gap-3 rounded-[20px] bg-white px-7 py-6 shadow-[inset_0_0_0_1.5px_#DCE5EF]">
          <h2 className="m-0 text-xl font-bold">{block.title}</h2>
          <ul className="m-0 flex list-disc flex-col gap-2 pl-[22px]">
            {block.items.map((item) => (
              <li key={item} className="pl-1 text-lg leading-[1.7]">
                {item}
              </li>
            ))}
          </ul>
        </aside>
      );
    case "tip":
      return (
        <aside className="bg-tint-orange-2 my-2 flex items-start gap-4 rounded-[20px] px-6 py-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F4731F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
            </svg>
          </span>
          <div className="flex flex-col gap-1">
            <strong className="text-[17px]">{block.title}</strong>
            <p className="m-0 text-[17px] leading-[1.65]">{block.text}</p>
          </div>
        </aside>
      );
    case "figure":
      return (
        <figure className="my-2 flex flex-col gap-2.5">
          <div className="bg-tint-blue-2 box-border flex aspect-[16/8] items-center justify-center rounded-[20px] p-6">
            <ProductVisual image={block.image} art={block.art} dark={block.dark} alt={block.alt} width="86%" shadow={false} />
          </div>
          {block.caption && <figcaption className="text-muted text-[15px] leading-normal">{block.caption}</figcaption>}
        </figure>
      );
    case "calculator":
      return <InlineCalculator />;
    case "power_table":
      return <ArticlePowerTable />;
    case "products":
      return (
        <div className="my-2 grid grid-cols-1 gap-3 md:grid-cols-2">
          {block.items.map((item) => (
            <InlineProductCard key={item.sku} product={item} />
          ))}
        </div>
      );
  }
}

/**
 * Article body blocks (design/Article puissance climatiseur.dc.html). The collapsible table of
 * contents for mobile and tablet sits right after the first "En bref" box, as drawn.
 */
export function ArticleBody({ blocks, toc }: { blocks: ArticleBlock[]; toc: { id: string; text: string }[] }) {
  const tocAfter = blocks.findIndex((b) => b.type === "callout");
  return (
    <>
      {toc.length > 0 && tocAfter === -1 && <MobileToc entries={toc} />}
      {blocks.map((block, i) => (
        <Fragment key={i}>
          <Block block={block} />
          {toc.length > 0 && i === tocAfter && <MobileToc entries={toc} />}
        </Fragment>
      ))}
    </>
  );
}
