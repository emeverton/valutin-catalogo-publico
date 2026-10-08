/**
 * Valutin GA4 IDs — single config surface.
 *
 * Browser / GTM diagnostics historically use G-307208PY2Q (property 485520019).
 * n8n Measurement Protocol fallback historically uses G-41J33QQ02H.
 * Do NOT silently unify without Events / Admin confirmation.
 */
export const GA4_PROPERTY_ID = "485520019";
export const GA4_BROWSER_MEASUREMENT_ID = "G-307208PY2Q";
/** Stage MP default until VALUTIN_GA4_MEASUREMENT_ID is confirmed in provider panels. */
export const GA4_MP_MEASUREMENT_ID_FALLBACK = "G-41J33QQ02H";
export const GA4_ID_STATUS = "REQUIRES_PROVIDER_VALIDATION" as const;
