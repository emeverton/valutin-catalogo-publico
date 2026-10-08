import products from "../catalog.json";
import { catalogProducts } from "../catalog-individual";
import { getCatalogProducts } from "../editor/catalog-store";
import { getLinxSkusForReference, getLinxStock, hasLinxStockConfig } from "../linx/stock";
import { catalogFeedId } from "./feed-id";

type CatalogProduct = {
  title: string;
  handle: string;
  category: "bebe" | "crianca" | "batizado" | "presentes";
  catalogCategory?: string;
  description: string;
  price: number | null;
  reference?: string | null;
  sizes: string[];
  displayImages: string[];
  linxSku?: string;
  linxSkus?: Record<string, string>;
  stock?: Record<string, number> | null;
};

export type FeedItem = {
  id: string;
  itemGroupId?: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImageLinks: string[];
  availability: "in_stock" | "out_of_stock";
  inventory: number;
  price: number;
  sku: string;
  size?: string;
  productType: string;
};

export class ProductFeedUnavailableError extends Error {
  constructor(readonly code: "linx_not_configured" | "no_eligible_products" | "invalid_public_origin") { super(code); }
}

function publicOrigin(): string {
  const configured = String(process.env.CATALOG_PUBLIC_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || "https://www.valutin.com.br").trim();
  try {
    const url = new URL(configured);
    if (url.protocol !== "https:") throw new Error("origin_must_be_https");
    return url.origin;
  } catch {
    throw new ProductFeedUnavailableError("invalid_public_origin");
  }
}

function imageUrl(origin: string, source: string): string {
  return new URL(source, origin).toString();
}

function productType(product: CatalogProduct): string {
  const labels: Record<CatalogProduct["category"], string> = {
    bebe: "Bebês",
    crianca: "Crianças",
    batizado: "Batizado e cerimônia",
    presentes: "Presentes e lembranças",
  };
  return `Valutin > ${labels[product.category]}${product.catalogCategory ? ` > ${product.catalogCategory.replace(/-/g, " ")}` : ""}`;
}

function configuredVariants(product: CatalogProduct): Array<{ sku: string; size?: string }> {
  const mapped = Object.entries(product.linxSkus || {}).flatMap(([size, sku]) => /^\d{1,20}$/.test(sku.trim()) ? [{ sku: sku.trim(), size }] : []);
  if (mapped.length) return mapped;
  const sku = String(product.linxSku || "").trim();
  return /^\d{1,20}$/.test(sku) ? [{ sku }] : [];
}

async function variants(product: CatalogProduct): Promise<Array<{ sku: string; size?: string }>> {
  const configured = configuredVariants(product);
  if (configured.length) return configured;
  const reference = String(product.reference || "").trim();
  if (!reference) return [];
  return (await getLinxSkusForReference(reference)).map((sku) => ({ sku }));
}

async function concurrently<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
  const output = new Array<R>(items.length);
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      output[current] = await mapper(items[current]);
    }
  }));
  return output;
}

