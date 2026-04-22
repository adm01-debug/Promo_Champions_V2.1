import { createClient } from 'npm:@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PALETTE = [
  { p: '#ef4444', s: '#fff' }, { p: '#22c55e', s: '#fff' }, { p: '#f97316', s: '#fff' },
  { p: '#eab308', s: '#000' }, { p: '#3b82f6', s: '#fff' }, { p: '#a855f7', s: '#fff' },
  { p: '#ec4899', s: '#fff' }, { p: '#14b8a6', s: '#fff' }, { p: '#0ea5e9', s: '#fff' },
  { p: '#84cc16', s: '#000' }, { p: '#f43f5e', s: '#fff' }, { p: '#6366f1', s: '#fff' },
];

interface ScoringRule {
  metric_code: string;
  weight: number;
  points_per_unit: number;
  label?: string;
}

const DEFAULT_RULES: Record<'closer' | 'sdr', ScoringRule[]> = {
  closer: [
    { metric_code: 'sales_value', weight: 1.0, points_per_unit: 1, label: 'Valor de Vendas' },
    { metric_code: 'markup_pct', weight: 0.8, points_per_unit: 1, label: 'Markup' },
    { metric_code: 'new_clients_activated', weight: 1.5, points_per_unit: 5000, label: 'Novos Clientes' },
    { metric_code: 'routine_compliance', weight: 0.5, points_per_unit: 100, label: 'Rotina' },
  ],
  sdr: [
    { metric_code: 'stakeholders_captured', weight: 1.5, points_per_unit: 3000, label: 'Stakeholders' },
    { metric_code: 'new_clients_activated', weight: 1.2, points_per_unit: 4000, label: 'Novos Clientes' },
    { metric_code: 'conversations_initiated', weight: 1.0, points_per_unit: 500, label: 'Conversas Iniciadas' },
    { metric_code: 'sales_value_originated', weight: 0.8, points_per_unit: 0.5, label: 'Vendas Originadas' },
    { metric_code: 'routine_compliance', weight: 0.6, points_per_unit: 100, label: 'Rotina' },
  ],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authError } = await userClient.auth.getClaims(token);
    if (authError || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: isAdmin } = await admin.rpc('has_role', { _user_id: claims.claims.sub, _role: 'admin' });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden — admin only' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const {
      name, start_date, end_date, goal_amount,
      track_type = 'oval',
      role_type = 'closer',
      scoring_rules,
    } = body as {
      name: string; start_date: string; end_date: string; goal_amount: number;
      track_type?: string; role_type?: 'closer' | 'sdr'; scoring_rules?: ScoringRule[];
    };

    if (!name || !start_date || !end_date || !goal_amount) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!['closer', 'sdr'].includes(role_type)) {
      return new Response(JSON.stringify({ error: 'Invalid role_type' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Finalizar apenas a temporada ativa do mesmo papel
    await admin.from('race_seasons').update({ status: 'finished' }).eq('status', 'active').eq('role_type', role_type);

    const { data: newSeason, error: seasonErr } = await admin
      .from('race_seasons')
      .insert({ name, start_date, end_date, goal_amount, track_type, status: 'active', role_type })
      .select()
      .single();
    if (seasonErr) throw seasonErr;

    // Inserir regras de pontuação (custom ou default)
    const rules = (scoring_rules && scoring_rules.length > 0) ? scoring_rules : DEFAULT_RULES[role_type];
    const ruleRows = rules.map((r) => ({
      season_id: newSeason.id,
      metric_code: r.metric_code,
      weight: r.weight,
      points_per_unit: r.points_per_unit,
      label: r.label ?? null,
    }));
    if (ruleRows.length > 0) {
      const { error: rulesErr } = await admin.from('race_scoring_rules').insert(ruleRows);
      if (rulesErr) throw rulesErr;
    }

    // Buscar vendedores do papel correto (ou hybrid)
    const { data: salespeople } = await admin
      .from('salespeople')
      .select('id, role')
      .eq('is_active', true)
      .in('role', [role_type, 'hybrid']);

    const { data: existingCars } = await admin.from('race_cars').select('salesperson_id, car_number');
    const existingIds = new Set((existingCars ?? []).map((c) => c.salesperson_id));
    const usedNumbers = new Set((existingCars ?? []).map((c) => c.car_number));
    const toCreate: Array<Record<string, unknown>> = [];

    for (const sp of salespeople ?? []) {
      if (existingIds.has(sp.id)) continue;
      let num = 0;
      for (let i = 0; i < 200; i++) {
        const candidate = Math.floor(Math.random() * 99) + 1;
        if (!usedNumbers.has(candidate)) { num = candidate; usedNumbers.add(candidate); break; }
      }
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      toCreate.push({
        salesperson_id: sp.id,
        car_number: num || Math.floor(Math.random() * 99) + 1,
        primary_color: color.p,
        secondary_color: color.s,
        car_style: role_type === 'sdr' ? 'kart' : 'f1',
      });
    }
    if (toCreate.length > 0) await admin.from('race_cars').insert(toCreate);

    // Power-ups apenas para vendedores do papel correto
    const POWERUP_SPAWNS: Array<{ type: 'turbo' | 'shield' | 'lightning'; pct: number }> = [
      { type: 'turbo', pct: 0.15 },
      { type: 'shield', pct: 0.45 },
      { type: 'lightning', pct: 0.80 },
    ];
    const powerupRows: Array<Record<string, unknown>> = [];
    for (const sp of salespeople ?? []) {
      for (const spawn of POWERUP_SPAWNS) {
        powerupRows.push({
          season_id: newSeason.id,
          salesperson_id: sp.id,
          powerup_type: spawn.type,
          effect_data: { position_pct: spawn.pct, spawned: true },
          used_at: null,
        });
      }
    }
    if (powerupRows.length > 0) await admin.from('race_powerups').insert(powerupRows);

    return new Response(JSON.stringify({
      ok: true, season: newSeason,
      cars_created: toCreate.length,
      powerups_spawned: powerupRows.length,
      rules_created: ruleRows.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('start-race-season error', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
