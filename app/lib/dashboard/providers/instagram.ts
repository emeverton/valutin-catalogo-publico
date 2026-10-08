import { ACCOUNT_IDS, H2_GOALS } from "../goals";
import type { DateRange, InstagramSnapshot } from "../types";
import { fetchReporteiInstagramSnapshot } from "./reportei";

const GRAPH = () =>
  `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION || "v21.0"}`;

function systemToken(): string | undefined {
  return process.env.META_ACCESS_TOKEN;
}

async function resolvePageAccessToken(systemAccessToken: string, pageId: string): Promise<string | null> {
  let url: string | null =
    `${GRAPH()}/me/accounts?fields=id,access_token,instagram_business_account&limit=100&access_token=${encodeURIComponent(systemAccessToken)}`;

  while (url) {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: Array<{ id: string; access_token?: string; instagram_business_account?: { id: string } }>;
      paging?: { next?: string };
    };
    for (const page of json.data || []) {
      if (page.id === pageId && page.access_token) return page.access_token;
    }
    url = json.paging?.next || null;
  }
  return null;
}

export async function fetchInstagramSnapshot(range: DateRange): Promise<InstagramSnapshot> {
  let reporteiError = "";
  try {
    const reportei = await fetchReporteiInstagramSnapshot(range);
    if (reportei) return reportei;
  } catch (error) {
    reporteiError = error instanceof Error ? error.message : "Reportei Instagram falhou";
    console.warn(
      JSON.stringify({
        event: "dashboard_provider_error",
        provider: "reportei_instagram",
        message: reporteiError.slice(0, 160),
      })
    );
  }

  const meta = await fetchMetaInstagramSnapshot(range);
  if (!reporteiError) return meta;
  return {
    ...meta,
    error: [reporteiError, meta.error].filter(Boolean).join(" · "),
    status: meta.status === "ok" ? "partial" : meta.status,
  };
}

async function fetchMetaInstagramSnapshot(range: DateRange): Promise<InstagramSnapshot> {
  const accessToken = systemToken();
  if (!accessToken) return empty("META_ACCESS_TOKEN ausente");

  const pageId = process.env.FACEBOOK_PAGE_ID || ACCOUNT_IDS.facebookPageId;

  try {
    const pageToken = (await resolvePageAccessToken(accessToken, pageId)) || accessToken;
    let igId = process.env.IG_BUSINESS_ID || "";
    if (igId && igId.length < 10) igId = "";

    const pageUrl = new URL(`${GRAPH()}/${pageId}`);
    pageUrl.searchParams.set(
      "fields",
      "instagram_business_account,name"
    );
    pageUrl.searchParams.set("access_token", pageToken);
    const pageRes = await fetch(pageUrl.toString(), { next: { revalidate: 300 } });
    if (pageRes.ok) {
      const pageJson = (await pageRes.json()) as {
        instagram_business_account?: { id: string };
      };
      if (!igId) igId = pageJson.instagram_business_account?.id || "";
    }

    if (!igId) {
      return {
        followers: 0,
        followersDeltaH2: 0,
        reach: 0,
        engagement: 0,
        mediaCount: 0,
        recentMedia: [],
        status: "partial",
        error:
          "Instagram profissional ainda não vinculado à Página da Valutin. Conecte o @valutinoficial no Meta Business.",
      };
    }

    const profileUrl = new URL(`${GRAPH()}/${igId}`);
    profileUrl.searchParams.set("fields", "followers_count,media_count,username");
    profileUrl.searchParams.set("access_token", pageToken);
    const profileRes = await fetch(profileUrl.toString(), { next: { revalidate: 300 } });

    if (!profileRes.ok) {
      await profileRes.text();
      return {
        followers: 0,
        followersDeltaH2: 0,
        reach: 0,
        engagement: 0,
        mediaCount: 0,
        recentMedia: [],
        status: "partial",
        error: `Instagram indisponível no momento (HTTP ${profileRes.status}). Verifique o vínculo do @valutinoficial no Meta Business.`,
      };
    }

    const profile = (await profileRes.json()) as {
      followers_count?: number;
      media_count?: number;
      username?: string;
    };

    const insightsUrl = new URL(`${GRAPH()}/${igId}/insights`);
    insightsUrl.searchParams.set("metric", "reach,total_interactions");
    insightsUrl.searchParams.set("period", "day");
    insightsUrl.searchParams.set("since", range.since);
    insightsUrl.searchParams.set("until", range.until);
    insightsUrl.searchParams.set("access_token", pageToken);
    const insightsRes = await fetch(insightsUrl.toString(), { next: { revalidate: 300 } });

    let reach = 0;
    let engagement = 0;
    if (insightsRes.ok) {
      const insights = (await insightsRes.json()) as {
        data?: Array<{ name: string; values?: Array<{ value: number }> }>;
      };
      for (const m of insights.data || []) {
        const sum = (m.values || []).reduce((acc, v) => acc + Number(v.value || 0), 0);
        if (m.name === "reach") reach = sum;
        if (m.name === "total_interactions") engagement = sum;
      }
    }

    const mediaUrl = new URL(`${GRAPH()}/${igId}/media`);
    mediaUrl.searchParams.set(
      "fields",
      "id,caption,timestamp,like_count,comments_count,permalink"
    );
    mediaUrl.searchParams.set("limit", "12");
    mediaUrl.searchParams.set("access_token", pageToken);
    const mediaRes = await fetch(mediaUrl.toString(), { next: { revalidate: 300 } });
    const recentMedia: InstagramSnapshot["recentMedia"] = [];
    if (mediaRes.ok) {
      const mediaJson = (await mediaRes.json()) as {
        data?: Array<{
          id: string;
          caption?: string;
          timestamp?: string;
          like_count?: number;
          comments_count?: number;
          permalink?: string;
        }>;
      };
      for (const m of mediaJson.data || []) {
        recentMedia.push({
          id: m.id,
          caption: (m.caption || "").slice(0, 120),
          timestamp: m.timestamp || "",
          likeCount: Number(m.like_count || 0),
          commentsCount: Number(m.comments_count || 0),
          permalink: m.permalink,
        });
      }
    }

    const followers = Number(profile.followers_count || 0);
    const baseline = H2_GOALS.followersBaseline;

    return {
      followers,
      followersDeltaH2: baseline > 0 ? Math.max(0, followers - baseline) : 0,
      reach,
      engagement,
      mediaCount: Number(profile.media_count || 0),
      username: profile.username,
      recentMedia,
      source: "meta",
      status: insightsRes.ok ? "ok" : "partial",
      error: insightsRes.ok ? undefined : "Insights IG parciais (followers OK)",
    };
  } catch (err) {
    return empty(err instanceof Error ? err.message : "IG fetch failed");
  }
}

function empty(error: string): InstagramSnapshot {
  return {
    followers: 0,
    followersDeltaH2: 0,
    reach: 0,
    engagement: 0,
    mediaCount: 0,
    recentMedia: [],
    status: "unavailable",
    error,
  };
}
