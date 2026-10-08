import type { MetricDefinition } from "./types";

export const METRIC_CATALOG: MetricDefinition[] = [
  // Delivery
  { id: "spend", label: "Investimento", format: "currency", group: "cost", platforms: ["meta", "google", "geral"], path: "spend", defaultVisible: true },
  { id: "impressions", label: "Impressões", format: "number", group: "delivery", platforms: ["meta", "google"], path: "impressions", defaultVisible: true },
  { id: "reach", label: "Alcance", format: "number", group: "delivery", platforms: ["meta", "instagram"], path: "reach", defaultVisible: true },
  { id: "frequency", label: "Frequência", format: "number", group: "delivery", platforms: ["meta"], path: "frequency", defaultVisible: true },
  { id: "clicks", label: "Cliques", format: "number", group: "delivery", platforms: ["meta", "google"], path: "clicks", defaultVisible: true },
  { id: "ctr", label: "CTR", format: "percent", group: "delivery", platforms: ["meta", "google"], path: "ctr", defaultVisible: true },
  // Cost
  { id: "cpc", label: "CPC", format: "currency", group: "cost", platforms: ["meta", "google"], path: "cpc", defaultVisible: true },
  { id: "cpm", label: "CPM", format: "currency", group: "cost", platforms: ["meta", "google"], path: "cpm", defaultVisible: true },
  { id: "costPerConversion", label: "Custo/conv.", format: "currency", group: "cost", platforms: ["meta", "google"], path: "costPerConversion", defaultVisible: true },
  { id: "cpl", label: "CPL", format: "currency", group: "cost", platforms: ["geral"], path: "cpl", defaultVisible: true },
  { id: "cpa", label: "CPA venda", format: "currency", group: "cost", platforms: ["geral"], path: "cpa", defaultVisible: true },
  { id: "roas", label: "ROAS", format: "roas", group: "results", platforms: ["geral"], path: "roas", defaultVisible: true },
  // Results
  { id: "conversions", label: "Conversões", format: "number", group: "results", platforms: ["meta", "google"], path: "conversions", defaultVisible: true },
  { id: "results", label: "Resultados", format: "number", group: "results", platforms: ["meta", "google"], path: "results", defaultVisible: true },
  { id: "messaging", label: "Conversas WA", format: "number", group: "results", platforms: ["meta"], path: "extras.messaging", defaultVisible: true },
  { id: "linkClicks", label: "Cliques no link", format: "number", group: "engagement", platforms: ["meta"], path: "extras.link_clicks", defaultVisible: true },
  { id: "landingPageViews", label: "Views LP", format: "number", group: "engagement", platforms: ["meta"], path: "extras.landing_page_views", defaultVisible: false },
  { id: "videoViews", label: "Video views", format: "number", group: "engagement", platforms: ["meta"], path: "extras.video_views", defaultVisible: false },
  // Web
  { id: "sessions", label: "Sessões", format: "number", group: "web", platforms: ["ga4"], path: "sessions", defaultVisible: true },
  { id: "whatsapp", label: "Evento WhatsApp", format: "number", group: "web", platforms: ["ga4"], path: "whatsapp", defaultVisible: true },
  { id: "generateLead", label: "generate_lead", format: "number", group: "web", platforms: ["ga4"], path: "generateLead", defaultVisible: true },
  { id: "purchase", label: "purchase", format: "number", group: "web", platforms: ["ga4"], path: "purchase", defaultVisible: true },
  { id: "engagedSessions", label: "Sessões engajadas", format: "number", group: "web", platforms: ["ga4"], path: "engagedSessions", defaultVisible: true },
  { id: "bounceRate", label: "Bounce rate", format: "percent", group: "web", platforms: ["ga4"], path: "bounceRate", defaultVisible: false },
  // CRM
  { id: "newLeads", label: "Novos leads", format: "number", group: "crm", platforms: ["kommo"], path: "newLeads", defaultVisible: true },
  { id: "sales", label: "Vendas", format: "number", group: "crm", platforms: ["kommo", "geral"], path: "sales", defaultVisible: true },
  { id: "revenue", label: "Receita", format: "currency", group: "crm", platforms: ["kommo", "geral"], path: "revenue", defaultVisible: true },
  { id: "lost", label: "Perdidas", format: "number", group: "crm", platforms: ["kommo"], path: "lost", defaultVisible: true },
  { id: "avgTicket", label: "Ticket médio", format: "currency", group: "crm", platforms: ["kommo"], path: "avgTicket", defaultVisible: true },
  // Brand
  { id: "followers", label: "Seguidores", format: "number", group: "engagement", platforms: ["instagram"], path: "followers", defaultVisible: true },
  { id: "engagement", label: "Interações", format: "number", group: "engagement", platforms: ["instagram"], path: "engagement", defaultVisible: true },
  { id: "ytViews", label: "YT views lifetime", format: "number", group: "engagement", platforms: ["youtube"], path: "viewsLifetime", defaultVisible: true },
  { id: "ytSubs", label: "YT inscritos", format: "number", group: "engagement", platforms: ["youtube"], path: "subscribers", defaultVisible: true },
  { id: "ytVideos", label: "YT vídeos", format: "number", group: "engagement", platforms: ["youtube"], path: "videoCount", defaultVisible: true },
  { id: "gmbRating", label: "GMB rating", format: "number", group: "engagement", platforms: ["gmb"], path: "rating", defaultVisible: true },
  { id: "gmbReviews", label: "GMB reviews", format: "number", group: "engagement", platforms: ["gmb"], path: "reviewCount", defaultVisible: true },
  { id: "gmbImpressions", label: "GMB impressões", format: "number", group: "engagement", platforms: ["gmb"], path: "impressions", defaultVisible: true },
];

export const METRICS_STORAGE_KEY = "vl_dash_metrics_v1";

export function defaultVisibleIds(): string[] {
  return METRIC_CATALOG.filter((m) => m.defaultVisible).map((m) => m.id);
}

export function loadVisibleMetrics(): string[] {
  if (typeof window === "undefined") return defaultVisibleIds();
  try {
    const raw = localStorage.getItem(METRICS_STORAGE_KEY);
    if (!raw) return defaultVisibleIds();
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed) || !parsed.length) return defaultVisibleIds();
    return parsed;
  } catch {
    return defaultVisibleIds();
  }
}

export function saveVisibleMetrics(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(ids));
}

export function emptyMetrics(resultsLabel = "resultados"): import("./types").MediaMetrics {
  return {
    spend: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    ctr: null,
    cpc: null,
    cpm: null,
    frequency: null,
    conversions: 0,
    costPerConversion: null,
    results: 0,
    resultsLabel,
    extras: {},
  };
}
