/** Números e pesos — só via env em produção. Defaults = canônicos Valutin. */

export const ROUTING_VERSION = "vl-wa-v2";

export const WA_PUBLIC_E164 = process.env.WA_PUBLIC_E164 || "5511997534668";
export const WA_PUBLIC_DISPLAY = process.env.WA_PUBLIC_DISPLAY || "+55 11 99753-4668";

export type RouteBucket = "A" | "B" | "C";

export interface RouteTarget {
  bucket: RouteBucket;
  e164: string;
  weight: number;
}

export function routeTargets(): RouteTarget[] {
  return [
    { bucket: "A", e164: process.env.WA_ROUTE_A || "5511997534668", weight: 3334 },
    { bucket: "B", e164: process.env.WA_ROUTE_B || "5511915702555", weight: 3333 },
    { bucket: "C", e164: process.env.WA_ROUTE_C || "5511999116491", weight: 3333 },
  ];
}

export const ATTR_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_referrer",
  "ga_client_id",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "_fbp",
  "_fbc",
  "fbp",
  "fbc",
  "client_id",
  "campaign_id",
  "adset_id",
  "ad_id",
  "placement",
] as const;

export const BLOCKED_QUERY = new Set([
  "phone",
  "numero",
  "number",
  "wa",
  "to",
  "dest",
  "e164",
]);

export const COOKIE_LEAD_KEY = "vl_lead_key";
export const COOKIE_ASSIGNMENT = "vlt_wa_assignment";
export const COOKIE_ATTR = "vl_attr";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;
export const COOKIE_ASSIGNMENT_MAX_AGE = 60 * 60 * 24;

export const DEFAULT_WA_TEXT =
  "Olá! Vim pelo atendimento online da Valutin.";

export const ROUTER_PATH = "/wa";
export const GATE_PATH = "/atendimento";
export const COOKIE_RETAIL = "vlt_retail_ok";
export const COOKIE_RETAIL_MAX_AGE = 30 * 60;
