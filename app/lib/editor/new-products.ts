import { catalogProducts, type CatalogItem } from "../catalog-individual";
import { departments, productCategories } from "../catalog-navigation";
import sourceProducts from "../catalog.json";

export type NewProduct = {
  handle: string;
  title: string;
  description: string;
  category: "bebe" | "crianca" | "batizado" | "presentes";
  catalogCategory: string;
  collection: "primavera-verao" | "geral";
  price: number | null;
  reference: string | null;
  sizes: string[];
  stock: Record<string, number> | null;
  images: string[];
  imageLabels: string[];
  active: boolean;
};

const originalHandles = new Set([...catalogProducts.map((product) => product.handle), ...sourceProducts.map((product) => product.handle)]);
const reserved = new Set(["todos", "categoria", "primavera-verao"]);
const allowedDepartments = new Set<string>(departments.map((department) => department.slug));
const allowedCategories = new Set<string>(productCategories.map((category) => category.slug));
const uploadedImage = /^\/api\/editor\/media\?path=catalogo\/[a-f0-9-]{36}\.(?:jpg|png|webp)$/;
const keys = new Set(["handle", "title", "description", "category", "catalogCategory", "collection", "price", "reference", "sizes", "stock", "images", "imageLabels", "active"]);

export function validateNewProducts(input: unknown): NewProduct[] {
  if (!Array.isArray(input) || input.length > 200) throw new Error("Lista de novos produtos inválida");
  const seen = new Set<string>();
  return input.map((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error(`Produto ${index + 1} inválido`);
    const value = raw as Record<string, unknown>;
    if (Object.keys(value).some((key) => !keys.has(key))) throw new Error("Campo de produto não permitido");
    const handle = value.handle;
    if (typeof handle !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(handle) || handle.length < 3 || handle.length > 80 || originalHandles.has(handle) || reserved.has(handle) || seen.has(handle)) throw new Error("Endereço do produto inválido ou já existente");
    seen.add(handle);
    const title = value.title;
    const description = value.description;
    if (typeof title !== "string" || !title.trim() || title.trim().length > 120) throw new Error(`${handle}: nome inválido`);
    if (typeof description !== "string" || !description.trim() || description.trim().length > 1200) throw new Error(`${handle}: descrição inválida`);
    if (typeof value.category !== "string" || !allowedDepartments.has(value.category)) throw new Error(`${handle}: departamento inválido`);
    if (typeof value.catalogCategory !== "string" || !allowedCategories.has(value.catalogCategory)) throw new Error(`${handle}: categoria inválida`);
    if (value.collection !== "geral" && value.collection !== "primavera-verao") throw new Error(`${handle}: coleção inválida`);
    const price = value.price;
    if (price !== null && (typeof price !== "number" || !Number.isFinite(price) || price <= 0 || price > 100000 || Math.abs(Math.round(price * 100) - price * 100) > 0.000001)) throw new Error(`${handle}: preço inválido`);
    const reference = value.reference;
    if (reference !== null && (typeof reference !== "string" || reference.trim().length > 80)) throw new Error(`${handle}: referência inválida`);
    if (!Array.isArray(value.sizes) || value.sizes.length < 1 || value.sizes.length > 20 || value.sizes.some((size) => typeof size !== "string" || !size.trim() || size.trim().length > 24)) throw new Error(`${handle}: tamanhos inválidos`);
    const sizes = value.sizes.map((size: string) => size.trim());
    if (new Set(sizes).size !== sizes.length) throw new Error(`${handle}: tamanho repetido`);
    const stock = value.stock;
    if (stock !== null && (!stock || typeof stock !== "object" || Array.isArray(stock) || Object.entries(stock).some(([size, quantity]) => !sizes.includes(size) || typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 99999))) throw new Error(`${handle}: estoque inválido`);
    if (!Array.isArray(value.images) || !Array.isArray(value.imageLabels) || value.images.length < 1 || value.images.length > 12 || value.images.length !== value.imageLabels.length || value.images.some((image) => typeof image !== "string" || !uploadedImage.test(image))) throw new Error(`${handle}: envie ao menos uma foto válida`);
    if (new Set(value.images).size !== value.images.length || value.imageLabels.some((label) => typeof label !== "string" || !label.trim() || label.trim().length > 100)) throw new Error(`${handle}: galeria inválida`);
    if (typeof value.active !== "boolean") throw new Error(`${handle}: status inválido`);
    return {
      handle, title: title.trim(), description: description.trim(), category: value.category as NewProduct["category"],
      catalogCategory: value.catalogCategory, collection: value.collection, price: price as number | null,
      reference: reference === null ? null : (reference as string).trim() || null,
      sizes, stock: stock as Record<string, number> | null,
      images: value.images as string[], imageLabels: (value.imageLabels as string[]).map((label) => label.trim()), active: value.active,
    };
  });
}

export function asCatalogItem(product: NewProduct): CatalogItem {
  return {
    handle: product.handle, title: product.title, description: product.description, category: product.category,
    catalogCategory: product.catalogCategory, price: product.price, reference: product.reference,
    sizes: product.sizes, stock: product.stock, images: product.images, displayImages: product.images,
    imageLabels: product.imageLabels, collection: product.collection,
  } as CatalogItem;
}
