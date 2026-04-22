import { createClient } from 'npm:@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeaderboardRow {
  car_id: string;
  salesperson_id: string;
  progress: number;
  total_overtakes?: number | null;
}

const CHECKPOINTS = [0.25, 0.5, 0.75];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authError } = await userClient.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json().catch(() => ({}));
    const sale_id: string | undefined = body.sale_id;

    // 1. season ativa
    const { data: season } = await supabase
      .from('race_seasons')
      .select('*')
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!season) {
      return new Response(JSON.stringify({ ok: true, skipped: 'no-active-season' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. snapshot leaderboard (antes)
    const { data: prevBoard } = await supabase
      .from('race_leaderboard_view')
      .select('car_id, salesperson_id, progress')
      .eq('season_id', season.id);

    // 3. detectar venda → salesperson
    let salespersonId: string | null = null;
    if (sale_id) {
      const { data: sale } = await supabase
        .from('sales')
        .select('salesperson_id, amount, created_at')
        .eq('id', sale_id)
        .maybeSingle();
      salespersonId = sale?.salesperson_id ?? null;

      if (salespersonId) {
        await supabase.from('race_events').insert({
          season_id: season.id,
          salesperson_id: salespersonId,
          event_type: 'boost',
          metadata: { sale_id, amount: sale?.amount },
        });
      }
    }

    // 4. snapshot atual (vendas já estão computadas pela view)
    const { data: currBoard } = await supabase
      .from('race_leaderboard_view')
      .select('car_id, salesperson_id, progress, total_overtakes')
      .eq('season_id', season.id);

    const events: Array<{ type: string; salesperson_id: string; metadata?: Record<string, unknown> }> = [];

    if (prevBoard && currBoard) {
      const prevSorted = [...(prevBoard as LeaderboardRow[])].sort((a, b) => Number(b.progress) - Number(a.progress));
      const currSorted = [...(currBoard as LeaderboardRow[])].sort((a, b) => Number(b.progress) - Number(a.progress));
      const prevRank = new Map(prevSorted.map((r, i) => [r.salesperson_id, i]));
      const currRank = new Map(currSorted.map((r, i) => [r.salesperson_id, i]));
      const prevProg = new Map(prevSorted.map((r) => [r.salesperson_id, Number(r.progress)]));

      // ultrapassagens
      for (const [id, newPos] of currRank) {
        const oldPos = prevRank.get(id);
        if (oldPos === undefined || newPos >= oldPos) continue;
        for (const [otherId, otherNew] of currRank) {
          if (otherId === id) continue;
          const otherOld = prevRank.get(otherId);
          if (otherOld !== undefined && otherOld < oldPos && otherNew > newPos) {
            events.push({ type: 'overtake', salesperson_id: id, metadata: { overtaken: otherId } });
          }
        }
      }

      // checkpoints + victory
      for (const row of currSorted) {
        const newP = Number(row.progress);
        const oldP = prevProg.get(row.salesperson_id) ?? 0;
        for (const cp of CHECKPOINTS) {
          if (oldP < cp && newP >= cp) {
            events.push({ type: 'checkpoint', salesperson_id: row.salesperson_id, metadata: { checkpoint: cp } });
          }
        }
        if (oldP < 1 && newP >= 1 && !season.winner_id) {
          events.push({ type: 'victory', salesperson_id: row.salesperson_id, metadata: { season_id: season.id } });
          await supabase.from('race_seasons').update({ winner_id: row.salesperson_id, status: 'finished' }).eq('id', season.id);
          await supabase.rpc('increment_race_car_wins', { _salesperson_id: row.salesperson_id }).catch(() => null);
          break;
        }
      }
    }

    // inserir eventos derivados
    if (events.length > 0) {
      await supabase.from('race_events').insert(
        events.map((e) => ({ season_id: season.id, salesperson_id: e.salesperson_id, event_type: e.type, metadata: e.metadata ?? {} }))
      );
    }

    // contagem de overtakes por carro (incremento)
    const overtakers = events.filter((e) => e.type === 'overtake').map((e) => e.salesperson_id);
    for (const id of overtakers) {
      await supabase.rpc('increment_race_car_overtakes', { _salesperson_id: id }).catch(() => null);
    }

    // ===== BADGES =====
    const grantBadge = async (sp: string, code: string) => {
      await supabase.from('race_badges').upsert(
        { salesperson_id: sp, badge_code: code, season_id: season.id },
        { onConflict: 'salesperson_id,badge_code,season_id', ignoreDuplicates: true }
      );
    };

    // velocista: 3 vendas em 1h
    if (salespersonId) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('sales')
        .select('id', { count: 'exact', head: true })
        .eq('salesperson_id', salespersonId)
        .gte('created_at', oneHourAgo);
      if ((count ?? 0) >= 3) await grantBadge(salespersonId, 'velocista');
    }

    // comeback_king: estava em último na season e agora está top 3
    if (salespersonId && prevBoard && currBoard) {
      const prevSorted = [...(prevBoard as LeaderboardRow[])].sort((a, b) => Number(b.progress) - Number(a.progress));
      const currSorted = [...(currBoard as LeaderboardRow[])].sort((a, b) => Number(b.progress) - Number(a.progress));
      const wasLast = prevSorted[prevSorted.length - 1]?.salesperson_id === salespersonId && prevSorted.length >= 4;
      const nowTop3 = currSorted.slice(0, 3).some((r) => r.salesperson_id === salespersonId);
      if (wasLast && nowTop3) await grantBadge(salespersonId, 'comeback_king');
    }

    // bandeira_quadriculada + drift_master nos eventos de victory/overtake
    for (const e of events) {
      if (e.type === 'victory') await grantBadge(e.salesperson_id, 'bandeira_quadriculada');
    }
    if (currBoard) {
      for (const row of currBoard as LeaderboardRow[]) {
        if ((row.total_overtakes ?? 0) >= 5) await grantBadge(row.salesperson_id, 'drift_master');
      }
    }

    return new Response(JSON.stringify({ ok: true, events_emitted: 1 + events.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('process-race-event error', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
