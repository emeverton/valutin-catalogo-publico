"use client";

import { DIFERENCIAIS } from "../lib/constants";

interface DiferenciaisProps {
  onOpenModal: () => void;
}

export default function Diferenciais({ onOpenModal }: DiferenciaisProps) {
  return (
    <section className="bg-brand-strong px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl border border-white/25 px-7 py-8 sm:px-10 md:px-12 md:py-10">
        <div className="mb-8 flex items-center justify-between border-b border-white/20 pb-6">
          <p className="font-poppins text-[10px] uppercase tracking-[0.3em] text-white/75">
            A assinatura Valutin
          </p>
          <p className="font-playfair text-sm italic text-white/75">São Paulo · 1998</p>
        </div>

        <div className="grid grid-cols-1 divide-y divide-white/20 md:grid-cols-3 md:divide-x md:divide-y-0">
          {DIFERENCIAIS.map((item) => (
            <div key={item.number} className="py-8 md:px-9 md:first:pl-0 md:last:pr-0">
              <span className="block font-playfair text-5xl italic text-white/20 mb-6 leading-none">
                {item.number}
              </span>
              <h3 className="font-playfair text-[24px] text-white mb-3">{item.title}</h3>
              <p className="font-poppins text-[13px] text-white/75 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-white/20 pt-8 text-center md:pt-10">
          <button
            onClick={onOpenModal}
            className="font-poppins text-[13px] uppercase tracking-[0.15em] text-white/80 hover:text-white transition-colors duration-200 cursor-pointer"
          >
            Iniciar atendimento →
          </button>
        </div>
      </div>
    </section>
  );
}
