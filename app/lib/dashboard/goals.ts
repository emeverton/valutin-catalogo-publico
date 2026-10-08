/** Metas H2 2026 — Plano Operacional Valutin */
export const H2_GOALS = {
  leads: 970,
  sales: 117,
  followersGrowth: 2100,
  followersBaseline: Number(process.env.IG_FOLLOWERS_BASELINE || 0),
  cplTargetMin: 30,
  cplTargetMax: 34,
  funnelSplit: { topo: 0.4, meio: 0.35, fundo: 0.25 } as const,
  h2Start: "2026-07-01",
  h2End: "2026-12-31",
} as const;

export const ACCOUNT_IDS = {
  metaAdAccount: "act_480285489617714",
  googleCustomerId: "9454214254",
  ga4PropertyId: "485520019",
  kommoPipelineId: 11006007,
  facebookPageId: "171008119741935",
  youtubeChannelId: "UCUtxoKun0V-OKnhgacXnsLg",
  /** Google Meu Negócio — painel público Maps */
  gmbMapsCid: "1949999187998996603",
  gmbFeatureId: "0x94ce59fc5607480d:0x1b0fc9ee10faf87b",
  gmbMapsUrl:
    "https://www.google.com/maps?cid=1949999187998996603",
  gmbTitle: "Valutin",
  gmbAddress: "R. João Lourenço, 323 - Vila Nova Conceição, São Paulo - SP, 04508-030",
  gmbPhone: "(11) 99753-4668",
  gmbPublicRating: 4.7,
  gmbPublicReviewCount: 45,
} as const;

export function classifyMetaCampaign(name: string): "topo" | "meio" | "fundo" | null {
  if (/Alcance|Brand_Topo|Engajamento_Topo|Awareness/i.test(name)) return "topo";
  if (/Trafego|Traffic|VisitaLoja|LP_/i.test(name)) return "meio";
  if (/WA_|WhatsApp|Conversas/i.test(name)) return "fundo";
  return null;
}
