import { ACCOUNT_IDS } from "../goals";
import type { CampaignRow, DateRange, GoogleSnapshot, MediaEntity, MediaMetrics } from "../types";

const configuredApiVersion = process.env.GOOGLE_ADS_API_VERSION || "";
// v21 reaches sunset in August 2026. Keep an explicit allow-list so a stale
// Vercel variable cannot silently take the whole Google Ads panel offline.
const API_VERSION = /^v(?:22|23|24|25)$/.test(configuredApiVersion)
  ? configuredApiVersion
  : "v25";

async function getAccessToken(): Promise<string | null> {
  if (process.env.GOOGLE_ADS_ACCESS_TOKEN) return process.env.GOOGLE_ADS_ACCESS_TOKEN;
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token || null;
}

type Agg = {
  name: string;
  status: string;
  channelType?: string;
  parentId?: string;
  parentName?: string;
  campaignId?: string;
  campaignName?: string;
  adsetId?: string;
  adsetName?: string;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
};

function toMetrics(a: Agg): MediaMetrics {
  const { spend, clicks, impressions, conversions } = a;
  return {
    spend,
    impressions,
    reach: 0,
    clicks,
    ctr: impressions > 0 ? clicks / impressions : null,
    cpc: clicks > 0 ? spend / clicks : null,
    cpm: impressions > 0 ? (spend / impressions) * 1000 : null,
    frequency: null,
    conversions,
    costPerConversion: conversions > 0 ? spend / conversions : null,
    results: conversions,
    resultsLabel: "conversões",
    extras: {},
  };
}

async function searchStream(
  customerId: string,
  headers: Record<string, string>,
  query: string
): Promise<unknown[]> {
  const res = await fetch(
    `https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}/googleAds:searchStream`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
      next: { revalidate: 300 },
    }
  );
  if (!res.ok) {
    const t = await res.text();
    let message = `HTTP ${res.status}`;
    let code = "";
    try {
      const json = JSON.parse(t) as {
        error?: {
          message?: string;
          details?: Array<{
            errors?: Array<{
              message?: string;
              errorCode?: Record<string, string>;
            }>;
          }>;
        };
      };
      const first = json.error?.details?.[0]?.errors?.[0];
      message = first?.message || json.error?.message || message;
      code = first?.errorCode ? Object.values(first.errorCode)[0] || "" : "";
    } catch {
      // The provider error stays intentionally concise in the dashboard.
    }
    console.error(
      JSON.stringify({
        event: "dashboard_provider_error",
        provider: "google_ads",
        httpStatus: res.status,
        code: code || undefined,
        requestId: res.headers.get("request-id") || undefined,
      })
    );
    throw new Error(
      `Consulta indisponível${code ? ` (${code})` : ""}: ${message.slice(0, 140)}`
    );
  }
  const raw = await res.text();
  if (!raw.trim()) return [];
  const parsed = JSON.parse(raw);
  const batches = Array.isArray(parsed) ? parsed : [parsed];
  const rows: unknown[] = [];
  for (const b of batches) {
    for (const r of (b as { results?: unknown[] }).results || []) rows.push(r);
  }
  return rows;
}

function bump(
  map: Map<string, Agg>,
  id: string,
  base: Omit<Agg, "spend" | "clicks" | "impressions" | "conversions">,
  metrics: { costMicros?: string; clicks?: string; impressions?: string; conversions?: number }
) {
  const prev = map.get(id) || {
    ...base,
    spend: 0,
    clicks: 0,
    impressions: 0,
    conversions: 0,
  };
  prev.spend += Number(metrics.costMicros || 0) / 1_000_000;
  prev.clicks += Number(metrics.clicks || 0);
  prev.impressions += Number(metrics.impressions || 0);
  prev.conversions += Number(metrics.conversions || 0);
  map.set(id, prev);
}

