"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useCatalogProducts } from "./CatalogMediaProvider";
import { categoryHref, productCategories, productHref } from "../lib/catalog-navigation";
import { catalogImageClass } from "../lib/catalog-image";
import { springSummerSourceHandles } from "../lib/seasonal";
import SpringSummerSecondFold from "./SpringSummerSecondFold";
import SpringSummerEditorial from "./SpringSummerEditorial";
import SpringSummerProductShelf from "./SpringSummerProductShelf";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const springSummerSet = new Set<string>(springSummerSourceHandles);
const featuredHandles = [
  "vestido-de-laise-rosa",
  "macacao-tricoline-listra-sage",
  "conjunto-laise-laranja",
  "camisa-linho",
  "vestido-percal-tricolor",
  "conjunto-body-shorts-floral",
  "vestido-algodao-rosa",
  "macacao-fustao-azul",
];
const featuredRank = new Map(featuredHandles.map((handle, index) => [handle, index]));
const categories = [["todos", "Todos os produtos"], ...productCategories.map((category) => [category.slug, category.label] as const)] as const;
const springSummerCategories = new Set(["todos", "vestidos", "macacoes-e-jardineiras", "bodys-e-conjuntos", "camisetas-e-camisas", "saias-shorts-e-bermudas"]);
type Category = string;
type Sort = "catalogo" | "preco-menor" | "preco-maior";

