"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import type { FaqItem } from "@/lib/types";

/**
 * FAQ accordion (all pages): white card, one item open at a time, first item open by default,
 * "+" turning 45°, height animated with grid-template-rows. Emits FAQPage JSON-LD.
 */
export function FaqAccordion({ items, jsonLd = true }: { items: FaqItem[]; jsonLd?: boolean }) {
  const [open, setOpen] = useState(0);
  const id = useId();
  if (!items.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };

  return (
    <div className="rounded-24 bg-white px-6 py-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.question} className="border-divider border-b last:border-b-0">
            <h3 className="m-0">
              <button
                type="button"
                id={`${id}-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-a${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex min-h-16 w-full items-center justify-between gap-4 py-3 text-left text-lg font-bold"
              >
                {item.question}
                <span aria-hidden className={cn("text-brand text-[26px] leading-none font-normal transition-transform duration-300", isOpen && "rotate-45")}>
                  +
                </span>
              </button>
            </h3>
            <div
              id={`${id}-a${i}`}
              role="region"
              aria-labelledby={`${id}-q${i}`}
              className={cn("grid transition-[grid-template-rows] duration-300", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="overflow-hidden">
                <p className="text-ink-2 mt-0 mb-5 max-w-[760px] text-base leading-[1.6]">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
    </div>
  );
}
