import Image from "next/image";
import { CONSULTORIA_COPY, CONSULTORIA_IMAGE, CONSULTORIA_ITEMS } from "../lib/constants";
import WhatsAppCta from "./WhatsAppCta";

export default function SpringSummerConcierge() {
  return (
    <section id="consultoria-primavera-verao" aria-labelledby="spring-concierge-title" className="bg-white px-4 py-16 sm:px-7 sm:py-24 lg:px-10">
      <div className="mx-auto grid max-w-[1440px] overflow-hidden border border-brand/20 bg-cream/15 lg:grid-cols-12">
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:col-span-7 lg:p-14 xl:p-16">
          <p className="font-poppins text-[11px] uppercase tracking-[0.2em] text-brand-strong">{CONSULTORIA_COPY.label}</p>
          <h2 id="spring-concierge-title" className="mt-5 max-w-2xl font-playfair text-[38px] italic leading-[1.1] text-ink sm:text-[48px]">{CONSULTORIA_COPY.title}</h2>
          <p className="mt-6 max-w-2xl font-poppins text-sm leading-7 text-ink/70 sm:text-base">{CONSULTORIA_COPY.body}</p>

          <div className="mt-9 grid border-y border-brand/20 sm:grid-cols-3 sm:divide-x sm:divide-brand/20">
            {CONSULTORIA_ITEMS.map((item, index) => (
              <div key={item.title} className="py-5 sm:px-5 sm:first:pl-0 sm:last:pr-0">
                <span className="font-playfair text-sm italic text-brand/60">0{index + 1}</span>
                <h3 className="mt-3 font-poppins text-sm font-medium text-ink">{item.title}</h3>
                <p className="mt-1 font-poppins text-xs leading-relaxed text-ink/60">{item.body}</p>
              </div>
            ))}
          </div>

          <WhatsAppCta src="primavera-verao-consultoria" className="mt-8 self-start border-b border-brand-strong pb-1 font-poppins text-sm text-brand-strong transition-colors hover:text-ink">
            {CONSULTORIA_COPY.cta}
          </WhatsAppCta>
        </div>

        <div className="relative min-h-[410px] overflow-hidden lg:col-span-5 lg:min-h-[630px]">
          <Image src={CONSULTORIA_IMAGE} alt="Detalhe artesanal de vestido infantil Valutin" fill sizes="(max-width: 1023px) 100vw, 42vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
