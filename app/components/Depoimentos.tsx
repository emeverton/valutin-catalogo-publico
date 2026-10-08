import { DEPOIMENTOS_TITLE, INSTAGRAM_URL, MAPS_DIR_URL } from "../lib/constants";

const googleReviews = [
  { name: "Guto Meirelles", quote: "Ótima loja de roupas infantis", href: "https://share.google/89Rt70NUH6kNvT57Q" },
  { name: "Carol Make", quote: "Um ótimo atendimento da loja e em principal da Talia ❣️", href: "https://share.google/zdc7o1lqRRdzI6Dqx" },
  { name: "Rafael Yamane - Sócio Executivo V4", quote: "Minha filha ficou encantada com o presente que levei!!", href: "https://share.google/FVEkVCN50L646Dwt3" },
] as const;

export default function Depoimentos() {
  return <section className="bg-white px-6 py-20 md:py-28"><div className="mx-auto max-w-6xl">
    <p className="font-poppins text-xs uppercase tracking-[0.2em] text-brand-strong">Avaliações no Google</p>
    <h2 className="mt-5 font-playfair text-4xl italic text-ink md:text-5xl">{DEPOIMENTOS_TITLE}</h2>
    <p className="mt-4 font-poppins text-xs text-ink/65">Avaliações públicas do perfil da loja, consultadas em 23/09/2026.</p>
    <div className="mt-10 grid gap-4 md:grid-cols-3">
      {googleReviews.map((review) => <figure key={review.href} className="border border-brand/20 bg-cream/20 p-6">
        <div role="img" aria-label="5 de 5 estrelas" className="text-base tracking-[0.16em] text-[#bc8c3d]">★★★★★</div>
        <blockquote className="mt-4 font-playfair text-xl leading-snug text-ink">“{review.quote}”</blockquote>
        <figcaption className="mt-6 font-poppins text-xs text-ink/70">{review.name}</figcaption>
        <a href={review.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-poppins text-xs text-brand-strong underline underline-offset-4">Ver avaliação no Google ↗</a>
      </figure>)}
    </div>
    <h3 className="mt-20 font-playfair text-3xl italic text-ink md:text-4xl">Conheça a Valutin de perto.</h3>
    <div className="mt-8 grid gap-8 border-t border-brand/20 pt-8 md:grid-cols-2">
      <div><h4 className="font-playfair text-2xl">Visite nossa loja</h4><p className="my-4 text-ink/70">Rua João Lourenço, 323 · Vila Nova Conceição, São Paulo. Veja os detalhes das peças e encontre o tamanho com ajuda da equipe.</p><a href={MAPS_DIR_URL} target="_blank" rel="noopener noreferrer" className="text-brand-strong underline underline-offset-4">Ver localização no Google Maps</a></div>
      <div><h4 className="font-playfair text-2xl">Acompanhe nosso dia a dia</h4><p className="my-4 text-ink/70">Conheça os looks, os detalhes e as novidades compartilhadas pela Valutin em seu Instagram.</p><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-brand-strong underline underline-offset-4">Conhecer o Instagram da Valutin</a></div>
    </div>
  </div></section>;
}
