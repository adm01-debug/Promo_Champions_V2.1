// Daily queue: auto-generates follow-up tasks for high-urgency clients
// Runs via cron every hour; only executes when local time >= configured cutoff and not already run today.
import { getCorsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';

const WON_STATUSES = ['won', 'closed_won', 'paid', 'delivered', 'completed'];

type Urgency = 'critical' | 'high' | 'medium' | 'low';

interface Settings {
  id: string;
  enabled: boolean;
  cutoff_time: string; // HH:MM:SS
  timezone: string;
  min_urgency: 'critical' | 'high' | 'medium';
  max_tasks_per_salesperson: number;
  last_run_date: string | null;
}

const URGENCY_RANK: Record<Urgency, number> = { critical: 4, high: 3, medium: 2, low: 1 };

function localDateAndTime(tz: string): { date: string; time: string } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}:${get('second')}`,
  };
}

function computeUrgency(daysSince: number, avgInterval: number): { urgency: Urgency; risk: number } {
  const ratio = avgInterval > 0 ? daysSince / avgInterval : daysSince / 30;
  const risk = Math.min(100, Math.round(ratio * 40 + Math.min(daysSince, 120) * 0.5));
  let urgency: Urgency = 'low';
  if (risk >= 70 || daysSince >= 90) urgency = 'critical';
  else if (risk >= 45 || daysSince >= 45) urgency = 'high';
  else if (risk >= 20 || daysSince >= 21) urgency = 'medium';
  return { urgency, risk };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const url = new URL(req.url);
    const force = url.searchParams.get('force') === '1';

    const { data: settings, error: sErr } = await supabase
      .from('auto_task_queue_settings')
      .select('*')
      .eq('singleton', true)
      .maybeSingle<Settings>();
    if (sErr) throw sErr;
    if (!settings) return json({ skipped: 'no-settings' });
    if (!settings.enabled && !force) return json({ skipped: 'disabled' });

    const { date: today, time: nowLocal } = localDateAndTime(settings.timezone);
    if (!force) {
      if (settings.last_run_date === today) return json({ skipped: 'already-ran', today });
      if (nowLocal < settings.cutoff_time) return json({ skipped: 'before-cutoff', nowLocal, cutoff: settings.cutoff_time });
    }

    const minRank = URGENCY_RANK[settings.min_urgency];

    // Load active salespeople
    const { data: sellers, error: spErr } = await supabase
      .from('salespeople')
      .select('id')
      .eq('is_active', true);
    if (spErr) throw spErr;

    let totalCreated = 0;
    const perSeller: Record<string, number> = {};

    for (const seller of sellers ?? []) {
      const salespersonId = seller.id as string;

      const { data: sales, error: salesErr } = await supabase
        .from('sales')
        .select('client_id, client_name, amount, created_at, status')
        .or(`salesperson_id.eq.${salespersonId},sdr_id.eq.${salespersonId},closer_id.eq.${salespersonId}`)
        .in('status', WON_STATUSES)
        .order('created_at', { ascending: true });
      if (salesErr) { console.error(salesErr); continue; }

      const grouped = new Map<string, { clientId: string | null; clientName: string; dates: Date[]; total: number }>();
      for (const s of sales ?? []) {
        const key = (s.client_id as string | null) || `name:${s.client_name}`;
        if (!key) continue;
        const g = grouped.get(key) ?? { clientId: (s.client_id as string | null) ?? null, clientName: s.client_name as string, dates: [], total: 0 };
        g.dates.push(new Date(s.created_at as string));
        g.total += Number(s.amount || 0);
        grouped.set(key, g);
      }

      const nowMs = Date.now();
      const candidates = Array.from(grouped.values())
        .map((g) => {
          const last = g.dates[g.dates.length - 1];
          const daysSince = Math.floor((nowMs - last.getTime()) / 86400000);
          let avg = 30;
          if (g.dates.length >= 2) {
            const intervals: number[] = [];
            for (let i = 1; i < g.dates.length; i++) {
              intervals.push((g.dates[i].getTime() - g.dates[i - 1].getTime()) / 86400000);
            }
            avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          }
          const { urgency, risk } = computeUrgency(daysSince, avg);
          return { ...g, daysSince, urgency, risk };
        })
        .filter((c) => URGENCY_RANK[c.urgency] >= minRank && c.clientId)
        .sort((a, b) => b.risk - a.risk)
        .slice(0, settings.max_tasks_per_salesperson);

      for (const c of candidates) {
        // Idempotency: skip if a follow_up task already exists today for this client+seller
        const { count } = await supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('salesperson_id', salespersonId)
          .eq('client_id', c.clientId)
          .eq('task_type', 'follow_up')
          .eq('due_date', today);
        if ((count ?? 0) > 0) continue;

        const priority = c.urgency === 'critical' ? 'urgent' : c.urgency === 'high' ? 'high' : 'medium';
        const { error: insErr } = await supabase.from('tasks').insert({
          title: `Retomar contato: ${c.clientName}`,
          description: `Cliente sem compra há ${c.daysSince} dias (risco ${c.risk}). Ação sugerida pela fila diária automática.`,
          salesperson_id: salespersonId,
          client_id: c.clientId,
          task_type: 'follow_up',
          priority,
          status: 'pending',
          due_date: today,
        });
        if (insErr) { console.error('insert task', insErr); continue; }
        totalCreated++;
        perSeller[salespersonId] = (perSeller[salespersonId] ?? 0) + 1;
      }
    }

    await supabase
      .from('auto_task_queue_settings')
      .update({ last_run_date: today, last_run_created_count: totalCreated })
      .eq('id', settings.id);

    return json({ ok: true, created: totalCreated, sellers: Object.keys(perSeller).length, date: today });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}
