import { ATTR_KEYS } from "./config";

/** First-touch merge: never overwrite a filled key with a later value. */
export function mergeAttrFirstTouch(
  existing: Record<string, string>,
  incoming: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = { ...existing };
  for (const [k, v] of Object.entries(incoming)) {
    const next = String(v || "").trim().slice(0, 200);
    if (!next) continue;
    const cur = String(out[k] || "").trim();
    if (!cur) out[k] = next;
  }
  return out;
}

/** Copy attribution keys from current URL into a URLSearchParams (no duplicates). */
export function appendAttrFromSearch(
  dest: URLSearchParams,
  search: string | URLSearchParams
): URLSearchParams {
  const src =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;
  for (const key of ATTR_KEYS) {
    const v = src.get(key);
    if (v && !dest.has(key)) dest.set(key, v.slice(0, 200));
  }
  // also preserve common click ids if ATTR_KEYS grows out of sync
  for (const key of ["gclid", "gbraid", "wbraid", "fbclid"]) {
    const v = src.get(key);
    if (v && !dest.has(key)) dest.set(key, v.slice(0, 200));
  }
  return dest;
}

export function buildAtendimentoHref(opts: {
  search?: string;
  extra?: Record<string, string | undefined>;
}): string {
  const params = new URLSearchParams();
  if (opts.extra) {
    for (const [k, v] of Object.entries(opts.extra)) {
      if (v) params.set(k, String(v).slice(0, 500));
    }
  }
  if (opts.search) appendAttrFromSearch(params, opts.search);
  else if (typeof window !== "undefined") appendAttrFromSearch(params, window.location.search);
  const q = params.toString();
  return q ? `/atendimento?${q}` : "/atendimento";
}
