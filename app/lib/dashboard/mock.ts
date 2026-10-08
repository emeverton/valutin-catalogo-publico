import { H2_GOALS } from "./goals";
import { emptyMetrics } from "./metrics-catalog";
import type { DashboardSummary, DateRange, MediaEntity } from "./types";

function demoEntity(
  id: string,
  name: string,
  level: MediaEntity["level"],
  spend: number,
  channel: "meta" | "google" = "meta",
  parent?: Partial<MediaEntity>
): MediaEntity {
  const m = emptyMetrics(level === "campaign" ? "alcance" : "resultados");
  m.spend = spend;
  m.impressions = Math.round(spend * 80);
  m.reach = Math.round(spend * 40);
  m.clicks = Math.round(spend * 2);
  m.ctr = m.impressions ? m.clicks / m.impressions : null;
  m.cpc = m.clicks ? spend / m.clicks : null;
  m.cpm = m.impressions ? (spend / m.impressions) * 1000 : null;
  m.conversions = Math.round(spend / 50);
  m.results = m.conversions;
  return {
    id,
    name,
    status: "ACTIVE",
    channel,
    level,
    metrics: m,
    ...parent,
  };
}

export function buildMockSummary(period: DateRange): DashboardSummary {
  const spendMeta = 2200;
  const spendGoogle = 800;
  const leads = 62;
  const sales = 7;
  const revenue = 18500;

  const metaEntities: MediaEntity[] = [
    demoEntity("c1", "[VALUTIN]_Alcance_Brand_Topo", "campaign", 900),
    demoEntity("as1", "as_01_vnc_8km", "adset", 300, "meta", {
      parentId: "c1",
      campaignId: "c1",
      campaignName: "[VALUTIN]_Alcance_Brand_Topo",
    }),
    demoEntity("ad1", "brand_01", "ad", 100, "meta", {
      parentId: "as1",
      campaignId: "c1",
      adsetId: "as1",
    }),
    demoEntity("c2", "[VALUTIN]_Trafego_LP_VisitaLoja", "campaign", 775),
    demoEntity("c3", "[VALUTIN]_WA_Conversas_VNC", "campaign", 525),
  ];

  return {
    generatedAt: new Date().toISOString(),
    period,
    goals: {
      leads: { label: "Leads H2", current: leads, target: H2_GOALS.leads, unit: "count" },
      sales: { label: "Vendas H2", current: sales, target: H2_GOALS.sales, unit: "count" },
      followers: {
        label: "Seguidores (+H2)",
        current: 180,
        target: H2_GOALS.followersGrowth,
        unit: "count",
      },
    },
    efficiency: {
      spendTotal: spendMeta + spendGoogle,
      spendMeta,
      spendGoogle,
      leads,
      sales,
      revenue,
      cpl: (spendMeta + spendGoogle) / leads,
      cpa: (spendMeta + spendGoogle) / sales,
      roas: revenue / (spendMeta + spendGoogle),
    },
    meta: {
      spend: spendMeta,
      impressions: 185000,
      reach: 42000,
      clicks: 4100,
      campaigns: metaEntities
        .filter((e) => e.level === "campaign")
        .map((e) => ({
          id: e.id,
          name: e.name,
          channel: "meta" as const,
          status: e.status,
          spend: e.metrics.spend,
          results: e.metrics.results,
          resultsLabel: e.metrics.resultsLabel,
        })),
      entities: metaEntities,
      funnel: [
        { key: "topo", label: "Topo · Awareness", targetShare: 0.4, spend: 900, share: 0.409, results: 28000, resultsLabel: "alcance" },
        { key: "meio", label: "Meio · Tráfego", targetShare: 0.35, spend: 775, share: 0.352, results: 2100, resultsLabel: "cliques" },
        { key: "fundo", label: "Fundo · WhatsApp", targetShare: 0.25, spend: 525, share: 0.239, results: 48, resultsLabel: "conversas" },
      ],
      status: "ok",
    },
    google: {
      spend: spendGoogle,
      clicks: 940,
      impressions: 22000,
      conversions: 22,
      campaigns: [
        { id: "g1", name: "[VALUTIN]_Search_Marca_Intencao", channel: "google", status: "ENABLED", spend: 560, results: 16, resultsLabel: "conversões" },
        { id: "g2", name: "[VALUTIN]_PMax", channel: "google", status: "ENABLED", spend: 240, results: 6, resultsLabel: "conversões" },
      ],
      entities: [
        demoEntity("g1", "[VALUTIN]_Search_Marca_Intencao", "campaign", 560, "google"),
        demoEntity("gag1", "Ad group marca", "adset", 280, "google", { parentId: "g1", campaignId: "g1" }),
        demoEntity("gad1", "RSA marca", "ad", 140, "google", { parentId: "gag1", campaignId: "g1", adsetId: "gag1" }),
      ],
      status: "ok",
    },
    ga4: {
      sessions: 4100,
      whatsapp: 55,
      generateLead: 38,
      purchase: 7,
      proposal: 12,
      engagedSessions: 2800,
      bounceRate: 0.42,
      avgSessionDuration: 95,
      topSources: [
        { source: "meta", medium: "paid", sessions: 1200, users: 980 },
        { source: "google", medium: "cpc", sessions: 680, users: 520 },
      ],
      topPages: [
        { page: "/", views: 3200, sessions: 2100 },
        { page: "/dashboard", views: 40, sessions: 20 },
      ],
      events: [
        { name: "page_view", count: 9000 },
        { name: "whatsapp", count: 55 },
        { name: "generate_lead", count: 38 },
      ],
      status: "ok",
    },
    kommo: {
      newLeads: leads,
      pipeline: [
        { stage: "Incoming", statusId: 1, count: 12 },
        { stage: "Qualificação", statusId: 2, count: 18 },
        { stage: "Em Atendimento", statusId: 3, count: 285 },
        { stage: "Negociando", statusId: 4, count: 24 },
        { stage: "Venda ganha", statusId: 5, count: sales },
      ],
      sales,
      revenue,
      lost: 9,
      avgTicket: revenue / sales,
      leads: [
        { id: 1, name: "Lead demo", status: "Em Atendimento", price: 0, createdAt: new Date().toISOString() },
      ],
      status: "ok",
    },
    instagram: {
      followers: 8420,
      followersDeltaH2: 180,
      reach: 31000,
      engagement: 2400,
      mediaCount: 120,
      username: "valutinoficial",
      recentMedia: [],
      status: "ok",
    },
    youtube: {
      channelId: "UCUtxoKun0V-OKnhgacXnsLg",
      title: "Valutin",
      subscribers: 2,
      viewsLifetime: 120970,
      videoCount: 15,
      periodVideoCount: 0,
      periodViewsApprox: 0,
      recentVideos: [
        {
          id: "demo1",
          title: "O Cuidado em Cada Detalhe",
          publishedAt: "2026-05-18T00:00:00Z",
          views: 4200,
          likes: 38,
          comments: 4,
          url: "https://www.youtube.com/@Valutin",
        },
      ],
      status: "ok",
    },
    gmb: {
      locationName: "locations/demo",
      title: "Valutin · Vila Nova Conceição",
      address: "Rua João Lourenço, 323",
      rating: 4.8,
      reviewCount: 42,
      reviews: [
        {
          id: "r1",
          author: "Cliente",
          stars: 5,
          comment: "Atendimento impecável e peças lindas.",
          createdAt: "2026-07-10T12:00:00Z",
        },
      ],
      metrics: {
        businessImpressionsDesktopMaps: 120,
        businessImpressionsMobileMaps: 890,
        businessImpressionsDesktopSearch: 210,
        businessImpressionsMobileSearch: 640,
        callClicks: 28,
        websiteClicks: 55,
        businessDirectionRequests: 41,
      },
      impressions: 1860,
      mapsUrl: "https://www.google.com/maps?cid=1949999187998996603",
      phone: "(11) 99753-4668",
      status: "ok",
    },
    notes: ["Modo demonstração (mock) — configure secrets para dados live."],
  };
}
