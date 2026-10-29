-- Onda B (auditoria #24 + A6): gamificação executada no servidor, idempotente.
-- Rollback: unschedule dos 2 crons; DROP TRIGGER trg_process_race_event_on_sale e
--   DROP FUNCTION process_race_event_on_sale; restaurar spin_prize_wheel e
--   trigger_internal_edge_job do estado anterior; recriar policies de INSERT de
--   race_powerups/race_events/race_badges (20260418104152); DROP dos 2 índices
--   *_dedup_idx; restaurar CHECKs anteriores de event_type/powerup_type.
--   (detalhe completo no rodapé do cabeçalho)
--
-- 1) Trigger AFTER INSERT/UPDATE em public.sales → process-race-event para
--    TODA venda (UI, Bitrix24, V4, importações e RPCs) — mesmo padrão de
--    public.broadcast_sale_completed: net.http_post assíncrono, segredos em
--    public._internal_secrets e falhas registradas em public.edge_call_failures
--    em vez de engolidas. A inserção da venda nunca é abortada pelo disparo.
-- 2) race_powerups / race_events / race_badges: remove as policies que
--    deixavam o cliente se conceder power-ups, eventos e badges — a posse e a
--    coleta passam a ser decididas apenas pelo servidor (service_role bypassa
--    RLS; nada no frontend escreve essas tabelas).
-- 3) Alinha os CHECKs com os valores que o servidor realmente emite:
--    race_events.event_type ganha 'powerup_unlocked' e 'monthly_champion', e
--    race_powerups.powerup_type ganha 'xp_boost' e 'mega_boost' — antes esses
--    inserts falhavam em silêncio (supabase-js não lança exceção).
-- 4) public.spin_prize_wheel: concede o prêmio anunciado (xp_history →
--    salesperson_xp via tr_sync_total_xp, active_power_ups, achievements).
--    Antes a roleta anunciava prêmio que nunca era creditado.
-- 5) rotate-daily-challenges entra na allowlist de
--    public.trigger_internal_edge_job e ganha cron diário 00:10 (horário de
--    Brasília = 03:10 UTC) — hoje só dispara quando alguém abre o card.
-- 6) Reagenda 'weekly-matchmaking' (1 0 * * 1): excluído do restore de
--    2026-09-13 porque a função não existia; ela foi recriada idempotente em
--    20260831130001. Guarda de existência mantida por segurança.
--
-- Rollback: em ordem inversa — SELECT cron.unschedule('rotate-daily-challenges-daily')
--   e cron.unschedule('weekly-matchmaking'); DROP TRIGGER
--   trg_process_race_event_on_sale ON public.sales; DROP FUNCTION
--   public.process_race_event_on_sale(); restaurar public.spin_prize_wheel e
--   public.trigger_internal_edge_job do estado anterior (ver migrations que os
--   criaram); recriar as policies de INSERT derrubadas em
--   race_powerups/race_events/race_badges (definições em 20260418104152);
--   DROP INDEX race_events_sale_dedup_idx e race_powerups_source_sale_dedup_idx;
--   restaurar os CHECKs anteriores de race_events.event_type e
--   race_powerups.powerup_type sem os valores novos.

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ---------------------------------------------------------------------------
-- 2) Posse só no servidor: o cliente lê (SELECT), mas não escreve.
--    As policies de INSERT foram substituídas em 20260418104152 — os drops
--    precisam cobrir os nomes atuais (own_or_admin / admin) além dos antigos.
--    Nenhuma tela do app insere nessas tabelas (hooks só fazem SELECT); quem
--    escreve é edge function com service_role, que bypassa RLS.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "insert_own_powerups" ON public.race_powerups;
DROP POLICY IF EXISTS "update_own_powerups" ON public.race_powerups;
DROP POLICY IF EXISTS "insert_race_events" ON public.race_events;
DROP POLICY IF EXISTS "insert_race_events_own_or_admin" ON public.race_events;
DROP POLICY IF EXISTS "insert_race_badges" ON public.race_badges;
DROP POLICY IF EXISTS "insert_race_badges_admin" ON public.race_badges;

-- ---------------------------------------------------------------------------
-- 2b) Dedupe atômico: a idempotência por sale_id não pode depender só de
--     read-before-insert — chamadas concorrentes (UI + trigger de sales)
--     passariam juntas pelo check. Índices únicos parciais fazem o banco
--     impor unicidade; a função trata 23505 como "já processado".
--     Linhas antigas (metadata/effect_data sem sale_id) ficam fora do índice.
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS race_events_sale_dedup_idx
  ON public.race_events (season_id, salesperson_id, event_type, ((metadata->>'sale_id')))
  WHERE metadata->>'sale_id' IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS race_powerups_source_sale_dedup_idx
  ON public.race_powerups (season_id, salesperson_id, powerup_type, ((effect_data->>'source_sale_id')))
  WHERE effect_data->>'source_sale_id' IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3) CHECKs alinhados aos tipos emitidos pelo servidor.
