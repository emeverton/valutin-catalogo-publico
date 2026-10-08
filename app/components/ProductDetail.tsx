"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { catalogFeedId } from "../lib/catalog/feed-id";
import { trackCatalogItemView, trackFunnel, trackProductDetailView } from "../lib/funnel";
import { COOKIE_CONSENT_EVENT } from "../lib/cookie-consent";
import { appendAttrFromSearch } from "../lib/whatsapp/attr-merge";
import { useCatalogProducts } from "./CatalogMediaProvider";
import { categoryHref, categoryLabel } from "../lib/catalog-navigation";
import { catalogImageClass } from "../lib/catalog-image";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type Product = {
  title: string; handle: string; sourceHandle?: string; description: string; price: number | null; sizes: string[]; stock?: Record<string, number> | null;
  images: string[]; displayImages: string[]; imageLabels: string[]; colors?: string[];
  colorTitle?: string; reference?: string | null; linxSku?: string; linxSkus?: Record<string, string>; category: string; catalogCategory: string;
};
type StockState = { configured: boolean; status?: "available" | "out_of_stock" | "not_found"; scope?: "sku" | "reference"; checkedSku?: string } | null;

export default function ProductDetail({ product }: { product: Product }) {
  const products = useCatalogProducts();
  const [image, setImage] = useState(0);
  const [size, setSize] = useState("");
  const [requestedSku, setRequestedSku] = useState("");
  const [stock, setStock] = useState<StockState>(null);
  const [checkingStock, setCheckingStock] = useState(false);
  const sku = size ? (product.linxSkus?.[size] || product.linxSku || "") : (product.linxSku || requestedSku);

  useEffect(() => {
    const requestedSku = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("sku")?.trim() || "";
    if (!/^\d{1,20}$/.test(requestedSku)) return;
    const requestedSize = Object.entries(product.linxSkus || {}).find(([, mappedSku]) => mappedSku === requestedSku)?.[0];
    // A family reference can contain several colors. Only a product-specific
    // mapping proves that a SKU belongs to an individual color/print PDP.
    if (!requestedSize && requestedSku !== product.linxSku && (product.sourceHandle || !product.reference)) return;
    setRequestedSku(requestedSku);
    if (requestedSize) setSize(requestedSize);
  }, [product.linxSku, product.linxSkus, product.reference, product.sourceHandle]);

  useEffect(() => {
    const reference = product.reference || "";
    if (product.stock !== null && product.stock !== undefined) { setStock(null); setCheckingStock(false); return; }
    if (!sku && !reference) { setStock(null); return; }
    const controller = new AbortController();
    const query = new URLSearchParams(sku ? { sku, ...(reference ? { reference } : {}) } : { reference });
    setCheckingStock(true);
    fetch("/api/catalogo/estoque?" + query, { signal: controller.signal, cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => { if (!controller.signal.aborted) setStock(payload && payload.ok ? { ...payload, checkedSku: sku || undefined } : null); })
      .catch(() => { if (!controller.signal.aborted) setStock(null); })
      .finally(() => { if (!controller.signal.aborted) setCheckingStock(false); });
    return () => controller.abort();
  }, [product.reference, product.stock, sku]);

  useEffect(() => {
    const emit = () => trackProductDetailView(product.handle);
    emit();
    window.addEventListener(COOKIE_CONSENT_EVENT, emit);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, emit);
  }, [product.handle]);

  useEffect(() => {
    const price = product.price;
    if (!sku || typeof price !== "number" || stock?.checkedSku !== sku || stock.configured !== true || stock.scope !== "sku" || stock.status === "not_found") return;
    const emit = () => trackCatalogItemView({ id: catalogFeedId(sku), title: product.title, price });
    emit();
    window.addEventListener(COOKIE_CONSENT_EVENT, emit);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, emit);
  }, [product.price, product.title, sku, stock]);

  const text = "Olá! Gostaria de consultar " + product.title + ", tamanho " + (size || "a confirmar") + ", e disponibilidade.";
  const reserveParams = new URLSearchParams({ src: "produto", produto: product.sourceHandle || product.handle, peca: product.title, text });
  const consultParams = new URLSearchParams({ src: "produto_consulta", peca: product.title, text });
  if (sku) reserveParams.set("sku", sku);
  if (product.reference) { reserveParams.set("referencia", product.reference); consultParams.set("referencia", product.reference); }
  if (size) { reserveParams.set("tamanho", size); consultParams.set("tamanho", size); }
  if (typeof window !== "undefined") {
    appendAttrFromSearch(reserveParams, window.location.search);
    appendAttrFromSearch(consultParams, window.location.search);
  }

  const stockForSelection = stock?.checkedSku === (sku || undefined) ? stock : null;
  const manualStock = product.stock !== null && product.stock !== undefined;
  const manualSize = size || (product.sizes.length === 1 ? product.sizes[0] : "");
  const manualQuantity = manualStock && manualSize ? product.stock?.[manualSize] : undefined;
  const stockMessage = manualStock
    ? !manualSize ? "Selecione um tamanho para consultar o saldo informado pela loja." : manualQuantity === undefined ? "Saldo deste tamanho não informado. Consulte a equipe." : manualQuantity > 0 ? `${manualQuantity} unidade(s) informada(s) pela loja — confirme antes da reserva.` : "Esgotado segundo o saldo informado pela loja. Confirme com a equipe."
    : checkingStock
    ? "Consultando disponibilidade…"
    : stockForSelection?.configured && stockForSelection.status === "available"
      ? stockForSelection.scope === "sku" ? "Disponível em estoque agora" : "Referência disponível em estoque"
      : stockForSelection?.configured && stockForSelection.status === "out_of_stock" ? "Indisponível no estoque consultado"
          : stockForSelection?.configured && stockForSelection.status === "not_found" ? "Referência não localizada no estoque"
          : stockForSelection?.configured === false ? "Disponibilidade online em atualização. Consulte a equipe." : "Tamanho e disponibilidade serão confirmados pela equipe.";
  const eligibleToReserve = !manualStock && stockForSelection?.configured === true && stockForSelection.status === "available" && stockForSelection.scope === "sku" && stockForSelection.checkedSku === sku;
  const variants = product.sourceHandle ? products.filter((item) => item.sourceHandle === product.sourceHandle) : [];
  const recommendations = products.filter((item) => item.handle !== product.handle && item.catalogCategory === product.catalogCategory && (!product.sourceHandle || item.sourceHandle !== product.sourceHandle)).slice(0, 3);

  return <section className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 sm:px-7 lg:px-10">
    <nav aria-label="Navegação estrutural" className="mb-6 font-poppins text-xs text-ink/60">
      <a href="/" className="hover:text-brand-strong">Início</a><span className="px-2">/</span><a href="/catalogo" className="hover:text-brand-strong">Catálogo</a><span className="px-2">/</span><a href={categoryHref(product.category)} className="hover:text-brand-strong">{categoryLabel(product.category)}</a><span className="px-2">/</span><a href={categoryHref(product.catalogCategory)} className="hover:text-brand-strong">{categoryLabel(product.catalogCategory)}</a><span className="px-2">/</span><span>{product.title}</span>
    </nav>
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,.8fr)] lg:gap-14">
      <div className="grid min-w-0 items-start gap-3 sm:grid-cols-[82px_minmax(0,1fr)]">
        <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">
          {product.displayImages.map((src, index) => <button key={src} type="button" onClick={() => setImage(index)} aria-label={"Ver " + product.imageLabels[index]} aria-pressed={image === index} className={"catalog-product-surface relative h-20 w-16 shrink-0 overflow-hidden p-1 " + (image === index ? "ring-1 ring-brand-strong" : "")}>
            <Image src={src} alt="" fill sizes="64px" className={catalogImageClass(src)} />
          </button>)}
        </div>
        <div className="catalog-product-surface relative order-1 aspect-[3/4] w-full min-w-0 overflow-hidden p-4 sm:order-2">
          <Image src={product.displayImages[image]} alt={product.title + " — " + product.imageLabels[image]} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className={catalogImageClass(product.displayImages[image])} />
          {product.displayImages.length > 1 && <span className="absolute right-4 top-4 bg-white/95 px-3 py-2 font-poppins text-[10px] uppercase tracking-[0.12em] text-ink">{image + 1} / {product.displayImages.length}</span>}
        </div>
      </div>
      <div className="lg:sticky lg:top-32 lg:self-start">
        <p className="font-poppins text-[10px] uppercase tracking-[0.19em] text-brand-strong">Valutin · Moda infantil</p>
        <h1 className="mt-3 font-playfair text-4xl leading-tight sm:text-5xl">{product.title}</h1>
        <p className="mt-5 font-poppins text-lg">{product.price === null ? "Preço sob consulta" : money.format(product.price)}</p>
        {product.reference && <p className="mt-2 font-poppins text-xs text-ink/55">Referência: {product.reference}</p>}
        <p className="mt-7 font-poppins text-sm leading-relaxed text-ink/75">{product.description}</p>
        {variants.length > 1 && <div className="mt-7"><h2 className="font-poppins text-xs uppercase tracking-[0.13em]">Cores e estampas deste modelo</h2><div className="mt-3 flex flex-wrap gap-2">{variants.map((variant) => <Link key={variant.handle} href={`/catalogo/${variant.handle}`} aria-current={variant.handle === product.handle ? "page" : undefined} title={variant.title} className={`catalog-product-surface relative block h-20 w-16 overflow-hidden border p-1 transition hover:border-brand-strong ${variant.handle === product.handle ? "border-brand-strong" : "border-ink/20"}`}><Image src={variant.displayImages[0]} alt={variant.title} fill sizes="64px" className={catalogImageClass(variant.displayImages[0])}/></Link>)}</div><p className="mt-2 font-poppins text-xs text-ink/60">{product.title} selecionado</p></div>}
        {product.colors && <div className="mt-7"><h2 className="font-poppins text-xs uppercase tracking-[0.13em]">{product.colorTitle ?? "Cores"}</h2><p className="mt-3 font-poppins text-sm">{product.colors.join(" · ")}</p></div>}
        <div className="mt-8">
          <h2 className="font-poppins text-xs uppercase tracking-[0.13em]">Tamanho</h2>
          {product.sizes.length === 1 && product.sizes[0] === "Sob consulta" ? <p className="mt-4 font-poppins text-sm text-ink/65">Tamanhos sob consulta</p> : <div className="mt-4 flex flex-wrap gap-2">{product.sizes.map((item) => <button key={item} type="button" onClick={() => setSize(item)} aria-pressed={size === item} className={"min-h-11 min-w-12 border px-3 font-poppins text-sm " + (size === item ? "border-brand-strong bg-brand-strong text-white" : "border-ink/25 hover:border-ink")}>{item}</button>)}</div>}
          <p aria-live="polite" className={"mt-4 font-poppins text-xs " + ((manualStock && manualQuantity === 0) || stockForSelection?.status === "out_of_stock" || stockForSelection?.status === "not_found" ? "text-[#9a3d35]" : "text-brand-strong")}>{stockMessage}{!manualStock && stockForSelection?.scope === "reference" && stockForSelection?.status === "available" ? ". A grade exata é confirmada ao selecionar a variante." : ""}</p>
        </div>
        {eligibleToReserve
          ? <Link onClick={() => trackFunnel("vlt_product_select")} href={"/atendimento?" + reserveParams} className="mt-8 flex min-h-14 items-center justify-center bg-brand-strong px-5 font-poppins text-xs uppercase tracking-[0.14em] text-white transition hover:bg-ink">Reservar com a Valutin</Link>
          : <Link onClick={() => trackFunnel("vlt_product_select")} href={"/atendimento?" + consultParams} className="mt-8 flex min-h-14 items-center justify-center bg-brand-strong px-5 text-center font-poppins text-xs uppercase tracking-[0.14em] text-white transition hover:bg-ink">Consultar esta peça</Link>}
        <p className="mt-4 font-poppins text-xs leading-relaxed text-ink/55">{eligibleToReserve ? "A equipe confirma os detalhes da reserva no atendimento." : "A consulta não reserva a peça. A equipe confirma o tamanho, o preço e a disponibilidade antes de qualquer compra."}</p>
        <div className="mt-8 grid grid-cols-3 border-y border-ink/15 py-5 text-center"><div className="border-r border-ink/15 px-2"><p className="font-poppins text-[9px] uppercase tracking-[0.13em] text-ink/55">Curadoria</p><p className="mt-2 font-playfair text-sm">Valutin</p></div><div className="border-r border-ink/15 px-2"><p className="font-poppins text-[9px] uppercase tracking-[0.13em] text-ink/55">Atendimento</p><p className="mt-2 font-playfair text-sm">Pessoal</p></div><div className="px-2"><p className="font-poppins text-[9px] uppercase tracking-[0.13em] text-ink/55">Estoque</p><p className="mt-2 font-playfair text-sm">{eligibleToReserve ? "Confirmado" : manualStock ? "Informado pela loja" : "Sob consulta"}</p></div></div>
        <div className="mt-8 divide-y divide-ink/15 border-y border-ink/15">
          <details open className="py-4"><summary className="cursor-pointer font-poppins text-sm">Sobre a peça</summary><p className="mt-3 font-poppins text-sm leading-relaxed text-ink/70">{product.description}</p></details>
          <details className="py-4"><summary className="cursor-pointer font-poppins text-sm">Cuidados e composição</summary><p className="mt-3 font-poppins text-sm leading-relaxed text-ink/70">Confirme os cuidados recomendados e a composição com a equipe ao consultar a peça.</p></details>
        </div>
      </div>
    </div>
    {recommendations.length > 0 && <section className="mt-20 border-t border-ink/15 pt-12"><div className="flex items-end justify-between gap-4"><div><p className="font-poppins text-[10px] uppercase tracking-[0.17em] text-brand-strong">A descobrir</p><h2 className="mt-3 font-playfair text-3xl sm:text-4xl">Você também pode gostar</h2></div><Link href={categoryHref(product.catalogCategory)} className="shrink-0 font-poppins text-xs underline underline-offset-4">Ver {categoryLabel(product.catalogCategory).toLowerCase()}</Link></div><div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">{recommendations.map((item) => <article key={item.handle} className="group"><Link href={`/catalogo/${item.handle}`} className="catalog-product-surface relative block aspect-[3/4] overflow-hidden border border-ink/10 p-3"><Image src={item.displayImages[0]} alt={item.title} fill sizes="(max-width: 640px) 50vw, 33vw" className={catalogImageClass(item.displayImages[0])} /></Link><Link href={`/catalogo/${item.handle}`} className="mt-4 block font-poppins text-xs font-medium hover:text-brand-strong">{item.title}</Link><p className="mt-1 font-poppins text-sm text-ink/70">{item.price === null ? "Preço sob consulta" : money.format(item.price)}</p></article>)}</div></section>}
  </section>;
}
