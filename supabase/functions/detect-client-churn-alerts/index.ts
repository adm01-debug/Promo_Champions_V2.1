// Detects clients that crossed the churn threshold and creates notifications
// for the responsible salesperson. Idempotent within cooldown window.
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

type Level = 'low' | 'medium' | 'high' | 'critical';
const LEVEL_RANK: Record<Level, number> = { low: 0, medium: 1, high: 2, critical: 3 };
const RATIO_THRESHOLDS: Record<Exclude<Level, 'low'>, number> = { medium: 1.3, high: 2, critical: 3 };
const ABSOLUTE_THRESHOLDS: Record<Exclude<Level, 'low'>, number> = { medium: 30, high: 60, critical: 120 };

interface AlertRow {
  salesperson_id: string;
  client_name: string;
  days_since: number;
  level: Level;
  expected_interval_days: number;
  threshold_days: number;
}

function dayDiff(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86400000);
}

function computeLevel(daysSince: number, expectedInterval: number | null): Level {
  if (!expectedInterval || expectedInterval <= 0) {
    if (daysSince >= ABSOLUTE_THRESHOLDS.critical) return 'critical';
    if (daysSince >= ABSOLUTE_THRESHOLDS.high) return 'high';
    if (daysSince >= ABSOLUTE_THRESHOLDS.medium) return 'medium';
    return 'low';
  }
  const ratio = daysSince / expectedInterval;
  if (ratio >= RATIO_THRESHOLDS.critical) return 'critical';
  if (ratio >= RATIO_THRESHOLDS.high) return 'high';
  if (ratio >= RATIO_THRESHOLDS.medium) return 'medium';
  return 'low';
}

