import { ACCOUNT_IDS } from "../goals";
import type { DateRange, GmbSnapshot } from "../types";
import { getGoogleAccessToken } from "./google-auth";

const QUOTA_MESSAGE =
  "Limite temporário da API do Perfil da Empresa (429). Dados públicos preservados; tente novamente em alguns minutos.";
const QUOTA_DISABLED_MESSAGE =
  "A quota da API do Perfil da Empresa está em 0. Habilite o acesso ou solicite quota no projeto Google Cloud; os dados públicos foram preservados.";

async function fetchWithBackoff(
  input: string,
  init: RequestInit & { next?: { revalidate?: number } },
  maxRetries = 2
): Promise<Response> {
  let response = await fetch(input, init);
  for (let attempt = 0; response.status === 429 && attempt < maxRetries; attempt += 1) {
    const retryAfter = Number(response.headers.get("retry-after") || 0) * 1000;
    const exponential = 250 * 2 ** attempt;
    const delay = Math.min(1_500, retryAfter || exponential + Math.random() * exponential);
    await new Promise((resolve) => setTimeout(resolve, delay));
    response = await fetch(input, init);
  }
  return response;
}

async function providerError(res: Response, operation: string): Promise<string> {
  const raw = await res.text();
  let message = "";
  let quotaLimitValue = "";
  try {
    const json = JSON.parse(raw) as {
      error?: {
        message?: string;
        status?: string;
        details?: Array<{ metadata?: Record<string, string> }>;
      };
    };
    message = json.error?.message || "";
    quotaLimitValue =
      json.error?.details?.find((detail) => detail.metadata?.quota_limit_value)?.metadata
        ?.quota_limit_value || "";
  } catch {
    // Keep the user-facing status concise even when the API returns non-JSON.
  }
  console.warn(
    JSON.stringify({
      event: "dashboard_provider_error",
      provider: "google_business_profile",
      operation,
      httpStatus: res.status,
      apiStatus: message ? message.slice(0, 100) : undefined,
      quotaLimitValue: quotaLimitValue || undefined,
    })
  );
  if (res.status === 429 && quotaLimitValue === "0") return QUOTA_DISABLED_MESSAGE;
  if (res.status === 429) return QUOTA_MESSAGE;
  return `${operation} indisponível (HTTP ${res.status}).`;
}

function emptyMetrics(): GmbSnapshot["metrics"] {
  return {
    businessImpressionsDesktopMaps: 0,
    businessImpressionsMobileMaps: 0,
    businessImpressionsDesktopSearch: 0,
    businessImpressionsMobileSearch: 0,
    callClicks: 0,
    websiteClicks: 0,
    businessDirectionRequests: 0,
  };
}

function publicFallback(error?: string): GmbSnapshot {
  return {
    locationName: process.env.GBP_LOCATION_NAME || `cid:${ACCOUNT_IDS.gmbMapsCid}`,
    title: ACCOUNT_IDS.gmbTitle,
    address: ACCOUNT_IDS.gmbAddress,
    rating: ACCOUNT_IDS.gmbPublicRating,
    reviewCount: ACCOUNT_IDS.gmbPublicReviewCount,
    reviews: [],
    metrics: emptyMetrics(),
    impressions: 0,
    mapsUrl: ACCOUNT_IDS.gmbMapsUrl,
    phone: ACCOUNT_IDS.gmbPhone,
    status: "partial",
    error:
      error ||
      "Exibindo painel público Maps (4,7★ / 45). Para métricas + reviews live: conceder Manager e setar GBP_LOCATION_NAME.",
  };
}

