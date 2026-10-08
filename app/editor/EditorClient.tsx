"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { DEFAULT_CONTENT, EDITOR_FIELDS, type EditorField, type PageContent } from "../lib/editor/content";
import { LOGO_SRC } from "../lib/constants";

type Row = { draft: PageContent; published: PageContent; version: number; published_at: string | null };

const groups: { title: string; fields: EditorField[] }[] = [
  { title: "Identidade visual", fields: ["themeAccent"] },
  { title: "Hero da coleção", fields: ["heroEyebrow", "heroTitle", "heroDescription", "heroCta", "heroCtaHref", "heroPoster", "heroVideo"] },
  { title: "Passeios ao sol", fields: ["outingsTitle", "outingsImage", "outingsAlt", "outingsCta", "outingsCtaHref"] },
  { title: "Histórias da coleção", fields: ["storyOneImage", "storyOneAlt", "storyOneEyebrow", "storyOneTitle", "storyTwoImage", "storyTwoAlt", "storyTwoEyebrow", "storyTwoTitle"] },
  { title: "Editorial azul", fields: ["blueTitle", "blueImage", "blueAlt", "blueCta", "blueCtaHref"] },
  { title: "Nossa loja", fields: ["facadeImage", "facadeAlt"] },
];

const ctaDestinations = [
  ["#destaques", "Destaques nesta página"], ["/catalogo", "Categorias do catálogo"], ["/catalogo/todos", "Todas as peças"],
  ["/catalogo/primavera-verao", "Página Primavera–Verão"], ["/catalogo/categoria/bebe", "Bebês"], ["/catalogo/categoria/crianca", "Crianças"],
  ["/catalogo/categoria/batizado", "Batizado"], ["/catalogo/categoria/presentes", "Presentes"], ["/atendimento", "Atendimento"],
] as const;

