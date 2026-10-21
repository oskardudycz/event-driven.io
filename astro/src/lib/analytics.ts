type AnalyticsWindow = Window & { dataLayer?: { event: string }[] };
export function trackNavigation() {
  // Keep the configured GTM trigger identity through the framework change.
  (window as AnalyticsWindow).dataLayer?.push({ event: 'gatsby-route-change' });
}
