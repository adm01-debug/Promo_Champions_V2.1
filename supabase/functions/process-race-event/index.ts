import { getCorsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { withRequestId } from '../_shared/request-id.ts';
import { getUserClient, UnauthorizedError } from '../_shared/auth-client.ts';
import { isAuthorizedCronJob } from '../_shared/cron-job-auth.ts';
import { collectErrors, validateUUID, validationErrorResponse } from '../_shared/validation.ts';
import { WON_SALE_STATUSES } from '../_shared/sale-statuses.ts';

interface LeaderboardRow {
  car_id: string;
  salesperson_id: string;
  progress: number;
  total_sales?: number | null;
  deals_count?: number | null;
  new_clients_count?: number | null;
  activities_count?: number | null;
  conversations_count?: number | null;
}

interface ScoreMetrics {
  sales: number;
  newClients: number;
  activities: number;
  conversations: number;
}

interface ScoringRule {
  metric_code: string;
  points_per_unit: number;
  weight: number;
}

const CHECKPOINTS = [0.25, 0.5, 0.75];
const DERIVED_EVENT_TYPES = ['overtake', 'checkpoint', 'victory'];
const COUNTED_SALE_STATUSES = [...WON_SALE_STATUSES];

// Mesmo CASE da race_leaderboard_view (20260830000000): cada metric_code
// aponta para a métrica bruta que ele pondera.
const metricValue = (code: string, m: ScoreMetrics): number => {
  switch (code) {
    case 'sales_value':
    case 'sales_value_originated': return m.sales;
    case 'new_clients_activated':
    case 'stakeholders_captured': return m.newClients;
    case 'routine_compliance': return m.activities;
    case 'conversations_initiated': return m.conversations;
    case 'markup_pct': return m.sales * 0.3;
    default: return 0;
  }
};

const scoreFor = (rules: ScoringRule[] | null, m: ScoreMetrics): number =>
  !rules?.length
    ? m.sales
    : rules.reduce(
        (acc, r) => acc + metricValue(r.metric_code, m) * Number(r.points_per_unit) * Number(r.weight),
        0
      );

Deno.serve(withRequestId('process-race-event', async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Job interno (trigger de sales via pg_net / pg_cron) OU usuário autenticado.
    // Chamadas de usuário ficam restritas às vendas do próprio vendedor — sem
    // isso qualquer autenticado processaria a venda alheia com service_role.
    const cronAuthorized = await isAuthorizedCronJob(req, supabase);
    let callerUserId: string | null = null;
    if (!cronAuthorized) {
      try {
        const ctx = await getUserClient(req);
        callerUserId = ctx.userId;
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

    // 1. season ativa (goal, datas e regras alimentam o cálculo do diff)
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

    const { data: scoringRules } = await supabase
      .from('race_scoring_rules')
      .select('metric_code, points_per_unit, weight')
      .eq('season_id', season.id);

    // 2. venda → salesperson (antes dos snapshots; a venda já está gravada)
    let salespersonId: string | null = null;
    let saleAmount = 0;
    let saleClientName: string | null = null;
    let saleCounted = false;
    if (sale_id) {
      const { data: sale } = await supabase
        .from('sales')
        .select('salesperson_id, amount, status, created_at, client_name')
        .eq('id', sale_id)
        .maybeSingle();
      salespersonId = sale?.salesperson_id ?? null;
      saleAmount = Number(sale?.amount ?? 0);
      saleClientName = sale?.client_name ?? null;

      // A view só soma vendas won/completed dentro do período da season.
      const saleDay = String(sale?.created_at ?? '').slice(0, 10);
      saleCounted = !!sale && COUNTED_SALE_STATUSES.includes(sale.status)
        && saleDay >= String(season.start_date) && saleDay <= String(season.end_date);
    }

    // Sem cron: o chamador precisa ser dono da venda (ou admin/manager).
    if (!cronAuthorized && callerUserId && salespersonId) {
      const { data: ownSp } = await supabase
        .from('salespeople')
        .select('id')
        .eq('id', salespersonId)
        .eq('auth_user_id', callerUserId)
        .limit(1);

      if (!ownSp?.length) {
        const { data: elevated } = await supabase
          .rpc('is_admin_or_manager', { _user_id: callerUserId });
        if (!elevated) {
          return new Response(JSON.stringify({ error: 'forbidden' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // 3. evento 'boost' da venda — idempotente por sale_id. O índice único
    //    parcial em (season, vendedor, tipo, metadata->>sale_id) torna o
    //    dedupe atômico: a segunda chamada concorrente recebe 23505.
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
        const { error: boostErr } = await supabase.from('race_events').insert({
          season_id: season.id,
          salesperson_id: salespersonId,
          event_type: 'boost',
          metadata: { sale_id, amount: saleAmount },
        });
        boostInserted = !boostErr || boostErr.code !== '23505';
      }
    }

    // 4. snapshot atual (a venda já está computada pela view)
    const { data: currBoard } = await supabase
      .from('race_leaderboard_view')
      .select('car_id, salesperson_id, progress, total_sales, deals_count, new_clients_count, activities_count, conversations_count')
      .eq('season_id', season.id);

    // new_clients_raw conta DISTINCT client_name: a venda contribuiu +1 só se
    // for a primeira venda contada do cliente na janela da season.
    let isNewClient = false;
    if (saleCounted && salespersonId && saleClientName) {
      const { count: otherSales } = await supabase
        .from('sales')
        .select('id', { count: 'exact', head: true })
        .eq('salesperson_id', salespersonId)
        .eq('client_name', saleClientName)
        .in('status', COUNTED_SALE_STATUSES)
        .gte('created_at', `${season.start_date}T00:00:00Z`)
        .lte('created_at', `${season.end_date}T23:59:59.999Z`)
        .neq('id', sale_id);
      isNewClient = (otherSales ?? 0) === 0;
    }

    // 5. placar anterior = placar atual menos a contribuição desta venda,
    //    recalculando o score exatamente como a view (regras ponderadas).
    //    Ler a view duas vezes gerava prev == curr e o diff nunca disparava.
    const goalAmount = Number(season.goal_amount ?? 0);
    const prevBoard: LeaderboardRow[] = ((currBoard ?? []) as LeaderboardRow[]).map(row => {
      if (!(saleCounted && goalAmount > 0 && row.salesperson_id === salespersonId)) {
        return row;
      }
      const prevMetrics: ScoreMetrics = {
        sales: Math.max(0, Number(row.total_sales ?? 0) - saleAmount),
        newClients: Math.max(0, Number(row.new_clients_count ?? 0) - (isNewClient ? 1 : 0)),
        activities: Number(row.activities_count ?? 0),
        conversations: Number(row.conversations_count ?? 0),
      };
      return {
        ...row,
        progress: Math.min(1, Math.max(0, scoreFor(scoringRules, prevMetrics)) / goalAmount),
      };
    });

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
      dedup_key?: string;
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
              dedup_key: `overtake:${otherId}`,
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
              dedup_key: `checkpoint:${cp}`,
            });
          }
        }
        if (oldP < 1 && newP >= 1 && !season.winner_id) {
          // Guarda atômica: só a primeira chamada vence a corrida — a
          // concorrente recebe RETURNING vazio e não emite 'victory' nem
          // incrementa wins.
          const { data: wonSeason } = await supabase
            .from('race_seasons')
            .update({ winner_id: row.salesperson_id, status: 'finished' })
            .eq('id', season.id)
            .is('winner_id', null)
            .select('id');
          if (wonSeason?.length) {
            events.push({
              type: 'victory',
              salesperson_id: row.salesperson_id,
              metadata: { season_id: season.id },
              dedup_key: 'victory',
            });
            await supabase
              .rpc('increment_race_car_wins', { _salesperson_id: row.salesperson_id })
              .then(() => null, () => null);
            break;
          }
        }
      }
    }

    // inserir eventos derivados (marcados com a venda que os originou),
    // um a um: 23505 numa linha não aborta as demais (mesmo padrão do
    // boost) — o índice inclui dedup_key como discriminador por ocorrência.
    let derivedInserted = 0;
    const insertedOvertakers: string[] = [];
    for (const e of events) {
      const { error: eventErr } = await supabase.from('race_events').insert({
        season_id: season.id,
        salesperson_id: e.salesperson_id,
        event_type: e.type,
        metadata: {
          ...(e.metadata ?? {}),
          sale_id: sale_id ?? null,
          dedup_key: e.dedup_key ?? null,
        },
      });
      if (!eventErr) {
        derivedInserted++;
        if (e.type === 'overtake') insertedOvertakers.push(e.salesperson_id);
      } else if (eventErr.code !== '23505') {
        console.error('race_events insert failed', eventErr);
      }
    }

    // contagem de overtakes por carro: só para eventos realmente gravados —
    // incrementar sem o insert inflaria total_overtakes.
    for (const id of insertedOvertakers) {
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
      // (o índice único parcial em source_sale_id cobre a concorrência).
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

      const { error: grantErr } = await supabase.from('race_powerups').insert({
        salesperson_id: sp,
        season_id: season.id,
        powerup_type: type,
        effect_data: { ...effect, source_sale_id: sale_id ?? null },
        collected_at: new Date().toISOString(),
      });
      if (grantErr) return;

      // Emit event for real-time notification (dedup_key por powerup_type:
      // xp_boost e mega_boost da mesma venda coexistem no índice único).
      await supabase.from('race_events').insert({
        season_id: season.id,
        salesperson_id: sp,
        event_type: 'powerup_unlocked',
        metadata: {
          powerup_type: type,
          sale_id: sale_id ?? null,
          dedup_key: `powerup:${type}`,
          ...effect,
        },
      });
    };

    if (salespersonId) {
      // 1. Velocista (Badge): 3 vendas em 1h
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: recentSalesCount } = await supabase
        .from('sales')
        .select('id', { count: 'exact', head: true })
        .eq('salesperson_id', salespersonId)
        .in('status', COUNTED_SALE_STATUSES)
        .gte('created_at', oneHourAgo);

      if ((recentSalesCount ?? 0) >= 3) await grantBadge(salespersonId, 'velocista');

      // 2. XP Boost (Power-up): 3 vendas seguidas (independente de tempo).
      //    Só concede quando a venda que disparou é a mais recente — reprocessar
      //    vendas antigas não pode farmar boosts sem nova sequência.
      const { data: lastSales } = await supabase
        .from('sales')
        .select('id, status')
        .eq('salesperson_id', salespersonId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (
        lastSales?.length === 3 &&
        lastSales.every(s => ['completed', 'won', 'closed'].includes(s.status)) &&
        (!sale_id || lastSales[0].id === sale_id)
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
    const { data: raceCars } = await supabase
      .from('race_cars')
      .select('salesperson_id, total_overtakes')
      .eq('season_id', season.id);
    for (const car of raceCars ?? []) {
      if (Number(car.total_overtakes ?? 0) >= 5)
        await grantBadge(car.salesperson_id, 'drift_master');
    }

    return new Response(JSON.stringify({
      ok: true,
      events_emitted: (boostInserted ? 1 : 0) + derivedInserted,
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
