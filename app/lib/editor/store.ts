import "server-only";
import { cache } from "react";
import { DEFAULT_CONTENT, validateContent, type PageContent } from "./content";

type ContentRow = { draft: PageContent; published: PageContent; version: number; published_at: string | null; updated_at: string };

function credentials() {
  const url = process.env.SUPABASE_URL || process.env.VALUTIN_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VALUTIN_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase não configurado para o editor");
  return { url: url.replace(/\/$/, ""), key };
}

export function editorStorageConfigured() {
  try { credentials(); return true; } catch { return false; }
}

async function query(path: string, init?: RequestInit) {
  const { url, key } = credentials();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation", ...init?.headers },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Falha no armazenamento do editor (${response.status})`);
  return response.json() as Promise<ContentRow[]>;
}

export async function getContentRow(): Promise<ContentRow> {
  const rows = await query("valutin_page_content?slug=eq.primavera-verao&select=draft,published,version,published_at,updated_at");
  const row = rows[0];
  if (!row) return { draft: DEFAULT_CONTENT, published: DEFAULT_CONTENT, version: 0, published_at: null, updated_at: "" };
  return { ...row, draft: validateContent(row.draft), published: validateContent(row.published) };
}

export const getPublishedContent = cache(async (): Promise<PageContent> => {
  if (!editorStorageConfigured()) return DEFAULT_CONTENT;
  try { return (await getContentRow()).published; } catch (error) {
    console.error("Falha ao ler conteúdo publicado; mantendo versão aprovada em código", error);
    return DEFAULT_CONTENT;
  }
});

export async function saveDraft(content: PageContent, version: number) {
  if (version === 0) {
    const rows = await query("valutin_page_content?on_conflict=slug", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({ slug: "primavera-verao", draft: validateContent(content), published: DEFAULT_CONTENT, version: 1 }),
    });
    if (!rows[0]) throw new Error("Outra pessoa iniciou a edição. Recarregue antes de salvar.");
    return rows[0];
  }
  const rows = await query(`valutin_page_content?slug=eq.primavera-verao&version=eq.${version}`, {
    method: "PATCH", body: JSON.stringify({ draft: validateContent(content), version: version + 1, updated_at: new Date().toISOString() }),
  });
  if (!rows[0]) throw new Error("Outra pessoa alterou a página. Recarregue antes de salvar.");
  return rows[0];
}

export async function publishDraft(version: number) {
  const current = await getContentRow();
  if (current.version !== version) throw new Error("O rascunho mudou. Recarregue antes de publicar.");
  const rows = await query(`valutin_page_content?slug=eq.primavera-verao&version=eq.${version}`, {
    method: "PATCH", body: JSON.stringify({ published: current.draft, version: version + 1, published_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  });
  if (!rows[0]) throw new Error("Publicação em conflito. Recarregue e tente novamente.");
  return rows[0];
}

export function storageCredentials() { return credentials(); }
