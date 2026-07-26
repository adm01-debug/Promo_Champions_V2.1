import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { getCorsHeaders(req) } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { withEdgeCircuitBreaker, CircuitBreakerOpenError } from '../_shared/circuit-breaker.ts';

interface DispatchRequest {
  webhook_id?: string;
  event_type: string;
  payload: Record<string, unknown>;
}

// ─── SSRF Protection ────────────────────────────────────────────────────────
// Blocklist: nunca permitir IPs privados, loopback, ou metadata endpoints
const SSRF_BLOCKLIST_HOSTNAMES = new Set([
  'localhost', 'metadata', 'metadata.google.internal', '169.254.169.254',
  'metadata.google', 'azure.metadata.ubuntu.com',
]);
const SSRF_BLOCKLIST_PATTERNS = [
  /^127\./,           // 127.0.0.0/8
  /^10\./,            // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./,  // 172.16.0.0/12
  /^192\.168\./,      // 192.168.0.0/16
  /^0\./,             // 0.0.0.0/8
  /^224\./,           // 224.0.0.0/4
  /^::1$/,            // IPv6 loopback
  /^fe80:/i,         // IPv6 link-local
  /^fc00:/i,          // IPv6 ULA
];

function isUrlSafeForSSRF(url: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    // 1) Block hostname literals
    if (SSRF_BLOCKLIST_HOSTNAMES.has(host)) {
      return { safe: false, reason: `blocklisted hostname: ${host}` };
    }

    // 2) Block private IP patterns
    for (const pattern of SSRF_BLOCKLIST_PATTERNS) {
      if (pattern.test(host)) {
        return { safe: false, reason: `private/reserved IP range: ${host}` };
      }
    }

    // 3) Block non-HTTP(S) protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { safe: false, reason: `disallowed protocol: ${parsed.protocol}` };
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: 'malformed URL' };
  }
}

async function hmacSign(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(withRequestId('dispatch-webhook', async (req, _ctx) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: getCorsHeaders(req) });

  // Require authentication — this function triggers outbound HTTP requests and writes delivery records
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization header required' }), {
      status: 401,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
  const authClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { event_type, payload, webhook_id }: DispatchRequest = body;

    if (!event_type || !payload) {
      return new Response(JSON.stringify({ error: 'event_type and payload are required' }), {
        status: 400,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find matching webhooks
    let q = supabase.from('webhooks').select('id, url, headers, secret, failure_count').eq('is_active', true);
    if (webhook_id) q = q.eq('id', webhook_id);
    else q = q.contains('events', [event_type]);
    q = q.limit(100);

    const { data: webhooks, error } = await q;
    if (error) throw error;

    const results = [];
    const deliveryRows: Record<string, unknown>[] = [];
    const webhookUpdateOps: Array<Promise<unknown>> = [];
    const nowIso = new Date().toISOString();

    // Phase 1: sequential HTTP dispatch (each endpoint is independent but ordering is preserved)
    for (const wh of webhooks ?? []) {
      const start = Date.now();
      const body = JSON.stringify({
        event: event_type,
        data: payload,
        timestamp: nowIso,
      });
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event_type,
        ...((wh.headers as Record<string, string>) || {}),
      };
      if (wh.secret) headers['X-Webhook-Signature'] = await hmacSign(wh.secret, body);

      let status = 0,
        respBody = '',
        errMsg: string | null = null,
        success = false;
      try {
        await withEdgeCircuitBreaker(
          `webhook:${wh.id}`,
          async () => {
            // SSRF: validar URL antes de fazer request
            const ssrfCheck = isUrlSafeForSSRF(wh.url);
            if (!ssrfCheck.safe) {
              console.warn(`[dispatch-webhook] SSRF blocked: ${wh.url} — ${ssrfCheck.reason}`);
              throw new Error(`ssrf_blocked:${ssrfCheck.reason}`);
            }
            const r = await fetch(wh.url, {
              method: 'POST',
              headers,
              body,
              signal: AbortSignal.timeout(10000),
            });
            status = r.status;
            respBody = (await r.text()).slice(0, 1000);
            success = r.ok;
            if (!r.ok) throw new Error(`webhook_http_${r.status}`);
          },
          { failureThreshold: 5, resetTimeout: 30_000, timeoutMs: 10_000 },
        );
      } catch (e) {
        if (e instanceof CircuitBreakerOpenError) {
          errMsg = 'circuit_open';
          status = 0;
          success = false;
        } else if (!errMsg) {
          errMsg = e instanceof Error ? e.message : String(e);
        }
      }

      const duration = Date.now() - start;

      deliveryRows.push({
        webhook_id: wh.id,
        event_type,
        payload,
        response_status: status,
        response_body: respBody,
        error_message: errMsg,
        success,
        duration_ms: duration,
      });

      webhookUpdateOps.push(
        supabase
          .from('webhooks')
          .update({
            last_triggered_at: nowIso,
            ...(success
              ? { last_success_at: nowIso, failure_count: 0 }
              : {
                  last_failure_at: nowIso,
                  failure_count: ((wh as { failure_count?: number }).failure_count ?? 0) + 1,
                }),
          })
          .eq('id', wh.id)
      );

      results.push({ webhook_id: wh.id, success, status, duration });
    }

    // Phase 2: batch all DB writes in parallel
    await Promise.all([
      deliveryRows.length > 0
        ? supabase.from('webhook_deliveries').insert(deliveryRows)
        : Promise.resolve(),
      ...webhookUpdateOps,
    ]);

    return new Response(JSON.stringify({ dispatched: results.length, results }), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error("dispatch-webhook error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
}));
