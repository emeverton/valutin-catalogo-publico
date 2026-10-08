"use client";
import { useState } from "react";
import { VIDEO_LABEL, VIDEO_TITLE, VIDEO_YOUTUBE_ID } from "../lib/constants";

export default function Video() {
  const [started, setStarted] = useState(false);
  return <section className="bg-cream/20 px-6 py-20 md:py-28"><div className="mx-auto max-w-6xl">
    <p className="text-xs uppercase tracking-[0.2em] text-brand-strong">{VIDEO_LABEL}</p>
    <h2 className="my-6 font-playfair text-4xl italic text-ink md:text-5xl">{VIDEO_TITLE}</h2>
    <div className="relative aspect-video overflow-hidden border border-brand/20 bg-ink">
      {started ? <iframe title={`${VIDEO_TITLE} — vídeo Valutin`} src={`https://www.youtube.com/embed/${VIDEO_YOUTUBE_ID}?autoplay=1&controls=1&playsinline=1&rel=0`} referrerPolicy="strict-origin-when-cross-origin" className="absolute inset-0 h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /> : <button type="button" onClick={()=>setStarted(true)} className="absolute inset-0 grid w-full place-items-center bg-cover bg-center" style={{backgroundImage:`linear-gradient(#0003,#0005),url(https://i.ytimg.com/vi/${VIDEO_YOUTUBE_ID}/hqdefault.jpg)`}} aria-label={`Assistir: ${VIDEO_TITLE}`}><span className="rounded-full bg-white px-6 py-4 text-sm font-medium text-[#40566e]">▶ Assistir à história</span></button>}
    </div>
  </div></section>;
}
