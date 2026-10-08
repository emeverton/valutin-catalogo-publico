export type LeadType = "VAREJO" | "ATACADO" | "NAO_CLASSIFICADO";

const STRONG = [
  "atacado","atacadista","atacadao","revenda","revender","revendedor","revendedores",
  "fornecedor","fornecedores","representante comercial","distribuidor","distribuidores",
  "preco de atacado","tabela de atacado","tabela para revenda","preco para revenda",
  "comprar para revender","comprar em quantidade para revender","sou lojista",
  "tenho loja para revenda","fornecedor para loja","fornecedor para lojista",
  "grade fechada","grade atacado","kit revenda","wholesale",
];
const WEAK = ["cnpj","pedido minimo","quantidade","lote","representante"];

export function normalizeIntent(value: string): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function classifyWholesale(raw: string): { wholesale: boolean; strong_hits: string[]; weak_hits: string[] } {
  const text = normalizeIntent(raw);
  const strong_hits = STRONG.filter((t) => text.includes(t));
  const weak_hits = WEAK.filter((t) => text.includes(t));
  return { wholesale: strong_hits.length >= 1 || weak_hits.length >= 2, strong_hits, weak_hits };
}

export function resolveLeadType(opts: { text?: string; retailConfirmed?: boolean; trustedRetailSource?: boolean }): { lead_type: LeadType; wholesale: boolean; strong_hits: string[]; weak_hits: string[] } {
  const classified = classifyWholesale(opts.text || "");
  if (classified.wholesale) return { lead_type: "ATACADO", ...classified };
  if (opts.retailConfirmed || opts.trustedRetailSource) return { lead_type: "VAREJO", ...classified };
  return { lead_type: "NAO_CLASSIFICADO", ...classified };
}

export function classifyLeadIntent(raw: string): { lead_type: LeadType; strong_hits: string[]; weak_hits: string[] } {
  const r = resolveLeadType({ text: raw, retailConfirmed: false });
  return { lead_type: r.lead_type, strong_hits: r.strong_hits, weak_hits: r.weak_hits };
}

export function isBlockedWholesale(raw: string): string[] {
  const text = normalizeIntent(raw);
  return STRONG.filter((term) => text.includes(term));
}
