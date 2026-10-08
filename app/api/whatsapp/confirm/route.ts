import { NextRequest, NextResponse } from "next/server";
import { getRouteStore } from "../../../lib/whatsapp/store";
import type { RouteBucket } from "../../../lib/whatsapp/config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const expected = process.env.VALUTIN_WA_CONFIRM_SECRET || "";
  const kommo = process.env.KOMMO_LONG_LIVED_TOKEN || "";
  const got = req.headers.get("x-valutin-confirm") || "";
  const allowed = (expected && got === expected) || (kommo && got === kommo);
  if (!allowed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const slot = String(body.slot || "").toUpperCase();
  const leadId = String(body.kommo_lead_id || "");
  if (!["A", "B", "C"].includes(slot) || leadId.length < 2) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  const store = getRouteStore();
  const result = await store.confirm({
    slot: slot as RouteBucket,
    kommo_lead_id: leadId,
    route_ref: String(body.route_ref || ""),
    lead_type: String(body.lead_type || "NAO_CLASSIFICADO"),
  });
  console.info(JSON.stringify({
    evt: "wa_confirm",
    slot,
    lead_id: leadId,
    lead_type: body.lead_type || "NAO_CLASSIFICADO",
    already: result.already,
    ts: new Date().toISOString(),
  }));
  return NextResponse.json({ ok: result.ok, already: result.already, confirmed_leads: result.confirmed_leads });
}
