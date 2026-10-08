"use client";

import Image from "next/image";
import { useCatalogProducts } from "./CatalogMediaProvider";
import { catalogImageClass } from "../lib/catalog-image";
import { productHref } from "../lib/catalog-navigation";
import SpringSummerProductShelf from "./SpringSummerProductShelf";
import { DEFAULT_CONTENT, type PageContent } from "../lib/editor/content";

const signatureSelection = [
  { handle: "vestido-algodao-bordado", caption: "O bordado" },
  { handle: "vestido-laise-novidades-branco", caption: "A laise" },
  { handle: "camisa-linho", caption: "O linho" },
  { handle: "macacao-tricoline-listra-sage", caption: "As listras" },
] as const;

function EditorialHeading({ id, title, href }: { id: string; title: string; href: string }) {
  return <div className="pb-10 text-center sm:pb-12">
    <h2 id={id} className="font-playfair text-4xl text-[#5c719b] sm:text-5xl">{title}</h2>
    <a href={href} className="mt-4 inline-block border-b border-[#213448] pb-1 font-poppins text-sm text-[#213448] transition hover:border-brand-strong hover:text-brand-strong">Descobrir</a>
  </div>;
}

export default function SpringSummerEditorial({ content = DEFAULT_CONTENT }: { content?: PageContent }) {
  const catalogProducts = useCatalogProducts();
  const signaturePieces = signatureSelection.flatMap(({ handle, caption }) => {
    const product = catalogProducts.find((item) => item.handle === handle);
    return product ? [{ product, caption }] : [];
  });
  return <div className="bg-white">
    <section aria-labelledby="spring-signatures-title" className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-7 sm:pb-24 lg:px-10">
      <EditorialHeading id="spring-signatures-title" title="Detalhes que ficam" href="/catalogo/categoria/vestidos" />
      <div className="bg-[#d8c9b3] p-4 sm:p-7 lg:p-10">
        <div className="mx-auto grid max-w-[1180px] overflow-hidden bg-[#fcfaf5] shadow-[0_18px_35px_rgba(52,43,33,.13)] lg:min-h-[580px] lg:grid-cols-2">
          <div className="flex flex-col justify-between border-b border-[#e4ded4] px-7 py-10 sm:px-12 sm:py-14 lg:border-b-0 lg:border-r lg:px-16 lg:py-16">
            <p className="font-poppins text-[10px] uppercase tracking-[0.28em] text-[#6f6455]">Valutin · Primavera–Verão</p>
            <div className="py-12 lg:py-0">
              <p className="font-playfair text-5xl leading-[1.1] text-[#75664e] sm:text-6xl lg:text-[3.8rem]">Peças para<br />guardar na<br />memória.</p>
              <p className="mt-7 max-w-[330px] font-poppins text-sm leading-7 text-[#665f55]">Bordados, texturas e tecidos leves: pequenos detalhes para acompanhar grandes descobertas.</p>
            </div>
            <span className="font-poppins text-[10px] uppercase tracking-[0.2em] text-[#6f6455]">A delicadeza mora nos detalhes</span>
          </div>
          <div className="grid grid-cols-2 gap-3 bg-[#f6f3ee] p-4 sm:gap-5 sm:p-7 lg:p-9">
            {signaturePieces.map(({ product, caption }) => <a key={product.handle} href={productHref(product.handle)} className="group min-w-0 bg-white p-2 shadow-[0_2px_10px_rgba(52,43,33,.06)] transition hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(52,43,33,.12)] sm:p-3">
              <span className="catalog-product-surface relative block aspect-[4/5] overflow-hidden">
                <Image src={product.displayImages[0]} alt={product.title} fill sizes="(max-width: 640px) 42vw, (max-width: 1024px) 32vw, 250px" className={catalogImageClass(product.displayImages[0], "transition duration-500 group-hover:scale-[1.035]")} />
              </span>
              <span className="mt-2 block font-poppins text-[10px] text-[#213448] sm:text-xs">{caption}</span>
            </a>)}
          </div>
        </div>
      </div>
    </section>

    <SpringSummerProductShelf shelf="detalhes" />

    <section aria-labelledby="spring-blue-title" className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-7 sm:pb-28 lg:px-10">
      <EditorialHeading id="spring-blue-title" title={content.blueTitle} href={content.blueCtaHref} />
      <a href={content.blueCtaHref} className="group relative block overflow-hidden bg-[#dce9f3]">
        <div className="relative aspect-[4/5] w-full sm:aspect-[1.7/1] lg:aspect-[2.35/1]">
          <Image src={content.blueImage} alt={content.blueAlt} fill unoptimized sizes="(max-width: 1440px) 100vw, 1440px" className="object-cover object-[60%_center] transition duration-700 group-hover:scale-[1.02] sm:object-center" />
        </div>
        <span className="absolute bottom-5 left-5 bg-white/95 px-5 py-3 font-poppins text-[11px] uppercase tracking-[0.13em] text-[#213448] sm:bottom-10 sm:left-10">{content.blueCta} →</span>
      </a>
    </section>
  </div>;
}
