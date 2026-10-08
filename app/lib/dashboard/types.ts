export type PeriodKey = "today" | "7d" | "30d" | "mtd" | "h2" | "custom";

export type ProviderStatus = "ok" | "unavailable" | "partial";

export type DashboardTab =
  | "geral"
  | "meta"
  | "google"
  | "ga4"
  | "kommo"
  | "instagram"
  | "youtube"
  | "gmb"
  | "insights"
  | "ops"
  | "metricas"
  | "studio";

export interface DateRange {
  since: string;
  until: string;
  label: string;
  key: PeriodKey;
}

export interface GoalProgress {
  label: string;
  current: number;
  target: number;
  unit: "count" | "currency";
}

export interface EfficiencyMetrics {
  spendTotal: number;
  spendMeta: number;
  spendGoogle: number;
  leads: number;
  sales: number;
  revenue: number;
  cpl: number | null;
  cpa: number | null;
  roas: number | null;
}

export interface FunnelLayer {
  key: "topo" | "meio" | "fundo";
  label: string;
  targetShare: number;
  spend: number;
  share: number;
  results: number;
  resultsLabel: string;
}

/** Métricas padronizadas por entidade de mídia */
export interface MediaMetrics {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  frequency: number | null;
  conversions: number;
  costPerConversion: number | null;
  results: number;
  resultsLabel: string;
  /** extras livres (ex.: messaging, link_clicks, video_views) */
  extras: Record<string, number>;
}

export interface MediaEntity {
  id: string;
  name: string;
  status: string;
  channel: "meta" | "google";
  level: "campaign" | "adset" | "ad";
  parentId?: string;
  parentName?: string;
  campaignId?: string;
  campaignName?: string;
  adsetId?: string;
  adsetName?: string;
  objective?: string;
  metrics: MediaMetrics;
}

export interface CampaignRow {
  id: string;
  name: string;
  channel: "meta" | "google";
  status: string;
  spend: number;
  results: number;
  resultsLabel: string;
}

export interface Ga4Snapshot {
  sessions: number;
  whatsapp: number;
  generateLead: number;
  purchase: number;
  proposal: number;
  engagedSessions: number;
  bounceRate: number | null;
  avgSessionDuration: number | null;
  topSources: Array<{ source: string; medium: string; sessions: number; users?: number }>;
  topPages: Array<{ page: string; views: number; sessions: number }>;
  events: Array<{ name: string; count: number }>;
  status: ProviderStatus;
  error?: string;
}

export interface KommoSnapshot {
  newLeads: number;
  pipeline: Array<{ stage: string; statusId: number; count: number }>;
  sales: number;
  revenue: number;
  lost: number;
  avgTicket: number | null;
  leads: Array<{
    id: number;
    name: string;
    status: string;
    price: number;
    createdAt: string;
    source?: string;
  }>;
  status: ProviderStatus;
  error?: string;
}

export interface InstagramSnapshot {
  followers: number;
  followersDeltaH2: number;
  reach: number;
  engagement: number;
  mediaCount: number;
  username?: string;
  recentMedia: Array<{
    id: string;
    caption: string;
    timestamp: string;
    likeCount: number;
    commentsCount: number;
    permalink?: string;
  }>;
  source?: "meta" | "reportei";
  status: ProviderStatus;
  error?: string;
}


export interface YouTubeSnapshot {
  channelId: string;
  title: string;
  customUrl?: string;
  subscribers: number;
  viewsLifetime: number;
  videoCount: number;
  recentVideos: Array<{
    id: string;
    title: string;
    publishedAt: string;
    views: number;
    likes: number;
    comments: number;
    url: string;
  }>;
  /** Vídeos publicados no período (Data API) */
  periodVideoCount?: number;
  /** Soma aproximada de views lifetime dos vídeos recentes filtrados pelo período */
  periodViewsApprox?: number;
  status: ProviderStatus;
  error?: string;
}

export interface GmbSnapshot {
  locationName: string;
  title: string;
  address: string;
  rating: number | null;
  reviewCount: number;
  reviews: Array<{
    id: string;
    author: string;
    stars: number;
    comment: string;
    createdAt: string;
  }>;
  metrics: {
    businessImpressionsDesktopMaps: number;
    businessImpressionsMobileMaps: number;
    businessImpressionsDesktopSearch: number;
    businessImpressionsMobileSearch: number;
    callClicks: number;
    websiteClicks: number;
    businessDirectionRequests: number;
  };
  impressions?: number;
  mapsUrl?: string;
  phone?: string;
  status: ProviderStatus;
  error?: string;
}

export interface MetaSnapshot {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  campaigns: CampaignRow[];
  entities: MediaEntity[];
  funnel: FunnelLayer[];
  status: ProviderStatus;
  error?: string;
}

export interface GoogleSnapshot {
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  campaigns: CampaignRow[];
  entities: MediaEntity[];
  status: ProviderStatus;
  error?: string;
}

export interface DashboardSummary {
  generatedAt: string;
  period: DateRange;
  goals: {
    leads: GoalProgress;
    sales: GoalProgress;
    followers: GoalProgress;
  };
  efficiency: EfficiencyMetrics;
  meta: MetaSnapshot;
  google: GoogleSnapshot;
  ga4: Ga4Snapshot;
  kommo: KommoSnapshot;
  instagram: InstagramSnapshot;
  youtube: YouTubeSnapshot;
  gmb: GmbSnapshot;
  notes: string[];
}

export interface DashboardCompareResponse {
  current: DashboardSummary;
  compare: DashboardSummary | null;
}

export type MetricFormat = "number" | "currency" | "percent" | "roas";

export interface MetricDefinition {
  id: string;
  label: string;
  format: MetricFormat;
  group: "delivery" | "cost" | "results" | "engagement" | "crm" | "web";
  platforms: Array<"meta" | "google" | "ga4" | "kommo" | "instagram" | "youtube" | "gmb" | "geral">;
  /** path within entity metrics or summary */
  path: string;
  defaultVisible: boolean;
}


export type StudioDocType = "dashboard" | "report";

export type StudioPlatform = "meta" | "google" | "ga4" | "kommo" | "instagram" | "youtube" | "gmb";

export type StudioTemplateId =
  | "executivo"
  | "midia_paga"
  | "funil_completo"
  | "crm_loja"
  | "marca_social"
  | "youtube_gmb";

export interface StudioDocument {
  id: string;
  type: StudioDocType;
  title: string;
  subtitle?: string;
  templateId: StudioTemplateId;
  platforms: StudioPlatform[];
  periodKey: PeriodKey;
  customSince?: string;
  customUntil?: string;
  compareMode: "off" | "previous" | "custom";
  compareSince?: string;
  compareUntil?: string;
  includeAi: boolean;
  createdAt: string;
  updatedAt: string;
  /** Relatório estático: snapshot + análise no momento da criação */
  snapshot?: {
    generatedAt: string;
    periodLabel: string;
    compareLabel?: string;
    kpis: Record<string, number | null>;
    notes: string[];
    aiAnalysis?: AiAnalysisResult;
  };
}

export interface AiAnalysisResult {
  generatedAt: string;
  opportunityScore: number;
  executiveSummary: string;
  highlights: string[];
  risks: string[];
  recommendations: Array<{ channel: string; action: string; priority: "alta" | "media" | "baixa" }>;
  channelNotes: Array<{ channel: string; verdict: string; detail: string }>;
  model: "valutin-rules" | "openai";
}
