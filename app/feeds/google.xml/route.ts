import { buildProductFeed, googleShoppingXml, ProductFeedUnavailableError } from "../../lib/catalog/product-feeds";
import { linxStockDiagnostic } from "../../lib/linx/stock";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const body = googleShoppingXml(await buildProductFeed());
    return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  } catch (error) {
    const code = error instanceof ProductFeedUnavailableError ? error.code : "stock_upstream_unavailable";
    console.error(JSON.stringify({ level: "error", event: "catalog_feed_unavailable", route: "/feeds/google.xml", ...linxStockDiagnostic(error) }));
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><error><code>${code}</code></error>`, { status: 503, headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  }
}
