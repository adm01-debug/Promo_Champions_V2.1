// Deal Risk Digest — daily 08:00 BRT cron.
// For each salesperson with active deals scoring < 50, insert ONE notification
// containing their top-5 at-risk deals. Idempotent: skips salespeople who
// already received today's digest (created_at::date = today, type = same).
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';

const DIGEST_TYPE = 'deal_risk_digest';
const HEALTH_THRESHOLD = 50;
const TOP_N = 5;

interface AtRiskDeal {
  sale_id: string;
  salesperson_id: string;
  health_score: number;
  amount: number | null;
  client_id: string | null;
}

Deno.serve(withRequestId('deal-risk-digest', async (req, _ctx) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

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
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 3. Map salesperson_id → user_id (auth uid) via salespeople table.
  const sellerIds = Array.from(bySeller.keys());
  const { data: sellers } = await admin
    .from('salespeople')
    .select('id, user_id, name')
    .in('id', sellerIds);

  const sellerMap = new Map<string, { user_id: string | null; name: string | null }>();
  for (const s of (sellers ?? []) as Array<{ id: string; user_id: string | null; name: string | null }>) {
    sellerMap.set(s.id, { user_id: s.user_id, name: s.name });
  }

  // 4. Idempotency guard — pull today's digests already sent.
  const todayIso = new Date().toISOString().slice(0, 10);
  const userIds = Array.from(sellerMap.values())
    .map((s) => s.user_id)
    .filter((u): u is string => !!u);

  const { data: existing } = await admin
    .from('notifications')
    .select('user_id')
    .eq('type', DIGEST_TYPE)
    .in('user_id', userIds)
    .gte('created_at', `${todayIso}T00:00:00Z`);

  const alreadySent = new Set((existing ?? []).map((r) => r.user_id));

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
      category: 'risk',
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
    const { error: insErr, count } = await admin
      .from('notifications')
      .insert(toInsert, { count: 'exact' });
    if (insErr) {
      console.error('[deal-risk-digest] insert failed', insErr);
      return new Response(JSON.stringify({ error: insErr.message, partial: true }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    inserted = count ?? toInsert.length;
  }

  const summary = {
    ok: true,
    salespeople_analyzed: bySeller.size,
    digests_created: inserted,
    skipped_idempotent: skipped,
    elapsed_ms: Date.now() - startedAt,
  };
  console.log('[deal-risk-digest]', JSON.stringify(summary));

  return new Response(JSON.stringify(summary), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}));