export default function Catalog({ initialCategory = "todos", heading = "A coleção", collection }: { initialCategory?: Category; heading?: string; collection?: "primavera-verao" }) {
  const products = useCatalogProducts();
  const [category, setCategory] = useState<Category>(initialCategory);
  const [search, setSearch] = useState("");
  const [size, setSize] = useState("");
  const [sort, setSort] = useState<Sort>("catalogo");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("categoria");
    const requestedSearch = params.get("busca");
    if (requestedSearch) setSearch(requestedSearch);
    if (!initialCategory || initialCategory === "todos") {
      if (categories.some(([id]) => id === requested)) setCategory(requested as Category);
    }
  }, [initialCategory]);

  const sizes = useMemo(() => Array.from(new Set(products
    .filter((product) => (collection !== "primavera-verao" || product.collection === "primavera-verao" || springSummerSet.has(product.sourceHandle ?? product.handle)) && (category === "todos" || product.category === category || product.catalogCategory === category))
    .flatMap((product) => product.sizes))), [category, collection, products]);
  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    const filtered = products.filter((product) => {
      const collectionMatch = collection !== "primavera-verao" || product.collection === "primavera-verao" || springSummerSet.has(product.sourceHandle ?? product.handle);
      const categoryMatch = category === "todos" || product.category === category || product.catalogCategory === category;
      const sizeMatch = !size || product.sizes.includes(size);
      const reference = "reference" in product ? product.reference ?? "" : "";
      return collectionMatch && categoryMatch && sizeMatch && (!term || `${product.title} ${product.description} ${reference}`.toLocaleLowerCase("pt-BR").includes(term));
    });
    if (sort === "preco-menor") return [...filtered].sort((a, b) => (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER));
    if (sort === "preco-maior") return [...filtered].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    if (collection !== "primavera-verao" && category === "todos" && !term && !size) {
      return [...filtered].sort((a, b) => (featuredRank.get(a.handle) ?? Infinity) - (featuredRank.get(b.handle) ?? Infinity));
    }
    return filtered;
  }, [category, collection, products, search, size, sort]);
  function chooseCategory(next: Category) {
    setCategory(next);
    setSize("");
  }
  const sizeFilterButtons = () => sizes.map((item) => <button key={item} type="button" onClick={() => setSize(size === item ? "" : item)} aria-pressed={size === item} className={`min-h-10 border px-3 font-poppins text-xs transition ${size === item ? "border-brand-strong bg-brand-strong text-white" : "border-ink/20 text-ink hover:border-ink"}`}>{item}</button>);

  return <section id="colecao" aria-label="Peças do catálogo" className="bg-white">
    {collection === "primavera-verao" && initialCategory === "todos" && <div className="relative h-[clamp(560px,72vh,720px)] w-full overflow-hidden bg-[#24402d]">
      <Image src="/campaign-spring-summer-2026/orange-look-desktop.jpg" alt="Criança com conjunto laranja de laise em editorial Primavera–Verão" fill priority sizes="100vw" className="object-cover object-[67%_20%] lg:object-[center_20%]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#26352f]/65 via-[#26352f]/15 to-transparent" aria-hidden="true" />
      <h1 className="absolute bottom-28 left-5 max-w-[420px] font-playfair text-4xl leading-tight text-white drop-shadow sm:bottom-32 sm:left-12 sm:text-5xl">{heading} Valutin</h1>
      <a href="#produtos" className="absolute bottom-8 left-1/2 min-w-[190px] -translate-x-1/2 rounded-full border border-[#213448] bg-white px-9 py-3 text-center font-poppins text-sm font-medium text-[#213448] shadow-sm transition hover:bg-[#213448] hover:text-white sm:bottom-10">Descobrir</a>
    </div>}
    {collection === "primavera-verao" && <SpringSummerSecondFold />}
    {collection === "primavera-verao" && <SpringSummerProductShelf shelf="passeios" />}
    {collection === "primavera-verao" && <SpringSummerEditorial />}
    <div className={`mx-auto max-w-[1440px] px-4 pb-24 sm:px-7 lg:px-10 ${collection === "primavera-verao" ? "pt-7" : "pt-9 sm:pt-12"}`}>
      {collection !== "primavera-verao" && <div className="mb-5 flex flex-col justify-between gap-5 pb-5 sm:mb-6 sm:flex-row sm:items-end">
        <div><a href="/catalogo" className="font-poppins text-xs text-brand-strong underline underline-offset-4">← Voltar às categorias</a><p className="mt-5 font-poppins text-[11px] uppercase tracking-[0.18em] text-brand-strong">Valutin · Boutique infantil</p><h1 className="mt-3 font-playfair text-4xl text-ink sm:text-5xl">{heading}</h1><p className="mt-3 max-w-xl font-poppins text-sm leading-relaxed text-ink/65">{initialCategory === "todos" ? "Encontre cada peça da nossa coleção, em todas as cores e estampas. Explore os modelos e consulte a disponibilidade do seu tamanho." : "Explore os modelos desta categoria e consulte a disponibilidade do seu tamanho."}</p></div>
        {initialCategory === "todos" && <a href="/catalogo/primavera-verao" className="shrink-0 self-start border-b border-brand-strong pb-1 font-poppins text-xs text-brand-strong transition hover:text-ink sm:self-end">Conheça a Primavera–Verão →</a>}
      </div>}
      {collection === "primavera-verao" && <div className="mb-7 max-w-2xl"><p className="font-poppins text-sm leading-relaxed text-ink/65">Uma seleção de algodão, linho, laise e peças leves para os dias de sol. Consulte tamanhos e disponibilidade com a nossa equipe.</p><a href="/catalogo" className="mt-3 inline-block font-poppins text-xs text-brand-strong underline underline-offset-4">Ver catálogo completo</a></div>}
      <nav className="border-y border-ink/15 py-4" aria-label="Categorias do catálogo"><div className="-mx-4 flex overflow-x-auto px-4 sm:mx-0 sm:px-0">{categories.filter(([id]) => collection !== "primavera-verao" || springSummerCategories.has(id)).map(([id, label]) => {
        const className = `shrink-0 border-b-2 px-4 pb-2 pt-1 font-poppins text-[10px] uppercase tracking-[0.15em] ${category === id ? "border-brand-strong text-brand-strong" : "border-transparent text-ink/65 hover:text-ink"}`;
        return collection === "primavera-verao" ? <button key={id} type="button" onClick={() => chooseCategory(id)} aria-current={category === id ? "page" : undefined} className={className}>{label}</button> : <a key={id} href={id === "todos" ? "/catalogo/todos" : categoryHref(id)} aria-current={category === id ? "page" : undefined} className={className}>{label}</a>;
      })}</div></nav>
      <div className={`flex flex-col gap-5 border-b border-ink/15 lg:flex-row lg:items-end lg:justify-between ${collection === "primavera-verao" ? "py-7" : "py-5"}`}><div>{collection === "primavera-verao" ? <><p className="font-poppins text-[10px] uppercase tracking-[0.17em] text-brand-strong">A coleção</p><h2 id="produtos" className="mt-2 font-playfair text-3xl">Peças da estação</h2><p className="mt-2 font-poppins text-xs text-ink/55">Cada estampa e cor em uma peça individual.</p></> : <><h2 id="produtos" className="sr-only">Produtos do catálogo</h2><p className="font-poppins text-xs text-ink/60">Peças individuais · escolha a sua favorita</p></>}</div><label className="flex w-full items-center gap-3 border-b border-ink/30 pb-2 lg:w-80"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current text-ink/60" strokeWidth="1.5"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg><input id="catalog-search" type="search" aria-label="Buscar no catálogo" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar uma peça" className="min-w-0 flex-1 bg-transparent font-poppins text-sm outline-none placeholder:text-ink/45" /></label></div>
      <div className="grid gap-6 py-7 lg:grid-cols-[210px_1fr] lg:gap-8">
        <aside className="border-b border-ink/15 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-7" aria-label="Filtros do catálogo">
          <div className="hidden items-center justify-between lg:flex"><h2 className="font-poppins text-xs font-medium uppercase tracking-[0.13em]">Filtros</h2>{size && <button type="button" onClick={() => setSize("")} className="font-poppins text-xs text-brand-strong underline underline-offset-4">Limpar</button>}</div>
          <div className="hidden lg:block"><p className="mt-6 font-poppins text-sm font-medium">Tamanho</p><div className="mt-4 flex flex-wrap gap-2">{sizeFilterButtons()}</div><p className="mt-9 border-t border-ink/10 pt-5 font-poppins text-xs leading-relaxed text-ink/60">A disponibilidade de cada tamanho é confirmada com a equipe Valutin na reserva.</p></div>
          <details className="lg:hidden"><summary className="cursor-pointer font-poppins text-sm font-medium">Filtrar por tamanho{size ? ` · ${size}` : ""}</summary><div className="mt-4 flex flex-wrap gap-2">{sizeFilterButtons()}</div>{size && <button type="button" onClick={() => setSize("")} className="mt-4 font-poppins text-xs text-brand-strong underline underline-offset-4">Limpar tamanho</button>}</details>
        </aside>
        <div><div className="flex items-center justify-between gap-4 pb-6"><p role="status" className="font-poppins text-xs text-ink/60">{visible.length} {visible.length === 1 ? "peça" : "peças"}</p><label className="flex items-center gap-2 font-poppins text-xs text-ink/65">Ordenar<select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="border-b border-ink/30 bg-transparent py-2 text-ink outline-none"><option value="catalogo">Destaques</option><option value="preco-menor">Menor preço</option><option value="preco-maior">Maior preço</option></select></label></div>
          {visible.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4 lg:gap-x-5">{visible.map((product, index) => <article key={product.handle} className="group flex min-w-0 flex-col overflow-hidden border border-ink/10 bg-white transition duration-300 hover:border-ink/25 hover:shadow-[0_12px_30px_rgba(32,31,28,.08)]"><a href={productHref(product.handle)} className="catalog-product-surface relative block aspect-[3/4] overflow-hidden"><Image src={product.displayImages[0]} alt={`${product.title} — ${product.imageLabels[0]}`} fill priority={index < 4 && collection !== "primavera-verao"} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className={catalogImageClass(product.displayImages[0])} />{product.displayImages.length > 1 && <span className="absolute bottom-3 left-3 bg-white/95 px-2 py-1 font-poppins text-[9px] uppercase tracking-[0.12em] text-ink">{product.displayImages.length} vistas</span>}</a><div className="flex flex-1 flex-col px-3 pb-4 pt-3 sm:px-4"><a href={productHref(product.handle)} className="min-h-10 font-poppins text-xs font-medium leading-relaxed text-ink hover:text-brand-strong sm:text-[13px]">{product.title}</a><p className="mt-1 font-poppins text-sm font-medium text-ink">{product.price === null ? "Preço sob consulta" : money.format(product.price)}</p>{"reference" in product && product.reference && <p className="mt-1 font-poppins text-[10px] text-ink/50">Ref. {product.reference}</p>}<p className="mt-3 hidden font-poppins text-[11px] leading-relaxed text-ink/60 sm:block">{product.sizes.includes("Sob consulta") ? "Tamanhos sob consulta" : `Tamanhos: ${product.sizes.slice(0, 5).join(" · ")}`}</p><a href={productHref(product.handle)} className="mt-auto inline-flex min-h-9 items-center self-start border-b border-brand-strong pt-3 font-poppins text-[10px] font-medium uppercase tracking-[0.1em] text-brand-strong transition group-hover:text-ink">Ver detalhes <span aria-hidden="true" className="ml-1">→</span></a></div></article>)}</div> : <div className="py-24 text-center"><p className="font-playfair text-2xl">Nenhuma peça encontrada.</p><button type="button" onClick={() => { setSearch(""); setSize(""); }} className="mt-5 font-poppins text-xs text-brand-strong underline underline-offset-4">Limpar filtros</button></div>}</div>
      </div>
    </div>
  </section>;
}
