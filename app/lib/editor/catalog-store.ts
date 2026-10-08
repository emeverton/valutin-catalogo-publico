import "server-only";
import { cache } from "react";
import { catalogProducts } from "../catalog-individual";
import { applyCatalogMedia, validateCatalogMedia, type CatalogMedia } from "./catalog-media";
import { applyProductEdits } from "./catalog-products";
import { getPublishedProductEdits } from "./product-store";
import { getPublishedNewProducts } from "./new-product-store";
import { asCatalogItem } from "./new-products";
import { editorStorageConfigured, storageCredentials } from "./store";

const slug = "catalogo-images";
const empty: CatalogMedia = {};
type CatalogRow = { draft: CatalogMedia; published: CatalogMedia; version: number; published_at: string | null; updated_at: string };

async function query(path: string, init?: RequestInit): Promise<CatalogRow[]> {
  const { url, key } = storageCredentials();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation", ...init?.headers },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Falha ao acessar galerias (${response.status})`);
  return response.json();
}

export async function getCatalogRow(): Promise<CatalogRow> {
  const rows = await query(`valutin_page_content?slug=eq.${slug}&select=draft,published,version,published_at,updated_at`);
  const row = rows[0];
  if (!row) return { draft: empty, published: empty, version: 0, published_at: null, updated_at: "" };
  return { ...row, draft: validateCatalogMedia(row.draft), published: validateCatalogMedia(row.published) };
}

export const getPublishedCatalogMedia = cache(async (): Promise<CatalogMedia> => {
  if (!editorStorageConfigured()) return empty;
  try { return (await getCatalogRow()).published; }
  catch (error) { console.error("Falha ao ler fotos do catálogo; mantendo fotos aprovadas", error); return empty; }
});

export const getCatalogProducts = cache(async () => {
  const [media, edits, added] = await Promise.all([getPublishedCatalogMedia(), getPublishedProductEdits(), getPublishedNewProducts()]);
  return [...applyProductEdits(applyCatalogMedia(catalogProducts, media), edits), ...added.map(asCatalogItem)];
});

export async function saveCatalogDraft(content: unknown, version: number): Promise<CatalogRow> {
  const draft = validateCatalogMedia(content);
  if (version === 0) {
    const rows = await query(`valutin_page_content?on_conflict=slug`, {
      method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({ slug, draft, published: empty, version: 1 }),
    });
    if (!rows[0]) throw new Error("Outra pessoa iniciou a edição. Recarregue antes de salvar.");
    return rows[0];
  }
  const rows = await query(`valutin_page_content?slug=eq.${slug}&version=eq.${version}`, {
    method: "PATCH", body: JSON.stringify({ draft, version: version + 1, updated_at: new Date().toISOString() }),
  });
  if (!rows[0]) throw new Error("Outra pessoa alterou o catálogo. Recarregue antes de salvar.");
  return rows[0];
}

export async function publishCatalogDraft(version: number): Promise<CatalogRow> {
  const row = await getCatalogRow();
  if (row.version !== version) throw new Error("O rascunho mudou. Recarregue antes de publicar.");
  const rows = await query(`valutin_page_content?slug=eq.${slug}&version=eq.${version}`, {
    method: "PATCH", body: JSON.stringify({ published: row.draft, version: version + 1, published_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  });
  if (!rows[0]) throw new Error("Publicação em conflito. Recarregue e tente novamente.");
  return rows[0];
}

export const catalogMediaProducts = catalogProducts.map((product) => ({ handle: product.handle, title: product.title, category: product.category, catalogCategory: product.catalogCategory, gallery: { images: product.displayImages, labels: product.imageLabels } }));
