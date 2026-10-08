import products from "../catalog.json";
import { getLinxStock, hasLinxStockConfig, isLinxSkuForReference } from "../linx/stock";

type CatalogProduct = {
  handle: string;
  title: string;
  price: number | null;
  reference?: string | null;
  linxSku?: string;
  linxSkus?: Record<string, string>;
};

export class CatalogSaleError extends Error {
  constructor(readonly code: "catalog_product_invalid" | "catalog_sku_unmapped" | "catalog_stock_unavailable" | "catalog_stock_not_configured") {
    super(code);
  }
}

export type CatalogSaleEligibility = {
  productHandle: string;
  productTitle: string;
  reference: string | null;
  sku: string;
  size: string | null;
  price: number | null;
  quantity: number;
  checkedAt: string;
};

function catalogProduct(handle: string): CatalogProduct | null {
  return (products as CatalogProduct[]).find((product) => product.handle === handle) || null;
}

function knownSku(product: CatalogProduct, size: string | null): string {
  const mapped = size ? product.linxSkus?.[size] : undefined;
  return mapped || product.linxSku || "";
}

export async function requireCatalogSaleEligibility(input: { productHandle: string; sku: string; size?: string | null }): Promise<CatalogSaleEligibility> {
  const product = catalogProduct(input.productHandle);
  if (!product) throw new CatalogSaleError("catalog_product_invalid");
  const size = String(input.size || "").trim() || null;
  const suppliedSku = String(input.sku || "").trim();
  const configuredSku = knownSku(product, size);
  if (!hasLinxStockConfig()) throw new CatalogSaleError("catalog_stock_not_configured");
  const matchesConfiguredSku = Boolean(configuredSku && configuredSku === suppliedSku);
  const matchesReferenceSku = !configuredSku && Boolean(product.reference) && await isLinxSkuForReference({ sku: suppliedSku, reference: product.reference! });
  if (!matchesConfiguredSku && !matchesReferenceSku) throw new CatalogSaleError("catalog_sku_unmapped");
  const verifiedSku = matchesConfiguredSku ? configuredSku : suppliedSku;
  const stock = await getLinxStock({ sku: verifiedSku });
  if (stock.status !== "available" || stock.quantity < 1) throw new CatalogSaleError("catalog_stock_unavailable");
  return {
    productHandle: product.handle,
    productTitle: product.title,
    reference: product.reference || null,
    sku: verifiedSku,
    size,
    price: product.price,
    quantity: stock.quantity,
    checkedAt: new Date().toISOString(),
  };
}
