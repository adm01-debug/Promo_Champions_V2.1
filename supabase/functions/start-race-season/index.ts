import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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

    // role check
    const { data: isAdmin } = await admin.rpc('has_role', { _user_id: claims.claims.sub, _role: 'admin' });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden — admin only' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { name, start_date, end_date, goal_amount, track_type = 'oval' } = body;
    if (!name || !start_date || !end_date || !goal_amount) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // finalizar season ativa
    await admin.from('race_seasons').update({ status: 'finished' }).eq('status', 'active');

    // criar nova
    const { data: newSeason, error: seasonErr } = await admin
      .from('race_seasons')
      .insert({ name, start_date, end_date, goal_amount, track_type, status: 'active' })
      .select()
      .single();
    if (seasonErr) throw seasonErr;

    // gerar carros default para vendedores sem carro
    const { data: salespeople } = await admin.from('salespeople').select('id').eq('is_active', true);
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
        car_style: 'f1',
      });
    }
    if (toCreate.length > 0) await admin.from('race_cars').insert(toCreate);

    // auto-spawn 3 power-ups (turbo/shield/lightning) por vendedor da season nas posições 15/45/80%
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

    return new Response(JSON.stringify({ ok: true, season: newSeason, cars_created: toCreate.length, powerups_spawned: powerupRows.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('start-race-season error', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
