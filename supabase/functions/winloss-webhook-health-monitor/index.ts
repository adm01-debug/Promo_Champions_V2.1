import { getCorsHeaders(req) } from '../_shared/cors.ts';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.49.4';
import { withRequestId } from '../_shared/request-id.ts';
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";

type LogLevel = 'info' | 'warn' | 'error';
type AlertKind = 'consecutive_failures' | 'high_retry_rate' | 'attempts_exhausted';

// Defaults — used when DB row is missing or a column is null. Env vars stay
// supported as a final fallback to avoid breaking existing deployments.
interface AlertSettings {
  consecutive_failures: number;
  retry_rate_threshold: number;
  window_minutes: number;
  min_deliveries: number;
  suppress_minutes: number;
  max_attempts: number;
}

const DEFAULT_SETTINGS: AlertSettings = {
  consecutive_failures: Number(Deno.env.get('ALERT_CONSECUTIVE_FAILURES') ?? 5),
  retry_rate_threshold: Number(Deno.env.get('ALERT_RETRY_RATE_THRESHOLD') ?? 0.5),
  window_minutes: Number(Deno.env.get('ALERT_WINDOW_MINUTES') ?? 30),
  min_deliveries: Number(Deno.env.get('ALERT_MIN_DELIVERIES') ?? 10),
  suppress_minutes: Number(Deno.env.get('ALERT_SUPPRESS_MINUTES') ?? 60),
  max_attempts: Number(Deno.env.get('ALERT_MAX_ATTEMPTS') ?? 3),
};

async function loadSettings(
  supabase: SupabaseClient,
  requestId: string
): Promise<AlertSettings> {
  try {
    const { data, error } = await supabase
      .from('winloss_alert_settings')
      .select(
        'consecutive_failures, retry_rate_threshold, window_minutes, min_deliveries, suppress_minutes, max_attempts'
      )
      .eq('singleton', true)
      .maybeSingle();
    if (error) {
      structuredLog(
        'warn',
        { msg: 'settings_load_failed', error: error.message },
        requestId
      );
      return DEFAULT_SETTINGS;
    }
    if (!data) return DEFAULT_SETTINGS;
    return {
      consecutive_failures: Number(
        data.consecutive_failures ?? DEFAULT_SETTINGS.consecutive_failures
      ),
      retry_rate_threshold: Number(
        data.retry_rate_threshold ?? DEFAULT_SETTINGS.retry_rate_threshold
      ),
      window_minutes: Number(data.window_minutes ?? DEFAULT_SETTINGS.window_minutes),
      min_deliveries: Number(data.min_deliveries ?? DEFAULT_SETTINGS.min_deliveries),
      suppress_minutes: Number(
        data.suppress_minutes ?? DEFAULT_SETTINGS.suppress_minutes
      ),
      max_attempts: Number(data.max_attempts ?? DEFAULT_SETTINGS.max_attempts),
    };
  } catch (e) {
    structuredLog(
      'warn',
      { msg: 'settings_load_exception', ...describeError(e) },
      requestId
    );
    return DEFAULT_SETTINGS;
  }
}

function describeError(e: unknown): {
  error_name: string;
  error: string;
  error_stack: string | null;
} {
  if (e instanceof Error) {
    return {
      error_name: e.name || 'Error',
      error: e.message || String(e),
      error_stack: e.stack ? e.stack.slice(0, 4000) : null,
    };
  }
  return { error_name: 'UnknownError', error: String(e), error_stack: null };
}

