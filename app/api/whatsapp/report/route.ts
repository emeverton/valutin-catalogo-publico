import { NextRequest, NextResponse } from "next/server";
import { getRouteStore } from "../../../lib/whatsapp/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const expected = process.env.VALUTIN_WA_CONFIRM_SECRET || "";
  const kommo = process.env.KOMMO_LONG_LIVED_TOKEN || "";
  const got = req.headers.get("x-valutin-confirm") || req.nextUrl.searchParams.get("token") || "";
  const allowed = (expected && got === expected) || (kommo && got === kommo);
  if (!allowed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const store = getRouteStore();
  const rows = await store.report();
  return NextResponse.json({ ok: true, routes: rows, ts: new Date().toISOString() });
}
