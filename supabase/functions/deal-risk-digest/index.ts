// Deal Risk Digest — daily 08:00 BRT cron.
// For each salesperson with active deals scoring < 50, insert ONE notification
// containing their top-5 at-risk deals. Idempotent: skips salespeople who
// already received today's digest (created_at::date = today, type = same).
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { withEdgeCircuitBreaker, CircuitBreakerOpenError } from '../_shared/circuit-breaker.ts';
import { withRetry, RetryError } from '../_shared/retry.ts';
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";
import { partitionNotificationBatch } from "../_shared/notification-categories.ts";

const DIGEST_TYPE = 'deal_risk_digest';
const HEALTH_THRESHOLD = 50;
const TOP_N = 5;
const SLACK_CIRCUIT = 'slack:deal-risk-digest';

interface AtRiskDeal {
  sale_id: string;
  salesperson_id: string;
  health_score: number;
  amount: number | null;
  client_id: string | null;
}

interface SlackResult { attempted: boolean; ok: boolean; error?: string; circuit_open?: boolean }

async function postSlack(text: string, requestId?: string | null): Promise<SlackResult> {
  const url = Deno.env.get('SLACK_DIGEST_WEBHOOK_URL');
  if (!url) return { attempted: false, ok: false };
  try {
    await withEdgeCircuitBreaker(SLACK_CIRCUIT, async () => {
      await withRetry(async (_attempt, signal) => {
        const res = await fetchWithTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
          signal,
        });
        await res.text().catch(() => undefined);
        if (!res.ok) {
          if (res.status === 429 || res.status >= 500) throw res;
          throw new Error(`http_${res.status}`);
        }
      }, {
        maxAttempts: 3,
        baseDelayMs: 300,
        maxDelayMs: 3000,
        timeoutMs: 5_000,
        isRetryable: (err) => err instanceof Response
          ? (err.status === 429 || err.status >= 500)
          : ((err as { name?: string })?.name === 'AbortError' || (err as { name?: string })?.name === 'TypeError'),
        telemetry: {
          functionName: 'deal-risk-digest',
          operation: 'slack_post',
          requestId: requestId ?? null,
        },
      });
    }, { failureThreshold: 5, resetTimeout: 30_000, timeoutMs: 20_000 });
    return { attempted: true, ok: true };
  } catch (err) {
    if (err instanceof CircuitBreakerOpenError) {
      console.warn('[deal-risk-digest] slack circuit open, skipping fallback');
      return { attempted: false, ok: false, error: 'circuit_open', circuit_open: true };
    }
    if (err instanceof RetryError) {
      console.warn('[deal-risk-digest] slack retry exhausted', err.attempts);
      return { attempted: true, ok: false, error: `retry_exhausted:${err.attempts}` };
    }
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[deal-risk-digest] slack fallback failed', msg);
    return { attempted: true, ok: false, error: msg };
  }
}