function structuredLog(
  level: LogLevel,
  data: Record<string, unknown>,
  requestId?: string
) {
  const line = JSON.stringify({
    fn: 'winloss-webhook-health-monitor',
    level,
    ts: new Date().toISOString(),
    requestId,
    ...data,
  });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

interface DeliveryRow {
  attempt: number;
  succeeded: boolean;
  status: number;
  error_message: string | null;
  created_at: string;
  request_id: string | null;
  event: string | null;
}

interface SubscriptionRow {
  id: string;
  url: string;
}

interface EvaluationResult {
  subscriptionId: string;
  url: string;
  total: number;
  failed: number;
  retries: number;
  retryRate: number;
  consecutiveFailures: number;
  fired: AlertKind[];
  suppressed: AlertKind[];
}

function evaluate(
  rows: DeliveryRow[],
  settings: AlertSettings
): {
  total: number;
  failed: number;
  retries: number;
  retryRate: number;
  consecutiveFailures: number;
  triggers: Array<{ kind: AlertKind; details: Record<string, unknown> }>;
} {
  const total = rows.length;
  const failed = rows.filter(r => !r.succeeded).length;
  const retries = rows.filter(r => r.attempt > 1).length;
  const retryRate = total === 0 ? 0 : retries / total;

  // Consecutive failures: rows are ordered DESC by created_at; count head streak of !succeeded
  let consecutiveFailures = 0;
  for (const r of rows) {
    if (!r.succeeded) consecutiveFailures += 1;
    else break;
  }

  const triggers: Array<{ kind: AlertKind; details: Record<string, unknown> }> = [];

  if (consecutiveFailures >= settings.consecutive_failures) {
    const last = rows[0];
    triggers.push({
      kind: 'consecutive_failures',
      details: {
        consecutive_failures: consecutiveFailures,
        threshold: settings.consecutive_failures,
        last_status: last?.status ?? null,
        last_error: last?.error_message ?? null,
      },
    });
  }

  if (total >= settings.min_deliveries && retryRate > settings.retry_rate_threshold) {
    triggers.push({
      kind: 'high_retry_rate',
      details: {
        retry_rate: Number(retryRate.toFixed(3)),
        threshold: settings.retry_rate_threshold,
        retries,
        total,
        window_minutes: settings.window_minutes,
      },
    });
  }

  // Attempts exhausted: any request_id where all max_attempts attempts failed.
  const byRequest = new Map<string, DeliveryRow[]>();
  for (const r of rows) {
    if (!r.request_id) continue;
    const arr = byRequest.get(r.request_id) ?? [];
    arr.push(r);
    byRequest.set(r.request_id, arr);
  }
  for (const [reqId, attempts] of byRequest) {
    if (attempts.length < settings.max_attempts) continue;
    if (attempts.some(a => a.succeeded)) continue;
    const last = attempts[0];
    triggers.push({
      kind: 'attempts_exhausted',
      details: {
        request_id: reqId,
        attempts: attempts.length,
        max_attempts: settings.max_attempts,
        event: last?.event ?? null,
        last_status: last?.status ?? null,
        last_error: last?.error_message ?? null,
        window_minutes: settings.window_minutes,
      },
    });
  }

  return { total, failed, retries, retryRate, consecutiveFailures, triggers };
}

async function sendAlertEmail(
  url: string,
  subscriptionId: string,
  triggers: Array<{ kind: AlertKind; details: Record<string, unknown> }>,
  requestId: string
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL');
  if (!apiKey || !adminEmail) {
    structuredLog(
      'info',
      { msg: 'email_skipped', subscriptionId, reason: 'missing_env' },
      requestId
    );
    return { sent: false, reason: 'missing_env' };
  }

  const items = triggers
    .map(
      t =>
        `<li><strong>${t.kind}</strong>: <code>${JSON.stringify(t.details)}</code></li>`
    )
    .join('');
  const html = `
    <h2>⚠️ Webhook degradado</h2>
    <p>Assinatura <code>${subscriptionId}</code> (<a href="${url}">${url}</a>) disparou alerta(s):</p>
    <ul>${items}</ul>
    <p>Investigue no painel Win/Loss Intelligence → Webhooks.</p>
  `;

  try {
    const r = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Win/Loss Webhooks <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `Webhook degradado: ${triggers.map(t => t.kind).join(', ')}`,
        html,
      }),
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      structuredLog(
        'error',
        {
          msg: 'email_failed',
          subscriptionId,
          status: r.status,
          body: text.slice(0, 500),
        },
        requestId
      );
      return { sent: false, reason: `resend_${r.status}` };
    }
    return { sent: true };
  } catch (e) {
    structuredLog(
      'error',
      { msg: 'email_failed', subscriptionId, ...describeError(e) },
      requestId
    );
    return { sent: false, reason: 'exception' };
  }
}

