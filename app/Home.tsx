"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import AnnouncementBar from "./components/AnnouncementBar";
import Footer from "./components/Footer";
import GtmSnippet from "./components/GtmSnippet";
import Header from "./components/Header";
import Consultoria from "./components/Consultoria";
import Diferenciais from "./components/Diferenciais";
import ComoChegar from "./components/ComoChegar";
import Manifesto from "./components/Manifesto";
import Galeria from "./components/Galeria";
import Depoimentos from "./components/Depoimentos";
import { catalogProducts as products } from "./lib/catalog-individual";
import { categoryHref, departments, productHref } from "./lib/catalog-navigation";
import { catalogImageClass } from "./lib/catalog-image";
import { RETAIL_ONLY_COPY } from "./lib/constants";
import WhatsAppCta from "./components/WhatsAppCta";
import styles from "./HomeHero.module.css";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const carouselPoster = "/media/valutin-spring-summer-carousel-poster.jpg";

export default function Home() {
  const [retailBlock, setRetailBlock] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  useEffect(() => { const q = new URLSearchParams(window.location.search); setRetailBlock(q.get("intencao") === "atacado-bloqueado" || q.get("blocked") === "wholesale"); }, []);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setMotionAllowed(!preference.matches);
    syncMotion();
    preference.addEventListener("change", syncMotion);
    return () => preference.removeEventListener("change", syncMotion);
  }, []);
  const featured = ["vestido-de-laise-rosa", "vestido-listrado-preto", "bloomer-fustao", "vestido-algodao-bordado"].map((handle) => products.find((product) => product.handle === handle)!).filter(Boolean);
  const categoryImages = ["saia-algodao-branca", "vestido-de-laise-rosa", "vestido-laise-novidades-branco"].map((handle) => products.find((product) => product.handle === handle)!).filter(Boolean);
  return <><a href="#main-content" className="skip-link">Pular para o conteúdo</a><GtmSnippet/><AnnouncementBar/>{retailBlock && <div className="fixed left-0 right-0 top-[32px] z-[75] bg-[#444643] px-4 py-2 text-center font-poppins text-xs text-white">{RETAIL_ONLY_COPY.blocked}</div>}<Header onOpenModal={() => { window.location.href = "/atendimento" + window.location.search; }}/><main id="main-content" tabIndex={-1}>
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <div className={styles.visual} aria-hidden="true">
        <div className={styles.media}>
          {motionAllowed ? <video autoPlay muted loop playsInline preload="metadata" poster={carouselPoster} className={styles.video}>
            <source src="/media/valutin-spring-summer-carousel.mp4" type="video/mp4" />
          </video> : <Image src={carouselPoster} alt="" fill priority sizes="(max-width: 1099px) 100vw, 58vw" className={styles.poster} />}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Nova coleção · Primavera–Verão 2026/27</p>
          <h1 id="home-hero-title" className={styles.title}>Primavera Verão <em>Valutin</em></h1>
          <p className={styles.description}>Leveza, delicadeza e pequenos detalhes criados para acompanhar os momentos mais especiais da infância.</p>
          <div className={styles.actions}>
            <a href="/catalogo/primavera-verao" className={styles.primary}>Conheça a nova coleção</a>
            <WhatsAppCta src="home-hero" className={styles.secondary} ariaLabel="Fale com nosso Concierge pelo atendimento Valutin">Fale com nosso Concierge</WhatsAppCta>
          </div>
          <a href="#visite-a-loja" className={styles.store}>Visite nossa loja <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-10 lg:py-20"><div className="flex items-end justify-between"><div><p className="font-poppins text-[11px] uppercase tracking-[0.16em] text-brand-strong">Descubra</p><h2 className="mt-3 font-playfair text-4xl">Por momento</h2></div><a href="/catalogo" className="font-poppins text-xs underline underline-offset-4">Ver catálogo</a></div><div className="mt-9 grid gap-4 md:grid-cols-3">{departments.slice(0, 3).map((department, index) => <a key={department.slug} href={categoryHref(department.slug)} className="catalog-product-surface group relative aspect-[4/5] overflow-hidden"><Image src={categoryImages[index].displayImages[0]} alt={department.label} fill sizes="(max-width: 768px) 100vw, 33vw" className={catalogImageClass(categoryImages[index].displayImages[0], "transition duration-500 group-hover:scale-[1.03]")}/><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent px-6 pb-6 pt-16 text-white"><p className="font-poppins text-[10px] uppercase tracking-[0.15em]">Valutin</p><h3 className="mt-2 font-playfair text-3xl">{department.label}</h3><span className="mt-3 inline-block font-poppins text-xs underline underline-offset-4">Descobrir</span></div></a>)}</div></section>
    <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-10 lg:pb-24"><a href={categoryHref("batizado")} className="group relative block min-h-[430px] overflow-hidden bg-[#213f33] sm:min-h-[520px]"><Image src="/campaign-spring-summer-2026/celebration-white-dress.jpg" alt="Vestido branco de laise em cena de celebração Primavera–Verão" fill sizes="(max-width: 1440px) 100vw, 1440px" className="object-cover object-[65%_center] transition duration-700 group-hover:scale-[1.02] sm:object-center"/><div className="absolute inset-0 bg-gradient-to-r from-[#10271b]/85 via-[#10271b]/25 to-transparent"/><div className="relative flex min-h-[430px] max-w-xl items-end px-7 py-9 text-white sm:min-h-[520px] sm:px-12 sm:py-12"><div><p className="font-poppins text-[11px] uppercase tracking-[0.18em] text-white/80">Momentos especiais</p><h2 className="mt-4 font-playfair text-4xl leading-[.98] sm:text-5xl">Celebrações que viram lembrança.</h2><p className="mt-5 max-w-md font-poppins text-sm leading-relaxed text-white/85">Uma seleção delicada para batizados, festas e encontros em família.</p><span className="mt-7 inline-block border-b border-white pb-1 font-poppins text-xs uppercase tracking-[0.13em]">Conhecer a seleção</span></div></div></a></section>
    <section className="bg-[#f6f2eb] py-16 lg:py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10"><div className="flex items-end justify-between"><div><p className="font-poppins text-[11px] uppercase tracking-[0.16em] text-brand-strong">Seleção da semana</p><h2 className="mt-3 font-playfair text-4xl">Peças em destaque</h2></div><a href="/catalogo" className="font-poppins text-xs underline underline-offset-4">Ver todas</a></div><div className="mt-9 grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-4 sm:gap-x-5">{featured.map((product) => <article key={product.handle} className="group"><a href={productHref(product.handle)} className="catalog-product-surface relative block aspect-[3/4] overflow-hidden p-2"><Image src={product.displayImages[0]} alt={product.title} fill sizes="(max-width: 640px) 50vw, 25vw" className={catalogImageClass(product.displayImages[0], "transition duration-500 group-hover:scale-[1.02]")}/></a><a href={productHref(product.handle)} className="mt-4 block font-poppins text-[11px] uppercase tracking-[0.08em] hover:text-brand-strong">{product.title}</a><p className="mt-1 font-poppins text-sm text-ink/75">{product.price === null ? "Preço sob consulta" : money.format(product.price)}</p></article>)}</div></div></section>
    <Manifesto />
    <Consultoria onCtaClick={() => { window.location.href = "/atendimento" + window.location.search; }}/>
    <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24"><div className="grid gap-5 md:grid-cols-2"><a href={categoryHref("crianca")} className="group relative min-h-[520px] overflow-hidden bg-[#e6dfd1] sm:min-h-[620px]"><Image src="/campaign-spring-summer-2026/embroidered-detail.jpg" alt="Detalhe editorial de bordado floral em cardigan infantil" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.03]"/><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-7 pb-8 pt-28 text-white"><p className="font-poppins text-[10px] uppercase tracking-[0.18em] text-white/80">Feito para guardar</p><h2 className="mt-3 font-playfair text-4xl">Detalhes que contam história.</h2><span className="mt-5 inline-block border-b border-white pb-1 font-poppins text-xs uppercase tracking-[0.13em]">Ver para crianças</span></div></a><a href={categoryHref("presentes")} className="group relative min-h-[520px] overflow-hidden bg-[#d8e4f2] sm:min-h-[620px]"><Image src="/campaign-spring-summer-2026/gifts-still-life.jpg" alt="Vestido branco de laise e macaquinho branco da coleção Primavera–Verão" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-center transition duration-700 group-hover:scale-[1.03]"/><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#244466]/65 to-transparent px-7 pb-8 pt-28 text-white"><p className="font-poppins text-[10px] uppercase tracking-[0.18em] text-white/85">Para presentear</p><h2 className="mt-3 max-w-sm font-playfair text-4xl">Uma escolha que permanece.</h2><span className="mt-5 inline-block border-b border-white pb-1 font-poppins text-xs uppercase tracking-[0.13em]">Ver presentes</span></div></a></div></section>
    <Diferenciais onOpenModal={() => { window.location.href = "/atendimento" + window.location.search; }}/>
    <Galeria />
    <section id="maison" className="mx-auto grid max-w-[1440px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:py-24"><div><p className="font-poppins text-[11px] uppercase tracking-[0.16em] text-brand-strong">A Maison Valutin</p><h2 className="mt-4 max-w-xl font-playfair text-5xl leading-[.98]">Peças que acompanham a história de cada família.</h2></div><div className="self-end"><p className="font-poppins text-base leading-relaxed text-ink/75">Da primeira roupa aos encontros de família, a curadoria Valutin aproxima conforto, acabamento e memória. Visite a loja ou fale com nossa equipe para escolher a peça ideal.</p><a href="/atendimento" className="mt-6 inline-block font-poppins text-xs uppercase tracking-[0.13em] text-brand-strong underline underline-offset-4">Falar com a Valutin</a></div></section>
    <Depoimentos />
    <div id="visite-a-loja"><ComoChegar/></div>
  </main><Footer/></>;
}
