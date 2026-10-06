"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { toast } from "@/components/ui/Toast";
import { FacebookIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { InlineProduct } from "@/lib/blog/types";
import { addToCart } from "@/lib/cart/store";
import { cn } from "@/lib/cn";
import { dh } from "@/lib/format";

/** Product suggested inside an article: thumbnail, name, price, "Ajouter au panier". */
export function InlineProductCard({ product }: { product: InlineProduct }) {
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const orderable = product.inStock !== false;

  function add() {
    addToCart(product.sku, 1);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
    toast(`${product.name} ajouté au panier`);
  }

  return (
    <article className="flex items-center gap-4 rounded-[20px] bg-white p-4 shadow-[0_0_0_1px_#E6EBF0]">
      <Link
        href={product.href}
        tabIndex={-1}
        aria-hidden
        className="bg-tint-thumb rounded-14 box-border flex h-[84px] w-[110px] shrink-0 items-center justify-center p-2"
      >
        <ProductVisual image={product.image} art={product.art ?? "mural"} dark={product.dark} alt="" shadow={false} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link href={product.href} className="text-ink hover:text-brand text-base leading-[1.3] font-bold">
          {product.name}
        </Link>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[22px] font-extrabold">{dh(product.price)}</span>
          {product.regularPrice && product.regularPrice > product.price && (
            <span className="text-muted-2 text-sm line-through">{dh(product.regularPrice)}</span>
          )}
        </div>
        {orderable ? (
          <button
            type="button"
            onClick={add}
            className={cn(
              "hover:border-ink h-10 cursor-pointer self-start rounded-full border-[1.5px] px-3.5 text-sm font-bold",
              added ? "border-success bg-success text-white" : "border-line-strong text-ink bg-white",
            )}
          >
            {added ? "Ajouté ✓" : "Ajouter au panier"}
          </button>
        ) : (
          <Link
            href={product.href}
            className="border-line-strong text-ink hover:border-ink flex h-10 items-center self-start rounded-full border-[1.5px] bg-white px-3.5 text-sm font-bold"
          >
            Voir le produit
          </Link>
        )}
      </div>
    </article>
  );
}

/** "Partager": WhatsApp, Facebook, "Copier le lien". */
export function ShareBar({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const pill = "flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-bold";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border-step-line mt-8 flex flex-wrap items-center gap-3 border-t pt-6">
      <span className="mr-1 text-base font-bold">Partager</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener"
        aria-label="Partager sur WhatsApp"
        className={cn(pill, "bg-whatsapp text-white hover:text-white hover:brightness-95")}
      >
        <WhatsAppIcon size={18} />
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener"
        aria-label="Partager sur Facebook"
        className={cn(pill, "bg-facebook text-white hover:text-white hover:brightness-95")}
      >
        <FacebookIcon size={18} />
        Facebook
      </a>
      <button type="button" onClick={copy} className={cn(pill, "border-control text-ink hover:border-ink cursor-pointer border-[1.5px] bg-white")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </svg>
        <span aria-live="polite">{copied ? "Lien copié" : "Copier le lien"}</span>
      </button>
    </div>
  );
}
