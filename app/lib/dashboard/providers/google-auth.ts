/** Shared Google OAuth access token for GA4 / YouTube / GBP. */
export async function getGoogleAccessToken(): Promise<string | null> {
  if (process.env.GOOGLE_ACCESS_TOKEN || process.env.GA4_ACCESS_TOKEN) {
    return process.env.GOOGLE_ACCESS_TOKEN || process.env.GA4_ACCESS_TOKEN || null;
  }
  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.GA4_CLIENT_ID ||
    process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.GA4_CLIENT_SECRET ||
    process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken =
    process.env.GOOGLE_REFRESH_TOKEN ||
    process.env.GA4_REFRESH_TOKEN ||
    process.env.GOOGLE_ADS_REFRESH_TOKEN;
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
