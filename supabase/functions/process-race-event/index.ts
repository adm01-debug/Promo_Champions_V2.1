import { getCorsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { withRequestId } from '../_shared/request-id.ts';
import { getUserClient, UnauthorizedError } from '../_shared/auth-client.ts';
import { isAuthorizedCronJob } from '../_shared/cron-job-auth.ts';
import { collectErrors, validateUUID, validationErrorResponse } from '../_shared/validation.ts';

interface LeaderboardRow {
  car_id: string;
  salesperson_id: string;
  progress: number;
  total_sales?: number | null;
  total_overtakes?: number | null;
}

const CHECKPOINTS = [0.25, 0.5, 0.75];
const DERIVED_EVENT_TYPES = ['overtake', 'checkpoint', 'victory'];

Deno.serve(withRequestId('process-race-event', async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Job interno (trigger de sales via pg_net / pg_cron) OU usuário autenticado.
    if (!(await isAuthorizedCronJob(req, supabase))) {
      try {
        await getUserClient(req);
      } catch (authErr) {
        const msg = authErr instanceof UnauthorizedError ? (authErr as UnauthorizedError).message : 'Unauthorized';
        return new Response(JSON.stringify({ error: msg }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const body = await req.json().catch(() => ({}));

    const payloadErrors = collectErrors([
      validateUUID(body?.sale_id, 'sale_id'),
    ]);
    if (payloadErrors.length) return validationErrorResponse(payloadErrors, corsHeaders);

    const sale_id: string | undefined = body.sale_id;

    // 1. season ativa (goal e datas alimentam o cálculo do diff)
    const { data: season } = await supabase
      .from('race_seasons')
      .select('id, winner_id, goal_amount, start_date, end_date')
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!season) {
      return new Response(JSON.stringify({ ok: true, skipped: 'no-active-season' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. venda → salesperson (antes dos snapshots; a venda já está gravada)
    let salespersonId: string | null = null;
    let saleAmount = 0;
    let saleCounted = false;
    if (sale_id) {
      const { data: sale } = await supabase
        .from('sales')
        .select('salesperson_id, amount, status, created_at')
        .eq('id', sale_id)
        .maybeSingle();
      salespersonId = sale?.salesperson_id ?? null;
      saleAmount = Number(sale?.amount ?? 0);

      // A view só soma vendas 'completed' dentro do período da season.
      const saleDay = String(sale?.created_at ?? '').slice(0, 10);
      saleCounted = !!sale && sale.status === 'completed'
        && saleDay >= String(season.start_date) && saleDay <= String(season.end_date);
    }

    // 3. evento 'boost' da venda — idempotente por sale_id (o trigger de
    //    sales e a UI podem disparar a mesma venda mais de uma vez).
    let boostInserted = false;
    if (sale_id && salespersonId) {
      const { data: priorBoost } = await supabase
        .from('race_events')
        .select('id')
        .eq('season_id', season.id)
        .eq('salesperson_id', salespersonId)
        .eq('event_type', 'boost')
        .eq('metadata->>sale_id', sale_id)
        .limit(1);

      if (!priorBoost?.length) {
        await supabase.from('race_events').insert({
          season_id: season.id,
          salesperson_id: salespersonId,
          event_type: 'boost',
          metadata: { sale_id, amount: saleAmount },
        });
        boostInserted = true;
      }
    }

    // 4. snapshot atual (a venda já está computada pela view)
    const { data: currBoard } = await supabase
      .from('race_leaderboard_view')
      .select('car_id, salesperson_id, progress, total_sales, total_overtakes')
      .eq('season_id', season.id);

    // 5. placar anterior = placar atual menos a contribuição desta venda.
    //    Ler a view duas vezes gerava prev == curr e o diff nunca disparava.
    const goalAmount = Number(season.goal_amount ?? 0);
    const prevBoard: LeaderboardRow[] = ((currBoard ?? []) as LeaderboardRow[]).map(row =>
      saleCounted && goalAmount > 0 && row.salesperson_id === salespersonId
        ? {
            ...row,
            progress: Math.min(
              1,
              Math.max(0, Number(row.total_sales ?? 0) - saleAmount) / goalAmount
            ),
          }
        : row
    );

    // 6. eventos derivados (overtake/checkpoint/victory) emitem no máximo uma
    //    vez por venda: carregam metadata.sale_id para dedupe nas re-chamadas.
    let derivedDone = false;
    if (sale_id) {
      const { data: priorDerived } = await supabase
        .from('race_events')
        .select('id')
        .eq('season_id', season.id)
        .eq('metadata->>sale_id', sale_id)
        .in('event_type', DERIVED_EVENT_TYPES)
        .limit(1);
      derivedDone = (priorDerived?.length ?? 0) > 0;
    }

    const events: Array<{
      type: string;
      salesperson_id: string;
      metadata?: Record<string, unknown>;
    }> = [];

    const prevSorted = [...prevBoard].sort(
      (a, b) => Number(b.progress) - Number(a.progress)
    );
    const currSorted = [...((currBoard ?? []) as LeaderboardRow[])].sort(
      (a, b) => Number(b.progress) - Number(a.progress)
    );

    if (!derivedDone && currBoard) {
      const prevRank = new Map(prevSorted.map((r, i) => [r.salesperson_id, i]));
      const currRank = new Map(currSorted.map((r, i) => [r.salesperson_id, i]));
      const prevProg = new Map(
        prevSorted.map(r => [r.salesperson_id, Number(r.progress)])
      );

      // ultrapassagens
      for (const [id, newPos] of currRank) {
        const oldPos = prevRank.get(id);
        if (oldPos === undefined || newPos >= oldPos) continue;
        for (const [otherId, otherNew] of currRank) {
          if (otherId === id) continue;
          const otherOld = prevRank.get(otherId);
          if (otherOld !== undefined && otherOld < oldPos && otherNew > newPos) {
            events.push({
              type: 'overtake',
              salesperson_id: id,
              metadata: { overtaken: otherId },
            });
          }
        }
      }

      // checkpoints + victory
      for (const row of currSorted) {
        const newP = Number(row.progress);
        const oldP = prevProg.get(row.salesperson_id) ?? 0;
        for (const cp of CHECKPOINTS) {
          if (oldP < cp && newP >= cp) {
            events.push({
              type: 'checkpoint',
              salesperson_id: row.salesperson_id,
              metadata: { checkpoint: cp },
            });
          }
        }
        if (oldP < 1 && newP >= 1 && !season.winner_id) {
          events.push({
            type: 'victory',
            salesperson_id: row.salesperson_id,
            metadata: { season_id: season.id },
          });
          await supabase
            .from('race_seasons')
            .update({ winner_id: row.salesperson_id, status: 'finished' })
            .eq('id', season.id);
          await supabase
            .rpc('increment_race_car_wins', { _salesperson_id: row.salesperson_id })
            .then(() => null, () => null);
          break;
        }
      }
    }

    // inserir eventos derivados (marcados com a venda que os originou)
    if (events.length > 0) {
      await supabase.from('race_events').insert(
        events.map(e => ({
          season_id: season.id,
          salesperson_id: e.salesperson_id,
          event_type: e.type,
          metadata: { ...(e.metadata ?? {}), sale_id: sale_id ?? null },
        }))
      );
    }

    // contagem de overtakes por carro (incremento)
    const overtakers = events
      .filter(e => e.type === 'overtake')
      .map(e => e.salesperson_id);
    for (const id of overtakers) {
      await supabase
        .rpc('increment_race_car_overtakes', { _salesperson_id: id })
        .then(() => null, () => null);
    }

    // ===== POWER-UPS & BADGES =====
    const grantBadge = async (sp: string, code: string) => {
      await supabase
        .from('race_badges')
        .upsert(
          { salesperson_id: sp, badge_code: code, season_id: season.id },
          { onConflict: 'salesperson_id,badge_code,season_id', ignoreDuplicates: true }
        );
    };

    const grantPowerUp = async (
      sp: string,
      type: string,
      effect: Record<string, unknown> = {}
    ) => {
      // idempotente por venda: a mesma venda não concede o power-up duas vezes
      if (sale_id) {
        const { data: priorGrant } = await supabase
          .from('race_powerups')
          .select('id')
          .eq('season_id', season.id)
          .eq('salesperson_id', sp)
          .eq('powerup_type', type)
          .eq('effect_data->>source_sale_id', sale_id)
          .limit(1);
        if (priorGrant?.length) return;
      }

      await supabase.from('race_powerups').insert({
        salesperson_id: sp,
        season_id: season.id,
        powerup_type: type,
        effect_data: { ...effect, source_sale_id: sale_id ?? null },
        collected_at: new Date().toISOString(),
      });

      // Emit event for real-time notification
      await supabase.from('race_events').insert({
        season_id: season.id,
        salesperson_id: sp,
        event_type: 'powerup_unlocked',
        metadata: { powerup_type: type, sale_id: sale_id ?? null, ...effect },
      });
    };

    if (salespersonId) {
      // 1. Velocista (Badge): 3 vendas em 1h
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: recentSalesCount } = await supabase
        .from('sales')
        .select('id', { count: 'exact', head: true })
        .eq('salesperson_id', salespersonId)
        .gte('created_at', oneHourAgo);

      if ((recentSalesCount ?? 0) >= 3) await grantBadge(salespersonId, 'velocista');

      // 2. XP Boost (Power-up): 3 vendas seguidas (independente de tempo)
      const { data: lastSales } = await supabase
        .from('sales')
        .select('status')
        .eq('salesperson_id', salespersonId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (
        lastSales?.length === 3 &&
        lastSales.every(s => ['completed', 'won', 'closed'].includes(s.status))
      ) {
        await grantPowerUp(salespersonId, 'xp_boost', {
          multiplier: 2,
          duration_hours: 2,
        });
      }

      // 3. Mega Boost (Power-up): Venda única > $10k
      if (saleCounted && saleAmount >= 10000) {
        await grantPowerUp(salespersonId, 'mega_boost', {
          multiplier: 3,
          duration_hours: 1,
        });
      }
    }

    // 4. Comeback King (Badge)
    if (salespersonId && currBoard) {
      const wasLast =
        prevSorted[prevSorted.length - 1]?.salesperson_id === salespersonId &&
        prevSorted.length >= 4;
      const nowTop3 = currSorted
        .slice(0, 3)
        .some(r => r.salesperson_id === salespersonId);
      if (wasLast && nowTop3) await grantBadge(salespersonId, 'comeback_king');
    }

    // 5. Victory & Overtake Badges
    for (const e of events) {
      if (e.type === 'victory')
        await grantBadge(e.salesperson_id, 'bandeira_quadriculada');
    }
    if (currBoard) {
      for (const row of currBoard as LeaderboardRow[]) {
        if ((row.total_overtakes ?? 0) >= 5)
          await grantBadge(row.salesperson_id, 'drift_master');
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      events_emitted: (boostInserted ? 1 : 0) + events.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('process-race-event error', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}));
