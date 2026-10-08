import Image from "next/image";
import products from "../lib/catalog.json";
import type { seasonalCampaign } from "../lib/seasonal";

export default function SeasonalCollection({ campaign }: { campaign: ReturnType<typeof seasonalCampaign> }) {
  const featured = [products[0], products[3], products[6]];
  return <section className="bg-cream px-6 py-20 md:py-28">
    <div className="mx-auto max-w-6xl">
      <p className="text-xs tracking-[0.2em] text-brand-strong">{campaign.label}</p>
      <h2 className="mt-4 max-w-3xl font-playfair text-4xl italic text-ink md:text-5xl">{campaign.title}</h2>
      <p className="mt-5 max-w-2xl leading-relaxed text-ink/75">{campaign.body}</p>
      <div className="mt-10 grid gap-8 sm:grid-cols-3">{featured.map(product => <a key={product.handle} href={`/catalogo#${product.handle}`} className="group">
        <div className="relative aspect-[4/5] overflow-hidden bg-cream"><Image src={product.displayImages[0]} alt={product.title} fill sizes="(max-width: 639px) 90vw, 33vw" className="object-contain transition-transform group-hover:scale-105" /></div>
        <h3 className="mt-4 font-playfair text-2xl text-ink">{product.title}</h3>
        <p className="mt-2 text-sm text-ink/70">{product.price === null ? 'Preço sob consulta' : product.price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} · preço de referência</p>
      </a>)}</div>
      <p className="mt-6 text-sm text-ink/60">Confirme preços atuais, cores e disponibilidade dos tamanhos com nossa equipe.</p>
      <a href="/catalogo" className="mt-7 inline-flex rounded-full border border-brand px-7 py-3 text-brand-strong hover:bg-brand-strong hover:text-white">Explorar o catálogo completo</a>
    </div>
  </section>;
}
