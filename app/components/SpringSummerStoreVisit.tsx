import Image from "next/image";
import { ADDRESS, MAPS_DIR_URL, UBER_URL, WAZE_URL } from "../lib/constants";
import WhatsAppCta from "./WhatsAppCta";
import type { PageContent } from "../lib/editor/content";

const routes = [
  { label: "Google Maps", href: MAPS_DIR_URL },
  { label: "Waze", href: WAZE_URL },
  { label: "Uber", href: UBER_URL },
] as const;

// Avaliações conferidas no perfil público da Valutin em 23/09/2026.
const reviews = [
  {
    name: "Guto Meirelles",
    quote: "Ótima loja de roupas infantis",
    href: "https://share.google/89Rt70NUH6kNvT57Q",
  },
  {
    name: "Carol Make",
    quote: "Um ótimo atendimento da loja e em principal da Talia ❣️",
    href: "https://share.google/zdc7o1lqRRdzI6Dqx",
  },
  {
    name: "Rafael Yamane - Sócio Executivo V4",
    quote: "Minha filha ficou encantada com o presente que levei!!",
    href: "https://share.google/FVEkVCN50L646Dwt3",
  },
] as const;

const GOOGLE_PROFILE_URL = "https://www.google.com/maps?cid=1949999187998996603";

export default function SpringSummerStoreVisit({ content }: { content: PageContent }) {
  return (
    <section id="visite-a-loja" aria-labelledby="store-visit-heading" className="scroll-mt-36 bg-[#faf9f7] px-4 py-16 sm:px-7 sm:py-24 lg:px-10">
      <div className="mx-auto grid max-w-[1440px] overflow-hidden border border-brand/20 bg-white lg:grid-cols-12">
        <div className="p-7 sm:p-10 lg:col-span-5 lg:p-14">
          <p className="font-poppins text-[11px] uppercase tracking-[0.2em] text-brand-strong">Venha nos visitar</p>
          <h2 id="store-visit-heading" className="mt-6 font-playfair text-[42px] italic leading-none text-ink sm:text-[52px]">Nossa Loja</h2>

          <Image src={content.facadeImage} alt={content.facadeAlt} width={1320} height={1446} unoptimized sizes="(max-width: 1023px) 100vw, 480px" className="mt-7 h-auto w-full" />

          <address className="mt-8 not-italic font-poppins text-sm leading-relaxed text-ink/75">
            <p>{ADDRESS.street}</p>
            <p>{ADDRESS.neighborhood}</p>
          </address>
          <div className="mt-7 font-poppins text-sm leading-relaxed text-ink/75">
            <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-brand-strong">Horários</p>
            <p>{ADDRESS.hoursWeekdays}</p>
            <p>{ADDRESS.hoursSaturday}</p>
          </div>

          <p className="mt-9 font-poppins text-[11px] uppercase tracking-[0.18em] text-brand-strong">Como chegar</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {routes.map((route) => (
              <a key={route.label} href={route.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 min-w-[112px] items-center justify-center rounded-full border border-brand px-4 py-2.5 font-poppins text-xs font-medium text-brand-strong transition-colors hover:bg-brand-strong hover:text-white">
                {route.label}
              </a>
            ))}
          </div>

          <WhatsAppCta src="primavera-verao-loja" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-strong px-6 py-3 font-poppins text-sm font-medium text-white transition-opacity hover:opacity-90">
            Falar com a concierge →
          </WhatsAppCta>
          <p className="mt-4 max-w-sm font-poppins text-xs leading-relaxed text-ink/60">Prefere atendimento online? Nossa equipe também responde pelo WhatsApp.</p>
        </div>

        <div className="border-t border-brand/20 bg-[#f8f9fb] p-7 sm:p-10 lg:col-span-7 lg:border-l lg:border-t-0 lg:p-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-poppins text-[11px] uppercase tracking-[0.2em] text-brand-strong">A experiência de quem nos visita</p>
              <h3 className="mt-4 font-playfair text-3xl text-ink sm:text-4xl">O que dizem sobre a Valutin</h3>
            </div>
            <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="font-poppins text-xs text-brand-strong underline underline-offset-4 hover:text-ink">Ver no Google ↗</a>
          </div>
          <p className="mt-4 font-poppins text-xs text-ink/60">Avaliações públicas do perfil da loja no Google, consultadas em 23/09/2026.</p>

          <div className="mt-7 grid gap-3">
            {reviews.map((review) => (
              <figure key={review.href} className="border border-brand/15 bg-white p-5 sm:p-6">
                <div role="img" aria-label="5 de 5 estrelas" className="font-poppins text-base tracking-[0.16em] text-[#bc8c3d]">★★★★★</div>
                <blockquote className="mt-3 font-playfair text-xl leading-snug text-ink">“{review.quote}”</blockquote>
                <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 font-poppins text-xs text-ink/65">
                  <span>{review.name}</span>
                  <a href={review.href} target="_blank" rel="noopener noreferrer" className="text-brand-strong underline underline-offset-4 hover:text-ink" aria-label={`Ver avaliação de ${review.name} no Google`}>Avaliação no Google ↗</a>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