function thresholdDaysFor(level: Level, expectedInterval: number | null): number {
  if (level === 'low') return 0;
  if (expectedInterval && expectedInterval > 0) {
    return Math.round(expectedInterval * RATIO_THRESHOLDS[level]);
  }
  return ABSOLUTE_THRESHOLDS[level];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: settings } = await supabase
      .from('churn_alert_settings')
      .select('enabled, min_level, cooldown_hours, auto_task_enabled, auto_task_min_level, auto_task_cooldown_hours, auto_task_priority, auto_task_due_in_days')
      .maybeSingle();

    if (!settings?.enabled) {
      return new Response(JSON.stringify({ ok: true, skipped: 'disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const minLevel = (settings.min_level ?? 'high') as Level;
    const cooldownMs = (settings.cooldown_hours ?? 24) * 3600 * 1000;
    const autoTaskEnabled = Boolean(settings.auto_task_enabled);
    const autoTaskMinLevel = (settings.auto_task_min_level ?? 'high') as Level;
    const autoTaskCooldownMs = (settings.auto_task_cooldown_hours ?? 48) * 3600 * 1000;
    const autoTaskPriority = (settings.auto_task_priority ?? 'high') as 'low' | 'medium' | 'high' | 'urgent';
    const autoTaskDueInDays = Math.max(0, Number(settings.auto_task_due_in_days ?? 1));

    // Pull recent sales (limit to last 3 years to keep memory bounded)
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 3);
    const { data: sales, error } = await supabase
      .from('sales')
      .select('salesperson_id, client_name, created_at, status')
      .gte('created_at', cutoff.toISOString())
      .not('salesperson_id', 'is', null)
      .not('client_name', 'is', null);
    if (error) throw error;

    const now = new Date();
    // Group by salesperson + client
    const groups = new Map<string, { salesperson_id: string; client_name: string; dates: Date[] }>();
    for (const s of sales ?? []) {
      if (!s.client_name || !s.salesperson_id) continue;
      if (s.status && String(s.status).toLowerCase().includes('cancel')) continue;
      const key = `${s.salesperson_id}::${s.client_name.trim().toLowerCase()}`;
      const existing = groups.get(key);
      const d = new Date(s.created_at);
      if (existing) existing.dates.push(d);
      else groups.set(key, { salesperson_id: s.salesperson_id, client_name: s.client_name, dates: [d] });
    }

    const alerts: AlertRow[] = [];
    for (const g of groups.values()) {
      g.dates.sort((a, b) => a.getTime() - b.getTime());
      const last = g.dates[g.dates.length - 1];
      const daysSince = dayDiff(last, now);
      let expected: number | null = null;
      if (g.dates.length >= 2) {
        const intervals: number[] = [];
        for (let i = 1; i < g.dates.length; i++) intervals.push(dayDiff(g.dates[i - 1], g.dates[i]));
        expected = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      }
      const level = computeLevel(daysSince, expected);
      if (LEVEL_RANK[level] >= LEVEL_RANK[minLevel]) {
        alerts.push({
          salesperson_id: g.salesperson_id,
          client_name: g.client_name,
          days_since: daysSince,
          level,
          expected_interval_days: Math.round(expected ?? 0),
          threshold_days: thresholdDaysFor(level, expected),
        });
      }
    }

    // Load current state
    const { data: state } = await supabase
      .from('client_churn_alerts_state')
      .select('salesperson_id, client_name, last_level, last_alerted_at');
    const stateMap = new Map<string, { level: Level; at: number }>();
    for (const r of state ?? []) {
      stateMap.set(`${r.salesperson_id}::${r.client_name.trim().toLowerCase()}`, {
        level: r.last_level as Level,
        at: new Date(r.last_alerted_at).getTime(),
      });
    }

    let created = 0;
    let skipped = 0;
    const upserts: Array<{
      salesperson_id: string;
      client_name: string;
      last_level: Level;
      last_days_since: number;
      last_expected_interval_days: number | null;
      last_threshold_days: number | null;
      last_alerted_at: string;
      updated_at: string;
    }> = [];

    for (const a of alerts) {
      const key = `${a.salesperson_id}::${a.client_name.trim().toLowerCase()}`;
      const prev = stateMap.get(key);
      const escalated = !prev || LEVEL_RANK[a.level] > LEVEL_RANK[prev.level];
      const cooldownExpired = !prev || now.getTime() - prev.at > cooldownMs;
      if (!escalated && !cooldownExpired) {
        skipped++;
        continue;
      }

      const priority = a.level === 'critical' ? 'urgent' : a.level === 'high' ? 'high' : 'medium';
      const title = a.level === 'critical'
        ? `🚨 Cliente em risco crítico de churn`
        : a.level === 'high'
        ? `⚠️ Cliente com alto risco de churn`
        : `Cliente inativo`;
      const avgPart = a.expected_interval_days > 0
        ? ` · média do cliente: ${a.expected_interval_days}d`
        : '';
      const limitPart = a.threshold_days > 0
        ? ` · limite ${a.level}: ${a.threshold_days}d`
        : '';
      const message = `${a.client_name} está há ${a.days_since} dias sem comprar${avgPart}${limitPart}.`;

      const { error: insErr } = await supabase.from('notifications').insert({
        user_id: a.salesperson_id,
        type: 'churn_alert',
        category: 'client',
        priority,
        title,
        message,
        icon: '⏰',
        action_url: `/clientes?search=${encodeURIComponent(a.client_name)}`,
        action_label: 'Ver cliente',
        metadata: {
          client_name: a.client_name,
          days_since: a.days_since,
          level: a.level,
          expected_interval_days: a.expected_interval_days,
          threshold_days: a.threshold_days,
        },
        expires_at: new Date(now.getTime() + 7 * 86400000).toISOString(),
      });
      if (insErr) {
        console.error('notification insert failed', insErr);
        continue;
      }
      created++;
      upserts.push({
        salesperson_id: a.salesperson_id,
        client_name: a.client_name,
        last_level: a.level,
        last_days_since: a.days_since,
        last_expected_interval_days: a.expected_interval_days || null,
        last_threshold_days: a.threshold_days || null,
        last_alerted_at: now.toISOString(),
        updated_at: now.toISOString(),
      });
    }

    if (upserts.length > 0) {
      const { error: upErr } = await supabase
        .from('client_churn_alerts_state')
        .upsert(upserts, { onConflict: 'salesperson_id,client_name' });
      if (upErr) console.error('state upsert failed', upErr);
    }

    return new Response(
      JSON.stringify({ ok: true, evaluated: alerts.length, created, skipped }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('detect-client-churn-alerts error', e);
    return new Response(JSON.stringify({ ok: false, error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
