import { ACCOUNT_IDS, H2_GOALS, classifyMetaCampaign } from "../goals";
import type {
  CampaignRow,
  DateRange,
  FunnelLayer,
  MediaEntity,
  MediaMetrics,
  MetaSnapshot,
} from "../types";

const GRAPH = () =>
  `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION || "v21.0"}`;

function token(): string | undefined {
  return process.env.META_ACCESS_TOKEN;
}

type InsightRow = {
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  frequency?: string;
  clicks?: string;
  cpc?: string;
  cpm?: string;
  ctr?: string;
  actions?: Array<{ action_type: string; value: string }>;
  cost_per_action_type?: Array<{ action_type: string; value: string }>;
  objective?: string;
};

function actionValue(row: InsightRow, patterns: RegExp[]): number {
  for (const a of row.actions || []) {
    if (patterns.some((p) => p.test(a.action_type))) return Number(a.value || 0);
  }
  return 0;
}

function toMetrics(row: InsightRow, resultsLabel: string): MediaMetrics {
  const spend = Number(row.spend || 0);
  const impressions = Number(row.impressions || 0);
  const reach = Number(row.reach || 0);
  const clicks = Number(row.clicks || 0);
  const messaging = actionValue(row, [
    /messaging_conversation_started/i,
    /onsite_conversion\.messaging/i,
  ]);
  const linkClicks = actionValue(row, [/^link_click$/i]);
  const landing = actionValue(row, [/landing_page_view/i]);
  const videoViews = actionValue(row, [/^video_view$/i]);
  const leads = actionValue(row, [/^lead$/i, /onsite_conversion\.lead/i]);
  const conversions = messaging || leads || linkClicks;
  const results =
    resultsLabel.includes("conversa")
      ? messaging
      : resultsLabel.includes("clique")
        ? linkClicks || clicks
        : reach || impressions;

  const ctr = row.ctr != null ? Number(row.ctr) / 100 : impressions > 0 ? clicks / impressions : null;
  const cpc = row.cpc != null ? Number(row.cpc) : clicks > 0 ? spend / clicks : null;
  const cpm = row.cpm != null ? Number(row.cpm) : impressions > 0 ? (spend / impressions) * 1000 : null;

  return {
    spend,
    impressions,
    reach,
    clicks,
    ctr,
    cpc,
    cpm,
    frequency: row.frequency != null ? Number(row.frequency) : reach > 0 ? impressions / reach : null,
    conversions,
    costPerConversion: conversions > 0 ? spend / conversions : null,
    results,
    resultsLabel,
    extras: {
      messaging,
      link_clicks: linkClicks,
      landing_page_views: landing,
      video_views: videoViews,
      leads,
    },
  };
}

function resultsLabelFor(name: string): string {
  const layer = classifyMetaCampaign(name);
  if (layer === "fundo") return "conversas WA";
  if (layer === "meio") return "cliques";
  return "alcance";
}

