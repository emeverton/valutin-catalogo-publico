import { MANIFESTO_COPY } from "../lib/constants";

export default function Manifesto() {
  return (
    <section className="bg-white px-6 py-24 md:py-36">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
        <div className="border-t border-brand/30 pt-5 md:col-span-2">
          <p className="font-poppins text-[10px] uppercase tracking-[0.28em] text-brand-strong">
            A Maison Valutin
          </p>
          <p className="mt-3 font-playfair text-lg italic text-ink/50">Desde 1998</p>
        </div>

        <div className="relative md:col-span-8 md:col-start-4">
          <span className="absolute -left-1 -top-12 font-playfair text-8xl leading-none text-brand/10 md:-left-12 md:-top-14 md:text-9xl">
            &ldquo;
          </span>
          <blockquote className="relative font-playfair text-[27px] italic leading-[1.4] text-ink md:text-[38px] md:leading-[1.35]">
            {MANIFESTO_COPY.quote}
          </blockquote>

          <div className="mt-10 flex items-center gap-5">
            <span className="h-px w-12 bg-brand/45" />
            <p className="font-poppins text-[10px] uppercase tracking-[0.24em] text-brand-strong">
              {MANIFESTO_COPY.attribution}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
