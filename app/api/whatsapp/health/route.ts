import { NextResponse } from "next/server";
import { getRouteStore } from "../../../lib/whatsapp/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = getRouteStore();
  const db = await store.health();
  return NextResponse.json({
    ok: true,
    router: "up",
    db: db.db,
    kommo: Boolean(process.env.KOMMO_LONG_LIVED_TOKEN),
    meta: Boolean(process.env.VALUTIN_META_CAPI_TOKEN || process.env.META_ACCESS_TOKEN),
    google: Boolean(process.env.GOOGLE_ADS_REFRESH_TOKEN),
    ts: new Date().toISOString(),
  });
}
