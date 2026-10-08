/** Stable ID shared by the product feeds, GTM events, Meta and Google. */
export function catalogFeedId(sku: string): string {
  return `vlt_${String(sku).trim()}`;
}
