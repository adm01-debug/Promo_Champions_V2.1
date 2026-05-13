import type { Metric } from 'web-vitals';

/**
 * Reports Core Web Vitals metrics.
 * In development: logs to console.
 * In production: can be extended to send to analytics endpoint.
 */
export function reportWebVitals(onReport?: (metric: Metric) => void) {
  const handler = onReport ?? ((metric: Metric) => {
    if (import.meta.env.DEV) {
      const label = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.info(`${label} [${metric.name}] ${Math.round(metric.value)}ms (${metric.rating})`);
    }
  });

  import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
    onCLS(handler);
    onINP(handler);
    onLCP(handler);
    onFCP(handler);
    onTTFB(handler);
  });
}