export async function fetchGoogleSnapshot(range: DateRange): Promise<GoogleSnapshot> {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const customerId = (
    process.env.VALUTIN_GOOGLE_CUSTOMER_ID ||
    process.env.GOOGLE_ADS_CUSTOMER_ID ||
    ACCOUNT_IDS.googleCustomerId
  ).replace(/-/g, "");
  const loginCustomerId = (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || "").replace(/-/g, "");

  if (!developerToken) return empty("GOOGLE_ADS_DEVELOPER_TOKEN ausente");
  const accessToken = await getAccessToken();
  if (!accessToken) return empty("Google Ads OAuth token indisponível");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": developerToken,
    "Content-Type": "application/json",
  };
  // Only send this header when access really goes through a manager account.
  // Omitting it makes Google Ads default to the operating customer.
  if (loginCustomerId) headers["login-customer-id"] = loginCustomerId;

  const dateFilter = `segments.date BETWEEN '${range.since}' AND '${range.until}'`;

  try {
    const [campResult, agResult, adResult] = await Promise.allSettled([
      searchStream(
        customerId,
        headers,
        `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
          metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions
         FROM campaign
         WHERE ${dateFilter} AND campaign.status != 'REMOVED'`
      ),
      searchStream(
        customerId,
        headers,
        `SELECT campaign.id, campaign.name, ad_group.id, ad_group.name, ad_group.status,
          metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions
         FROM ad_group
         WHERE ${dateFilter} AND ad_group.status != 'REMOVED' AND campaign.status != 'REMOVED'`
      ),
      searchStream(
        customerId,
        headers,
        `SELECT campaign.id, campaign.name, ad_group.id, ad_group.name,
          ad_group_ad.ad.id, ad_group_ad.ad.name, ad_group_ad.status,
          metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions
         FROM ad_group_ad
         WHERE ${dateFilter} AND ad_group_ad.status != 'REMOVED' AND campaign.status != 'REMOVED'`
      ),
    ]);

    // Campaign totals are the source of truth for the executive summary. A
    // failure in ad-group/ad detail must not zero an otherwise valid account.
    if (campResult.status === "rejected") throw campResult.reason;
    const campRows = campResult.value;
    const agRows = agResult.status === "fulfilled" ? agResult.value : [];
    const adRows = adResult.status === "fulfilled" ? adResult.value : [];
    const detailErrors = [
      agResult.status === "rejected" ? "grupos" : "",
      adResult.status === "rejected" ? "anúncios" : "",
    ].filter(Boolean);

    const camps = new Map<string, Agg>();
    const adsets = new Map<string, Agg>();
    const ads = new Map<string, Agg>();

    for (const raw of campRows) {
      const row = raw as {
        campaign?: { id?: string; name?: string; status?: string; advertisingChannelType?: string };
        metrics?: { costMicros?: string; clicks?: string; impressions?: string; conversions?: number };
      };
      const id = String(row.campaign?.id || "");
      if (!id) continue;
      bump(
        camps,
        id,
        {
          name: row.campaign?.name || id,
          status: row.campaign?.status || "",
          channelType: row.campaign?.advertisingChannelType,
          campaignId: id,
          campaignName: row.campaign?.name || id,
        },
        row.metrics || {}
      );
    }

    for (const raw of agRows) {
      const row = raw as {
        campaign?: { id?: string; name?: string };
        adGroup?: { id?: string; name?: string; status?: string };
        metrics?: { costMicros?: string; clicks?: string; impressions?: string; conversions?: number };
      };
      const id = String(row.adGroup?.id || "");
      if (!id) continue;
      bump(
        adsets,
        id,
        {
          name: row.adGroup?.name || id,
          status: row.adGroup?.status || "",
          parentId: row.campaign?.id,
          parentName: row.campaign?.name,
          campaignId: row.campaign?.id,
          campaignName: row.campaign?.name,
          adsetId: id,
          adsetName: row.adGroup?.name || id,
        },
        row.metrics || {}
      );
    }

    for (const raw of adRows) {
      const row = raw as {
        campaign?: { id?: string; name?: string };
        adGroup?: { id?: string; name?: string };
        adGroupAd?: { status?: string; ad?: { id?: string; name?: string } };
        metrics?: { costMicros?: string; clicks?: string; impressions?: string; conversions?: number };
      };
      const id = String(row.adGroupAd?.ad?.id || "");
      if (!id) continue;
      bump(
        ads,
        id,
        {
          name: row.adGroupAd?.ad?.name || id,
          status: row.adGroupAd?.status || "",
          parentId: row.adGroup?.id,
          parentName: row.adGroup?.name,
          campaignId: row.campaign?.id,
          campaignName: row.campaign?.name,
          adsetId: row.adGroup?.id,
          adsetName: row.adGroup?.name,
        },
        row.metrics || {}
      );
    }

    const entities: MediaEntity[] = [];
    const campaigns: CampaignRow[] = [];
    let spend = 0;
    let clicks = 0;
    let impressions = 0;
    let conversions = 0;

    for (const [id, a] of Array.from(camps.entries())) {
      const metrics = toMetrics(a);
      spend += metrics.spend;
      clicks += metrics.clicks;
      impressions += metrics.impressions;
      conversions += metrics.conversions;
      campaigns.push({
        id,
        name: a.name,
        channel: "google",
        status: a.status,
        spend: metrics.spend,
        results: metrics.conversions,
        resultsLabel: "conversões",
      });
      entities.push({
        id,
        name: a.name,
        status: a.status,
        channel: "google",
        level: "campaign",
        objective: a.channelType,
        campaignId: id,
        campaignName: a.name,
        metrics,
      });
    }

    for (const [id, a] of Array.from(adsets.entries())) {
      entities.push({
        id,
        name: a.name,
        status: a.status,
        channel: "google",
        level: "adset",
        parentId: a.parentId,
        parentName: a.parentName,
        campaignId: a.campaignId,
        campaignName: a.campaignName,
        adsetId: id,
        adsetName: a.name,
        metrics: toMetrics(a),
      });
    }

    for (const [id, a] of Array.from(ads.entries())) {
      entities.push({
        id,
        name: a.name,
        status: a.status,
        channel: "google",
        level: "ad",
        parentId: a.parentId,
        parentName: a.parentName,
        campaignId: a.campaignId,
        campaignName: a.campaignName,
        adsetId: a.adsetId,
        adsetName: a.adsetName,
        metrics: toMetrics(a),
      });
    }

    return {
      spend,
      clicks,
      impressions,
      conversions,
      campaigns: campaigns.sort((a, b) => b.spend - a.spend),
      entities,
      status: detailErrors.length ? "partial" : "ok",
      error: detailErrors.length
        ? `Totais de campanha disponíveis; detalhamento de ${detailErrors.join(" e ")} temporariamente indisponível.`
        : undefined,
    };
  } catch (err) {
    return empty(err instanceof Error ? err.message : "Google Ads fetch failed");
  }
}

function empty(error: string): GoogleSnapshot {
  return {
    spend: 0,
    clicks: 0,
    impressions: 0,
    conversions: 0,
    campaigns: [],
    entities: [],
    status: "unavailable",
    error,
  };
}
