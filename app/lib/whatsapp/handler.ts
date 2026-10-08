import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  ATTR_KEYS,
  BLOCKED_QUERY,
  COOKIE_ASSIGNMENT,
  COOKIE_ASSIGNMENT_MAX_AGE,
  COOKIE_ATTR,
  COOKIE_LEAD_KEY,
  COOKIE_MAX_AGE,
  ROUTING_VERSION,
  type RouteBucket,
} from "./config";
import { buildPrefillText, visitorHashFrom } from "./balance";
import { getRouteStore } from "./store";
import { newLeadKey, parseAttrCookie } from "./routing";
import { isBlockedWholesale } from "./classifier";
import { COOKIE_RETAIL, GATE_PATH, preserveSearch, verifyRetailToken } from "./retail-gate";
import { mergeAttrFirstTouch } from "./attr-merge";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 40;
const hits = new Map<string, { n: number; t: number }>();

function cookieOpts(maxAge = COOKIE_MAX_AGE) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/",
  };
}

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
  const salt = process.env.WA_ROUTE_SECRET || "vl-dev-only-not-for-prod";
  return createHash("sha256").update(`${salt}|${ip}`).digest("hex").slice(0, 16);
}

function collectIntent(url: URL): string {
  const keys = ["text", "message", "nome", "name", "empresa", "observacao", "utm_term", "q", "query"];
  const bits: string[] = [];
  url.searchParams.forEach((value, key) => {
    bits.push(value);
    if (keys.includes(key)) bits.push(value);
  });
  return bits.join(" ");
}

function redirectAtendimento(url: URL, extra = ""): NextResponse {
  const dest = new URL(url.href);
  dest.pathname = GATE_PATH;
  dest.search = preserveSearch(url.search);
  if (extra) {
    const params = new URLSearchParams(dest.search.startsWith("?") ? dest.search.slice(1) : dest.search);
    extra.split("&").forEach((pair) => {
      const [k, v] = pair.split("=");
      if (k) params.set(k, v || "1");
    });
    dest.search = params.toString() ? `?${params.toString()}` : "";
  }
  const res = NextResponse.redirect(dest, 302);
  res.headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
  res.headers.set("CDN-Cache-Control", "no-store");
  res.headers.set("Vercel-CDN-Cache-Control", "no-store");
  res.headers.set("Vary", "Cookie");
  res.headers.set("X-Valutin-Gate", extra ? "wholesale" : "missing_retail_token");
  return res;
}

export async function handleWhatsAppGet(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl;
  for (const blocked of Array.from(BLOCKED_QUERY)) {
    if (url.searchParams.has(blocked)) {
      return NextResponse.json({ error: "invalid_param" }, { status: 400 });
    }
  }

  const intent = collectIntent(url);
  if (isBlockedWholesale(intent).length) {
    console.info(JSON.stringify({
      evt: "wa_blocked",
      reason: "wholesale_intent",
      route_ref: null,
      ts: new Date().toISOString(),
    }));
    return redirectAtendimento(url, "blocked=wholesale");
  }

  // Nenhuma origem pública bypassa: src, utm, referrer, como-chegar, footer, concierge.
  const retail = verifyRetailToken(req.cookies.get(COOKIE_RETAIL)?.value);
  if (!retail.ok) {
    console.info(JSON.stringify({
      evt: "wa_gate_redirect",
      reason: retail.reason,
      ts: new Date().toISOString(),
    }));
    return redirectAtendimento(url);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const ipHash = saltIp(ip);
  if (!rateLimit(ipHash)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let leadKey = url.searchParams.get("lead_key") || req.cookies.get(COOKIE_LEAD_KEY)?.value || "";
  if (!leadKey || leadKey.length < 8) leadKey = newLeadKey();

  const stickyRaw = req.cookies.get(COOKIE_ASSIGNMENT)?.value || "";
  const sticky = ["A", "B", "C"].includes(stickyRaw) ? (stickyRaw as RouteBucket) : undefined;
  const visitorHash = visitorHashFrom(ipHash, req.headers.get("user-agent") || "", leadKey);
  const store = getRouteStore();
  const assignment = await store.assign({ visitor_hash: visitorHash, sticky_slot: sticky });

  const text = url.searchParams.get("text") || buildPrefillText(assignment.route_ref);
  const dest = new URL(`https://wa.me/${assignment.phone_e164}`);
  dest.searchParams.set("text", text.slice(0, 500));

  let attr = parseAttrCookie(req.cookies.get(COOKIE_ATTR)?.value);
  const incoming: Record<string, string> = {};
  for (const key of ATTR_KEYS) {
    const q = url.searchParams.get(key);
    if (q) incoming[key] = q.slice(0, 200);
  }
  attr = mergeAttrFirstTouch(attr, incoming);

  console.info(JSON.stringify({
    evt: "wa_route",
    routing_version: ROUTING_VERSION,
    slot: assignment.slot,
    route_status: assignment.route_status,
    route_ref: assignment.route_ref,
    visitor_hash: visitorHash.slice(0, 12),
    lead_type: "VAREJO",
    campaign_id: attr.campaign_id || url.searchParams.get("campaign_id") || null,
    utm_source: attr.utm_source || null,
    ts: new Date().toISOString(),
  }));

  const res = NextResponse.redirect(dest, 302);
  res.headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
  res.headers.set("CDN-Cache-Control", "no-store");
  res.headers.set("Vercel-CDN-Cache-Control", "no-store");
  res.headers.set("Vary", "Cookie");
  res.cookies.set(COOKIE_LEAD_KEY, leadKey, cookieOpts());
  res.cookies.set(COOKIE_ASSIGNMENT, assignment.slot, cookieOpts(COOKIE_ASSIGNMENT_MAX_AGE));
  if (Object.keys(attr).length) {
    res.cookies.set(COOKIE_ATTR, JSON.stringify(attr), cookieOpts());
  }
  return res;
}