-- ---------------------------------------------------------------------------
ALTER TABLE public.race_events
  DROP CONSTRAINT IF EXISTS race_events_event_type_check;
ALTER TABLE public.race_events
  ADD CONSTRAINT race_events_event_type_check
  CHECK (event_type IN (
    'boost', 'overtake', 'checkpoint', 'powerup', 'victory', 'pitstop',
    'powerup_unlocked', 'monthly_champion'
  ));

ALTER TABLE public.race_powerups
  DROP CONSTRAINT IF EXISTS race_powerups_powerup_type_check;
ALTER TABLE public.race_powerups
  ADD CONSTRAINT race_powerups_powerup_type_check
  CHECK (powerup_type IN (
    'turbo', 'shield', 'lightning', 'xp_boost', 'mega_boost'
  ));

-- ---------------------------------------------------------------------------
-- 4) Roleta: o prêmio anunciado é concedido na mesma transação do giro.
--    O caminho idempotente (request_id já gravado) retorna antes — a
--    concessão roda exatamente uma vez por giro.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.spin_prize_wheel(p_request_id uuid)
RETURNS TABLE (
  id uuid,
  prize_type text,
  prize_value integer,
  prize_label text,
  trigger_type text,
  spun_at timestamptz,
  prize_index integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_salesperson_id uuid;
  v_spins_count integer;
  v_roll integer;
  v_prize_type text;
  v_prize_value integer;
  v_prize_label text;
  v_prize_index integer;
  v_existing public.prize_wheel_spins%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticação obrigatória para girar a roda'
      USING ERRCODE = '28000';
  END IF;

  IF p_request_id IS NULL THEN
    RAISE EXCEPTION 'Identificador idempotente obrigatório'
      USING ERRCODE = '22004';
  END IF;

  v_salesperson_id := public.get_current_salesperson_id();
  IF v_salesperson_id IS NULL THEN
    RAISE EXCEPTION 'Perfil comercial não encontrado para o usuário autenticado'
      USING ERRCODE = 'P0001';
  END IF;

  -- Retorna a tentativa já concluída sem consumir outro giro.
  SELECT *
    INTO v_existing
    FROM public.prize_wheel_spins
   WHERE salesperson_id = v_salesperson_id
     AND request_id = p_request_id;

  IF FOUND THEN
    RETURN QUERY
    SELECT
      v_existing.id,
      v_existing.prize_type,
      v_existing.prize_value,
      v_existing.prize_label,
      v_existing.trigger_type,
      v_existing.spun_at,
      CASE v_existing.prize_label
        WHEN '+50 XP' THEN 0
        WHEN '+100 XP' THEN 1
        WHEN '+200 XP' THEN 2
        WHEN '2x XP 1h' THEN 3
        WHEN 'Badge 🔥' THEN 4
        WHEN '+500 XP' THEN 5
        WHEN '+25 XP' THEN 6
        ELSE NULL
      END;
    RETURN;
  END IF;

  -- Serializa somente os giros do vendedor atual. Uma chamada concorrente
  -- aguarda o lock, relê a requisição idempotente e não pode gerar prêmio
  -- adicional para o mesmo request_id.
  SELECT spins_count
    INTO v_spins_count
    FROM public.available_spins
   WHERE salesperson_id = v_salesperson_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nenhum giro disponível'
      USING ERRCODE = 'P0001';
  END IF;

  -- A segunda leitura ocorre depois do lock. Em READ COMMITTED, isso permite
  -- que uma chamada concorrente enxergue a gravação concluída pela primeira
  -- transação antes de decidir se ainda há saldo a consumir.
  SELECT *
    INTO v_existing
    FROM public.prize_wheel_spins
   WHERE salesperson_id = v_salesperson_id
     AND request_id = p_request_id;

  IF FOUND THEN
    RETURN QUERY
    SELECT
      v_existing.id,
      v_existing.prize_type,
      v_existing.prize_value,
      v_existing.prize_label,
      v_existing.trigger_type,
      v_existing.spun_at,
      CASE v_existing.prize_label
        WHEN '+50 XP' THEN 0
        WHEN '+100 XP' THEN 1
        WHEN '+200 XP' THEN 2
        WHEN '2x XP 1h' THEN 3
        WHEN 'Badge 🔥' THEN 4
        WHEN '+500 XP' THEN 5
        WHEN '+25 XP' THEN 6
        ELSE NULL
      END;
    RETURN;
  END IF;

  IF v_spins_count <= 0 THEN
    RAISE EXCEPTION 'Nenhum giro disponível'
      USING ERRCODE = 'P0001';
  END IF;

  v_roll := floor(random() * 100)::integer;
  CASE
    WHEN v_roll < 25 THEN
      v_prize_type := 'xp'; v_prize_value := 50; v_prize_label := '+50 XP'; v_prize_index := 0;
    WHEN v_roll < 45 THEN
      v_prize_type := 'xp'; v_prize_value := 100; v_prize_label := '+100 XP'; v_prize_index := 1;
    WHEN v_roll < 55 THEN
      v_prize_type := 'xp'; v_prize_value := 200; v_prize_label := '+200 XP'; v_prize_index := 2;
    WHEN v_roll < 70 THEN
      v_prize_type := 'power_up'; v_prize_value := 2; v_prize_label := '2x XP 1h'; v_prize_index := 3;
    WHEN v_roll < 80 THEN
      v_prize_type := 'badge'; v_prize_value := 1; v_prize_label := 'Badge 🔥'; v_prize_index := 4;
    WHEN v_roll < 85 THEN
      v_prize_type := 'xp'; v_prize_value := 500; v_prize_label := '+500 XP'; v_prize_index := 5;
    ELSE
      v_prize_type := 'xp'; v_prize_value := 25; v_prize_label := '+25 XP'; v_prize_index := 6;
  END CASE;

  UPDATE public.available_spins
     SET spins_count = spins_count - 1,
         updated_at = now()
   WHERE salesperson_id = v_salesperson_id;

  INSERT INTO public.prize_wheel_spins (
    salesperson_id,
    request_id,
    prize_type,
    prize_value,
    prize_label,
    trigger_type
  )
  VALUES (
    v_salesperson_id,
    p_request_id,
    v_prize_type,
    v_prize_value,
    v_prize_label,
    'mission'
  )
  RETURNING * INTO v_existing;

  -- Concede o prêmio anunciado. O giro só alcança este ponto uma vez por
  -- request_id (o caminho idempotente retorna antes), então a concessão é
  -- exatamente-uma-vez por spin registrado.
  IF v_prize_type = 'xp' THEN
    INSERT INTO public.xp_history (
      salesperson_id, xp_amount, source_type, source_id, description
    ) VALUES (
      v_salesperson_id, v_prize_value, 'prize_wheel', v_existing.id::text,
      'Roleta da Sorte: ' || v_prize_label
    );
  ELSIF v_prize_type = 'power_up' THEN
    INSERT INTO public.active_power_ups (
      salesperson_id, power_up_type, multiplier, expires_at, source
    ) VALUES (
      v_salesperson_id, 'xp_boost', v_prize_value,
      now() + interval '1 hour', 'prize_wheel'
    );
  ELSIF v_prize_type = 'badge' THEN
    PERFORM private.award_achievement_if_not_exists(
      v_salesperson_id, 'prize_wheel_fire'
    );
  END IF;

  RETURN QUERY
  SELECT
    v_existing.id,
    v_existing.prize_type,
    v_existing.prize_value,
    v_existing.prize_label,
    v_existing.trigger_type,
    v_existing.spun_at,
    v_prize_index;
END;
$$;

REVOKE ALL ON FUNCTION public.spin_prize_wheel(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.spin_prize_wheel(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 1) Toda venda dispara process-race-event, qualquer que seja a origem.
--    O corpo leva só o sale_id; a edge function lê o restante no banco.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_race_event_on_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  v_payload jsonb;
  v_base_url text;
  v_anon_key text;
  v_cron_secret text;
BEGIN
  IF NEW.salesperson_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_payload := jsonb_build_object('sale_id', NEW.id);

  SELECT
    max(s.value) FILTER (WHERE s.key = 'functions_base_url'),
    max(s.value) FILTER (WHERE s.key = 'anon_key'),
    max(s.value) FILTER (WHERE s.key = 'coaching_cron_secret')
  INTO v_base_url, v_anon_key, v_cron_secret
  FROM public._internal_secrets AS s;

  IF v_base_url IS NULL OR v_anon_key IS NULL OR v_cron_secret IS NULL THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('process_race_event_on_sale', 'process-race-event',
            jsonb_build_object('sale_id', NEW.id), 'internal_edge_secrets_missing');
    RETURN NEW;
  END IF;
  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('process_race_event_on_sale', 'process-race-event',
            jsonb_build_object('sale_id', NEW.id), 'internal_edge_base_url_must_be_https');
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := rtrim(v_base_url, '/') || '/process-race-event',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key,
      'X-Cron-Secret', v_cron_secret
    ),
    body := v_payload
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca quebrar a escrita da venda, mas deixar a falha visível.
  BEGIN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('process_race_event_on_sale', 'process-race-event',
            jsonb_build_object('sale_id', NEW.id), SQLERRM);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RAISE WARNING 'process_race_event_on_sale failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.process_race_event_on_sale() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_process_race_event_on_sale ON public.sales;
CREATE TRIGGER trg_process_race_event_on_sale
AFTER INSERT OR UPDATE OF status, salesperson_id ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.process_race_event_on_sale();

-- ---------------------------------------------------------------------------
-- 5) rotate-daily-challenges na allowlist + cron diário 03:10 UTC (00:10 BRT).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trigger_internal_edge_job(p_function_name text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  v_base_url text;
  v_anon_key text;
  v_cron_secret text;
  v_request_id bigint;
BEGIN
  IF p_function_name IS NULL OR NOT (
    p_function_name = ANY (ARRAY[
      -- operacionais pré-existentes
      'notify-v4-quote-status',
      'check-v4-callback-alerts',
      'cron-failure-alerter',
      'process-call-recording-ingest',
      'edge-retry-threshold-alert',
      'deal-risk-digest',
      'email-bulk-retry',
      'wal-health-alert',
      'winloss-webhook-health-monitor',
      'webvitals-regression-alert',
      -- máquina de vendas (Onda 1)
      'sequence-runner',
      'process-cadence-tasks',
      'process-scheduled-sends',
      'check-quote-expiration',
      'check-lead-sla',
      'sdr-consecutive-alerts',
      'activity-goal-alerts',
      'challenge-expiration-alerts',
      'send-alert-notifications',
      'auto-reassign-inactive',
      'access-denied-alerts',
      'scheduled-reports-runner',
      -- gamificação (Onda B)
      'rotate-daily-challenges'
    ]::text[])
  ) THEN
    RAISE EXCEPTION 'internal_edge_job_not_allowed';
  END IF;

  SELECT
    max(s.value) FILTER (WHERE s.key = 'functions_base_url'),
    max(s.value) FILTER (WHERE s.key = 'anon_key'),
    max(s.value) FILTER (WHERE s.key = 'coaching_cron_secret')
  INTO v_base_url, v_anon_key, v_cron_secret
  FROM public._internal_secrets AS s;

  IF v_base_url IS NULL OR v_anon_key IS NULL OR v_cron_secret IS NULL THEN
    RAISE EXCEPTION 'internal_edge_job_secrets_missing';
  END IF;
  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'internal_edge_job_base_url_must_be_https';
  END IF;

  SELECT net.http_post(
    url := rtrim(v_base_url, '/') || '/' || p_function_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key,
      'X-Cron-Secret', v_cron_secret
    ),
    body := jsonb_build_object('scheduled_at', now())
  )
  INTO v_request_id;

  RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_internal_edge_job(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_internal_edge_job(text)
  TO service_role;

DO $$
BEGIN
  PERFORM cron.unschedule('rotate-daily-challenges-daily')
  WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'rotate-daily-challenges-daily'
  );
  PERFORM cron.schedule(
    'rotate-daily-challenges-daily',
    '10 3 * * *',
    'SELECT public.trigger_internal_edge_job(''rotate-daily-challenges'');'
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 6) Matchmaking de volta à agenda: a função existe (idempotente e
--    serializada por advisory lock desde 20260831130001).
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM pg_proc p
      JOIN pg_namespace ns ON ns.oid = p.pronamespace
     WHERE ns.nspname = 'public' AND p.proname = 'match_weekly_players'
  ) THEN
    PERFORM cron.unschedule('weekly-matchmaking')
    WHERE EXISTS (
      SELECT 1 FROM cron.job WHERE jobname = 'weekly-matchmaking'
    );
    PERFORM cron.schedule(
      'weekly-matchmaking',
      '1 0 * * 1',
      'SELECT public.match_weekly_players()'
    );
  ELSE
    RAISE NOTICE 'skip weekly-matchmaking: função public.match_weekly_players não existe';
  END IF;
END;
$$;
