export const COOKIE_CONSENT_KEY = "valutin-cookie-consent";
export const COOKIE_CONSENT_EVENT = "valutin:cookie-consent";

export type CookieDecision = boolean | null;

export function readCookieConsent(): CookieDecision {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
    if (!raw) return null;
    const saved = JSON.parse(raw) as Record<string, unknown>;
    const analytics = saved.analytics;
    const personalization = saved.ad_personalization;
    if (analytics === "GRANTED" && personalization === "GRANTED") return true;
    if (analytics === "DENIED" || personalization === "DENIED") return false;
    return null;
  } catch {
    return null;
  }
}

export function hasOptionalCookieConsent(): boolean {
  return readCookieConsent() === true;
}

export function saveCookieConsent(allowOptional: boolean): void {
  const payload = {
    ad_user_data: allowOptional ? "UNKNOWN" : "DENIED",
    ad_personalization: allowOptional ? "GRANTED" : "DENIED",
    analytics: allowOptional ? "GRANTED" : "DENIED",
    source: "lp_cookie",
    version: "valutin-cookie-consent-v2",
    ts: new Date().toISOString(),
  };
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(payload));
  window.localStorage.setItem(`${COOKIE_CONSENT_KEY}:legacy`, allowOptional ? "true" : "false");
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: allowOptional }));
}
