export const EDITOR_COOKIE = "vl_editor";
const MAX_AGE = 60 * 60 * 8;

function config() {
  const password = process.env.VALUTIN_EDITOR_PASSWORD;
  const secret = process.env.VALUTIN_EDITOR_SECRET;
  if (!password || !secret || password.length < 12 || secret.length < 32 || password === process.env.DASHBOARD_PASSWORD) {
    throw new Error("Editor não configurado com credenciais independentes");
  }
  return { password, secret };
}

function equal(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function signature(payload: string) {
  const { secret, password } = config();
  // Vincular a assinatura à senha invalida sessões emitidas antes de uma troca.
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(`${secret}:${password}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function checkEditorPassword(value: string) {
  try { return equal(value, config().password); } catch { return false; }
}

export async function signEditorSession() {
  const payload = `editor.${Date.now()}`;
  return `${payload}.${await signature(payload)}`;
}

export async function verifyEditorSession(token?: string | null) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "editor") return false;
  const issuedAt = Number(parts[1]);
  if (!Number.isFinite(issuedAt) || issuedAt > Date.now() + 60_000 || Date.now() - issuedAt > MAX_AGE * 1000) return false;
  try { return equal(parts[2], await signature(`${parts[0]}.${parts[1]}`)); } catch { return false; }
}

export function editorCookie(token: string) {
  return { name: EDITOR_COOKIE, value: token, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/", maxAge: MAX_AGE };
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    const host = request.headers.get("host") || new URL(request.url).host;
    return parsed.host === host && parsed.protocol === new URL(request.url).protocol;
  } catch {
    return false;
  }
}
