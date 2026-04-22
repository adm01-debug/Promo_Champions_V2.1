import { createClient } from 'npm:@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { powerup_id } = await req.json();
    if (!powerup_id) {
      return new Response(JSON.stringify({ error: 'Missing powerup_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // resolve salesperson do usuário
    const { data: sp } = await admin.from('salespeople').select('id').eq('auth_user_id', claims.claims.sub).maybeSingle();
    if (!sp) return new Response(JSON.stringify({ error: 'Salesperson not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // busca powerup
    const { data: pu, error: puErr } = await admin
      .from('race_powerups')
      .select('id, salesperson_id, season_id, powerup_type, used_at, effect_data')
      .eq('id', powerup_id)
      .maybeSingle();
    if (puErr || !pu) return new Response(JSON.stringify({ error: 'Power-up not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (pu.salesperson_id !== sp.id) return new Response(JSON.stringify({ error: 'Not your power-up' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (pu.used_at) return new Response(JSON.stringify({ error: 'Already collected' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // valida posição: progresso do vendedor precisa ter passado pela posição
    const positionPct = Number((pu.effect_data as Record<string, unknown>)?.position_pct ?? 0);
    const { data: lb } = await admin
      .from('race_leaderboard_view')
      .select('progress')
      .eq('season_id', pu.season_id)
      .eq('salesperson_id', sp.id)
      .maybeSingle();
    const progress = Number(lb?.progress ?? 0);
    if (progress < positionPct) {
      return new Response(JSON.stringify({ error: 'Not yet reached', progress, positionPct }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // marca como coletado
    await admin.from('race_powerups').update({ used_at: new Date().toISOString() }).eq('id', powerup_id);

    // insere evento
    await admin.from('race_events').insert({
      season_id: pu.season_id,
      salesperson_id: sp.id,
      event_type: 'powerup',
      payload: { powerup_type: pu.powerup_type, position_pct: positionPct },
    });

    // badge: 3 power-ups coletados na season → "powerup_collector"
    const { count } = await admin
      .from('race_powerups')
      .select('id', { count: 'exact', head: true })
      .eq('season_id', pu.season_id)
      .eq('salesperson_id', sp.id)
      .not('used_at', 'is', null);
    if ((count ?? 0) >= 3) {
      await admin.from('race_badges').upsert(
        { salesperson_id: sp.id, badge_code: 'powerup_collector', season_id: pu.season_id },
        { onConflict: 'salesperson_id,badge_code,season_id', ignoreDuplicates: true },
      );
    }

    return new Response(JSON.stringify({ ok: true, powerup_type: pu.powerup_type, badge_unlocked: (count ?? 0) >= 3 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('collect-race-powerup error', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
