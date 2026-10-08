"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { PageContent } from "../lib/editor/content";

const poster = "/media/valutin-spring-summer-carousel-poster.jpg";
const video = "/media/valutin-spring-summer-carousel.mp4";

export default function SpringSummerHero({ content }: { content: PageContent }) {
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setMotionAllowed(!preference.matches);
    syncMotion();
    preference.addEventListener("change", syncMotion);
    return () => preference.removeEventListener("change", syncMotion);
  }, []);

  return (
    <section
      aria-label="Coleção Primavera–Verão Valutin"
      className="relative h-[clamp(560px,72vh,720px)] w-full overflow-hidden bg-[#d9dce0]"
    >
      <Image src={content.heroPoster || poster} alt="" fill priority unoptimized sizes="100vw" className="object-cover object-center" />
      {motionAllowed && content.heroVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={content.heroPoster || poster}
          aria-hidden="true"
          onPlaying={() => setVideoPlaying(true)}
          onPause={() => setVideoPlaying(false)}
          onError={() => setVideoPlaying(false)}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ${videoPlaying ? "opacity-100" : "opacity-0"}`}
        >
          <source src={content.heroVideo || video} type="video/mp4" />
        </video>
      )}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#13273a]/85 via-[#13273a]/45 to-[#13273a]/10"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#13273a]/55 via-transparent to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 flex items-center px-5 pb-8 pt-10 sm:px-12 lg:px-16">
        <div className="max-w-[620px] text-white">
          <p className="font-poppins text-[10px] font-medium uppercase tracking-[0.22em] text-white/90 sm:text-xs">{content.heroEyebrow}</p>
          <h1 className="mt-5 max-w-[600px] font-playfair text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] drop-shadow-sm">
            {content.heroTitle}
          </h1>
          <p className="mt-5 max-w-[490px] font-poppins text-sm leading-relaxed text-white/95 sm:text-base">
            {content.heroDescription}
          </p>
          <a
            href={content.heroCtaHref}
            className="mt-8 inline-flex min-h-14 items-center justify-center gap-4 rounded-full border border-white bg-white px-7 py-3 font-poppins text-xs font-semibold uppercase tracking-[0.09em] text-[#213448] shadow-[0_10px_30px_rgba(0,0,0,.2)] transition hover:bg-[#213448] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-9"
          >
            {content.heroCta} <span aria-hidden="true" className="text-lg leading-none">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
