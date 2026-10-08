import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const COOKIE_RETAIL = "vlt_retail_ok";
export const GATE_TTL_SEC = 30 * 60;
export const GATE_PATH = "/atendimento";
export const ROUTER_PATH = "/wa";

export function retailSecret(): string {
  return String(process.env.VALUTIN_RETAIL_GATE_SECRET || process.env.WA_ROUTE_SECRET || "").trim();
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createRetailToken(now = Math.floor(Date.now() / 1000), ttl = GATE_TTL_SEC): string | null {
  const secret = retailSecret();
  if (!secret) return null;
  const exp = now + ttl;
  const nonce = randomBytes(8).toString("hex");
  const payload = `v2.${exp}.${nonce}`;
  return `${payload}.${signPayload(payload, secret)}`;
}

export function verifyRetailToken(token: string | undefined, now = Math.floor(Date.now() / 1000)): { ok: boolean; reason: string } {
  const secret = retailSecret();
  const raw = String(token || "").trim();
  if (!secret || !raw) return { ok: false, reason: "missing_token_or_secret" };
  const parts = raw.split(".");
  if (parts.length !== 4 || parts[0] !== "v2") return { ok: false, reason: "malformed" };
  const payload = `${parts[0]}.${parts[1]}.${parts[2]}`;
  const expected = signPayload(payload, secret);
  const a = Buffer.from(parts[3]);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "bad_signature" };
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < now) return { ok: false, reason: "expired" };
  return { ok: true, reason: "ok" };
}

export function retailCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: GATE_TTL_SEC,
    path: "/",
  };
}

export function preserveSearch(search: string): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  params.delete("retail");
  params.delete("retail_confirmed");
  params.delete("blocked");
  const q = params.toString();
  return q ? `?${q}` : "";
}
