import Link from "next/link";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { cn } from "@/lib/cn";
import { dh } from "@/lib/format";
import { INSTALL_IMAGE, designImage } from "@/lib/home/assets";
import type { DuctItem } from "@/lib/home/types";
import type { ProductCardData } from "@/lib/types";
import { DuctArt } from "./DuctArt";
import { SLOT } from "./slot";

const card =
  "ease-design box-border flex flex-col gap-3 rounded-[24px] bg-white p-5 transition-[box-shadow,transform] duration-350 hover:-translate-y-1 hover:shadow-card-hover";
const viewBtn =
  "rounded-12 border-line-strong text-ink hover:border-ink hover:bg-ink mt-auto flex h-12 shrink-0 items-center justify-center gap-2 border-[1.5px] bg-white text-[15px] font-bold transition-colors hover:text-white";
const title = "text-ink m-0 line-clamp-2 min-h-[47px] text-lg leading-[1.3] font-medium";

/** Card of the "Gaines circulaires" rail: diameter tag, name, reference, drawn duct, price. */
export function DuctCard({ duct }: { duct: DuctItem }) {
  return (
    <article className={cn(SLOT, card)}>
      {duct.diameter && (
        <span className="rounded-8 border-brand text-brand self-start border-[1.5px] px-[9px] py-[3px] text-sm font-bold md:text-[13px]">
          Ø {duct.diameter}
        </span>
      )}
      <h3 className={title}>{duct.name}</h3>
      <span className="text-muted text-sm">{duct.sku}</span>
      <div className="box-border flex h-[180px] shrink-0 items-center justify-center overflow-hidden p-1">
        {duct.diameter ? <DuctArt diameter={duct.diameter} kind={duct.kind} /> : <ProductVisual art="flex" alt={duct.name} />}
      </div>
      <span className="text-2xl font-extrabold tracking-[-0.02em]">{dh(duct.price)}</span>
      <Link href={duct.href} className={viewBtn}>
        Voir le produit
      </Link>
    </article>
  );
}

/** Card of the "Cuivre, gaz et pièces de rechange" rail: name, reference, picture, price. */
export function SupplyCard({ product }: { product: ProductCardData }) {
  // Drawings are narrowed per kind as in the design (remote 48 %, gas bottle 56 %, others 86 %).
  const width = product.image ? "100%" : product.art === "remote" ? "48%" : product.art === "gaz" ? "56%" : "86%";
  return (
    <article className={cn(SLOT, card)}>
      <h3 className={title}>{product.name}</h3>
      <span className="text-muted text-sm">{product.sku ?? product.refText}</span>
      <div className="box-border flex h-[180px] shrink-0 items-center justify-center overflow-hidden p-1">
        <ProductVisual image={product.image} art={product.art} dark={product.dark} alt={product.imageAlt ?? product.name} width={width} />
      </div>
      <span className="mt-auto text-2xl font-extrabold tracking-[-0.02em]">
        {product.fromPrice && <span className="text-muted mr-1.5 text-sm font-normal tracking-normal">À partir de</span>}
        {dh(product.price)}
      </span>
      <Link href={product.href} className={viewBtn}>
        Voir le produit
      </Link>
    </article>
  );
}

/** Last slot of the supplies rail: "Tout pour l'installation" with links to the two dense ranges. */
export function InstallCard() {
  // Copper photo of the design (uploads/cuivre-56818f19.png) when present, else plain black.
  const image = designImage(INSTALL_IMAGE);
  return (
    <div className={cn(SLOT, "relative box-border flex min-h-[420px] flex-col justify-end gap-3 overflow-hidden rounded-[24px] bg-black p-6")}>
      {image && <div aria-hidden className="absolute inset-0 bg-cover bg-[position:center_30%]" style={{ backgroundImage: `url(${image})` }} />}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.55)_45%,rgba(0,0,0,0)_75%)]" />
      <h3 className="relative m-0 mb-1 text-2xl leading-[1.2] font-bold tracking-[-0.02em] text-white">Tout pour l&apos;installation</h3>
      <Link
        href="/cuivre-et-gaz"
        className="text-ink hover:bg-accent relative flex h-12 items-center justify-center rounded-full bg-white text-[15px] font-bold transition-colors hover:text-white"
      >
        Voir cuivre et gaz
      </Link>
      <Link
        href="/pieces-de-rechange"
        className="relative flex h-12 items-center justify-center rounded-full border-[1.5px] border-white/70 text-[15px] font-bold text-white transition-colors hover:bg-white/15 hover:text-white"
      >
        Voir les pièces de rechange
      </Link>
    </div>
  );
}
