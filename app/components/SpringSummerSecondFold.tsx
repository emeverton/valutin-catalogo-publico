"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useCatalogProducts } from "./CatalogMediaProvider";
import { catalogImageClass } from "../lib/catalog-image";
import { productHref } from "../lib/catalog-navigation";
import { DEFAULT_CONTENT, type PageContent } from "../lib/editor/content";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const lookSelection = [
  { handle: "vestido-laise-novidades-amarelo", label: "Flores para os dias de sol" },
  { handle: "macacao-tricoline-listra-sage", label: "Primeiros passeios" },
  { handle: "conjunto-laise-laranja", label: "Cores para brincar" },
  { handle: "vestido-de-laise-azul", label: "Delicadeza em azul" },
  { handle: "camisa-linho", label: "Leveza do linho" },
  { handle: "vestido-algodao-rosa", label: "Um dia especial" },
] as const;

export default function SpringSummerSecondFold({ content = DEFAULT_CONTENT }: { content?: PageContent }) {
  const catalogProducts = useCatalogProducts();
  const looks = lookSelection.flatMap(({ handle, label }) => {
    const product = catalogProducts.find((item) => item.handle === handle);
    return product ? [{ product, label }] : [];
  });
  const trackRef = useRef<HTMLDivElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(true);

  function updateScrollState() {
    const track = trackRef.current;
    if (!track) return;
    setCanGoBack(track.scrollLeft > 8);
    setCanGoForward(track.scrollLeft + track.clientWidth < track.scrollWidth - 8);
  }

  function scrollLooks(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  }

  return <div className="bg-white">
    <section aria-labelledby="spring-looks-title" className="mx-auto max-w-[1440px] px-4 pb-20 pt-20 sm:px-7 sm:pb-24 sm:pt-24 lg:px-10">
      <div className="mb-7 flex flex-col gap-3 sm:mb-9 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-poppins text-[10px] uppercase tracking-[0.2em] text-[#60718a]">Uma seleção Valutin</p><h2 id="spring-looks-title" className="mt-2 font-playfair text-3xl text-[#213448] sm:text-4xl">Destaques Primavera–Verão</h2></div><a href="/catalogo#departments-title" className="w-fit border-b border-[#213448] pb-1 font-poppins text-xs text-[#213448] transition hover:border-brand-strong hover:text-brand-strong">Ver categorias do catálogo</a></div>
      <div className="relative">
        <div ref={trackRef} onScroll={updateScrollState} tabIndex={0} aria-label="Peças em destaque da Primavera–Verão" className="spring-look-track flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 sm:gap-5 lg:gap-6">
          {looks.map(({ product, label }) => <a key={product.handle} href={productHref(product.handle)} className="group block w-[76vw] shrink-0 snap-start sm:w-[42vw] lg:w-[27%]">
            <span className="catalog-product-surface relative block aspect-square overflow-hidden bg-[#f5f4f2] p-4 sm:p-5">
              <Image src={product.displayImages[0]} alt={product.title} fill sizes="(max-width: 640px) 76vw, (max-width: 1024px) 42vw, 27vw" className={catalogImageClass(product.displayImages[0], "transition duration-500 group-hover:scale-[1.035]")} />
            </span>
            <span className="mt-3 block font-poppins text-sm text-[#213448] transition group-hover:text-brand-strong sm:text-base">{label}</span>
            <span className="mt-1 block font-poppins text-[11px] text-[#607080]">{product.title}</span>
            <span className="mt-1 block font-poppins text-sm font-medium text-[#213448]">{product.price === null ? "Preço sob consulta" : money.format(product.price)}</span>
          </a>)}
        </div>
        {canGoBack && <button type="button" onClick={() => scrollLooks(-1)} aria-label="Ver peças anteriores" className="absolute left-3 top-[calc(50%-20px)] grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-[#213448] shadow-md transition hover:bg-[#213448] hover:text-white">←</button>}
        {canGoForward && <button type="button" onClick={() => scrollLooks(1)} aria-label="Ver próximas peças" className="absolute right-3 top-[calc(50%-20px)] grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-[#213448] shadow-md transition hover:bg-[#213448] hover:text-white">→</button>}
      </div>
    </section>

    <section aria-labelledby="spring-outings-title" className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-7 sm:pb-24 lg:px-10">
      <div className="pb-10 text-center"><h2 id="spring-outings-title" className="font-playfair text-4xl text-[#5c719b] sm:text-5xl">{content.outingsTitle}</h2><a href={content.outingsCtaHref} className="mt-4 inline-block border-b border-[#213448] pb-1 font-poppins text-sm text-[#213448] transition hover:border-brand-strong hover:text-brand-strong">Descobrir</a></div>
      <a href={content.outingsCtaHref} className="group relative block aspect-[1.25/1] overflow-hidden bg-[#ebe5db] sm:aspect-[1.8/1] lg:aspect-[2.5/1]">
        <Image src={content.outingsImage} alt={content.outingsAlt} fill unoptimized sizes="(max-width: 1440px) 100vw, 1440px" className="object-cover object-center transition duration-700 group-hover:scale-[1.02]" />
        <span className="absolute bottom-6 left-6 bg-white/95 px-5 py-3 font-poppins text-[11px] uppercase tracking-[0.13em] text-[#213448] sm:bottom-10 sm:left-10">{content.outingsCta} →</span>
      </a>
    </section>
  </div>;
}
