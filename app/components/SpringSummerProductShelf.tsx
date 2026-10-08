"use client";

import Image from "next/image";
import { useCatalogProducts } from "./CatalogMediaProvider";
import { catalogImageClass } from "../lib/catalog-image";
import { productHref } from "../lib/catalog-navigation";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const shelves = {
  passeios: {
    title: "Para passear e descobrir",
    eyebrow: "Escolhas para os dias de sol",
    handles: [
      "macacao-fustao-azul",
      "conjunto-body-shorts-floral",
      "vestido-xadrez-rosa",
      "macacao-tricoline-listra-vermelha",
    ],
  },
  detalhes: {
    title: "Texturas para guardar",
    eyebrow: "A curadoria Valutin",
    handles: [
      "vestido-percal-tricolor",
      "vestido-de-laise-rosa",
      "conjunto-laise-rosa",
      "vestido-listrado-algodao-floral",
    ],
  },
} as const;

export default function SpringSummerProductShelf({ shelf }: { shelf: keyof typeof shelves }) {
  const productsByHandle = new Map(useCatalogProducts().map((product) => [product.handle, product]));
  const { eyebrow, title, handles } = shelves[shelf];
  const products = handles.map((handle) => {
    const product = productsByHandle.get(handle);
    if (!product) throw new Error(`Peça ausente da vitrine Primavera–Verão: ${handle}`);
    return product;
  });

  return <section aria-labelledby={`spring-shelf-${shelf}`} className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-7 sm:pb-24 lg:px-10">
    <div className="mb-7 flex flex-col gap-4 border-t border-[#dfe3e9] pt-8 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-poppins text-[10px] uppercase tracking-[0.2em] text-[#60718a]">{eyebrow}</p>
        <h2 id={`spring-shelf-${shelf}`} className="mt-2 font-playfair text-3xl text-[#213448] sm:text-4xl">{title}</h2>
      </div>
      <a href="/catalogo#types-title" className="w-fit border-b border-[#213448] pb-1 font-poppins text-xs text-[#213448] transition hover:border-brand-strong hover:text-brand-strong">Ver peças por categoria</a>
    </div>
    <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 lg:grid-cols-4 lg:gap-6">
      {products.map((product) => <article key={product.handle} className="group min-w-0 border border-[#e8e8e6] bg-white p-2 pb-4 transition duration-300 hover:border-[#c5ceda] hover:shadow-[0_12px_28px_rgba(32,52,72,.09)] sm:p-3 sm:pb-5">
        <a href={productHref(product.handle)} className="catalog-product-surface relative block aspect-[3/4] overflow-hidden" aria-label={`Ver ${product.title}`}>
          <Image src={product.displayImages[0]} alt={product.title} fill sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 23vw" className={catalogImageClass(product.displayImages[0], "transition duration-500 group-hover:scale-[1.035]")} />
        </a>
        <div className="px-1 pt-4 sm:px-2">
          <p className="font-poppins text-[9px] uppercase tracking-[0.16em] text-[#60718a]">Primavera–Verão</p>
          <h3 className="mt-2 min-h-[2.75rem] font-poppins text-xs font-medium leading-relaxed text-[#213448] sm:text-sm"><a href={productHref(product.handle)} className="hover:underline hover:underline-offset-4">{product.title}</a></h3>
          <p className="mt-2 font-poppins text-sm text-[#213448]">{product.price === null ? "Preço sob consulta" : money.format(product.price)}</p>
          <p className="mt-2 min-h-[2.25rem] font-poppins text-[10px] leading-relaxed text-[#69737e]">Tamanhos do modelo: {product.sizes.slice(0, 4).join(" · ")}</p>
          <a href={productHref(product.handle)} className="mt-4 inline-block border-b border-[#213448] pb-1 font-poppins text-[10px] uppercase tracking-[0.11em] text-[#213448] transition hover:border-brand-strong hover:text-brand-strong">Ver a peça →</a>
        </div>
      </article>)}
    </div>
  </section>;
}
