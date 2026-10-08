"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { type ProductEdit, type ProductEdits } from "../../lib/editor/catalog-products";
import { LOGO_SRC } from "../../lib/constants";

type Item = ProductEdit & { handle: string; category: string; catalogCategory: string; sizes: string[]; reference?: string | null; linxSku?: string; linxSkus?: Record<string, string> };
type Row = { draft: ProductEdits; published: ProductEdits; version: number; published_at: string | null; products: Item[] };
type Stock = { ok: boolean; configured?: boolean; status?: string; quantity?: number; scope?: string; error?: string };

export default function ProductEditor() {
  const [row, setRow] = useState<Row | null>(null);
  const [draft, setDraft] = useState<ProductEdits>({});
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [stock, setStock] = useState<Stock | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setError("");
    try {
      const response = await fetch("/api/editor/produtos", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar os produtos");
      setRow(data); setDraft(data.draft); setSelected((value) => value || data.products[0]?.handle || "");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao carregar"); }
  }
  useEffect(() => { void load(); }, []);

  const item = row?.products.find((product) => product.handle === selected);
  const edit = item ? draft[item.handle] ?? { title: item.title, description: item.description, price: item.price, stock: null } : null;
  const visible = useMemo(() => row?.products.filter((product) => `${product.title} ${product.handle} ${product.reference || ""}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))) ?? [], [row, search]);
  const hasChanges = row ? JSON.stringify(draft) !== JSON.stringify(row.draft) : false;
  const hasUnpublished = row ? JSON.stringify(row.draft) !== JSON.stringify(row.published) : false;

  useEffect(() => {
    setStock(null);
    if (!item) return;
    const sku = item.linxSku || Object.values(item.linxSkus || {})[0];
    const reference = item.reference;
    if (!sku && !reference) return;
    const controller = new AbortController();
    const query = new URLSearchParams(sku ? { sku } : { reference: reference! });
    fetch(`/api/catalogo/estoque?${query}`, { cache: "no-store", signal: controller.signal })
      .then((response) => response.json()).then(setStock).catch(() => { if (!controller.signal.aborted) setStock({ ok: false, error: "stock_unavailable" }); });
    return () => controller.abort();
  }, [item]);

  function change(patch: Partial<ProductEdit>) {
    if (!item || !edit) return;
    setDraft((current) => ({ ...current, [item.handle]: { ...edit, ...patch } }));
    setMessage("");
  }

  async function save() {
    if (!row) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/editor/produtos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: draft, version: row.version }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao salvar");
      setRow({ ...row, ...data }); setDraft(data.draft); setMessage("Rascunho salvo. O catálogo público ainda não mudou.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao salvar"); }
    finally { setBusy(false); }
  }

  async function publish() {
    if (!row || hasChanges || !hasUnpublished) return;
    if (!window.confirm("Publicar nomes, descrições, preços e estoque manual salvos? Confira cada quantidade com a loja antes de continuar.")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/editor/produtos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ version: row.version }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao publicar");
      setRow({ ...row, ...data }); setDraft(data.draft); setMessage("Produtos publicados. Confira as páginas e o feed antes de anunciar.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao publicar"); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#f8f7f5] font-poppins text-ink">
    <header className="border-b border-ink/10 bg-white px-5 py-5 sm:px-8"><div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-6"><Image src={LOGO_SRC} alt="Valutin" width={130} height={44} className="h-9 w-auto" /><span className="border-l border-ink/15 pl-6 text-xs uppercase tracking-[0.16em]">Produtos e estoque</span></div><nav className="flex gap-5 text-xs"><a href="/editor" className="underline">Banners</a><a href="/editor/catalogo" className="underline">Fotos</a><a href="/editor/novos-produtos" className="underline">Cadastrar peça</a><a href="/catalogo" target="_blank" rel="noopener noreferrer" className="underline">Ver catálogo ↗</a></nav></div></header>
    <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8"><h1 className="font-playfair text-4xl sm:text-5xl">Produtos, preços e estoque</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-ink/65">A cliente pode informar manualmente o saldo de cada tamanho. Campo vazio significa disponibilidade não informada; zero significa esgotado. O estoque manual não sincroniza com o Linx nem baixa automaticamente após o atendimento.</p>
      {error && <p role="alert" className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}{message && <p role="status" className="mt-6 border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}{!row && !error && <p className="mt-8 text-sm">Carregando…</p>}
      {row && <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-7"><section className="border border-ink/10 bg-white p-5 sm:p-8"><label htmlFor="find-product" className="text-xs uppercase tracking-[0.12em]">Buscar peça</label><input id="find-product" type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="mt-3 min-h-11 w-full border border-ink/20 px-3 text-sm" placeholder="Nome, referência ou cor"/><label htmlFor="choose-product" className="mt-6 block text-xs uppercase tracking-[0.12em]">Produto e variação</label><select id="choose-product" value={selected} onChange={(event) => setSelected(event.target.value)} className="mt-3 min-h-11 w-full border border-ink/20 bg-white px-3 text-sm"><option value="" disabled>Selecione</option>{visible.map((product) => <option key={product.handle} value={product.handle}>{product.title} · {product.handle}</option>)}</select></section>
        {item && edit && <section className="border border-ink/10 bg-white p-5 sm:p-8"><h2 className="font-playfair text-2xl">{item.title}</h2><p className="mt-2 text-xs text-ink/60">Ref. {item.reference || "não informada"} · <a href={`/catalogo/${item.handle}`} target="_blank" rel="noopener noreferrer" className="underline">Ver página ↗</a></p><div className="mt-6 space-y-5"><div><label htmlFor="product-title" className="text-xs">Nome da peça</label><input id="product-title" value={edit.title} maxLength={120} onChange={(event) => change({ title: event.target.value })} className="mt-2 min-h-11 w-full border border-ink/20 px-3 text-sm"/></div><div><label htmlFor="product-description" className="text-xs">Descrição</label><textarea id="product-description" value={edit.description} maxLength={1200} rows={5} onChange={(event) => change({ description: event.target.value })} className="mt-2 w-full border border-ink/20 p-3 text-sm"/></div><div><label htmlFor="product-price" className="text-xs">Preço (R$)</label><input id="product-price" type="number" min="0.01" max="100000" step="0.01" value={edit.price ?? ""} onChange={(event) => change({ price: event.target.value === "" ? null : Number(event.target.value) })} className="mt-2 min-h-11 w-full border border-ink/20 px-3 text-sm"/><p className="mt-2 text-xs text-ink/55">Em branco = preço sob consulta. Confirme com a tabela oficial antes de publicar.</p></div></div><button type="button" onClick={() => { const next = { ...draft }; delete next[item.handle]; setDraft(next); }} className="mt-6 text-xs underline">Restaurar dados originais desta peça</button></section>}
        {item && edit && <section className="border border-ink/10 bg-white p-5 sm:p-8"><h2 className="font-playfair text-2xl">Estoque manual por tamanho</h2><p className="mt-3 text-xs leading-6 text-ink/65">Os saldos publicados aparecem na página da peça. Atualize-os sempre que houver venda na loja ou por atendimento. Não há baixa automática.</p><label className="mt-5 flex items-center gap-3 text-sm"><input type="checkbox" checked={edit.stock !== null} onChange={(event) => change({ stock: event.target.checked ? {} : null })}/> Usar estoque manual nesta peça</label>{edit.stock !== null && <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">{item.sizes.map((size) => <label key={size} className="text-xs">{size}<input type="number" min="0" max="99999" step="1" inputMode="numeric" value={edit.stock?.[size] ?? ""} onChange={(event) => { const next = { ...(edit.stock || {}) }; if (event.target.value === "") delete next[size]; else next[size] = Number(event.target.value); change({ stock: next }); }} placeholder="Não informado" className="mt-2 min-h-11 w-full border border-ink/20 px-3 text-sm"/></label>)}</div>}<p className="mt-4 text-xs text-ink/55">Quantidade manual informada pela loja, sujeita à confirmação no atendimento. SKU e grade original continuam protegidos.</p></section>}
        {item && <section className="border border-ink/10 bg-white p-5 sm:p-8"><h2 className="font-playfair text-2xl">Diagnóstico Linx</h2><p className="mt-3 text-xs leading-6 text-ink/65">Consulta separada, somente leitura. Pode divergir do estoque manual; não publica nem substitui os números informados acima.</p><p className="mt-4 text-sm" role="status">{!item.linxSku && !Object.keys(item.linxSkus || {}).length && !item.reference ? "Sem SKU ou referência mapeada para consulta." : !stock ? "Consultando…" : stock.configured === false ? "Integração Linx não configurada neste ambiente." : !stock.ok ? "Linx indisponível no momento." : stock.status === "available" ? `Disponível: ${stock.quantity} unidade(s)${stock.scope === "reference" ? " na referência; confirme o tamanho" : " no SKU consultado"}.` : stock.status === "out_of_stock" ? "Sem saldo no Linx para a consulta." : "Produto não encontrado no Linx."}</p></section>}</div>
      <aside className="self-start border border-ink/10 bg-white p-6 lg:sticky lg:top-6"><h2 className="font-playfair text-2xl">Publicação</h2><p className="mt-3 text-xs leading-6 text-ink/65">Salvar não altera o site. Publicar aplica o último rascunho salvo.</p><button onClick={save} disabled={busy || !hasChanges} className="mt-6 min-h-12 w-full border border-brand-strong px-4 text-sm text-brand-strong disabled:opacity-40">{busy ? "Aguarde…" : "Salvar rascunho"}</button><button onClick={publish} disabled={busy || hasChanges || !hasUnpublished} className="mt-3 min-h-12 w-full bg-brand-strong px-4 text-sm text-white disabled:opacity-40">Publicar produtos</button>{hasChanges && <p className="mt-3 text-xs text-amber-800">Salve antes de publicar.</p>}{hasUnpublished && <p className="mt-3 text-xs text-ink/60">Há alterações salvas ainda não publicadas.</p>}<button onClick={() => { setDraft(row.draft); setMessage("Edições locais descartadas."); }} disabled={busy || !hasChanges} className="mt-6 text-xs underline disabled:opacity-40">Descartar edições locais</button></aside></div>}
    </div>
  </main>;
}
