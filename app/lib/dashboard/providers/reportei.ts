import { H2_GOALS } from "../goals";
import type { DateRange, InstagramSnapshot } from "../types";

const REPORTEI_API = "https://app.reportei.com/api/v2";

type MetricDescriptor = {
  id: string;
  reference_key: string;
  component: "number_v1" | "datatable_v1";
  metrics: string[];
  dimensions: string[];
  sort: string[];
  type: string | string[];
};

const INSTAGRAM_METRICS = [
  {
    id: "2ebb6455-bc1d-40a1-ace4-1bd68e3ed42b",
    reference_key: "ig:followers_count",
    component: "number_v1",
    metrics: ["followers"],
    dimensions: [],
    sort: [],
    type: [],
  },
  {
    id: "454342b0-128b-4227-b882-d34345977764",
    reference_key: "ig:reach",
    component: "number_v1",
    metrics: ["reach"],
    dimensions: [],
    sort: [],
    type: [],
  },
  {
    id: "5a62cdc5-3d0a-4a8f-baef-71c7954009c2",
    reference_key: "ig:media_engagement",
    component: "number_v1",
    metrics: ["engagement"],
    dimensions: ["media"],
    sort: [],
    type: "total_posts_engagement",
  },
  {
    id: "0fe1dde3-19e0-4dc0-bea6-dcc6b612e03b",
    reference_key: "ig:media_count",
    component: "number_v1",
    metrics: ["count"],
    dimensions: ["media"],
    sort: [],
    type: "total_posts_count",
  },
  {
    id: "41a15945-6edc-48e2-8c8e-da3298cb31ab",
    reference_key: "ig:media_datatable",
    component: "datatable_v1",
    metrics: [
      "type",
      "reach",
      "views",
      "total_interactions",
      "post_interactions_rate",
      "likes",
      "comments",
      "saved",
      "follows",
      "profile_visits",
      "shares",
      "created_at",
    ],
    dimensions: ["media"],
    sort: ["-reach"],
    type: [],
  },
] satisfies MetricDescriptor[];

type ReporteiMetricResult = {
  values?: unknown;
};

type ReporteiMetricsResponse = {
  data?: Record<string, ReporteiMetricResult> & { exception?: string };
  message?: string;
};

function numericValue(
  data: Record<string, ReporteiMetricResult>,
  metric: MetricDescriptor
): number {
  const value = data[metric.id]?.values;
  return typeof value === "number" ? value : Number(value || 0);
}

function mediaRows(
  data: Record<string, ReporteiMetricResult>,
  metric: MetricDescriptor
): InstagramSnapshot["recentMedia"] {
  const rows = data[metric.id]?.values;
  if (!Array.isArray(rows)) return [];

  return rows.slice(0, 12).flatMap((entry) => {
    if (!Array.isArray(entry)) return [];
    const media = entry[0];
    if (!media || typeof media !== "object") return [];
    const item = media as { id?: string; text?: string; url?: string };
    const id = String(item.id || "");
    if (!id) return [];
    return [
      {
        id,
        caption: String(item.text || "").slice(0, 120),
        timestamp: String(entry[12] || ""),
        likeCount: Number(entry[6] || 0),
        commentsCount: Number(entry[7] || 0),
        permalink: item.url || undefined,
      },
    ];
  });
}

export async function fetchReporteiInstagramSnapshot(
  range: DateRange
): Promise<InstagramSnapshot | null> {
  const token = process.env.REPORTEI_API_TOKEN;
  const integrationId = Number(process.env.REPORTEI_INSTAGRAM_INTEGRATION_ID || 0);
  if (!token || !integrationId) return null;

  const response = await fetch(`${REPORTEI_API}/metrics/get-data`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      start: range.since,
      end: range.until,
      integration_id: integrationId,
      metrics: INSTAGRAM_METRICS,
    }),
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Reportei Instagram indisponível (HTTP ${response.status})`);
  }

  const payload = (await response.json()) as ReporteiMetricsResponse;
  if (payload.data?.exception) {
    throw new Error(`Reportei Instagram: ${payload.data.exception}`);
  }
  if (!payload.data) {
    throw new Error(payload.message || "Reportei Instagram retornou resposta vazia");
  }

  const data = payload.data as Record<string, ReporteiMetricResult>;
  const followers = numericValue(data, INSTAGRAM_METRICS[0]);
  const reach = numericValue(data, INSTAGRAM_METRICS[1]);
  const engagement = numericValue(data, INSTAGRAM_METRICS[2]);
  const mediaCount = numericValue(data, INSTAGRAM_METRICS[3]);
  const baseline = H2_GOALS.followersBaseline;

  return {
    followers,
    followersDeltaH2: baseline > 0 ? Math.max(0, followers - baseline) : 0,
    reach,
    engagement,
    mediaCount,
    username: process.env.REPORTEI_INSTAGRAM_USERNAME || "valutinoficial",
    recentMedia: mediaRows(data, INSTAGRAM_METRICS[4]),
    source: "reportei",
    status: "ok",
  };
}