export async function buildProductFeed(): Promise<FeedItem[]> {
  const origin = publicOrigin();
  const published = await getCatalogProducts();
  const publishedByHandle = new Map(published.map((product) => [product.handle, product]));
  const routableHandles = new Set(catalogProducts.map((product) => product.handle));
  const candidateProducts = (products as CatalogProduct[]).flatMap((product) => {
    const current = (publishedByHandle.get(product.handle) as CatalogProduct | undefined) ?? product;
    const price = current.price;
    // A family split into individual color/print pages has no PDP at its source
    // handle. Do not advertise that URL (or assume a Linx SKU belongs to a color).
    if (!routableHandles.has(product.handle) || typeof price !== "number" || !Number.isFinite(price) || price <= 0 || !current.displayImages[0]) return [];
    return [{ product: current, price }];
  });
  const linxConfigured = hasLinxStockConfig();
  const candidates = (await concurrently(candidateProducts, 4, async ({ product, price }) => {
    if (product.stock !== null && product.stock !== undefined) {
      // Manual stock may enter a feed only with an explicit size-to-SKU map.
      // A family/reference SKU cannot prove which color and size it represents.
      return configuredVariants(product).filter((variant) => variant.size && product.stock?.[variant.size] !== undefined).map((variant) => ({ product, variant, price }));
    }
    return linxConfigured ? (await variants(product)).map((variant) => ({ product, variant, price })) : [];
  })).flat();
  if (!candidates.length && !linxConfigured) throw new ProductFeedUnavailableError("linx_not_configured");
  const rows = await concurrently(candidates, 4, async ({ product, variant, price }) => {
    const manualQuantity = product.stock && variant.size ? product.stock[variant.size] : undefined;
    const stock = manualQuantity === undefined ? await getLinxStock({ sku: variant.sku }) : null;
    const quantity = manualQuantity ?? (stock?.status === "available" ? stock.quantity : 0);
    const available = quantity > 0;
    const isVariant = Boolean(variant.size || product.reference);
    return {
      id: catalogFeedId(variant.sku),
      ...(isVariant ? { itemGroupId: `vlt_${product.handle}` } : {}),
      title: `${product.title}${variant.size ? ` — ${variant.size}` : ""}`,
      description: product.description,
      link: new URL(`/catalogo/${product.handle}?sku=${encodeURIComponent(variant.sku)}`, origin).toString(),
      imageLink: imageUrl(origin, product.displayImages[0]),
      additionalImageLinks: product.displayImages.slice(1, 11).map((image) => imageUrl(origin, image)),
      availability: available ? "in_stock" as const : "out_of_stock" as const,
      inventory: available ? quantity : 0,
      price,
      sku: variant.sku,
      ...(variant.size ? { size: variant.size } : {}),
      productType: productType(product),
    };
  });
  if (!rows.length) throw new ProductFeedUnavailableError("no_eligible_products");
  return rows;
}

function xml(value: string | number): string {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function tag(name: string, value: string | number | undefined): string {
  return value === undefined || value === "" ? "" : `<g:${name}>${xml(value)}</g:${name}>`;
}

function envelope(channel: "Meta Catalog" | "Google Shopping", items: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>Valutin ${channel}</title><link>https://www.valutin.com.br/catalogo</link><description>Catálogo Valutin com disponibilidade por peça elegível.</description>${items.join("")}</channel></rss>`;
}

export function googleShoppingXml(items: FeedItem[]): string {
  return envelope("Google Shopping", items.map((item) => `<item>${tag("id", item.id)}${tag("title", item.title)}${tag("description", item.description)}${tag("link", item.link)}${tag("image_link", item.imageLink)}${item.additionalImageLinks.map((image) => tag("additional_image_link", image)).join("")}${tag("availability", item.availability)}${tag("price", `${item.price.toFixed(2)} BRL`)}${tag("condition", "new")}${tag("brand", "Valutin")}${tag("mpn", item.sku)}${tag("product_type", item.productType)}${tag("item_group_id", item.itemGroupId)}${tag("size", item.size)}${item.size ? tag("size_system", "BR") : ""}</item>`));
}

export function metaCatalogXml(items: FeedItem[]): string {
  return envelope("Meta Catalog", items.map((item) => `<item>${tag("id", item.id)}${tag("title", item.title)}${tag("description", item.description)}${tag("link", item.link)}${tag("image_link", item.imageLink)}${item.additionalImageLinks.map((image) => tag("additional_image_link", image)).join("")}${tag("availability", item.availability.replace("_", " "))}${tag("inventory", item.inventory)}${tag("price", `${item.price.toFixed(2)} BRL`)}${tag("condition", "new")}${tag("brand", "Valutin")}${tag("mpn", item.sku)}${tag("product_type", item.productType)}${tag("item_group_id", item.itemGroupId)}${tag("size", item.size)}</item>`));
}
