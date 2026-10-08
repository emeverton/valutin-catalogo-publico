import { H2_GOALS } from "./goals";
import { buildMockSummary } from "./mock";
import { fetchGa4Snapshot } from "./providers/ga4";
import { fetchGoogleSnapshot } from "./providers/google-ads";
import { fetchGmbSnapshot } from "./providers/gmb";
import { fetchInstagramSnapshot } from "./providers/instagram";
import { fetchKommoSnapshot } from "./providers/kommo";
import { fetchMetaSnapshot } from "./providers/meta";
import { fetchYouTubeSnapshot } from "./providers/youtube";
import type { DateRange, DashboardSummary } from "./types";

export async function aggregateDashboard(period: DateRange): Promise<DashboardSummary> {
  if (process.env.DASHBOARD_USE_MOCK === "1") {
    return buildMockSummary(period);
  }

  const [meta, google, ga4, kommo, instagram, youtube, gmb] = await Promise.all([
    fetchMetaSnapshot(period),
    fetchGoogleSnapshot(period),
    fetchGa4Snapshot(period),
    fetchKommoSnapshot(period),
    fetchInstagramSnapshot(period),
    fetchYouTubeSnapshot(period),
    fetchGmbSnapshot(period),
  ]);

  const notes: string[] = [];
  const providers = [
    ["Meta", meta],
    ["Google Ads", google],
    ["GA4", ga4],
    ["Kommo", kommo],
    ["Instagram", instagram],
    ["YouTube", youtube],
    ["Google Meu Negócio", gmb],
  ] as const;

  let unavailable = 0;
  for (const [name, snap] of providers) {
    if (snap.status === "unavailable") {
      unavailable += 1;
      if (snap.error) notes.push(`${name}: ${snap.error}`);
    } else if (snap.status === "partial" && snap.error) {
      notes.push(`${name}: ${snap.error}`);
    }
  }

  // If everything unavailable, serve mock so UI still looks C-level
  if (unavailable === providers.length) {
    const mock = buildMockSummary(period);
    mock.notes = [
      "APIs indisponíveis — exibindo demonstração.",
      ...notes,
    ];
    return mock;
  }

  const spendMeta = meta.spend;
  const spendGoogle = google.spend;
  const spendTotal = spendMeta + spendGoogle;

  // Prefer Kommo for leads/sales; fallback GA4 whatsapp / generate_lead
  const leads =
    kommo.status !== "unavailable"
      ? kommo.newLeads
      : ga4.whatsapp || ga4.generateLead;
  const sales = kommo.status !== "unavailable" ? kommo.sales : 0;
  const revenue = kommo.status !== "unavailable" ? kommo.revenue : 0;

  const followersProgress =
    instagram.followersDeltaH2 > 0
      ? instagram.followersDeltaH2
      : H2_GOALS.followersBaseline > 0
        ? Math.max(0, instagram.followers - H2_GOALS.followersBaseline)
        : 0;

  // For H2 goals scorecard always use H2-oriented counters when period is not h2:
  // still show period efficiency, but goals.current should reflect H2 progress when possible.
  // Simpler v1: use period values; UI labels "no período" + target H2.

  const cpl = leads > 0 ? spendTotal / leads : null;
  const cpa = sales > 0 ? spendTotal / sales : null;
  const roas = spendTotal > 0 && revenue > 0 ? revenue / spendTotal : null;

  notes.push("Dados com cache de até 5 minutos · lag de APIs Ads/CRM possível.");

  return {
    generatedAt: new Date().toISOString(),
    period,
    goals: {
      leads: {
        label: period.key === "h2" ? "Leads H2" : "Leads (período)",
        current: leads,
        target: H2_GOALS.leads,
        unit: "count",
      },
      sales: {
        label: period.key === "h2" ? "Vendas H2" : "Vendas (período)",
        current: sales,
        target: H2_GOALS.sales,
        unit: "count",
      },
      followers: {
        label: "Seguidores (+ vs baseline H2)",
        current: followersProgress || instagram.followers,
        target: H2_GOALS.followersGrowth,
        unit: "count",
      },
    },
    efficiency: {
      spendTotal,
      spendMeta,
      spendGoogle,
      leads,
      sales,
      revenue,
      cpl,
      cpa,
      roas,
    },
    meta,
    google,
    ga4,
    kommo,
    instagram,
    youtube,
    gmb,
    notes,
  };
}
