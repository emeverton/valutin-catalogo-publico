import Image from "next/image";
import { BRAND_NAME, INSTAGRAM_URL, LEGAL_ENTITY } from "../lib/constants";
import WhatsAppCta from "./WhatsAppCta";

const serviceItems = [
  ["Atendimento pessoal", "Uma curadoria próxima para cada escolha."],
  ["Reserva de peças", "Nossa equipe confirma o tamanho e a disponibilidade."],
  ["Retirada ou entrega", "Combine com a equipe a melhor forma de receber."],
  ["Presentes Valutin", "Peças escolhidas para marcar momentos especiais."],
];

export default function Footer() {
  return <footer>
    <section className="border-y border-ink/15 bg-[#f4f0e9] px-5 py-7 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
        {serviceItems.map(([title, description], index) => <div key={title} className={"px-2 text-center lg:px-7 " + (index ? "lg:border-l lg:border-ink/15" : "")}><p className="font-playfair text-xl">{title}</p><p className="mx-auto mt-2 max-w-[210px] font-poppins text-xs leading-relaxed text-ink/65">{description}</p></div>)}
      </div>
    </section>
    <section className="bg-ink px-5 py-14 text-white sm:px-8 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-11 border-b border-white/15 pb-12 lg:grid-cols-[1.25fr_.75fr_.75fr_.9fr] lg:gap-8">
          <div><Image src="/logo-valutin.png" alt="Valutin" width={1024} height={295} sizes="250px" className="h-auto w-[220px] brightness-0 invert" /><p className="mt-6 max-w-sm font-poppins text-sm leading-relaxed text-white/70">Moda infantil premium em Vila Nova Conceição. Uma curadoria de peças para os primeiros dias e as grandes memórias.</p></div>
          <div><p className="font-poppins text-[10px] uppercase tracking-[0.16em] text-white/55">Atendimento</p><ul className="mt-5 space-y-3 font-poppins text-sm text-white/85"><li><a className="hover:text-white hover:underline" href="/atendimento">Falar com a Valutin</a></li><li><a className="hover:text-white hover:underline" href="/como-comprar">Como comprar</a></li><li><a className="hover:text-white hover:underline" href="/entregas-e-retirada">Entregas e retirada</a></li><li><a className="hover:text-white hover:underline" href="/trocas-e-devolucoes">Trocas e devoluções</a></li></ul></div>
          <div><p className="font-poppins text-[10px] uppercase tracking-[0.16em] text-white/55">A coleção</p><ul className="mt-5 space-y-3 font-poppins text-sm text-white/85"><li><a className="hover:text-white hover:underline" href="/catalogo/categoria/bebe">Bebês</a></li><li><a className="hover:text-white hover:underline" href="/catalogo/categoria/crianca">Crianças</a></li><li><a className="hover:text-white hover:underline" href="/catalogo/categoria/presentes">Presentes</a></li></ul></div>
          <div><p className="font-poppins text-[10px] uppercase tracking-[0.16em] text-white/55">Conheça a Valutin</p><p className="mt-5 font-poppins text-sm leading-relaxed text-white/75">Conheça a Valutin e acompanhe os looks e novidades da nossa curadoria.</p><a href="/sobre-a-valutin" className="mt-5 block font-poppins text-sm text-white/85 hover:text-white hover:underline">Sobre a Valutin</a><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex border-b border-white pb-1 font-poppins text-xs uppercase tracking-[0.13em] hover:text-white/75">Instagram Valutin</a></div>
        </div>
        <div className="flex flex-col items-center justify-between gap-5 pt-7 sm:flex-row"><p className="font-poppins text-[9px] uppercase tracking-[0.14em] text-white/55">{BRAND_NAME} · Moda Infantil Premium · Desde 1998</p><div className="flex flex-wrap items-center justify-center gap-5"><a href="/politica-de-privacidade" className="font-poppins text-xs text-white/80 transition hover:text-white">Privacidade</a><a href="/politica-de-cookies" className="font-poppins text-xs text-white/80 transition hover:text-white">Cookies</a><a href="/politica-de-cookies#preferencias" className="font-poppins text-xs text-white/80 transition hover:text-white">Preferências de Cookies</a><a href="/termos-de-uso" className="font-poppins text-xs text-white/80 transition hover:text-white">Termos de uso</a><WhatsAppCta src="footer" className="font-poppins text-xs text-white/80 transition hover:text-white">WhatsApp</WhatsAppCta></div></div>
        <p className="mt-6 font-poppins text-[11px] leading-relaxed text-white/55">{LEGAL_ENTITY.name} · CNPJ {LEGAL_ENTITY.cnpj} · IE {LEGAL_ENTITY.stateRegistration} · Rua João Lourenço, 323, Vila Nova Conceição, São Paulo/SP, CEP {LEGAL_ENTITY.postalCode} · <a href={`mailto:${LEGAL_ENTITY.email}`} className="underline underline-offset-2 hover:text-white">{LEGAL_ENTITY.email}</a></p>
      </div>
    </section>
  </footer>;
}
