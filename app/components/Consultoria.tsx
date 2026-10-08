"use client";

import Image from "next/image";
import {
  CONSULTORIA_COPY,
  CONSULTORIA_IMAGE,
  CONSULTORIA_ITEMS,
} from "../lib/constants";

interface ConsultoriaProps {
  onCtaClick: () => void;
}

export default function Consultoria({ onCtaClick }: ConsultoriaProps) {
  return (
    <section id="consultoria" className="scroll-mt-28 bg-white px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 overflow-hidden border border-brand/20 bg-cream/15 md:grid-cols-12">
        <div className="flex flex-col justify-center p-8 sm:p-10 md:col-span-7 md:p-14 lg:p-16">
          <p className="font-poppins text-[11px] uppercase tracking-[0.2em] text-brand-strong mb-4">
            {CONSULTORIA_COPY.label}
          </p>

          <h2 className="font-playfair text-[38px] italic text-ink leading-[1.12] mb-6 md:text-[48px]">
            {CONSULTORIA_COPY.title}
          </h2>

          <p className="font-poppins text-base text-gray-600 leading-relaxed mb-8">
            {CONSULTORIA_COPY.body}
          </p>

          <div className="mb-9 grid grid-cols-1 border-y border-brand/20 sm:grid-cols-3 sm:divide-x sm:divide-brand/20">
            {CONSULTORIA_ITEMS.map((item, index) => (
              <div key={item.title} className="py-5 sm:px-5 sm:first:pl-0 sm:last:pr-0">
                <span className="mb-3 block font-playfair text-sm italic text-brand/60">
                  0{index + 1}
                </span>
                <p className="font-poppins text-sm font-medium text-ink">{item.title}</p>
                <p className="mt-1 font-poppins text-xs leading-relaxed text-gray-500">{item.body}</p>
              </div>
            ))}
          </div>

          <button
            onClick={onCtaClick}
            className="self-start font-poppins text-sm text-brand-strong hover:opacity-60 transition-opacity"
          >
            {CONSULTORIA_COPY.cta}
          </button>
        </div>

        <div className="relative min-h-[430px] overflow-hidden md:col-span-5 md:min-h-0">
          <Image
            src={CONSULTORIA_IMAGE}
            alt="Curadoria do conjunto rosa de laise Primavera–Verão Valutin"
            fill
            sizes="(max-width: 767px) 100vw, 40vw"
            className="object-cover transition-transform duration-700 hover:scale-[1.015]"

          />
        </div>
      </div>
    </section>
  );
}
