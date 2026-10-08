"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BRAND_NAME, INSTAGRAM_URL, LOGO_SRC } from "../lib/constants";
import { catalogImageClass } from "../lib/catalog-image";
import { useCatalogProducts } from "./CatalogMediaProvider";
import { megaMenuSections } from "../lib/mega-menu";
import { buildAtendimentoHref } from "../lib/whatsapp/attr-merge";

interface HeaderProps { onOpenModal?: () => void; fromCatalog?: boolean; }

// Keep the seasonal landing page reachable through the logo and collection links,
// without repeating it as a department in the primary navigation.
const departmentSections = megaMenuSections.filter((section) => section.key !== "primavera-verao");
const storeHref = "/catalogo/primavera-verao#visite-a-loja";

export default function Header({ onOpenModal, fromCatalog = false }: HeaderProps) {
  const productByHandle = new Map(useCatalogProducts().map((product) => [product.handle, product]));
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = megaMenuSections.find((section) => section.key === menu);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenu(null); setMobileOpen(false); }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const closeMenu = () => setMenu(null);
  const openService = onOpenModal ?? (() => { window.location.href = buildAtendimentoHref({ extra: { src: "header" } }); });

  return <>
    {current && <button type="button" aria-label="Fechar menu de navegação" onClick={closeMenu} className="fixed inset-x-0 bottom-0 top-[142px] z-[65] hidden bg-[#17233b]/25 lg:block" />}
    <header className={`fixed left-0 right-0 top-[32px] z-[70] border-b transition ${scrolled || current || mobileOpen ? "border-ink/10 bg-white shadow-sm" : "border-white/40 bg-white/95 backdrop-blur"}`} onMouseLeave={closeMenu}>
      <div className="mx-auto grid h-[68px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-7 lg:px-10">
        <div className="hidden items-center gap-5 lg:flex"><a href={storeHref} onFocus={closeMenu} className="font-poppins text-[10px] uppercase tracking-[0.12em] text-ink/75 transition hover:text-brand-strong">Loja Valutin</a><button type="button" onFocus={closeMenu} onClick={openService} className="font-poppins text-[10px] uppercase tracking-[0.12em] text-ink/75 transition hover:text-brand-strong">Atendimento</button></div>
        <button type="button" onClick={() => { setMobileOpen(!mobileOpen); closeMenu(); }} aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"} className="inline-flex h-11 items-center font-poppins text-[11px] uppercase tracking-[0.14em] text-ink lg:hidden">{mobileOpen ? "Fechar" : "Menu"}</button>
        <a href="/" onFocus={closeMenu} aria-label={`Página inicial ${BRAND_NAME}`} className="justify-self-center"><Image src={LOGO_SRC} alt={BRAND_NAME} width={180} height={52} priority className="h-9 w-auto object-contain md:h-11" /></a>
        <div className="flex items-center justify-end gap-3 sm:gap-5">
          <a href={fromCatalog ? "#catalog-search" : "/catalogo#catalog-search"} onFocus={closeMenu} aria-label="Buscar no catálogo" className="grid h-11 w-7 place-items-center text-ink/70 hover:text-brand-strong"><svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="1.5"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg></a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" onFocus={closeMenu} aria-label="Instagram Valutin" className="hidden font-poppins text-[10px] uppercase tracking-[0.12em] text-ink/70 hover:text-brand-strong sm:block">Instagram</a>
          <button type="button" aria-label="Falar com a Valutin" onFocus={closeMenu} onClick={openService} className="grid h-9 w-9 place-items-center rounded-full border border-ink/25 text-ink transition hover:border-brand-strong hover:text-brand-strong"><svg viewBox="0 0 24 24" className="h-[17px] w-[17px] fill-none stroke-current" strokeWidth="1.4"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.7-3.4 3-5.1 6.5-5.1s5.8 1.7 6.5 5.1"/></svg></button>
        </div>
      </div>

      <nav className="hidden h-[42px] items-center justify-center gap-7 border-t border-ink/10 lg:flex" aria-label="Navegação principal">
        {departmentSections.map((section) => <button key={section.key} type="button" onMouseEnter={() => setMenu(section.key)} onFocus={() => setMenu(section.key)} onClick={() => setMenu(section.key)} aria-expanded={menu === section.key} aria-controls="mega-navigation" className={`relative h-full whitespace-nowrap px-1 font-poppins text-[12px] font-medium transition hover:text-brand-strong ${menu === section.key ? "text-brand-strong after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-brand-strong" : "text-[#213448]"}`}>{section.label}</button>)}
      </nav>

      {current && <div id="mega-navigation" className="hidden max-h-[calc(100dvh-142px)] overflow-y-auto border-t border-ink/10 bg-white shadow-[0_25px_40px_#17233b1a] lg:block" onMouseEnter={() => setMenu(current.key)}>
        {current.key === "primavera-verao" ? <div className="mx-auto grid min-h-[520px] max-w-[1440px] grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] gap-14 px-10 py-11">
          <a href={current.href} className="group relative min-h-[420px] overflow-hidden bg-[#e8e1d7]">
            <Image src="/campaign-spring-summer-2026/collection-flatlay-desktop.jpg" alt="Peças individuais da coleção Primavera–Verão Valutin" fill sizes="(max-width: 1440px) 55vw, 750px" className="object-cover object-center transition duration-500 group-hover:scale-[1.025]" />
            <span className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" aria-hidden="true" />
            <span className="absolute bottom-9 left-9 max-w-[320px] font-playfair text-4xl leading-tight text-white drop-shadow">Primavera–Verão<br/><span className="font-poppins text-sm tracking-[0.2em]">2026/27</span></span>
          </a>
          <div className="flex flex-col justify-center"><p className="font-poppins text-[10px] uppercase tracking-[0.2em] text-brand-strong">{current.eyebrow}</p><h2 className="mt-4 font-playfair text-3xl leading-tight text-[#213448]">{current.title}</h2><p className="mt-4 max-w-md font-poppins text-sm leading-relaxed text-ink/65">Algodão, linho, laise e cores leves para acompanhar os dias de sol e as novas descobertas.</p><div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3">{current.columns.flatMap((column) => column.links).slice(0, 8).map((link) => <a key={`${link.href}-${link.label}`} href={link.href} className="font-poppins text-[13px] text-[#213448] transition hover:text-brand-strong hover:underline hover:underline-offset-4">{link.label}</a>)}</div><a href={current.href} className="mt-10 w-fit border-b border-[#213448] pb-1 font-poppins text-xs font-medium uppercase tracking-[0.12em] text-[#213448]">Explorar a seleção</a></div>
        </div> : <div className="mx-auto max-w-[1440px] px-10 pb-12 pt-9">
          <div className="mb-8 flex items-start justify-between gap-8"><div><p className="font-poppins text-[10px] uppercase tracking-[0.18em] text-brand-strong">{current.eyebrow}</p><h2 className="mt-2 font-playfair text-[30px] leading-tight text-[#213448]">{current.title}</h2></div><button type="button" aria-label="Fechar menu" onClick={closeMenu} className="grid h-10 w-10 place-items-center text-2xl font-light text-ink/60 transition hover:text-ink">×</button></div>
          <div className="grid min-h-[370px] grid-cols-[repeat(3,minmax(0,1fr))_minmax(220px,1.05fr)] gap-0">{current.columns.map((column) => <div key={column.title} className="border-r border-ink/10 px-7 first:pl-0"><h3 className="font-playfair text-[22px] text-[#213448]">{column.title}</h3><ul className="mt-6 space-y-3">{column.links.map((link) => <li key={`${link.href}-${link.label}`}><a href={link.href} className="font-poppins text-[13px] leading-relaxed text-[#35495b] transition hover:text-brand-strong hover:underline hover:underline-offset-4">{link.label}</a></li>)}</ul></div>)}<div className="pl-8"><h3 className="font-playfair text-[22px] text-[#213448]">Inspirações</h3><div className="mt-5 space-y-4">{current.promos.map((promo) => { const item = productByHandle.get(promo.handle); return item ? <a key={promo.handle} href={`/catalogo/${item.handle}`} className="group flex items-center gap-4"><span className="catalog-product-surface relative block h-[90px] w-[105px] shrink-0 overflow-hidden bg-[#f6f4f1]"><Image src={item.displayImages[0]} alt="" fill sizes="105px" className={catalogImageClass(item.displayImages[0], "transition duration-300 group-hover:scale-[1.04]")} /></span><span className="font-poppins text-[12px] leading-snug text-[#35495b] group-hover:text-brand-strong group-hover:underline">{promo.label}</span></a> : null; })}</div><a href={current.href} className="mt-7 inline-block border-b border-[#213448] pb-1 font-poppins text-xs font-medium uppercase tracking-[0.1em] text-[#213448]">Ver toda a seleção</a></div></div>
        </div>}
      </div>}

      {mobileOpen && <div id="mobile-navigation" className="max-h-[calc(100dvh-100px)] overflow-y-auto border-t border-ink/10 bg-white px-5 pb-8 pt-3 lg:hidden"><nav aria-label="Menu de departamentos"><a href={storeHref} onClick={() => setMobileOpen(false)} className="block border-b border-ink/10 py-4 font-playfair text-xl text-brand-strong">Loja Valutin</a>{departmentSections.map((section) => <details key={section.key} className="border-b border-ink/10"><summary className="cursor-pointer py-4 font-poppins text-sm text-[#213448]">{section.label}</summary><div className="pb-5 pl-3"><a href={section.href} onClick={() => setMobileOpen(false)} className="mb-3 block font-poppins text-xs font-medium text-brand-strong underline underline-offset-4">Ver toda a seleção</a>{section.columns.slice(0, 2).flatMap((column) => column.links).map((link) => <a key={`${link.href}-${link.label}`} href={link.href} onClick={() => setMobileOpen(false)} className="block py-2 font-poppins text-xs text-ink/70">{link.label}</a>)}</div></details>)}</nav></div>}
    </header>
  </>;
}
