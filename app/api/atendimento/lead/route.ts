import { createHash, createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isBlockedWholesale } from "../../../lib/whatsapp/classifier";
import {
  COOKIE_RETAIL,
  createRetailToken,
  retailCookieOptions,
  retailSecret,
} from "../../../lib/whatsapp/retail-gate";
import { ATTR_KEYS, COOKIE_ASSIGNMENT, COOKIE_ASSIGNMENT_MAX_AGE, COOKIE_ATTR, type RouteBucket } from "../../../lib/whatsapp/config";
import { getRouteStore } from "../../../lib/whatsapp/store";
import { parseAttrCookie } from "../../../lib/whatsapp/routing";
import { mergeAttrFirstTouch } from "../../../lib/whatsapp/attr-merge";
import { resolveBrowserIds } from "../../../lib/whatsapp/browser-ids";
import { CatalogSaleError, requireCatalogSaleEligibility } from "../../../lib/catalog/sale-eligibility";

export const dynamic = "force-dynamic";

const WEBHOOK = process.env.VALUTIN_LEADS_WEBHOOK || "https://webhook.ehos.com.br/webhook/valutin-leads";
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { n: number; t: number }>();

function rateLimit(key: string): boolean {
  const now = Date.now();
  const cur = hits.get(key);
  if (!cur || now - cur.t > WINDOW_MS) {
    hits.set(key, { n: 1, t: now });
    return true;
  }
  cur.n += 1;
  return cur.n <= MAX_PER_WINDOW;
}

function saltIp(ip: string): string {
  const salt = process.env.WA_ROUTE_SECRET || process.env.VALUTIN_RETAIL_GATE_SECRET || "vl-dev-only";
  return createHash("sha256").update(`${salt}|${ip}`).digest("hex").slice(0, 16);
}

