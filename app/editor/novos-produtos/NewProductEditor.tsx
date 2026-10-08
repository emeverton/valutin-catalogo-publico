"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { type NewProduct } from "../../lib/editor/new-products";
import { departments, productCategories } from "../../lib/catalog-navigation";
import { LOGO_SRC } from "../../lib/constants";

type Row = { draft: NewProduct[]; published: NewProduct[]; version: number; published_at: string | null };
const field = "mt-2 min-h-11 w-full border border-ink/20 bg-white px-3 text-sm";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export default function NewProductEditor() {
  const [row, setRow] = useState<Row | null>(null);
  const [draft, setDraft] = useState<NewProduct[]>([]);
  const [selected, setSelected] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/editor/novos-produtos", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar os produtos");
      if (alive) { setRow(data); setDraft(data.draft); setSelected(data.draft[0]?.handle || ""); }
    }).catch((reason) => { if (alive) setError(reason instanceof Error ? reason.message : "Falha ao carregar"); });
    return () => { alive = false; };
  }, []);

  const product = draft.find((item) => item.handle === selected);
  const publishedHandles = new Set(row?.published.map((item) => item.handle) || []);
  const hasChanges = row ? JSON.stringify(draft) !== JSON.stringify(row.draft) : false;
  const hasUnpublished = row ? JSON.stringify(row.draft) !== JSON.stringify(row.published) : false;

  function update(patch: Partial<NewProduct>) {
    setDraft((current) => current.map((item) => item.handle === selected ? { ...item, ...patch } : item));
    setMessage("");
  }

  function create() {
    const title = newName.trim();
    const handle = slugify(title);
    if (!title || handle.length < 3) { setError("Informe um nome de pelo menos três caracteres."); return; }
    if (draft.some((item) => item.handle === handle)) { setError("Já existe uma peça com esse endereço. Diferencie o nome com cor ou referência."); return; }
    const item: NewProduct = { handle, title, description: "", category: "crianca", catalogCategory: "vestidos", collection: "geral", price: null, reference: null, sizes: ["Sob consulta"], stock: null, images: [], imageLabels: [], active: true };
    setDraft((current) => [...current, item]); setSelected(handle); setNewName(""); setError(""); setMessage("Preencha a descrição e envie uma foto antes de salvar o rascunho.");
  }

  async function upload(file?: File) {
    if (!file || !product) return;
    if (product.images.length >= 12) { setError("Limite de 12 fotos por peça."); return; }
    setBusy(true); setError("");
    try {
      const form = new FormData(); form.set("file", file); form.set("scope", "catalogo");
      const response = await fetch("/api/editor/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao enviar a foto");
      update({ images: [...product.images, data.url], imageLabels: [...product.imageLabels, product.title.slice(0, 100)] });
      setMessage("Foto enviada. A primeira imagem é a capa da peça.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha no envio"); }
    finally { setBusy(false); }
  }

  async function save() {
    if (!row) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/editor/novos-produtos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: draft, version: row.version }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao salvar");
      setRow(data); setDraft(data.draft); setMessage("Rascunho salvo. Nenhuma peça nova foi publicada.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao salvar"); }
    finally { setBusy(false); }
  }

  async function publish() {
    if (!row || hasChanges || !hasUnpublished) return;
    if (!window.confirm("Publicar as peças novas e alterações salvas? Confira fotos, preço, categoria e saldo com a cliente.")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/editor/novos-produtos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ version: row.version }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao publicar");
      setRow(data); setDraft(data.draft); setMessage("Peças publicadas. Confira as categorias e cada página de produto.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao publicar"); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#f8f7f5] font-poppins text-ink">
    <header className="border-b border-ink/10 bg-white px-5 py-5 sm:px-8"><div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-6"><Image src={LOGO_SRC} alt="Valutin" width={130} height={44} className="h-9 w-auto"/><span className="border-l border-ink/15 pl-6 text-xs uppercase tracking-[0.16em]">Novas peças</span></div><nav className="flex gap-5 text-xs"><a href="/editor" className="underline">Banners</a><a href="/editor/produtos" className="underline">Peças existentes</a><a href="/editor/catalogo" className="underline">Fotos existentes</a></nav></div></header>
    <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8"><h1 className="font-playfair text-4xl sm:text-5xl">Cadastrar novas peças</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-ink/65">Uma ficha por cor ou estampa. Salve o rascunho, confira a peça e publique. Novas peças aparecem nas categorias e na página de detalhes; anúncios e reserva vinculada a SKU dependem de validação separada.</p>
      {error && <p role="alert" className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}{message && <p role="status" className="mt-6 border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}{!row && !error && <p className="mt-8 text-sm">Carregando…</p>}
      {row && <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-7">
        <section className="border border-ink/10 bg-white p-5 sm:p-8"><h2 className="font-playfair text-2xl">Nova peça</h2><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input aria-label="Nome da nova peça" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Ex.: Vestido de Linho — Azul" className={field}/><button type="button" onClick={create} disabled={busy} className="min-h-11 shrink-0 bg-brand-strong px-5 text-xs text-white disabled:opacity-40">Criar ficha</button></div><p className="mt-3 text-xs text-ink/55">O endereço é criado a partir do nome e fica fixo depois da primeira publicação.</p><label htmlFor="choose-new-product" className="mt-6 block text-xs uppercase tracking-[0.12em]">Editar ficha</label><select id="choose-new-product" value={selected} onChange={(event) => setSelected(event.target.value)} className={field}><option value="">Selecione</option>{draft.map((item) => <option key={item.handle} value={item.handle}>{item.title} · {item.active ? "visível ao publicar" : "desativada"}</option>)}</select></section>
        {product && <section className="border border-ink/10 bg-white p-5 sm:p-8"><h2 className="font-playfair text-2xl">{product.title}</h2><p className="mt-2 text-xs text-ink/55">/catalogo/{product.handle}{publishedHandles.has(product.handle) && <> · <a href={`/catalogo/${product.handle}`} target="_blank" rel="noopener noreferrer" className="underline">Ver publicada ↗</a></>}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-xs">Nome<input value={product.title} maxLength={120} onChange={(event) => update({ title: event.target.value })} className={field}/></label><label className="text-xs">Referência interna (opcional)<input value={product.reference || ""} maxLength={80} onChange={(event) => update({ reference: event.target.value || null })} className={field}/></label><label className="text-xs">Departamento<select value={product.category} onChange={(event) => update({ category: event.target.value as NewProduct["category"] })} className={field}>{departments.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}</select></label><label className="text-xs">Categoria<select value={product.catalogCategory} onChange={(event) => update({ catalogCategory: event.target.value })} className={field}>{productCategories.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}</select></label><label className="text-xs">Coleção<select value={product.collection} onChange={(event) => update({ collection: event.target.value as NewProduct["collection"] })} className={field}><option value="geral">Catálogo geral</option><option value="primavera-verao">Primavera–Verão e catálogo geral</option></select></label><label className="text-xs">Preço (R$)<input type="number" min="0.01" max="100000" step="0.01" value={product.price ?? ""} onChange={(event) => update({ price: event.target.value === "" ? null : Number(event.target.value) })} placeholder="Sob consulta" className={field}/></label></div>
          <label className="mt-5 block text-xs">Descrição<textarea rows={5} maxLength={1200} value={product.description} onChange={(event) => update({ description: event.target.value })} className="mt-2 w-full border border-ink/20 p-3 text-sm"/></label><label className="mt-5 block text-xs">Tamanhos, separados por vírgula<input value={product.sizes.join(", ")} onChange={(event) => { const sizes = event.target.value.split(",").map((value) => value.trim()).filter(Boolean); const stock = product.stock === null ? null : Object.fromEntries(Object.entries(product.stock).filter(([size]) => sizes.includes(size))); update({ sizes, stock }); }} placeholder="6M, 9M, 12M" className={field}/></label>
          <label className="mt-6 flex items-center gap-3 text-sm"><input type="checkbox" checked={product.stock !== null} onChange={(event) => update({ stock: event.target.checked ? {} : null })}/> Controlar estoque manualmente</label>{product.stock !== null && <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">{product.sizes.map((size) => <label key={size} className="text-xs">{size}<input type="number" min="0" max="99999" step="1" value={product.stock?.[size] ?? ""} onChange={(event) => { const next = { ...(product.stock || {}) }; if (event.target.value === "") delete next[size]; else next[size] = Number(event.target.value); update({ stock: next }); }} placeholder="Não informado" className={field}/></label>)}</div>}<p className="mt-3 text-xs leading-6 text-ink/55">Estoque manual não baixa após uma venda. Valor vazio é desconhecido; zero é esgotado. A equipe confirma a disponibilidade antes de concluir a compra.</p>
          <label className="mt-6 flex items-center gap-3 text-sm"><input type="checkbox" checked={product.active} onChange={(event) => update({ active: event.target.checked })}/> Manter peça visível após publicar</label>{!publishedHandles.has(product.handle) && <button type="button" onClick={() => { if (!window.confirm("Descartar esta ficha ainda não publicada?")) return; setDraft((current) => current.filter((item) => item.handle !== selected)); setSelected(""); }} className="mt-5 block text-xs text-red-800 underline">Descartar ficha nova</button>}</section>}
        {product && <section className="border border-ink/10 bg-white p-5 sm:p-8"><h2 className="font-playfair text-2xl">Fotos da peça</h2><p className="mt-3 text-xs text-ink/60">Envie de 1 a 12 fotos. A primeira é a capa no catálogo. Arquivos JPG, PNG ou WebP de até 4 MB.</p><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{product.images.map((src, index) => <div key={src} className="border border-ink/15 p-2"><div className="catalog-product-surface relative aspect-[3/4]"><Image src={src} alt={product.imageLabels[index] || "Foto da peça"} fill unoptimized sizes="220px" className="object-contain"/></div><label className="mt-3 block text-xs">Descrição da foto<input value={product.imageLabels[index]} maxLength={100} onChange={(event) => update({ imageLabels: product.imageLabels.map((label, position) => position === index ? event.target.value : label) })} className={field}/></label><div className="mt-2 flex gap-3 text-xs"><button type="button" disabled={index === 0} onClick={() => { const images = [...product.images], labels = [...product.imageLabels]; [images[index - 1], images[index]] = [images[index], images[index - 1]]; [labels[index - 1], labels[index]] = [labels[index], labels[index - 1]]; update({ images, imageLabels: labels }); }} className="underline disabled:opacity-30">← Capa</button><button type="button" disabled={product.images.length === 1} onClick={() => update({ images: product.images.filter((_, position) => position !== index), imageLabels: product.imageLabels.filter((_, position) => position !== index) })} className="text-red-800 underline disabled:opacity-30">Remover</button></div></div>)}</div><label className="mt-5 inline-flex cursor-pointer border border-brand-strong px-5 py-3 text-xs text-brand-strong">Enviar foto<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy || product.images.length >= 12} onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }}/></label></section>}
      </div><aside className="self-start border border-ink/10 bg-white p-6 lg:sticky lg:top-6"><h2 className="font-playfair text-2xl">Publicação</h2><p className="mt-3 text-xs leading-6 text-ink/65">Salvar não altera o site. Publicar mostra as fichas ativas. Desativar retira a peça da vitrine sem apagá-la.</p><button onClick={save} disabled={busy || !hasChanges} className="mt-6 min-h-12 w-full border border-brand-strong px-4 text-sm text-brand-strong disabled:opacity-40">{busy ? "Aguarde…" : "Salvar rascunho"}</button><button onClick={publish} disabled={busy || hasChanges || !hasUnpublished} className="mt-3 min-h-12 w-full bg-brand-strong px-4 text-sm text-white disabled:opacity-40">Publicar peças</button>{hasChanges && <p className="mt-3 text-xs text-amber-800">Salve o rascunho antes de publicar.</p>}{hasUnpublished && <p className="mt-3 text-xs text-ink/60">Há alterações salvas não publicadas.</p>}<button onClick={() => { setDraft(row.draft); setMessage("Edições locais descartadas."); }} disabled={busy || !hasChanges} className="mt-6 text-xs underline disabled:opacity-40">Descartar edições locais</button></aside></div>}
    </div>
  </main>;
}
