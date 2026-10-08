import { catalogProducts, type CatalogItem } from "../catalog-individual";

export type ProductEdit = { title: string; description: string; price: number | null; stock: Record<string, number> | null };
export type ProductEdits = Record<string, ProductEdit>;

const byHandle = new Map(catalogProducts.map((product) => [product.handle, product]));

export function validateProductEdits(input: unknown): ProductEdits {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Produtos inválidos");
  const entries = Object.entries(input);
  if (entries.length > byHandle.size) throw new Error("Quantidade de produtos inválida");
  const result: ProductEdits = {};
  for (const [handle, raw] of entries) {
    if (!byHandle.has(handle) || !raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Produto desconhecido");
    const edit = raw as Record<string, unknown>;
    if (Object.keys(edit).some((key) => !["title", "description", "price", "stock"].includes(key))) throw new Error("Campo de produto não permitido");
    if (typeof edit.title !== "string" || !edit.title.trim() || edit.title.trim().length > 120) throw new Error(`${handle}: nome inválido`);
    if (typeof edit.description !== "string" || !edit.description.trim() || edit.description.trim().length > 1200) throw new Error(`${handle}: descrição inválida`);
    const price = edit.price;
    if (price !== null && (typeof price !== "number" || !Number.isFinite(price) || price <= 0 || price > 100000 || Math.abs(Math.round(price * 100) - price * 100) > 0.000001)) throw new Error(`${handle}: preço inválido`);
    const stock = edit.stock ?? null;
    if (stock !== null && (typeof stock !== "object" || Array.isArray(stock))) throw new Error(`${handle}: estoque inválido`);
    const allowedSizes = new Set(byHandle.get(handle)!.sizes);
    if (stock && Object.entries(stock).some(([size, quantity]) => !allowedSizes.has(size) || typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 99999)) throw new Error(`${handle}: quantidade inválida`);
    result[handle] = { title: edit.title.trim(), description: edit.description.trim(), price: price as number | null, stock: stock as Record<string, number> | null };
  }
  return result;
}

export function applyProductEdits(products: CatalogItem[], edits: ProductEdits): CatalogItem[] {
  return products.map((product) => edits[product.handle] ? { ...product, ...edits[product.handle] } : product);
}
