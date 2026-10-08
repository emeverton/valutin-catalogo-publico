import "server-only";
import { cache } from "react";
import { catalogProducts } from "../catalog-individual";
import { editorStorageConfigured, storageCredentials } from "./store";
import { validateProductEdits, type ProductEdits } from "./catalog-products";

const slug = "catalogo-products";
const empty: ProductEdits = {};
type Row = { draft: ProductEdits; published: ProductEdits; version: number; published_at: string | null; updated_at: string };

async function query(path: string, init?: RequestInit): Promise<Row[]> {
  const { url, key } = storageCredentials();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation", ...init?.headers },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Falha ao acessar produtos (${response.status})`);
  return response.json();
}

export async function getProductRow(): Promise<Row> {
  const rows = await query(`valutin_page_content?slug=eq.${slug}&select=draft,published,version,published_at,updated_at`);
  const row = rows[0];
  if (!row) return { draft: empty, published: empty, version: 0, published_at: null, updated_at: "" };
  return { ...row, draft: validateProductEdits(row.draft), published: validateProductEdits(row.published) };
}

export const getPublishedProductEdits = cache(async (): Promise<ProductEdits> => {
  if (!editorStorageConfigured()) return empty;
  try { return (await getProductRow()).published; }
  catch (error) { console.error("Falha ao ler edições do catálogo; mantendo dados aprovados", error); return empty; }
});

export async function saveProductDraft(content: unknown, version: number): Promise<Row> {
  const draft = validateProductEdits(content);
  if (version === 0) {
    const rows = await query("valutin_page_content?on_conflict=slug", {
      method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({ slug, draft, published: empty, version: 1 }),
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

export async function publishProductDraft(version: number): Promise<Row> {
  const row = await getProductRow();
  if (row.version !== version) throw new Error("O rascunho mudou. Recarregue antes de publicar.");
  const rows = await query(`valutin_page_content?slug=eq.${slug}&version=eq.${version}`, {
    method: "PATCH", body: JSON.stringify({ published: row.draft, version: version + 1, published_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  });
  if (!rows[0]) throw new Error("Publicação em conflito. Recarregue e tente novamente.");
  return rows[0];
}

export const editableProducts = catalogProducts.map(({ handle, title, description, price, sizes, category, catalogCategory, reference, linxSku, linxSkus }) => ({ handle, title, description, price, sizes, category, catalogCategory, reference, linxSku, linxSkus }));
