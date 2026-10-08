import "server-only";
import { cache } from "react";
import { editorStorageConfigured, storageCredentials } from "./store";
import { validateNewProducts, type NewProduct } from "./new-products";

const slug = "catalogo-new-products";
type Row = { draft: NewProduct[]; published: NewProduct[]; version: number; published_at: string | null; updated_at: string };

async function query(path: string, init?: RequestInit): Promise<Row[]> {
  const { url, key } = storageCredentials();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation", ...init?.headers },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Falha ao acessar novos produtos (${response.status})`);
  return response.json();
}

export async function getNewProductRow(): Promise<Row> {
  const rows = await query(`valutin_page_content?slug=eq.${slug}&select=draft,published,version,published_at,updated_at`);
  const row = rows[0];
  if (!row) return { draft: [], published: [], version: 0, published_at: null, updated_at: "" };
  return { ...row, draft: validateNewProducts(row.draft), published: validateNewProducts(row.published) };
}

export const getPublishedNewProducts = cache(async (): Promise<NewProduct[]> => {
  if (!editorStorageConfigured()) return [];
  try { return (await getNewProductRow()).published.filter((product) => product.active); }
  catch (error) { console.error("Falha ao ler novos produtos; mantendo catálogo aprovado", error); return []; }
});

export async function saveNewProductDraft(content: unknown, version: number): Promise<Row> {
  const draft = validateNewProducts(content);
  if (version > 0) {
    const current = await getNewProductRow();
    if (current.version !== version) throw new Error("Outra pessoa alterou os produtos. Recarregue antes de salvar.");
    const handles = new Set(draft.map((product) => product.handle));
    if (current.published.some((product) => !handles.has(product.handle))) throw new Error("Peças publicadas não podem ser apagadas ou renomeadas; desative-as para retirá-las do catálogo.");
  }
  if (version === 0) {
    const rows = await query("valutin_page_content?on_conflict=slug", {
      method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({ slug, draft, published: [], version: 1 }),
    });
    if (!rows[0]) throw new Error("Outra pessoa iniciou a edição. Recarregue antes de salvar.");
    return rows[0];
  }
  const rows = await query(`valutin_page_content?slug=eq.${slug}&version=eq.${version}`, {
    method: "PATCH", body: JSON.stringify({ draft, version: version + 1, updated_at: new Date().toISOString() }),
  });
  if (!rows[0]) throw new Error("Outra pessoa alterou os produtos. Recarregue antes de salvar.");
  return rows[0];
}

export async function publishNewProductDraft(version: number): Promise<Row> {
  const row = await getNewProductRow();
  if (row.version !== version) throw new Error("O rascunho mudou. Recarregue antes de publicar.");
  const rows = await query(`valutin_page_content?slug=eq.${slug}&version=eq.${version}`, {
    method: "PATCH", body: JSON.stringify({ published: row.draft, version: version + 1, published_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  });
  if (!rows[0]) throw new Error("Publicação em conflito. Recarregue e tente novamente.");
  return rows[0];
}
