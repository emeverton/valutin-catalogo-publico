export const DASH_COOKIE = "vl_dash";
const MAX_AGE_SEC = 60 * 60 * 24 * 14;

function secret(): string {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) throw new Error("Dashboard authentication is not configured");
  return `${process.env.DASHBOARD_SECRET || password}:${password}`;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toHex(sig);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function signSession(issuedAt = Date.now()): Promise<string> {
  const payload = `ok.${issuedAt}`;
  const sig = await hmacHex(payload);
  return `${payload}.${sig}`;
}

export async function verifySession(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [ok, ts, sig] = parts;
  if (ok !== "ok") return false;
  const issuedAt = Number(ts);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > MAX_AGE_SEC * 1000) return false;

  try {
    const expected = await hmacHex(`${ok}.${ts}`);
    return timingSafeEqualStr(sig, expected);
  } catch {
    return false;
  }
}

export function checkPassword(input: string): boolean {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return false;
  return timingSafeEqualStr(input, expected);
}

export function cookieOptions(token: string) {
  return {
    name: DASH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}
