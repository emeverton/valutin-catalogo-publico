import { NextRequest, NextResponse } from "next/server";
import { getLinxStock, hasLinxStockConfig, isLinxSkuForReference, linxStockDiagnostic } from "../../../lib/linx/stock";

export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { count: number; startedAt: number }>();

function allowed(key: string): boolean {
  const now = Date.now();
  const current = hits.get(key);
  if (!current || now - current.startedAt > WINDOW_MS) { hits.set(key, { count: 1, startedAt: now }); return true; }
  current.count += 1;
  return current.count <= MAX_PER_WINDOW;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowed(ip)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  const sku = String(request.nextUrl.searchParams.get("sku") || "").trim();
  const reference = String(request.nextUrl.searchParams.get("reference") || "").trim();
  if (!/^\d{1,20}$/.test(sku || "") && !/^[A-Za-zÀ-ÿ0-9 /_-]{3,80}$/.test(reference || "")) return NextResponse.json({ ok: false, error: "sku_or_reference_required" }, { status: 400 });
  if (!hasLinxStockConfig()) return NextResponse.json({ ok: true, configured: false }, { headers: { "Cache-Control": "no-store" } });
  try {
    if (sku && reference && !(await isLinxSkuForReference({ sku, reference }))) return NextResponse.json({ ok: false, error: "sku_reference_mismatch" }, { status: 404, headers: { "Cache-Control": "no-store" } });
    const stock = await getLinxStock({ sku: sku || undefined, reference: sku ? undefined : reference });
    return NextResponse.json({ ok: true, configured: true, ...stock }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ level: "error", event: "linx_stock_unavailable", route: "/api/catalogo/estoque", ...linxStockDiagnostic(error) }));
    return NextResponse.json({ ok: false, error: "stock_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