Deno.serve(withRequestId('deal-risk-digest', async (req, ctx) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: getCorsHeaders(req) });

  const startedAt = Date.now();
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Pull all at-risk deals with owner (RLS bypassed via service role — required for cross-user cron).
  const { data: risky, error: riskyErr } = await admin
    .from('deal_health_scores')
    .select('sale_id, health_score, sales!inner(id, salesperson_id, amount, client_id, status)')
    .lt('health_score', HEALTH_THRESHOLD)
    .not('sales.salesperson_id', 'is', null)
    .not('sales.status', 'in', '(won,lost)')
    .order('health_score', { ascending: true })
    .limit(2000);

  if (riskyErr) {
    console.error('[deal-risk-digest] query failed', riskyErr);
    return new Response(JSON.stringify({ error: riskyErr.message }), {
      status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  // 2. Group by salesperson, keep top N by lowest score.
  const bySeller = new Map<string, AtRiskDeal[]>();
  for (const row of (risky ?? []) as Array<{
    sale_id: string;
    health_score: number;
    sales: { id: string; salesperson_id: string; amount: number | null; client_id: string | null };
  }>) {
    const sp = row.sales?.salesperson_id;
    if (!sp) continue;
    const arr = bySeller.get(sp) ?? [];
    if (arr.length < TOP_N) {
      arr.push({
        sale_id: row.sale_id,
        salesperson_id: sp,
        health_score: row.health_score,
        amount: row.sales.amount,
        client_id: row.sales.client_id,
      });
      bySeller.set(sp, arr);
    }
  }

  if (bySeller.size === 0) {
    return new Response(JSON.stringify({ ok: true, digests_created: 0, elapsed_ms: Date.now() - startedAt }), {
      status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }

  // 3. Map salesperson_id → user_id (auth uid) via salespeople table.
  const sellerIds = Array.from(bySeller.keys());
  const sellers = await chunkedIn<{ id: string; user_id: string | null; name: string | null }>(
    sellerIds,
    (chunk) => admin.from('salespeople').select('id, user_id, name').in('id', chunk),
    { parallel: true, label: 'deal-risk-digest.sellers' },
  );

  const sellerMap = new Map<string, { user_id: string | null; name: string | null }>();
  for (const s of sellers) {
    sellerMap.set(s.id, { user_id: s.user_id, name: s.name });
  }

  // 4. Idempotency guard — pull today's digests already sent.
  const todayIso = new Date().toISOString().slice(0, 10);
  const userIds = Array.from(sellerMap.values())
    .map((s) => s.user_id)
    .filter((u): u is string => !!u);

  const existing = await chunkedIn<{ user_id: string }>(
    userIds,
    (chunk) => admin
      .from('notifications')
      .select('user_id')
      .eq('type', DIGEST_TYPE)
      .in('user_id', chunk)
      .gte('created_at', `${todayIso}T00:00:00Z`),
    { parallel: true, label: 'deal-risk-digest.existing' },
  );

  const alreadySent = new Set(existing.map((r) => r.user_id));

  // 5. Build & insert notifications.
  const BRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  const toInsert: Array<Record<string, unknown>> = [];
  let skipped = 0;

  for (const [sellerId, deals] of bySeller.entries()) {
    const seller = sellerMap.get(sellerId);
    if (!seller?.user_id || alreadySent.has(seller.user_id)) {
      skipped += 1;
      continue;
    }
    const totalAmount = deals.reduce((sum, d) => sum + (d.amount ?? 0), 0);
    const avgScore = Math.round(deals.reduce((s, d) => s + d.health_score, 0) / deals.length);

    toInsert.push({
      user_id: seller.user_id,
      type: DIGEST_TYPE,
      category: 'sales',
      priority: 'high',
      title: `${deals.length} deals em risco — ${BRL(totalAmount)}`,
      message: `Health médio ${avgScore}/100. Revise agora para não perder receita.`,
      icon: 'alert-triangle',
      action_url: '/deal-health',
      action_label: 'Abrir Deal Health',
      metadata: {
        deal_ids: deals.map((d) => d.sale_id),
        total_amount: totalAmount,
        avg_health_score: avgScore,
        digest_date: todayIso,
      },
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  let inserted = 0;
  if (toInsert.length > 0) {
    const { valid, invalid } = partitionNotificationBatch(toInsert);
    if (invalid.length > 0) {
      console.warn('[deal-risk-digest] notifications_invalid', { count: invalid.length, samples: invalid.slice(0, 3).map(i => i.reason) });
    }
    if (valid.length > 0) {
      const { error: insErr, count } = await admin
        .from('notifications')
        .insert(valid, { count: 'exact' });
      if (insErr) {
        console.error('[deal-risk-digest] insert failed', insErr);
        await postSlack(
          `:rotating_light: *Deal Risk Digest falhou* — ${insErr.message}. requestId=${ctx.requestId}`,
          ctx.requestId,
        );
        return new Response(JSON.stringify({ error: insErr.message, partial: true }), {
          status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        });
      }
      inserted = count ?? valid.length;
    }
  }

  let slack: SlackResult = { attempted: false, ok: false };
  if (inserted > 0) {
    slack = await postSlack(
      `:bar_chart: *Deal Risk Digest* — ${inserted} vendedores notificados (${skipped} pulados por idempotência) em ${Date.now() - startedAt}ms.`,
      ctx.requestId,
    );
  }

  const summary = {
    ok: true,
    salespeople_analyzed: bySeller.size,
    digests_created: inserted,
    skipped_idempotent: skipped,
    elapsed_ms: Date.now() - startedAt,
    slack_attempted: slack.attempted,
    slack_ok: slack.ok,
    slack_error: slack.error ?? null,
  };
  ctx.log('info', 'digest_summary', summary);

  return new Response(JSON.stringify(summary), {
    status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}));
