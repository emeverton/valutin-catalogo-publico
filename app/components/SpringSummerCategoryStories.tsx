"use client";

import Image from "next/image";
import { useState } from "react";
import { categoryHref } from "../lib/catalog-navigation";
import type { PageContent } from "../lib/editor/content";
const STORY_VIDEO_YOUTUBE_ID = "f1s5h1GuIZY";

const stories = [
  {
    href: categoryHref("crianca"),
    image: "/campaign-spring-summer-2026/embroidered-detail.jpg",
    alt: "Detalhe editorial de bordado floral em cardigan infantil",
    eyebrow: "Feito para guardar",
    title: "Detalhes que contam história.",
    cta: "▶ Assistir à história",
    gradient: "from-black/60",
    imagePosition: "object-center",
  },
  {
    href: categoryHref("presentes"),
    image: "/campaign-spring-summer-2026/gifts-still-life.jpg",
    alt: "Vestido branco de laise e macaquinho branco da coleção Primavera–Verão",
    eyebrow: "Para presentear",
    title: "Uma escolha que permanece.",
    cta: "Ver presentes",
    gradient: "from-[#244466]/70",
    imagePosition: "object-center",
  },
] as const;

export default function SpringSummerCategoryStories({ content }: { content: PageContent }) {
  const [playing, setPlaying] = useState(false);
  const pageStories = stories.map((story, index) => index === 0 ? {
    ...story, image: content.storyOneImage, alt: content.storyOneAlt, eyebrow: content.storyOneEyebrow, title: content.storyOneTitle,
  } : { ...story, image: content.storyTwoImage, alt: content.storyTwoAlt, eyebrow: content.storyTwoEyebrow, title: content.storyTwoTitle });
  return (
    <section id="historias-primavera-verao" aria-label="Descubra peças para crianças e presentes" className="mx-auto max-w-[1440px] scroll-mt-36 px-4 py-8 sm:px-7 sm:py-12 lg:px-10">
      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        {pageStories.map((story, index) => (
          <div key={story.href} className="group relative block min-h-[440px] overflow-hidden bg-[#e8e4dc] sm:min-h-[540px] lg:min-h-[600px]">
            <Image src={story.image} alt={story.alt} fill unoptimized sizes="(max-width: 767px) 100vw, (max-width: 1440px) 50vw, 700px" className={`object-cover ${story.imagePosition} transition-transform duration-700 group-hover:scale-[1.03]`} />
            <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t ${story.gradient} to-transparent`} />
            <div className="absolute inset-x-0 bottom-0 px-7 pb-8 pt-24 text-white sm:px-9 sm:pb-10">
              <p className="font-poppins text-[10px] uppercase tracking-[0.18em] text-white/85">{story.eyebrow}</p>
              <h2 className="mt-3 max-w-md font-playfair text-4xl leading-[1.06] sm:text-5xl">{story.title}</h2>
              <span className="mt-6 inline-block border-b border-white pb-1 font-poppins text-[11px] uppercase tracking-[0.13em]">{story.cta}</span>
            </div>
            {index === 0 ? (
              playing ? <div className="absolute inset-0 flex items-center bg-black">
                <iframe title="Conheça a Valutin — história da marca" src={`https://www.youtube-nocookie.com/embed/${STORY_VIDEO_YOUTUBE_ID}?autoplay=1&playsinline=1&rel=0`} referrerPolicy="strict-origin-when-cross-origin" className="absolute inset-0 h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
                <button type="button" onClick={() => setPlaying(false)} className="absolute right-3 top-3 rounded bg-white px-4 py-3 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Fechar vídeo</button>
              </div> : <button type="button" aria-label="Assistir à história da Valutin" onClick={() => setPlaying(true)} className="absolute inset-0 h-full w-full focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-white" />
            ) : <a href={story.href} aria-label={`${story.title} ${story.cta}`} className="absolute inset-0 focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-white" />}
          </div>
        ))}
      </div>
    </section>
  );
}