async function listLocations(
  token: string,
  accountName: string
): Promise<Array<{ name: string; title: string; address?: string }>> {
  const url = new URL(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`
  );
  url.searchParams.set("readMask", "name,title,storefrontAddress");
  url.searchParams.set("pageSize", "50");
  const res = await fetchWithBackoff(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(await providerError(res, "Lista de lojas"));
  }
  const json = (await res.json()) as {
    locations?: Array<{
      name?: string;
      title?: string;
      storefrontAddress?: { addressLines?: string[]; locality?: string };
    }>;
  };
  return (json.locations || []).map((l) => ({
    name: l.name || "",
    title: l.title || "",
    address: [...(l.storefrontAddress?.addressLines || []), l.storefrontAddress?.locality || ""]
      .filter(Boolean)
      .join(", "),
  }));
}

export async function fetchGmbSnapshot(range: DateRange): Promise<GmbSnapshot> {
  const token = await getGoogleAccessToken();
  let locationName =
    process.env.GBP_LOCATION_NAME || process.env.VALUTIN_GBP_LOCATION_NAME || "";
  const accountName =
    process.env.GBP_ACCOUNT_NAME ||
    process.env.VALUTIN_GBP_ACCOUNT_NAME ||
    process.env.GBP_ACCOUNT_ID ||
    "";

  if (!token) {
    return publicFallback("Google OAuth ausente — painel público Maps.");
  }

  try {
    if (!locationName && accountName) {
      const acct = accountName.startsWith("accounts/") ? accountName : `accounts/${accountName}`;
      const locs = await listLocations(token, acct);
      const prefer = locs.find((l) => /valutin/i.test(l.title)) || locs[0];
      if (prefer?.name) locationName = prefer.name;
    }

    if (!locationName) {
      const accRes = await fetchWithBackoff(
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
        {
          headers: { Authorization: `Bearer ${token}` },
          next: { revalidate: 300 },
        }
      );
      if (!accRes.ok) {
        return publicFallback(await providerError(accRes, "Conta do Perfil da Empresa"));
      }
      const accJson = (await accRes.json()) as {
        accounts?: Array<{ name?: string }>;
      };
      const first = accJson.accounts?.[0]?.name;
      if (!first) {
        return publicFallback(
          "OAuth sem conta GBP. Peça Manager no perfil Valutin (Maps CID 1949999187998996603)."
        );
      }
      const locs = await listLocations(token, first);
      const prefer = locs.find((l) => /valutin/i.test(l.title)) || locs[0];
      if (!prefer?.name) {
        return publicFallback(`Conta ${first} sem locations Valutin.`);
      }
      locationName = prefer.name;
    }

    const reviews: GmbSnapshot["reviews"] = [];
    let rating: number | null = null;
    let reviewCount = 0;
    let reviewsError = "";
    const revRes = await fetchWithBackoff(
      `https://mybusiness.googleapis.com/v4/${locationName}/reviews`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      }
    );
    if (revRes.ok) {
      const revJson = (await revRes.json()) as {
        reviews?: Array<{
          reviewId?: string;
          reviewer?: { displayName?: string };
          starRating?: string;
          comment?: string;
          createTime?: string;
        }>;
        averageRating?: number;
        totalReviewCount?: number;
      };
      rating = revJson.averageRating ?? null;
      reviewCount = Number(revJson.totalReviewCount || 0);
      const starMap: Record<string, number> = {
        ONE: 1,
        TWO: 2,
        THREE: 3,
        FOUR: 4,
        FIVE: 5,
      };
      for (const r of revJson.reviews || []) {
        reviews.push({
          id: r.reviewId || r.createTime || String(reviews.length),
          author: r.reviewer?.displayName || "Anônimo",
          stars: starMap[r.starRating || ""] || 0,
          comment: (r.comment || "").slice(0, 280),
          createdAt: r.createTime || "",
        });
      }
    } else {
      reviewsError = await providerError(revRes, "Avaliações");
    }

    const metrics = emptyMetrics();
    const metricKeys = Object.keys(metrics) as Array<keyof typeof metrics>;
    const perfUrl = new URL(
      `https://businessprofileperformance.googleapis.com/v1/${locationName}:fetchMultiDailyMetricsTimeSeries`
    );
    for (const m of metricKeys) perfUrl.searchParams.append("dailyMetrics", m);
    perfUrl.searchParams.set("dailyRange.start_date.year", range.since.slice(0, 4));
    perfUrl.searchParams.set(
      "dailyRange.start_date.month",
      String(Number(range.since.slice(5, 7)))
    );
    perfUrl.searchParams.set(
      "dailyRange.start_date.day",
      String(Number(range.since.slice(8, 10)))
    );
    perfUrl.searchParams.set("dailyRange.end_date.year", range.until.slice(0, 4));
    perfUrl.searchParams.set(
      "dailyRange.end_date.month",
      String(Number(range.until.slice(5, 7)))
    );
    perfUrl.searchParams.set(
      "dailyRange.end_date.day",
      String(Number(range.until.slice(8, 10)))
    );

    let perfError = "";
    const perfRes = await fetchWithBackoff(perfUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 },
    });
    if (perfRes.ok) {
      const perfJson = (await perfRes.json()) as {
        multiDailyMetricTimeSeries?: Array<{
          dailyMetricTimeSeries?: Array<{
            dailyMetric?: string;
            timeSeries?: { datedValues?: Array<{ value?: string }> };
          }>;
        }>;
      };
      for (const block of perfJson.multiDailyMetricTimeSeries || []) {
        for (const series of block.dailyMetricTimeSeries || []) {
          const key = series.dailyMetric as keyof typeof metrics | undefined;
          if (!key || !(key in metrics)) continue;
          metrics[key] = (series.timeSeries?.datedValues || []).reduce(
            (acc, d) => acc + Number(d.value || 0),
            0
          );
        }
      }
    } else {
      perfError = await providerError(perfRes, "Performance");
    }

    const impressions =
      metrics.businessImpressionsDesktopMaps +
      metrics.businessImpressionsMobileMaps +
      metrics.businessImpressionsDesktopSearch +
      metrics.businessImpressionsMobileSearch;

    return {
      locationName,
      title: ACCOUNT_IDS.gmbTitle,
      address: ACCOUNT_IDS.gmbAddress,
      rating: rating ?? ACCOUNT_IDS.gmbPublicRating,
      reviewCount: reviewCount || ACCOUNT_IDS.gmbPublicReviewCount,
      reviews: reviews.slice(0, 15),
      metrics,
      impressions,
      mapsUrl: ACCOUNT_IDS.gmbMapsUrl,
      phone: ACCOUNT_IDS.gmbPhone,
      status: perfError || reviewsError ? "partial" : "ok",
      error: [perfError, reviewsError].filter(Boolean).join(" ") || undefined,
    };
  } catch (err) {
    return publicFallback(err instanceof Error ? err.message : "GMB fetch failed");
  }
}
