import { ACCOUNT_IDS } from "../goals";
import type { DateRange, Ga4Snapshot } from "../types";

async function getAccessToken(): Promise<string | null> {
  if (process.env.GA4_ACCESS_TOKEN || process.env.GOOGLE_ACCESS_TOKEN) {
    return process.env.GA4_ACCESS_TOKEN || process.env.GOOGLE_ACCESS_TOKEN || null;
  }
  const clientId = process.env.GA4_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret =
    process.env.GA4_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken =
    process.env.GA4_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN || process.env.GOOGLE_ADS_REFRESH_TOKEN;
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

async function runReport(
  propertyId: string,
  headers: HeadersInit,
  body: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      next: { revalidate: 300 },
    }
  );
  if (!res.ok) return null;
  return (await res.json()) as Record<string, unknown>;
}

export async function fetchGa4Snapshot(range: DateRange): Promise<Ga4Snapshot> {
  const propertyId = process.env.GA4_PROPERTY_ID || ACCOUNT_IDS.ga4PropertyId;
  const accessToken = await getAccessToken();
  if (!accessToken) return empty("GA4 OAuth token indisponível");

  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    const dateRanges = [{ startDate: range.since, endDate: range.until }];

    const [overview, eventsRep, sources, pages] = await Promise.all([
      runReport(propertyId, headers, {
        dateRanges,
        metrics: [
          { name: "sessions" },
          { name: "engagedSessions" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
      }),
      runReport(propertyId, headers, {
        dateRanges,
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 30,
      }),
      runReport(propertyId, headers, {
        dateRanges,
        dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 15,
      }),
      runReport(propertyId, headers, {
        dateRanges,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "sessions" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 15,
      }),
    ]);

    if (!overview && !eventsRep) return empty("GA4 reports falharam");

    const ovRows = (overview?.rows as Array<{ metricValues?: Array<{ value: string }> }>) || [];
    const sessions = Number(ovRows[0]?.metricValues?.[0]?.value || 0);
    const engagedSessions = Number(ovRows[0]?.metricValues?.[1]?.value || 0);
    const bounceRate = ovRows[0]?.metricValues?.[2]
      ? Number(ovRows[0].metricValues[2].value)
      : null;
    const avgSessionDuration = ovRows[0]?.metricValues?.[3]
      ? Number(ovRows[0].metricValues[3].value)
      : null;

    const events: Ga4Snapshot["events"] = [];
    let whatsapp = 0;
    let generateLead = 0;
    let purchase = 0;
    let proposal = 0;
    for (const row of (eventsRep?.rows as Array<{
      dimensionValues?: Array<{ value: string }>;
      metricValues?: Array<{ value: string }>;
    }>) || []) {
      const name = row.dimensionValues?.[0]?.value || "";
      const count = Number(row.metricValues?.[0]?.value || 0);
      events.push({ name, count });
      if (name === "whatsapp") whatsapp = count;
      if (name === "generate_lead") generateLead = count;
      if (name === "purchase") purchase = count;
      if (name === "proposal") proposal = count;
    }

    const topSources: Ga4Snapshot["topSources"] = (
      (sources?.rows as Array<{
        dimensionValues?: Array<{ value: string }>;
        metricValues?: Array<{ value: string }>;
      }>) || []
    ).map((row) => ({
      source: row.dimensionValues?.[0]?.value || "(none)",
      medium: row.dimensionValues?.[1]?.value || "(none)",
      sessions: Number(row.metricValues?.[0]?.value || 0),
      users: Number(row.metricValues?.[1]?.value || 0),
    }));

    const topPages: Ga4Snapshot["topPages"] = (
      (pages?.rows as Array<{
        dimensionValues?: Array<{ value: string }>;
        metricValues?: Array<{ value: string }>;
      }>) || []
    ).map((row) => ({
      page: row.dimensionValues?.[0]?.value || "/",
      views: Number(row.metricValues?.[0]?.value || 0),
      sessions: Number(row.metricValues?.[1]?.value || 0),
    }));

    return {
      sessions,
      whatsapp,
      generateLead,
      purchase,
      proposal,
      engagedSessions,
      bounceRate,
      avgSessionDuration,
      topSources,
      topPages,
      events,
      status: "ok",
    };
  } catch (err) {
    return empty(err instanceof Error ? err.message : "GA4 fetch failed");
  }
}

function empty(error: string): Ga4Snapshot {
  return {
    sessions: 0,
    whatsapp: 0,
    generateLead: 0,
    purchase: 0,
    proposal: 0,
    engagedSessions: 0,
    bounceRate: null,
    avgSessionDuration: null,
    topSources: [],
    topPages: [],
    events: [],
    status: "unavailable",
    error,
  };
}