export default function EditorClient() {
  const [row, setRow] = useState<Row | null>(null);
  const [draft, setDraft] = useState<PageContent>(DEFAULT_CONTENT);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setError("");
    try {
      const response = await fetch("/api/editor/content", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar");
      setRow(data);
      setDraft(data.draft);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao carregar"); }
  }

  useEffect(() => { void load(); }, []);
  const hasChanges = row ? JSON.stringify(draft) !== JSON.stringify(row.draft) : false;
  const hasUnpublished = row ? JSON.stringify(row.draft) !== JSON.stringify(row.published) : false;

  function setField(field: EditorField, value: string) { setDraft((current) => ({ ...current, [field]: value })); setMessage(""); }

  async function save() {
    if (!row) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/editor/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: draft, version: row.version }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao salvar");
      setRow(data); setDraft(data.draft); setMessage("Rascunho salvo. A página pública ainda não mudou.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao salvar"); }
    finally { setBusy(false); }
  }

  async function publish() {
    if (!row || hasChanges || !hasUnpublished) return;
    if (!window.confirm("Publicar o rascunho da página Primavera–Verão?")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/editor/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ version: row.version }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao publicar");
      setRow(data); setDraft(data.draft); setMessage("Publicado. Confira a página pública em uma nova aba.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao publicar"); }
    finally { setBusy(false); }
  }

  async function upload(field: EditorField, file?: File) {
    if (!file) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/editor/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha no envio");
      setField(field, data.url);
      setMessage("Arquivo enviado. Salve o rascunho e publique para aparecer no site.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha no envio"); }
    finally { setBusy(false); }
  }

  async function logout() { await fetch("/api/editor/logout", { method: "POST" }); window.location.href = "/editor/login"; }

  return <main className="min-h-screen bg-[#f8f7f5] font-poppins text-ink">
    <header className="border-b border-ink/10 bg-white px-5 py-5 sm:px-8"><div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-6"><Image src={LOGO_SRC} alt="Valutin" width={130} height={44} className="h-9 w-auto" /><span className="border-l border-ink/15 pl-6 text-xs uppercase tracking-[0.16em]">Editor Primavera–Verão</span></div><div className="flex flex-wrap gap-5 text-xs"><a className="underline" href="/editor/catalogo">Fotos do catálogo</a><a className="underline" href="/editor/produtos">Produtos e estoque</a><a className="underline" href="/editor/novos-produtos">Cadastrar peça</a><a className="underline" href="/catalogo/primavera-verao" target="_blank" rel="noopener noreferrer">Ver página pública ↗</a><button className="underline" onClick={logout}>Sair</button></div></div></header>
    <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
      <h1 className="font-playfair text-4xl sm:text-5xl">Conteúdo da página</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/65">A estrutura da loja e a integração de estoque permanecem protegidas. Aqui você edita a cor de destaque, textos, destinos dos CTAs e imagens da coleção. Produtos e preços têm uma área própria.</p>
      {row && <p className="mt-4 text-xs text-ink/55">{row.published_at ? `Última publicação: ${new Date(row.published_at).toLocaleString("pt-BR")}` : "A versão aprovada em código está publicada."} {hasUnpublished ? "Há alterações não publicadas." : "Sem alterações pendentes de publicação."}</p>}
      {error && <p role="alert" className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {message && <p role="status" className="mt-6 border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}
      {!row && !error && <p className="mt-8 text-sm">Carregando editor…</p>}
      {row && <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-7">{groups.map((group) => <section key={group.title} className="border border-ink/10 bg-white p-5 sm:p-8"><h2 className="font-playfair text-2xl">{group.title}</h2><div className="mt-6 grid gap-6">{group.fields.map((field) => {
          const meta = EDITOR_FIELDS[field];
          return <div key={field}>
            <label htmlFor={field} className="block text-xs font-medium">{meta.label}</label>
            {meta.kind === "link" ? <select id={field} value={draft[field]} onChange={(event) => setField(field, event.target.value)} className="mt-2 min-h-11 w-full border border-ink/20 bg-white px-3 text-sm">{ctaDestinations.map(([href, label]) => <option key={href} value={href}>{label}</option>)}</select>
              : meta.kind === "color" ? <div className="mt-2 flex items-center gap-4"><input id={field} type="color" value={draft[field]} onChange={(event) => setField(field, event.target.value)} className="h-11 w-16 cursor-pointer border border-ink/20 bg-white p-1" /><span className="text-sm">{draft[field]}</span><span className="text-xs text-ink/60">Cor com contraste legível sobre branco.</span></div>
              : meta.kind === "text" && meta.max > 150 ? <textarea id={field} rows={3} maxLength={meta.max} value={draft[field]} onChange={(event) => setField(field, event.target.value)} className="mt-2 w-full border border-ink/20 p-3 text-sm outline-none focus:border-brand-strong" />
                : <input id={field} type="text" maxLength={meta.max} value={draft[field]} onChange={(event) => setField(field, event.target.value)} className="mt-2 min-h-11 w-full border border-ink/20 px-3 text-sm outline-none focus:border-brand-strong" />}
            {(meta.kind === "image" || meta.kind === "video") && <div className="mt-3 flex flex-wrap items-center gap-4"><label className="cursor-pointer border border-brand-strong px-4 py-2 text-xs text-brand-strong">Enviar {meta.kind === "video" ? "vídeo MP4" : "nova imagem"}<input type="file" accept={meta.kind === "video" ? "video/mp4" : "image/jpeg,image/png,image/webp"} className="sr-only" disabled={busy} onChange={(event) => { void upload(field, event.target.files?.[0]); event.target.value = ""; }} /></label><span className="text-[11px] text-ink/55">Até 4 MB</span></div>}
            {meta.kind === "image" && draft[field] && <div className="relative mt-4 h-44 max-w-sm overflow-hidden bg-[#eee]"><Image src={draft[field]} alt="Prévia da imagem" fill unoptimized sizes="400px" className="object-cover" /></div>}
            {meta.kind === "video" && draft[field] && <video src={draft[field]} muted playsInline controls preload="none" className="mt-4 h-44 max-w-sm bg-black" />}
          </div>;
        })}</div></section>)}</div>
        <aside className="self-start border border-ink/10 bg-white p-6 lg:sticky lg:top-6"><h2 className="font-playfair text-2xl">Publicação</h2><p className="mt-3 text-xs leading-6 text-ink/65">Salvar não altera o site. Publicar usa somente o último rascunho salvo.</p><button onClick={save} disabled={busy || !hasChanges} className="mt-6 min-h-12 w-full border border-brand-strong px-4 text-sm text-brand-strong disabled:opacity-40">{busy ? "Aguarde…" : "Salvar rascunho"}</button><a href="/editor/preview" target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-12 w-full items-center justify-center border border-ink/20 px-4 text-center text-sm">Ver prévia do rascunho ↗</a><button onClick={publish} disabled={busy || hasChanges || !hasUnpublished} className="mt-3 min-h-12 w-full bg-brand-strong px-4 text-sm text-white disabled:opacity-40">Publicar alterações</button>{hasChanges && <p className="mt-3 text-xs text-amber-800">Salve antes de ver a prévia ou publicar.</p>}<button onClick={() => { setDraft(row.draft); setMessage("Alterações locais descartadas."); }} disabled={!hasChanges || busy} className="mt-6 text-xs underline disabled:opacity-40">Descartar edições não salvas</button></aside>
      </div>}
    </div>
  </main>;
}
