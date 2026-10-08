import Image from "next/image";
import { GALERIA_HEADER, GALLERY_IMAGES } from "../lib/constants";

export default function Galeria() {
  const [large, ...stacked] = GALLERY_IMAGES;

  return (
    <section className="bg-cream/20 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid grid-cols-1 gap-5 border-t border-brand/25 pt-6 md:mb-16 md:grid-cols-12 md:items-end">
          <p className="font-poppins text-[10px] uppercase tracking-[0.28em] text-brand-strong md:col-span-3">
            {GALERIA_HEADER.label}
          </p>
          <h2 className="font-playfair text-[38px] italic leading-[1.1] text-ink md:col-span-8 md:col-start-5 md:text-[54px]">
            {GALERIA_HEADER.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 border border-brand/15 bg-white p-2 md:grid-cols-3 md:gap-4 md:p-3">
          <div className="relative aspect-[4/5] overflow-hidden md:col-span-2">
            <Image
              src={large.src}
              alt={large.alt}
              fill
              sizes="(max-width: 767px) 100vw, 67vw"
              className="object-cover"
              style={{ objectPosition: "72% center" }}

            />
            <div className="absolute bottom-3 left-3 bg-white/80 px-3 py-2 backdrop-blur-sm">
              <span className="font-poppins text-[11px] uppercase tracking-widest text-brand-strong">
                {large.caption}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:col-span-1 md:flex md:flex-col">
            {stacked.map((img) => (
              <div
                key={img.src}
                className="relative aspect-[4/5] min-h-0 overflow-hidden md:flex-1 md:aspect-auto"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 767px) 50vw, 33vw"
                  className="object-cover"

                />
                <div className="absolute bottom-2 left-2 bg-white/80 px-2.5 py-1.5 backdrop-blur-sm">
                  <span className="font-poppins text-[9px] uppercase tracking-widest text-brand-strong sm:text-[10px]">
                    {img.caption}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
