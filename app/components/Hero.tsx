"use client";

import Image, { getImageProps } from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { BRAND_NAME, HERO_COPY, LOGO_SRC } from "../lib/constants";

const HERO_ALT = "Looks infantis Valutin para menina e menino";

const { props: mobileHeroProps } = getImageProps({
  src: "/campaign-spring-summer-2026/orange-look-mobile.jpg",
  alt: HERO_ALT,
  width: 1122,
  height: 1402,
  sizes: "100vw",
  priority: true,
});

const mobileHeroSrcSet = mobileHeroProps.srcSet ?? mobileHeroProps.src;

const { props: desktopHeroProps } = getImageProps({
  src: "/campaign-spring-summer-2026/collection-flatlay-desktop.jpg",
  alt: HERO_ALT,
  width: 1672,
  height: 941,
  sizes: "100vw",
  priority: true,
});

interface HeroProps {
  onCtaClick: () => void;
}

export default function Hero({ onCtaClick }: HeroProps) {
  const tagRef = useRef<HTMLParagraphElement>(null);
  const [logoWidth, setLogoWidth] = useState(0);

  useLayoutEffect(() => {
    const el = tagRef.current;
    if (!el) return;

    const measure = () => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const width = Math.ceil(range.getBoundingClientRect().width);
      if (width > 0) setLogoWidth(width);
    };

    measure();
    void document.fonts?.ready?.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section className="relative h-[100svh] min-h-[700px] overflow-hidden bg-cream">
      <picture className="absolute inset-0 block h-full w-full">
        <source
          media="(max-width: 767px)"
          srcSet={mobileHeroSrcSet}
          sizes="100vw"
        />
        <img
          {...desktopHeroProps}
          alt={HERO_ALT}
          className="absolute inset-0 h-full w-full object-contain object-bottom md:object-cover md:object-center"
        />
      </picture>

      {/* Véu claro e responsivo para preservar a leitura sem esconder os looks. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cream/95 via-cream/45 to-transparent md:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-cream/95 via-cream/35 to-transparent md:block"
      />

      <div className="absolute inset-x-0 bottom-0 top-[112px]">
        <div className="mx-auto flex h-full max-w-7xl items-start px-6 pt-9 md:items-center md:px-8 md:pt-0">
          <div className="w-full max-w-[342px] md:max-w-[590px] md:-translate-y-3">
            <div className="mb-4 md:mb-6">
              <Image
                src={`${LOGO_SRC}?v=6`}
                alt={BRAND_NAME}
                width={1024}
                height={295}
                priority

                className="block h-auto object-contain transition-opacity duration-200"
                style={{
                  width: logoWidth ? `${logoWidth}px` : "auto",
                  maxWidth: "100%",
                  height: "auto",
                  opacity: 1,
                }}
              />
              <p
                ref={tagRef}
                className="mt-3 w-max whitespace-nowrap font-poppins text-[9px] uppercase tracking-[0.18em] text-ink/65 sm:text-[10px] md:text-[11px] md:tracking-[0.25em]"
              >
                {HERO_COPY.tag}
              </p>
            </div>

            <h1 className="mb-6 max-w-2xl font-playfair text-[34px] italic leading-[1.08] text-ink sm:text-[40px] md:mb-8 md:text-5xl lg:text-[60px]">
              {HERO_COPY.h1}
            </h1>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="relative inline-flex">
                <button
                  onClick={onCtaClick}
                  className="relative inline-flex items-center rounded-full bg-brand-strong px-8 py-3.5 font-poppins text-[15px] font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-brand/90 md:px-10 md:py-4 md:text-base"
                >
                  Falar pelo WhatsApp
                </button>
              </div>
              <a
                href="/catalogo"
                className="inline-flex items-center justify-center font-poppins text-sm text-ink/75 underline underline-offset-4 transition-colors hover:text-brand-strong"
              >
                Ver catálogo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