async function fetchInsightsLevel(
  accountId: string,
  accessToken: string,
  range: DateRange,
  level: "campaign" | "adset" | "ad"
): Promise<InsightRow[]> {
  const fields =
    level === "campaign"
      ? "campaign_id,campaign_name,spend,impressions,reach,frequency,clicks,cpc,cpm,ctr,actions,cost_per_action_type,objective"
      : level === "adset"
        ? "campaign_id,campaign_name,adset_id,adset_name,spend,impressions,reach,frequency,clicks,cpc,cpm,ctr,actions,objective"
        : "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,reach,frequency,clicks,cpc,cpm,ctr,actions,objective";

  const out: InsightRow[] = [];
  let url: string | null = (() => {
    const u = new URL(`${GRAPH()}/${accountId}/insights`);
    u.searchParams.set("fields", fields);
    u.searchParams.set("level", level);
    u.searchParams.set("time_range", JSON.stringify({ since: range.since, until: range.until }));
    u.searchParams.set("limit", "500");
    u.searchParams.set("access_token", accessToken);
    return u.toString();
  })();

  let pages = 0;
  while (url && pages < 10) {
    pages += 1;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Meta insights ${level} ${res.status}: ${body.slice(0, 160)}`);
    }
    const json = (await res.json()) as { data?: InsightRow[]; paging?: { next?: string } };
    out.push(...(json.data || []));
    url = json.paging?.next || null;
  }
  return out;
}

async function fetchStatuses(
  accountId: string,
  accessToken: string,
  edge: "campaigns" | "adsets" | "ads"
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let url: string | null = `${GRAPH()}/${accountId}/${edge}?fields=id,status,effective_status&limit=200&access_token=${encodeURIComponent(accessToken)}`;
  let pages = 0;
  while (url && pages < 8) {
    pages += 1;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) break;
    const json = (await res.json()) as {
      data?: Array<{ id: string; status?: string; effective_status?: string }>;
      paging?: { next?: string };
    };
    for (const row of json.data || []) {
      map.set(row.id, row.effective_status || row.status || "UNKNOWN");
    }
    url = json.paging?.next || null;
  }
  return map;
}

export async function fetchMetaSnapshot(range: DateRange): Promise<MetaSnapshot> {
  const accessToken = token();
  if (!accessToken) return emptyMeta("META_ACCESS_TOKEN ausente");

  const accountId = process.env.META_AD_ACCOUNT_ID || ACCOUNT_IDS.metaAdAccount;

  try {
    const [campaignRows, adsetRows, adRows, campStatus, adsetStatus, adStatus] =
      await Promise.all([
        fetchInsightsLevel(accountId, accessToken, range, "campaign"),
        fetchInsightsLevel(accountId, accessToken, range, "adset"),
        fetchInsightsLevel(accountId, accessToken, range, "ad"),
        fetchStatuses(accountId, accessToken, "campaigns"),
        fetchStatuses(accountId, accessToken, "adsets"),
        fetchStatuses(accountId, accessToken, "ads"),
      ]);

    const entities: MediaEntity[] = [];
    let spend = 0;
    let impressions = 0;
    let reach = 0;
    let clicks = 0;
    const campaigns: CampaignRow[] = [];
    const funnelSpend: Record<"topo" | "meio" | "fundo", number> = { topo: 0, meio: 0, fundo: 0 };
    const funnelResults: Record<"topo" | "meio" | "fundo", number> = { topo: 0, meio: 0, fundo: 0 };

    for (const row of campaignRows) {
      const id = String(row.campaign_id || "");
      const name = row.campaign_name || id;
      const label = resultsLabelFor(name);
      const metrics = toMetrics(row, label);
      spend += metrics.spend;
      impressions += metrics.impressions;
      reach += metrics.reach;
      clicks += metrics.clicks;

      const layer = classifyMetaCampaign(name);
      if (layer) {
        funnelSpend[layer] += metrics.spend;
        funnelResults[layer] += metrics.results;
      }

      campaigns.push({
        id,
        name,
        channel: "meta",
        status: campStatus.get(id) || "UNKNOWN",
        spend: metrics.spend,
        results: metrics.results,
        resultsLabel: label,
      });

      entities.push({
        id,
        name,
        status: campStatus.get(id) || "UNKNOWN",
        channel: "meta",
        level: "campaign",
        objective: row.objective,
        campaignId: id,
        campaignName: name,
        metrics,
      });
    }

    for (const row of adsetRows) {
      const id = String(row.adset_id || "");
      const name = row.adset_name || id;
      const campName = row.campaign_name || "";
      const label = resultsLabelFor(campName || name);
      const metrics = toMetrics(row, label);
      entities.push({
        id,
        name,
        status: adsetStatus.get(id) || "UNKNOWN",
        channel: "meta",
        level: "adset",
        parentId: row.campaign_id,
        parentName: campName,
        campaignId: row.campaign_id,
        campaignName: campName,
        adsetId: id,
        adsetName: name,
        metrics,
      });
    }

    for (const row of adRows) {
      const id = String(row.ad_id || "");
      const name = row.ad_name || id;
      const campName = row.campaign_name || "";
      const label = resultsLabelFor(campName || name);
      const metrics = toMetrics(row, label);
      entities.push({
        id,
        name,
        status: adStatus.get(id) || "UNKNOWN",
        channel: "meta",
        level: "ad",
        parentId: row.adset_id,
        parentName: row.adset_name,
        campaignId: row.campaign_id,
        campaignName: campName,
        adsetId: row.adset_id,
        adsetName: row.adset_name,
        metrics,
      });
    }

    const funnel: FunnelLayer[] = (
      [
        ["topo", "Topo · Awareness", H2_GOALS.funnelSplit.topo, "alcance"],
        ["meio", "Meio · Tráfego", H2_GOALS.funnelSplit.meio, "cliques"],
        ["fundo", "Fundo · WhatsApp", H2_GOALS.funnelSplit.fundo, "conversas"],
      ] as const
    ).map(([key, label, targetShare, resultsLabel]) => ({
      key,
      label,
      targetShare,
      spend: funnelSpend[key],
      share: spend > 0 ? funnelSpend[key] / spend : 0,
      results: funnelResults[key],
      resultsLabel,
    }));

    return {
      spend,
      impressions,
      reach,
      clicks,
      campaigns: campaigns.sort((a, b) => b.spend - a.spend),
      entities,
      funnel,
      status: "ok",
    };
  } catch (err) {
    return emptyMeta(err instanceof Error ? err.message : "Meta fetch failed");
  }
}

function emptyMeta(error: string): MetaSnapshot {
  return {
    spend: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    campaigns: [],
    entities: [],
    funnel: [
      { key: "topo", label: "Topo · Awareness", targetShare: 0.4, spend: 0, share: 0, results: 0, resultsLabel: "alcance" },
      { key: "meio", label: "Meio · Tráfego", targetShare: 0.35, spend: 0, share: 0, results: 0, resultsLabel: "cliques" },
      { key: "fundo", label: "Fundo · WhatsApp", targetShare: 0.25, spend: 0, share: 0, results: 0, resultsLabel: "conversas" },
    ],
    status: "unavailable",
    error,
  };
}
