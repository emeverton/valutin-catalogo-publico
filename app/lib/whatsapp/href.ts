import { DEFAULT_WA_TEXT } from "./config";
// Public navigation must not import server signing/crypto code.
const GATE_PATH = "/atendimento";

export function buildWhatsAppHref(opts?: {
  src?: string;
  text?: string;
  extra?: Record<string, string | undefined>;
}): string {
  const params = new URLSearchParams();
  if (opts?.src) params.set("src", opts.src);
  if (opts?.text) params.set("text", opts.text.slice(0, 500));
  if (typeof window !== "undefined") {
    const current = new URLSearchParams(window.location.search);
    for (const [k, v] of Array.from(current.entries())) {
      if (!params.has(k) && v) params.set(k, v);
    }
  }
  if (opts?.extra) {
    for (const [k, v] of Object.entries(opts.extra)) {
      if (v) params.set(k, v);
    }
  }
  const q = params.toString();
  return q ? `${GATE_PATH}?${q}` : GATE_PATH;
}

export { DEFAULT_WA_TEXT, GATE_PATH as ROUTER_PATH };
