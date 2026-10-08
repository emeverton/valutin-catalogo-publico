import { hasOptionalCookieConsent } from './cookie-consent';

export const FUNNEL_EVENTS = ['vlt_catalog_view','vlt_product_select','vlt_form_view','vlt_form_start','vlt_form_submit','vlt_form_error','vlt_whatsapp_redirect'] as const;
export type FunnelEvent = typeof FUNNEL_EVENTS[number];
type AnalyticsWindow = Window & { dataLayer?: Record<string, unknown>[] };
export function isPublicAnalyticsHost(host: string): boolean {
  return host === 'www.valutin.com.br' || host === 'valutin.com.br';
}
export function trackFunnel(event: FunnelEvent): void {
  if (typeof window === 'undefined' || !isPublicAnalyticsHost(window.location.hostname) || !hasOptionalCookieConsent()) return;
  if (!(FUNNEL_EVENTS as readonly string[]).includes(event)) return;
  const w = window as AnalyticsWindow;
  (w.dataLayer ||= []).push({ event });
}

export function trackCatalogItemView(item: { id: string; title: string; price: number }): void {
  if (typeof window === 'undefined' || !isPublicAnalyticsHost(window.location.hostname) || !hasOptionalCookieConsent()) return;
  const w = window as AnalyticsWindow;
  const itemData = { item_id: item.id, item_name: item.title, price: item.price, quantity: 1 };
  (w.dataLayer ||= []).push({
    event: 'view_item',
    ecommerce: { currency: 'BRL', value: item.price, items: [itemData] },
    // GTM maps these same stable IDs to Meta's ViewContent content_ids.
    content_type: 'product',
    content_ids: [item.id],
  });
}
/** Records PDP interest even while a feed-matching SKU is unavailable. */
export function trackProductDetailView(handle: string): void {
  if (typeof window === 'undefined' || !isPublicAnalyticsHost(window.location.hostname) || !hasOptionalCookieConsent()) return;
  const w = window as AnalyticsWindow;
  (w.dataLayer ||= []).push({ event: 'vlt_product_view', product_handle: handle });
}
/** Allow GTM a bounded dispatch window; never prevent customer navigation. */
export function trackConfirmedLead(eventId: string): Promise<void> {
  if (typeof window === 'undefined' || !isPublicAnalyticsHost(window.location.hostname) || !hasOptionalCookieConsent()) return Promise.resolve();
  const w = window as AnalyticsWindow;
  return new Promise(resolve => {
    let finished = false;
    const finish = () => { if (!finished) { finished = true; resolve(); } };
    setTimeout(finish, 900);
    try {
      (w.dataLayer ||= []).push({ event:'generate_lead', event_id:eventId, lead_type:'VAREJO', retail_confirmed:true });
      w.dataLayer.push({ event:'vlt_whatsapp_redirect', eventCallback:finish, eventTimeout:800 });
    } catch { finish(); }
  });
}
