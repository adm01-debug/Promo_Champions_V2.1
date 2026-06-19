import type { Metric } from 'web-vitals';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const ENDPOINT = `${SUPABASE_URL}/functions/v1/log-web-vitals`;


// Persistent per-session id (survives SPA navigation; resets on tab close)
function getSessionId(): string {
  try {
    const KEY = '__wv_session__';
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'no-session';
  }
}

function normalizeRoute(pathname: string): string {
  // Replace UUIDs and numeric ids with :id placeholders to bound cardinality
  return pathname
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d+(?=\/|$)/g, '/:id')
    .slice(0, 200);
}

function getConnectionType(): string | null {
  const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
  return nav.connection?.effectiveType ?? null;
}

interface VitalsPayload {
  route: string;
  metric: string;
  value: number;
  rating: string;
  navigation_type: string;
  session_id: string;
  viewport_width: number;
  connection_type: string | null;
}

function sendBeacon(payload: VitalsPayload): void {
  try {
    const body = JSON.stringify(payload);
    // sendBeacon must use a CORS-safelisted Content-Type; use Blob with text/plain
    const blob = new Blob([body], { type: 'text/plain' });
    const queued = navigator.sendBeacon?.(`${ENDPOINT}?apikey=${SUPABASE_PUBLISHABLE_KEY}`, blob);
    if (queued) return;
  } catch {
    /* fall through to fetch */
  }
  // Fallback for unload-safe delivery
  void fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_PUBLISHABLE_KEY },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    /* swallow — telemetry must never break UX */
  });
}

/**
 * Reports Core Web Vitals.
 * DEV: logs to console.
 * PROD: persists to `web_vitals_samples` via the `log-web-vitals` edge function (sendBeacon).
 */
export function reportWebVitals(onReport?: (metric: Metric) => void) {
  const sessionId = typeof window !== 'undefined' ? getSessionId() : 'ssr';

  const handler = (metric: Metric) => {
    if (onReport) {
      onReport(metric);
      return;
    }

    if (import.meta.env.DEV) {
      const label =
        metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      // eslint-disable-next-line no-console
      console.info(`${label} [${metric.name}] ${Math.round(metric.value)} (${metric.rating})`);
      return;
    }

    sendBeacon({
      route: normalizeRoute(window.location.pathname),
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      navigation_type: metric.navigationType ?? 'navigate',
      session_id: sessionId,
      viewport_width: window.innerWidth,
      connection_type: getConnectionType(),
    });
  };

  import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
    onCLS(handler);
    onINP(handler);
    onLCP(handler);
    onFCP(handler);
    onTTFB(handler);
  });
}
