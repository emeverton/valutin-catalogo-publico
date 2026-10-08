"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { type CatalogMedia, type ProductGallery } from "../../lib/editor/catalog-media";
import { LOGO_SRC } from "../../lib/constants";

type Item = { handle: string; title: string; category: string; catalogCategory: string; gallery: ProductGallery };
type Row = { draft: CatalogMedia; published: CatalogMedia; version: number; published_at: string | null; products: Item[] };

export default function CatalogPhotoEditor() {
  const [row, setRow] = useState<Row | null>(null);
  const [draft, setDraft] = useState<CatalogMedia>({});
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setError("");
    try {
      const response = await fetch("/api/editor/catalogo", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar o catálogo");
      setRow(data);
      setDraft(data.draft);
      setSelected((current) => current || data.products[0]?.handle || "");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao carregar"); }
  }

  useEffect(() => { void load(); }, []);
  const item = row?.products.find((product) => product.handle === selected);
  const gallery = item ? draft[item.handle] ?? item.gallery : null;
  const visible = useMemo(() => row?.products.filter((product) => `${product.title} ${product.handle}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))) ?? [], [row, search]);
  const hasChanges = row ? JSON.stringify(draft) !== JSON.stringify(row.draft) : false;
  const hasUnpublished = row ? JSON.stringify(row.draft) !== JSON.stringify(row.published) : false;

  function changeGallery(next: ProductGallery) {
    if (!item) return;
    setDraft((current) => ({ ...current, [item.handle]: next }));
    setMessage("");
  }

  function restoreOriginal() {
    if (!item) return;
    setDraft((current) => { const next = { ...current }; delete next[item.handle]; return next; });
    setMessage("Fotos originais restauradas neste rascunho. Salve e publique para aplicar.");
  }

  async function upload(file?: File) {
    if (!file || !gallery) return;
    if (gallery.images.length >= 12) { setError("Limite de 12 fotos por peça."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const form = new FormData(); form.set("file", file); form.set("scope", "catalogo");
      const response = await fetch("/api/editor/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao enviar a foto");
      changeGallery({ images: [...gallery.images, data.url], labels: [...gallery.labels, file.name.replace(/\.[^.]+$/, "").slice(0, 100)] });
      setMessage("Foto enviada. Confira a ordem, salve o rascunho e publique.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao enviar"); }
    finally { setBusy(false); }
  }

  async function save() {
    if (!row) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/editor/catalogo", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: draft, version: row.version }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao salvar");
      setRow({ ...row, ...data }); setDraft(data.draft); setMessage("Rascunho salvo. O catálogo público ainda não mudou.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao salvar"); }
    finally { setBusy(false); }
  }

  async function publish() {
    if (!row || hasChanges || !hasUnpublished) return;
    if (!window.confirm("Publicar todas as alterações salvas nas fotos do catálogo? Confira se cada foto pertence à peça correta.")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/editor/catalogo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ version: row.version }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao publicar");
      setRow({ ...row, ...data }); setDraft(data.draft); setMessage("Fotos publicadas. Confira a peça no catálogo e nas vitrines.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao publicar"); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#f8f7f5] font-poppins text-ink">
    <header className="border-b border-ink/10 bg-white px-5 py-5 sm:px-8"><div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-6"><Image src={LOGO_SRC} alt="Valutin" width={130} height={44} className="h-9 w-auto" /><span className="border-l border-ink/15 pl-6 text-xs uppercase tracking-[0.16em]">Fotos do catálogo</span></div><div className="flex gap-5 text-xs"><a href="/editor" className="underline">Banners</a><a href="/editor/produtos" className="underline">Produtos e estoque</a><a href="/editor/novos-produtos" className="underline">Cadastrar peça</a><a href="/catalogo" target="_blank" rel="noopener noreferrer" className="underline">Ver catálogo ↗</a></div></div></header>
    <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
      <h1 className="font-playfair text-4xl sm:text-5xl">Fotos por peça</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/65">Escolha a peça exata — cada cor ou estampa tem sua própria galeria. Envie fotos, ajuste a ordem e a descrição de cada vista. Preços, tamanhos, estoque e layout não mudam.</p>
      {error && <p role="alert" className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {message && <p role="status" className="mt-6 border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}
      {!row && !error && <p className="mt-8 text-sm">Carregando peças…</p>}
      {row && <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-7">
          <section className="border border-ink/10 bg-white p-5 sm:p-8">
            <label htmlFor="find-product" className="text-xs font-medium uppercase tracking-[0.12em]">Buscar peça</label>
            <input id="find-product" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, cor ou estampa" className="mt-3 min-h-11 w-full border border-ink/20 px-3 text-sm outline-none focus:border-brand-strong" />
            <label htmlFor="choose-product" className="mt-6 block text-xs font-medium uppercase tracking-[0.12em]">Produto e variação</label>
            <select id="choose-product" value={selected} onChange={(event) => setSelected(event.target.value)} className="mt-3 min-h-11 w-full border border-ink/20 bg-white px-3 text-sm"><option value="" disabled>Selecione a peça</option>{visible.map((product) => <option key={product.handle} value={product.handle}>{product.title} · {product.handle}</option>)}</select>
            {item && <p className="mt-3 text-xs text-ink/55">Página: <a href={`/catalogo/${item.handle}`} target="_blank" rel="noopener noreferrer" className="underline">/catalogo/{item.handle} ↗</a></p>}
          </section>
          {item && gallery && <section className="border border-ink/10 bg-white p-5 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-playfair text-2xl">Galeria de {item.title}</h2><button onClick={restoreOriginal} disabled={busy} className="text-xs underline disabled:opacity-40">Restaurar fotos originais</button></div>
            <p className="mt-3 text-xs leading-6 text-ink/60">A primeira foto será a capa do produto nas vitrines e na página. Esta é uma prévia do rascunho; a página pública só muda ao publicar.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{gallery.images.map((src, index) => <div key={`${src}-${index}`} className="border border-ink/15 p-2"><div className="catalog-product-surface relative aspect-[3/4] overflow-hidden"><Image src={src} alt={gallery.labels[index]} fill unoptimized sizes="(max-width: 640px) 45vw, 220px" className="object-contain" />{index === 0 && <span className="absolute bottom-2 left-2 bg-white/95 px-2 py-1 text-[10px]">CAPA</span>}</div><label htmlFor={`label-${index}`} className="mt-3 block text-[11px]">Descrição da foto</label><input id={`label-${index}`} value={gallery.labels[index]} maxLength={100} onChange={(event) => changeGallery({ ...gallery, labels: gallery.labels.map((label, position) => position === index ? event.target.value : label) })} className="mt-1 w-full border border-ink/20 p-2 text-xs" /><div className="mt-2 flex flex-wrap gap-2 text-[11px]"><button type="button" disabled={index === 0 || busy} onClick={() => { const images = [...gallery.images], labels = [...gallery.labels]; [images[index - 1], images[index]] = [images[index], images[index - 1]]; [labels[index - 1], labels[index]] = [labels[index], labels[index - 1]]; changeGallery({ images, labels }); }} className="underline disabled:opacity-30">← Antes</button><button type="button" disabled={index === gallery.images.length - 1 || busy} onClick={() => { const images = [...gallery.images], labels = [...gallery.labels]; [images[index + 1], images[index]] = [images[index], images[index + 1]]; [labels[index + 1], labels[index]] = [labels[index], labels[index + 1]]; changeGallery({ images, labels }); }} className="underline disabled:opacity-30">Depois →</button><button type="button" disabled={gallery.images.length === 1 || busy} onClick={() => changeGallery({ images: gallery.images.filter((_, position) => position !== index), labels: gallery.labels.filter((_, position) => position !== index) })} className="text-red-800 underline disabled:opacity-30">Remover</button></div></div>)}</div>
            <label className="mt-6 inline-flex cursor-pointer border border-brand-strong px-5 py-3 text-xs text-brand-strong">Adicionar foto JPG, PNG ou WebP<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} /></label><p className="mt-2 text-[11px] text-ink/55">Até 4 MB por foto e 12 vistas por peça.</p>
          </section>}
        </div>
        <aside className="self-start border border-ink/10 bg-white p-6 lg:sticky lg:top-6"><h2 className="font-playfair text-2xl">Publicação</h2><p className="mt-3 text-xs leading-6 text-ink/65">Salvar não altera o catálogo. Publicar aplica somente o último rascunho salvo a todas as peças editadas.</p><button onClick={save} disabled={busy || !hasChanges} className="mt-6 min-h-12 w-full border border-brand-strong px-4 text-sm text-brand-strong disabled:opacity-40">{busy ? "Aguarde…" : "Salvar rascunho"}</button><button onClick={publish} disabled={busy || hasChanges || !hasUnpublished} className="mt-3 min-h-12 w-full bg-brand-strong px-4 text-sm text-white disabled:opacity-40">Publicar fotos</button>{hasChanges && <p className="mt-3 text-xs text-amber-800">Salve antes de publicar.</p>}{hasUnpublished && <p className="mt-3 text-xs text-ink/60">Há fotos salvas que ainda não foram publicadas.</p>}<button onClick={() => { setDraft(row.draft); setMessage("Edições não salvas descartadas."); }} disabled={busy || !hasChanges} className="mt-6 text-xs underline disabled:opacity-40">Descartar edições locais</button></aside>
      </div>}
    </div>
  </main>;
}