function signWebhook(eventId: string, phoneDigits: string): { header: string; ts: string } | null {
  const secret = String(process.env.VALUTIN_LEADS_WEBHOOK_SECRET || "").trim();
  if (!secret) return null;
  const ts = String(Math.floor(Date.now() / 1000));
  const base = `${ts}.${eventId}.${phoneDigits}`;
  const mac = createHmac("sha256", secret).update(base).digest("hex");
  return { header: `t=${ts},v1=${mac}`, ts };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(saltIp(ip))) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const checkbox = body.consumidor_final === true || body.consumidorFinal === true || body.retail_confirmed === true;
  const intent = [body.nome, body.name, body.para_quem, body.ocasiao, body.investimento, body.message, body.empresa, body.observacao, body.utm_term].filter(Boolean).map(String).join(" ");
  const hitsWholesale = isBlockedWholesale(intent);

  if (!checkbox || hitsWholesale.length) {
    console.info(JSON.stringify({
      evt: "form_blocked",
      reason: !checkbox ? "missing_checkbox" : "wholesale_text",
      ts: new Date().toISOString(),
    }));
    return NextResponse.json({
      ok: true,
      blocked: true,
      lead_type: "ATACADO",
      conversions: { meta: "skipped", ga4: "skipped", google: "skipped", kommo: "skipped" },
    });
  }

  if (!retailSecret()) {
    return NextResponse.json({ error: "gate_not_configured" }, { status: 503 });
  }
  const token = createRetailToken();
  if (!token) return NextResponse.json({ error: "gate_not_configured" }, { status: 503 });

  const eventId = String(body.event_id || "").trim();
  if (!/^[a-zA-Z0-9:_-]{8,160}$/.test(eventId)) {
    return NextResponse.json({ ok: false, error: "event_id_required" }, { status: 400 });
  }
  const phone = String(body.phone || body.telefone || body.whatsapp || "").replace(/\D/g, "");
  if (phone.length < 10 || phone.length > 15) return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 400 });

  const produto = String(body.produto || body.product || "").trim().slice(0, 200);
  const sku = String(body.sku || "").trim().slice(0, 120);
  const tamanho = String(body.tamanho || body.size || "").trim().slice(0, 40);
  const origem = String(body.origem || (produto ? "LP_CATALOGO" : "LP_FORM")).trim().slice(0, 40);
  let catalogSale: Awaited<ReturnType<typeof requireCatalogSaleEligibility>> | null = null;
  if (origem === "LP_CATALOGO") {
    if (!produto || !sku) return NextResponse.json({ ok: false, error: "catalog_sku_required" }, { status: 409 });
    try {
      catalogSale = await requireCatalogSaleEligibility({ productHandle: produto, sku, size: tamanho || null });
    } catch (error) {
      const code = error instanceof CatalogSaleError ? error.code : "catalog_stock_check_unavailable";
      const status = code === "catalog_stock_not_configured" || code === "catalog_stock_check_unavailable" ? 503 : 409;
      return NextResponse.json({ ok: false, error: code }, { status, headers: { "Cache-Control": "no-store" } });
    }
  }

  const sticky = req.cookies.get(COOKIE_ASSIGNMENT)?.value;
  const visitorHash = createHash("sha256").update(`${retailSecret()}|${eventId}`).digest("hex");
  const assignment = await getRouteStore().assign({
    visitor_hash: visitorHash,
    sticky_slot: ["A", "B", "C"].includes(sticky || "") ? sticky as RouteBucket : undefined,
  });
  if (!["A", "B", "C"].includes(assignment.slot)) return NextResponse.json({ ok: false, error: "route_unavailable" }, { status: 503 });

  let attr = parseAttrCookie(req.cookies.get(COOKIE_ATTR)?.value);
  const fromBody: Record<string, string> = {};
  for (const key of ATTR_KEYS) {
    if (typeof body[key] === "string" && body[key]) fromBody[key] = String(body[key]).slice(0, 200);
  }
  attr = mergeAttrFirstTouch(attr, fromBody);

  const browserFromBody = {
    fbp: String(body.fbp || body._fbp || "").trim(),
    fbc: String(body.fbc || body._fbc || "").trim(),
    ga_client_id: String(body.ga_client_id || body.client_id || "").trim(),
  };
  const browserFromCookie = resolveBrowserIds({
    cookieHeader: req.headers.get("cookie") || undefined,
    fbclid: attr.fbclid || String(body.fbclid || ""),
  });
  const fbp = browserFromBody.fbp || attr.fbp || attr._fbp || browserFromCookie.fbp || "";
  const fbc = browserFromBody.fbc || attr.fbc || attr._fbc || browserFromCookie.fbc || "";
  const gaClientId =
    browserFromBody.ga_client_id ||
    attr.ga_client_id ||
    attr.client_id ||
    browserFromCookie.ga_client_id ||
    "";

  if (fbp) attr = mergeAttrFirstTouch(attr, { fbp, _fbp: fbp });
  if (fbc) attr = mergeAttrFirstTouch(attr, { fbc, _fbc: fbc });
  if (gaClientId) attr = mergeAttrFirstTouch(attr, { ga_client_id: gaClientId, client_id: gaClientId });

  // Consent SoT: independent purposes. Never invent GRANTED/timestamp without a real decision.
  // Legacy boolean cookie banner text covers personalization + analytics only — not ad_user_data.
  const cookieConsent = body.cookie_consent;
  const norm = (v: unknown) => {
    const s = String(v || "").trim().toUpperCase();
    if (["GRANTED", "CONSENT_GRANTED", "TRUE", "YES", "1"].includes(s)) return "GRANTED";
    if (["DENIED", "CONSENT_DENIED", "FALSE", "NO", "0"].includes(s)) return "DENIED";
    if (s === "UNKNOWN" || s === "") return "UNKNOWN";
    return "UNKNOWN";
  };
  let adUser = norm(body.ad_user_data_consent);
  let adPers = norm(body.ad_personalization_consent);
  let analytics = norm(body.analytics_consent);
  const explicit =
    String(body.ad_user_data_consent || "").trim() !== "" ||
    String(body.ad_personalization_consent || "").trim() !== "" ||
    String(body.analytics_consent || "").trim() !== "";
  if (!explicit) {
    if (cookieConsent === true) {
      adUser = "UNKNOWN";
      adPers = "GRANTED";
      analytics = "GRANTED";
    } else if (cookieConsent === false) {
      adUser = "DENIED";
      adPers = "DENIED";
      analytics = "DENIED";
    } else {
      adUser = "UNKNOWN";
      adPers = "UNKNOWN";
      analytics = "UNKNOWN";
    }
  }
  const hasDecision = [adUser, adPers, analytics].some((v) => v === "GRANTED" || v === "DENIED");
  const consentTimestamp = hasDecision
    ? String(body.consent_timestamp || new Date().toISOString())
    : "";
  const consentSource = hasDecision ? String(body.consent_source || "lp_cookie") : "";
  const consentVersion = hasDecision
    ? String(body.consent_version || "valutin-cookie-consent-v1")
    : "";
  const payload = Object.assign({}, body, {
    ...attr,
    fbp,
    fbc,
    ga_client_id: gaClientId,
    slot: assignment.slot,
    route_ref: assignment.route_ref,
    event_id: eventId,
    lead_type: "VAREJO",
    retail_confirmed: true,
    trusted_retail_source: true,
    origem,
    produto: produto || undefined,
    sku: sku || undefined,
    tamanho: tamanho || undefined,
    ...(catalogSale ? {
      catalog_sale_eligible: true,
      catalog_product_handle: catalogSale.productHandle,
      catalog_product_title: catalogSale.productTitle,
      catalog_reference: catalogSale.reference || undefined,
      catalog_sku: catalogSale.sku,
      catalog_size: catalogSale.size || undefined,
      catalog_price: catalogSale.price ?? undefined,
      linx_stock_quantity: catalogSale.quantity,
      linx_stock_checked_at: catalogSale.checkedAt,
    } : {}),
    ad_user_data_consent: adUser,
    ad_personalization_consent: adPers,
    analytics_consent: analytics,
    consent_timestamp: consentTimestamp || undefined,
    consent_source: consentSource || undefined,
    consent_version: consentVersion || undefined,
  });
  // Never forward placeholder revenue.
  if (Number(payload.lead_value) === 426 || Number(payload.value) === 426) {
    delete payload.lead_value;
    delete payload.value;
  }

  let effectiveSlot: RouteBucket = assignment.slot;
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const sig = signWebhook(eventId, phone);
    if (sig) headers["X-Valutin-Signature"] = sig.header;
    else if (process.env.NODE_ENV === "production" && process.env.VALUTIN_LEADS_REQUIRE_SIGNATURE === "1") {
      return NextResponse.json({ ok: false, error: "webhook_secret_missing" }, { status: 503 });
    }

    const upstream = await fetch(WEBHOOK, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25000),
    });
    const result = await upstream.json().catch(() => null);
    if (!upstream.ok || !result || result.ok !== true || !result.lead_id || result.blocked) {
      throw new Error("intake_unconfirmed");
    }
    if (result.route_conflict || !["A", "B", "C"].includes(result.slot) || !result.responsible_user_id) {
      return NextResponse.json({ ok: false, error: "route_conflict" }, { status: 409 });
    }
    effectiveSlot = result.slot;
  } catch {
    console.info(JSON.stringify({ evt: "form_webhook_error", error_code: "webhook_failed", ts: new Date().toISOString() }));
    const failed = NextResponse.json({ ok: false, error: "intake_unavailable" }, { status: 503 });
    failed.cookies.set(COOKIE_ASSIGNMENT, assignment.slot, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: COOKIE_ASSIGNMENT_MAX_AGE });
    return failed;
  }

  const res = NextResponse.json({
    ok: true,
    blocked: false,
    retail_confirmed: true,
    lead_type: "VAREJO",
    event_id: eventId,
    redirect: "/wa",
  });
  res.cookies.set(COOKIE_RETAIL, token, retailCookieOptions());
  res.cookies.set(COOKIE_ASSIGNMENT, effectiveSlot, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: COOKIE_ASSIGNMENT_MAX_AGE });
  if (Object.keys(attr).length) {
    res.cookies.set(COOKIE_ATTR, JSON.stringify(attr), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
  }
  return res;
}
