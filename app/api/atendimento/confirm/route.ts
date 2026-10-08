import { NextRequest, NextResponse } from "next/server";
import { isBlockedWholesale } from "../../../lib/whatsapp/classifier";
import { GATE_PATH, preserveSearch } from "../../../lib/whatsapp/retail-gate";

export const dynamic = "force-dynamic";

function intentFrom(body: Record<string, unknown>, url: URL): string {
  return [
    body.text, body.message, body.nome, body.name, body.empresa, body.observacao,
    body.utm_term, url.searchParams.get("text"), url.searchParams.get("utm_term"),
  ].filter(Boolean).map(String).join(" ");
}

export async function POST(req: NextRequest) {
  const url = req.nextUrl;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const decision = String(body.decision || body.choice || "").toLowerCase();
  const intent = intentFrom(body, url);
  const wholesale = isBlockedWholesale(intent).length > 0 || decision === "wholesale" || decision === "atacado" || decision === "no";

  if (wholesale) {
    console.info(JSON.stringify({
      evt: "retail_gate_block",
      reason: decision === "retail" || decision === "yes" ? "wholesale_text" : "user_atacado",
      ts: new Date().toISOString(),
    }));
    return NextResponse.json({
      ok: true,
      blocked: true,
      lead_type: "ATACADO",
      conversions: { meta: "skipped", ga4: "skipped", google: "skipped", kommo: "skipped" },
    });
  }

  if (decision !== "retail" && decision !== "yes") {
    return NextResponse.json({ error: "decision_required" }, { status: 400 });
  }

  // A retail declaration alone cannot release WhatsApp: the lead route must
  // first obtain a persisted Kommo identity and its effective owner/slot.
  return NextResponse.json({
    ok: false,
    error: "intake_required",
    redirect: `${GATE_PATH}${preserveSearch(url.search)}`,
  }, { status: 409, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  return NextResponse.redirect(new URL(GATE_PATH, process.env.NEXT_PUBLIC_SITE_URL || "https://www.valutin.com.br"), 302);
}
