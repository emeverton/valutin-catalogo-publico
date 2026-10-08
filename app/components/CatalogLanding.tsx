import Image from "next/image";
import Link from "next/link";
import { getCatalogProducts } from "../lib/editor/catalog-store";
import type { CatalogItem } from "../lib/catalog-individual";
import { categoryHref, departments, productCategories } from "../lib/catalog-navigation";
import { catalogImageClass } from "../lib/catalog-image";

const departmentImages: Record<string, string> = {
  bebe: "macacao-tricoline-listra-sage",
  crianca: "vestido-de-laise-rosa",
  batizado: "vestido-linho-batizado",
  presentes: "boneco-artesanal-rosa",
};

const categoryImages: Record<string, string> = {
  vestidos: "vestido-de-laise-rosa",
  "macacoes-e-jardineiras": "macacao-tricoline-listra-sage",
  "bodys-e-conjuntos": "conjunto-body-shorts-floral",
  "camisetas-e-camisas": "camiseta-algodao-veleiro-01",
  "saias-shorts-e-bermudas": "saia-algodao-floral",
  "tricos-e-casacos": "cardigan-bordado-mao-bordado-azul",
  "batizado-e-cerimonia": "vestido-linho-batizado",
  "presentes-e-lembrancas": "boneco-artesanal-rosa",
};

function imageFor(catalogProducts: CatalogItem[], slug: string, preferredHandle: string, department: boolean) {
  return catalogProducts.find((product) => product.handle === preferredHandle)
    ?? catalogProducts.find((product) => department ? product.category === slug : product.catalogCategory === slug);
}

export default async function CatalogLanding() {
  const catalogProducts = await getCatalogProducts();
  return <div className="bg-white pb-24">
    <div className="mx-auto max-w-[1440px] px-4 pt-9 sm:px-7 sm:pt-12 lg:px-10">
      <div className="flex flex-col gap-8 border-b border-ink/15 pb-9 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-poppins text-[11px] uppercase tracking-[0.18em] text-brand-strong">Valutin · Boutique infantil</p>
          <h1 className="mt-3 font-playfair text-4xl text-ink sm:text-5xl">Catálogo Valutin</h1>
          <p className="mt-3 max-w-2xl font-poppins text-sm leading-relaxed text-ink/65">Encontre a peça certa para cada momento. Navegue por idade, ocasião ou tipo de roupa; cada cor e estampa aparece individualmente.</p>
        </div>
        <form action="/catalogo/todos" role="search" className="flex w-full max-w-md items-center gap-3 border-b border-ink/40 pb-2">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-current text-ink/60" strokeWidth="1.5"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>
          <input id="catalog-search" name="busca" type="search" aria-label="Buscar em todas as peças" placeholder="O que você procura?" className="min-w-0 flex-1 bg-transparent font-poppins text-sm outline-none placeholder:text-ink/45" />
          <button type="submit" className="font-poppins text-xs font-medium text-brand-strong hover:text-ink">Buscar</button>
        </form>
      </div>

      <section aria-labelledby="departments-title" className="pt-11 sm:pt-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><p className="font-poppins text-[10px] uppercase tracking-[0.2em] text-brand-strong">Escolha por momento</p><h2 id="departments-title" className="mt-2 font-playfair text-3xl text-ink sm:text-4xl">Compre por categoria</h2></div>
          <Link href="/catalogo/todos" className="border-b border-brand-strong pb-1 font-poppins text-xs text-brand-strong hover:text-ink">Ver todas as {catalogProducts.length} peças →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {departments.map((department, index) => {
            const product = imageFor(catalogProducts, department.slug, departmentImages[department.slug], true);
            const count = catalogProducts.filter((item) => item.category === department.slug).length;
            return <Link key={department.slug} href={categoryHref(department.slug)} className="group block min-w-0 border border-ink/10 bg-white transition hover:border-ink/25 hover:shadow-[0_12px_30px_rgba(32,31,28,.08)]">
              <div className="catalog-product-surface relative aspect-[4/4.5] overflow-hidden bg-[#f6f5f3]">{product && <Image src={product.displayImages[0]} alt={`Peça da categoria ${department.label}: ${product.title}`} fill priority={index < 4} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw" className={`${catalogImageClass(product.displayImages[0])} transition-transform duration-500 group-hover:scale-[1.04]`} />}</div>
              <div className="px-3 pb-4 pt-3 sm:px-4 sm:pb-5"><h3 className="font-playfair text-xl text-ink sm:text-2xl">{department.label}</h3><p className="mt-1 hidden font-poppins text-xs text-ink/60 sm:block">{department.title}</p><p className="mt-3 font-poppins text-[11px] text-brand-strong">{count} {count === 1 ? "peça" : "peças"} <span aria-hidden="true">→</span></p></div>
            </Link>;
          })}
        </div>
      </section>

      <section aria-labelledby="types-title" className="pt-16 sm:pt-20">
        <div className="mb-6"><p className="font-poppins text-[10px] uppercase tracking-[0.2em] text-brand-strong">Encontre pelo tipo de peça</p><h2 id="types-title" className="mt-2 font-playfair text-3xl text-ink sm:text-4xl">Explore a coleção</h2></div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
          {productCategories.map((category) => {
            const product = imageFor(catalogProducts, category.slug, categoryImages[category.slug], false);
            const count = catalogProducts.filter((item) => item.catalogCategory === category.slug).length;
            return <Link key={category.slug} href={categoryHref(category.slug)} className="group block min-w-0">
              <div className="catalog-product-surface relative aspect-[4/4.2] overflow-hidden border border-ink/10 bg-[#f6f5f3] transition group-hover:border-ink/25">{product && <Image src={product.displayImages[0]} alt={`Peça da categoria ${category.label}: ${product.title}`} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className={`${catalogImageClass(product.displayImages[0])} transition-transform duration-500 group-hover:scale-[1.04]`} />}</div>
              <div className="mt-3 flex items-start justify-between gap-2"><div><h3 className="font-poppins text-sm font-medium text-ink group-hover:text-brand-strong">{category.label}</h3><p className="mt-1 font-poppins text-[11px] text-ink/55">{count} {count === 1 ? "peça" : "peças"}</p></div><span aria-hidden="true" className="font-poppins text-brand-strong">→</span></div>
            </Link>;
          })}
        </div>
      </section>
      <div className="mt-16 flex flex-col gap-4 border-t border-ink/15 pt-8 sm:flex-row sm:items-center sm:justify-between"><p className="font-playfair text-2xl text-ink">Leveza para viver a nova estação.</p><Link href="/catalogo/primavera-verao" className="self-start border-b border-brand-strong pb-1 font-poppins text-xs text-brand-strong hover:text-ink">Conheça a Primavera–Verão →</Link></div>
    </div>
  </div>;
}
