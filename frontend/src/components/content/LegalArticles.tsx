"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { withoutPlaceholders } from "@/lib/content/placeholders";

/**
 * Legal page body (design: CGV.dc.html): numbered "Sommaire" (sticky on the left from 1100px,
 * collapsible card above the text below), "Article N · titre" sections with scroll-spy.
 */
export interface LegalArticle {
  title: string;
  text: string;
}

export function LegalArticles({ intro, articles, children }: { intro: string | null; articles: LegalArticle[]; children?: React.ReactNode }) {
  const ids = articles.map((_, i) => `article-${i + 1}`);
  const [active, setActive] = useState(ids[0]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 160) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles.length]);

  function go(e: React.MouseEvent, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
    setOpen(false);
  }

  const toc = (mobile: boolean) =>
    articles.map((a, i) => {
      const id = ids[i];
      const on = id === active && !mobile;
      return (
        <li key={id}>
          <a
            href={`#${id}`}
            onClick={(e) => go(e, id)}
            aria-current={on ? "location" : undefined}
            className={cn(
              "flex items-center gap-2.5 text-[15px]",
              mobile
                ? "border-divider text-ink-2 hover:text-brand min-h-11 border-t font-medium"
                : cn(
                    "min-h-[38px] border-l-[3px] py-1 pl-3.5",
                    on ? "border-brand text-brand font-bold" : "border-step-line text-ink-2 hover:text-brand font-medium",
                  ),
            )}
          >
            <span className="text-line-strong min-w-5 tabular-nums">{i + 1}</span>
            {a.title}
          </a>
        </li>
      );
    });

  return (
    <div className="grid grid-cols-1 gap-14 pt-8 xl:grid-cols-[260px_minmax(0,720px)]">
      <nav aria-label="Sommaire" className="hidden xl:block">
        <div className="sticky top-[110px] max-h-[calc(100vh-140px)] overflow-y-auto">
          <p className="text-muted m-0 mb-3 text-[13px] font-bold tracking-[0.06em] uppercase">Sommaire</p>
          <ol className="m-0 flex list-none flex-col p-0">{toc(false)}</ol>
        </div>
      </nav>
      <div className="flex max-w-[720px] min-w-0 flex-col gap-4">
        <nav aria-label="Sommaire" className="rounded-20 mb-2 bg-white px-5 xl:hidden">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex min-h-14 w-full items-center justify-between text-base font-bold"
          >
            Sommaire
            <ChevronDownIcon size={18} className={cn("transition-transform", open && "rotate-180")} />
          </button>
          {open && <ol className="m-0 list-none p-0 pb-2">{toc(true)}</ol>}
        </nav>
        {intro && <p className="m-0 text-lg leading-[1.6]">{intro}</p>}
        {articles.map((a, i) => (
          <section key={ids[i]} id={ids[i]} className="flex scroll-mt-[110px] flex-col gap-3 pt-6">
            <h2 className="m-0 text-[22px] font-bold tracking-[-0.015em] md:text-[26px]">
              Article {i + 1} · {a.title}
            </h2>
            {a.text
              .split(/\n{2,}/)
              .map(withoutPlaceholders) // "[TEXTE JURIDIQUE]" is never shown
              .filter((para): para is string => !!para)
              .map((para, j) => (
                <p key={j} className="text-ink-2 m-0 text-lg leading-[1.75]">
                  {para}
                </p>
              ))}
          </section>
        ))}
        {children}
      </div>
    </div>
  );
}
