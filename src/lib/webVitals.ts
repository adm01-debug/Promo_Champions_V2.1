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

function sendBeacon(body: string): void {
  try {
    // sendBeacon precisa de Content-Type CORS-safelisted → Blob text/plain
    const blob = new Blob([body], { type: 'text/plain' });
    const queued = navigator.sendBeacon?.(`${ENDPOINT}?apikey=${SUPABASE_PUBLISHABLE_KEY}`, blob);
    if (queued) return;
  } catch {
    /* fall through to fetch */
  }
  void fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_PUBLISHABLE_KEY },
    body,
    keepalive: true,
  }).catch(() => {
    /* swallow — telemetry must never break UX */
  });
}

// Fila de amostras — 1 POST por sessão em vez de 1 por métrica (5x menos writes).
const queue: VitalsPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function flushQueue() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.length === 0) return;
  const batch = queue.splice(0, queue.length);
  sendBeacon(JSON.stringify({ samples: batch }));
}

function scheduleFlush() {
  if (flushTimer) return;
  // Safety flush caso a aba não dispare visibilitychange (ex.: SPA long-lived).
  flushTimer = setTimeout(flushQueue, 5000);
}

if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushQueue();
  });
  window.addEventListener('pagehide', flushQueue);
}

/**
 * Reports Core Web Vitals.
 * DEV: logs to console.
 * PROD: enfileira e envia em batch para `web_vitals_samples` via edge function.
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

    queue.push({
      route: normalizeRoute(window.location.pathname),
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      navigation_type: metric.navigationType ?? 'navigate',
      session_id: sessionId,
      viewport_width: window.innerWidth,
      connection_type: getConnectionType(),
    });
    scheduleFlush();
  };

  import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
    onCLS(handler);
    onINP(handler);
    onLCP(handler);
    onFCP(handler);
    onTTFB(handler);
  });
}