Deno.serve(withRequestId('winloss-webhook-health-monitor', async (req, _ctx) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: getCorsHeaders(req) });

  const requestId = crypto.randomUUID();
  const requestStart = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const settings = await loadSettings(supabase, requestId);

    structuredLog(
      'info',
      {
        msg: 'monitor_start',
        consecutive_threshold: settings.consecutive_failures,
        retry_rate_threshold: settings.retry_rate_threshold,
        window_minutes: settings.window_minutes,
        min_deliveries: settings.min_deliveries,
        suppress_minutes: settings.suppress_minutes,
        max_attempts: settings.max_attempts,
      },
      requestId
    );

    const { data: subs, error: subsError } = await supabase
      .from('winloss_webhook_subscriptions')
      .select('id, url')
      .eq('active', true)
      .limit(200);

    if (subsError) {
      structuredLog(
        'error',
        { msg: 'fetch_subscriptions_failed', error: subsError.message },
        requestId
      );
      throw subsError;
    }

    const subscriptions = (subs as SubscriptionRow[] | null) ?? [];
    const sinceIso = new Date(
      Date.now() - settings.window_minutes * 60_000
    ).toISOString();
    const suppressIso = new Date(
      Date.now() - settings.suppress_minutes * 60_000
    ).toISOString();

    const evaluations: EvaluationResult[] = [];
    let firedCount = 0;
    let suppressedCount = 0;

    if (subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ requestId, checked: 0, fired: 0, suppressed: 0, evaluations: [] }),
        { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json', 'X-Request-Id': requestId } }
      );
    }

    const subIds = subscriptions.map(s => s.id);

    // Pre-fetch ALL deliveries and recent alerts for every subscription in parallel —
    // eliminates 2 per-subscription DB round-trips inside the loop.
    const [deliveriesData, recentAlertsData] = await Promise.all([
      chunkedIn<{ subscription_id: string; attempt: number; succeeded: boolean; status: string; error_message: string | null; created_at: string; request_id: string | null; event: string }>(
        subIds,
        (chunk) => supabase
          .from('winloss_webhook_deliveries')
          .select('subscription_id, attempt, succeeded, status, error_message, created_at, request_id, event')
          .in('subscription_id', chunk)
          .gte('created_at', sinceIso)
          .order('created_at', { ascending: false })
          .limit(5000),
        { parallel: true, label: 'winloss-health.deliveries' },
      ),
      chunkedIn<{ subscription_id: string; kind: string; details: unknown; fired_at: string }>(
        subIds,
        (chunk) => supabase
          .from('winloss_webhook_alerts')
          .select('subscription_id, kind, details, fired_at')
          .in('subscription_id', chunk)
          .gte('fired_at', suppressIso)
          .limit(1000),
        { parallel: true, label: 'winloss-health.recent-alerts' },
      ),
    ]);

    // Group deliveries by subscription_id — already DESC ordered globally so
    // each per-sub slice is also DESC, which evaluate() requires.
    type DeliveryRowWithSubId = DeliveryRow & { subscription_id: string };
    const deliveriesBySubId = new Map<string, DeliveryRow[]>();
    for (const row of deliveriesData as DeliveryRowWithSubId[]) {
      const arr = deliveriesBySubId.get(row.subscription_id) ?? [];
      arr.push(row);
      deliveriesBySubId.set(row.subscription_id, arr);
    }

    // Group recent alerts by subscription_id
    type RecentAlertRow = { subscription_id: string; kind: string; details: Record<string, unknown> | null };
    const recentAlertsBySubId = new Map<string, Array<{ kind: string; details: Record<string, unknown> | null }>>();
    for (const row of recentAlertsData as RecentAlertRow[]) {
      const arr = recentAlertsBySubId.get(row.subscription_id) ?? [];
      arr.push({ kind: row.kind, details: row.details });
      recentAlertsBySubId.set(row.subscription_id, arr);
    }

    // Collect all alert insert rows to batch after the evaluation loop
    const alertInsertRows: Array<Record<string, unknown>> = [];
    // Track which subscriptions need email alerts (fired triggers only)
    const emailQueue: Array<{ sub: SubscriptionRow; firedTriggers: Array<{ kind: AlertKind; details: Record<string, unknown> }> }> = [];

    for (const sub of subscriptions) {
      const deliveries = deliveriesBySubId.get(sub.id) ?? [];
      const result = evaluate(deliveries, settings);

      const evalEntry: EvaluationResult = {
        subscriptionId: sub.id,
        url: sub.url,
        total: result.total,
        failed: result.failed,
        retries: result.retries,
        retryRate: result.retryRate,
        consecutiveFailures: result.consecutiveFailures,
        fired: [],
        suppressed: [],
      };

      structuredLog(
        'info',
        {
          msg: 'subscription_evaluated',
          subscriptionId: sub.id,
          total: result.total,
          failed: result.failed,
          retries: result.retries,
          retry_rate: Number(result.retryRate.toFixed(3)),
          consecutive_failures: result.consecutiveFailures,
          triggers: result.triggers.map(t => t.kind),
        },
        requestId
      );

      if (result.triggers.length === 0) {
        evaluations.push(evalEntry);
        continue;
      }

      // Anti-spam: use pre-fetched recent alerts (no DB call here)
      const recentRows = recentAlertsBySubId.get(sub.id) ?? [];
      const recentKinds = new Set(recentRows.map(r => r.kind));
      const recentExhaustedRequestIds = new Set(
        recentRows
          .filter(r => r.kind === 'attempts_exhausted')
          .map(r =>
            r.details && typeof r.details === 'object'
              ? (r.details as Record<string, unknown>).request_id
              : null
          )
          .filter((v): v is string => typeof v === 'string')
      );

      for (const trigger of result.triggers) {
        const triggerRequestId =
          trigger.kind === 'attempts_exhausted'
            ? (trigger.details.request_id as string | undefined)
            : undefined;

        const isSuppressed =
          trigger.kind === 'attempts_exhausted'
            ? !!triggerRequestId && recentExhaustedRequestIds.has(triggerRequestId)
            : recentKinds.has(trigger.kind);

        if (isSuppressed) {
          structuredLog(
            'info',
            {
              msg: 'alert_suppressed',
              subscriptionId: sub.id,
              kind: trigger.kind,
              triggerRequestId,
              suppress_minutes: settings.suppress_minutes,
            },
            requestId
          );

          const suppressedRequestId =
            trigger.kind === 'attempts_exhausted' && triggerRequestId
              ? triggerRequestId
              : requestId;
          const reason =
            trigger.kind === 'attempts_exhausted'
              ? 'duplicate_request_within_suppress_window'
              : 'duplicate_kind_within_suppress_window';

          alertInsertRows.push({
            subscription_id: sub.id,
            kind: trigger.kind,
            request_id: suppressedRequestId,
            suppressed: true,
            suppress_reason: reason,
            details: {
              ...trigger.details,
              subscription_id: sub.id,
              request_id: suppressedRequestId,
              monitor_request_id: requestId,
              suppressed: true,
              suppress_reason: reason,
              suppress_minutes: settings.suppress_minutes,
            },
          });

          evalEntry.suppressed.push(trigger.kind);
          suppressedCount += 1;
          continue;
        }

        const persistRequestId =
          trigger.kind === 'attempts_exhausted' && triggerRequestId
            ? triggerRequestId
            : requestId;

        alertInsertRows.push({
          subscription_id: sub.id,
          kind: trigger.kind,
          request_id: persistRequestId,
          details: {
            ...trigger.details,
            subscription_id: sub.id,
            request_id: persistRequestId,
            monitor_request_id: requestId,
          },
        });

        structuredLog(
          'warn',
          {
            msg: 'alert_fired',
            subscriptionId: sub.id,
            kind: trigger.kind,
            alert_request_id: persistRequestId,
            details: trigger.details,
          },
          requestId
        );

        evalEntry.fired.push(trigger.kind);
        firedCount += 1;
      }

      if (evalEntry.fired.length > 0) {
        emailQueue.push({
          sub,
          firedTriggers: result.triggers.filter(t => evalEntry.fired.includes(t.kind)),
        });
      }

      evaluations.push(evalEntry);
    }

    // Phase 2: batch insert all alert rows, then send emails sequentially
    if (alertInsertRows.length > 0) {
      const { error: batchInsertErr } = await supabase
        .from('winloss_webhook_alerts')
        .insert(alertInsertRows);
      if (batchInsertErr) {
        structuredLog('warn', { msg: 'alert_batch_insert_failed', error: batchInsertErr.message }, requestId);
      }
    }

    for (const { sub, firedTriggers } of emailQueue) {
      await sendAlertEmail(sub.url, sub.id, firedTriggers, requestId);
    }

    const totalLatency = Date.now() - requestStart;

    structuredLog(
      firedCount > 0 ? 'warn' : 'info',
      {
        msg: 'monitor_complete',
        checked: subscriptions.length,
        fired: firedCount,
        suppressed: suppressedCount,
        latency_ms: totalLatency,
      },
      requestId
    );

    return new Response(
      JSON.stringify({
        requestId,
        checked: subscriptions.length,
        fired: firedCount,
        suppressed: suppressedCount,
        evaluations,
      }),
      {
        headers: {
          ...getCorsHeaders(req),
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
        },
      }
    );
  } catch (e) {
    structuredLog(
      'error',
      {
        msg: 'monitor_fatal',
        ...describeError(e),
        latency_ms: Date.now() - requestStart,
      },
      requestId
    );
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'unknown', requestId }),
      {
        status: 500,
        headers: {
          ...getCorsHeaders(req),
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
        },
      }
    );
  }
}));
