import type { ArtKey, Link } from "@/lib/types";

/** Blog and calculator view models (backend ArticlePresenter, CalculatorController). */

export interface BlogCategory {
  name: string;
  slug: string;
  href: string;
  description: string | null;
  count?: number;
}

export interface ArticleCardData {
  title: string;
  slug: string;
  href: string;
  excerpt: string | null;
  category: BlogCategory | null;
  readingTime: number | null;
  cover: string | null;
  art: ArtKey | null;
  bg: string | null;
}

/** A single variant shown inline (article product cards, calculator match list). */
export interface InlineProduct {
  name: string;
  sku: string;
  href: string;
  price: number;
  regularPrice: number | null;
  image: string | null;
  art: ArtKey | null;
  dark: boolean;
  inStock?: boolean;
}

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "h2"; text: string; id: string | null }
  | { type: "h3"; text: string }
  | { type: "callout"; title: string; items: string[] }
  | { type: "tip"; title: string; text: string }
  | { type: "figure"; image: string | null; art: ArtKey | null; dark: boolean; alt: string; caption: string | null }
  | { type: "calculator" }
  | { type: "power_table" }
  | { type: "products"; items: InlineProduct[] };

export interface ArticleData extends ArticleCardData {
  h1: string;
  author: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  blocks: ArticleBlock[];
  toc: { id: string; text: string }[];
}

export interface ArticleResponse {
  article: ArticleData;
  seo: { title: string; description: string | null; canonical: string | null; noindex: boolean };
  related: ArticleCardData[];
}

export interface BlogResponse {
  categories: BlogCategory[];
  category: BlogCategory | null;
  featured: ArticleCardData | null;
  data: ArticleCardData[];
  meta: { page: number; lastPage: number; total: number };
}

export interface CalculatorTier {
  cta: Link;
  products: InlineProduct[];
}
