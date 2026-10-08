import { catalogProducts, type CatalogItem } from "../catalog-individual";

export type ProductGallery = { images: string[]; labels: string[] };
export type CatalogMedia = Record<string, ProductGallery>;

const productsByHandle = new Map(catalogProducts.map((product) => [product.handle, product]));
const uploadedImage = /^\/api\/editor\/media\?path=catalogo\/[a-f0-9-]{36}\.(?:jpg|jpeg|png|webp)$/;

export function validateCatalogMedia(input: unknown): CatalogMedia {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Galerias inválidas");
  const result: CatalogMedia = {};
  const entries = Object.entries(input);
  if (entries.length > catalogProducts.length) throw new Error("Muitas galerias");
  for (const [handle, value] of entries) {
    const product = productsByHandle.get(handle);
    if (!product || !value || typeof value !== "object" || Array.isArray(value)) throw new Error("Produto desconhecido");
    const gallery = value as Record<string, unknown>;
    if (Object.keys(gallery).some((key) => key !== "images" && key !== "labels")) throw new Error("Campo de galeria desconhecido");
    if (!Array.isArray(gallery.images) || !Array.isArray(gallery.labels) || gallery.images.length < 1 || gallery.images.length > 12 || gallery.images.length !== gallery.labels.length) throw new Error(`${product.title}: galeria incompleta`);
    const allowedOriginals = new Set(product.displayImages);
    const images = gallery.images.map((image) => {
      if (typeof image !== "string" || !(allowedOriginals.has(image) || uploadedImage.test(image))) throw new Error(`${product.title}: imagem não permitida`);
      return image;
    });
    if (new Set(images).size !== images.length) throw new Error(`${product.title}: imagem repetida`);
    const labels = gallery.labels.map((label) => {
      if (typeof label !== "string" || !label.trim() || label.trim().length > 100) throw new Error(`${product.title}: descrição da foto inválida`);
      return label.trim();
    });
    result[handle] = { images, labels };
  }
  return result;
}

export function applyCatalogMedia(products: CatalogItem[], overrides: CatalogMedia): CatalogItem[] {
  return products.map((product) => {
    const gallery = overrides[product.handle];
    return gallery ? { ...product, images: gallery.images, displayImages: gallery.images, imageLabels: gallery.labels } : product;
  });
}

export function defaultGallery(handle: string): ProductGallery | null {
  const product = productsByHandle.get(handle);
  return product ? { images: [...product.displayImages], labels: [...product.imageLabels] } : null;
}
