/** Browser attribution IDs — read cookies only; never invent click IDs. */

export function readCookie(rawCookieHeader: string | undefined, name: string): string {
  if (!rawCookieHeader) return "";
  const parts = rawCookieHeader.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    if (key !== name) continue;
    try {
      return decodeURIComponent(part.slice(idx + 1).trim()).slice(0, 200);
    } catch {
      return part.slice(idx + 1).trim().slice(0, 200);
    }
  }
  return "";
}

/** GA1.1.123.456 → 123.456 */
export function parseGaClientId(gaCookie: string): string {
  const raw = String(gaCookie || "").trim();
  if (!raw) return "";
  const m = raw.match(/^GA\d+\.\d+\.(\d+\.\d+)$/);
  if (m) return m[1];
  if (/^\d+\.\d+$/.test(raw)) return raw;
  return "";
}

export function buildFbcFromFbclid(fbclid: string, nowSec = Math.floor(Date.now() / 1000)): string {
  const id = String(fbclid || "").trim().slice(0, 200);
  if (!id) return "";
  return `fb.1.${nowSec}.${id}`;
}

export type BrowserIds = { fbp: string; fbc: string; ga_client_id: string };

/**
 * Resolve Meta/GA identifiers from document cookies + optional fbclid.
 * Never overwrites a valid _fbc with a synthesized one.
 */
export function resolveBrowserIds(opts: {
  cookieHeader?: string;
  fbclid?: string;
  nowSec?: number;
}): BrowserIds {
  const fbp = readCookie(opts.cookieHeader, "_fbp");
  const existingFbc = readCookie(opts.cookieHeader, "_fbc");
  const fbc =
    existingFbc ||
    buildFbcFromFbclid(String(opts.fbclid || "").trim(), opts.nowSec);
  const ga_client_id = parseGaClientId(readCookie(opts.cookieHeader, "_ga"));
  return { fbp, fbc, ga_client_id };
}

/** Client-side helper (document.cookie). */
export function resolveBrowserIdsFromDocument(fbclid?: string): BrowserIds {
  if (typeof document === "undefined") return { fbp: "", fbc: "", ga_client_id: "" };
  return resolveBrowserIds({ cookieHeader: document.cookie, fbclid });
}
