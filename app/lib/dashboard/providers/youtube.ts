import { ACCOUNT_IDS } from "../goals";
import type { DateRange, YouTubeSnapshot } from "../types";
import { getGoogleAccessToken } from "./google-auth";

function empty(error: string): YouTubeSnapshot {
  return {
    channelId: "",
    title: "",
    subscribers: 0,
    viewsLifetime: 0,
    videoCount: 0,
    recentVideos: [],
    status: "unavailable",
    error,
  };
}

export async function fetchYouTubeSnapshot(range: DateRange): Promise<YouTubeSnapshot> {
  const token = await getGoogleAccessToken();
  if (!token) return empty("Google OAuth ausente (GOOGLE_REFRESH_TOKEN)");

  const channelId =
    process.env.YOUTUBE_CHANNEL_ID ||
    process.env.VALUTIN_YOUTUBE_CHANNEL_ID ||
    ACCOUNT_IDS.youtubeChannelId;

  if (!channelId) return empty("YOUTUBE_CHANNEL_ID ausente");

  try {
    const chUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
    chUrl.searchParams.set("part", "snippet,statistics");
    chUrl.searchParams.set("id", channelId);
    const chRes = await fetch(chUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 },
    });
    if (!chRes.ok) {
      const t = await chRes.text();
      return empty(`YouTube channels HTTP ${chRes.status}: ${t.slice(0, 120)}`);
    }
    const chJson = (await chRes.json()) as {
      items?: Array<{
        id: string;
        snippet?: { title?: string; customUrl?: string };
        statistics?: {
          subscriberCount?: string;
          viewCount?: string;
          videoCount?: string;
          hiddenSubscriberCount?: boolean;
        };
      }>;
    };
    const ch = chJson.items?.[0];
    if (!ch) return empty("Canal YouTube não encontrado");

    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("channelId", channelId);
    searchUrl.searchParams.set("order", "date");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", "10");
    const searchRes = await fetch(searchUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 },
    });

    const videoIds: string[] = [];
    const titles: Record<string, { title: string; publishedAt: string }> = {};
    if (searchRes.ok) {
      const sJson = (await searchRes.json()) as {
        items?: Array<{
          id?: { videoId?: string };
          snippet?: { title?: string; publishedAt?: string };
        }>;
      };
      for (const it of sJson.items || []) {
        const id = it.id?.videoId;
        if (!id) continue;
        videoIds.push(id);
        titles[id] = {
          title: it.snippet?.title || id,
          publishedAt: it.snippet?.publishedAt || "",
        };
      }
    }

    const recentVideos: YouTubeSnapshot["recentVideos"] = [];
    if (videoIds.length) {
      const vUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      vUrl.searchParams.set("part", "statistics,snippet");
      vUrl.searchParams.set("id", videoIds.join(","));
      const vRes = await fetch(vUrl.toString(), {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      });
      if (vRes.ok) {
        const vJson = (await vRes.json()) as {
          items?: Array<{
            id: string;
            snippet?: { title?: string; publishedAt?: string };
            statistics?: {
              viewCount?: string;
              likeCount?: string;
              commentCount?: string;
            };
          }>;
        };
        for (const v of vJson.items || []) {
          const published = v.snippet?.publishedAt || titles[v.id]?.publishedAt || "";
          // Period filter (inclusive dates) — keep lifetime if published before range but still recent list
          recentVideos.push({
            id: v.id,
            title: v.snippet?.title || titles[v.id]?.title || v.id,
            publishedAt: published,
            views: Number(v.statistics?.viewCount || 0),
            likes: Number(v.statistics?.likeCount || 0),
            comments: Number(v.statistics?.commentCount || 0),
            url: `https://www.youtube.com/watch?v=${v.id}`,
          });
        }
      }
    }

    const inPeriod = recentVideos.filter((v) => {
      const d = v.publishedAt.slice(0, 10);
      return d >= range.since && d <= range.until;
    });

    return {
      channelId,
      title: ch.snippet?.title || "Valutin",
      customUrl: ch.snippet?.customUrl,
      subscribers: Number(ch.statistics?.subscriberCount || 0),
      viewsLifetime: Number(ch.statistics?.viewCount || 0),
      videoCount: Number(ch.statistics?.videoCount || 0),
      recentVideos,
      periodVideoCount: inPeriod.length,
      periodViewsApprox: inPeriod.reduce((a, v) => a + v.views, 0),
      status: "ok",
    };
  } catch (err) {
    return empty(err instanceof Error ? err.message : "YouTube fetch failed");
  }
}
