-- Remediação r2 — LGPD + gamificação (achados pós-#290):
--
-- A #290 removeu a escrita do cliente em xp_history/salesperson_xp/
-- challenge_progress, mas três RPCs SECURITY DEFINER continuavam GRANTed a
-- authenticated (allowlist de 20260711134320 e hardening de 20260831130000/
-- 20261001214000), o que permitia fabricar XP e placar à vontade; e nenhum
-- writer server-side gravava o progresso de desafios — eles nunca completavam.
--
-- 1. award_salesperson_xp: REVOKE de PUBLIC/anon/authenticated (GRANT só
--    service_role) + guarda interna — o cliente mandava p_xp_amount livre.
-- 2. public.award_sale_xp(p_sale_id): substituto — deriva o XP da venda e
--    de xp.rewards no app_config, trava por sale_id (advisory lock + dedup em
--    xp_history) e credita via xp_history (tr_sync_total_xp atualiza
--    salesperson_xp). Grant a authenticated: o valor não é mais escolhido
--    pelo cliente e só é creditado para o vendedor da própria venda.
-- 3. add_salesperson_xp: REVOKE de authenticated — caller = próprio
--    salesperson + amount 1..10000 era auto-crédito ilimitado. O caminho
--    private.* (triggers SECURITY DEFINER) e service_role seguem intactos.
-- 4. increment_race_car_wins/overtakes: REVOKE de authenticated + trigger
--    race_cars_guard_counters rejeita INSERT/UPDATE que mexa em
--    total_wins/total_overtakes/total_races fora do service_role — a policy
--    update_own_car não restringe coluna.
-- 5. public.sync_challenge_progress(p_salesperson_id): recomputa
--    current_value/completed_at a partir de activities/sales/quotes/
--    follow_up_audit_logs — o cliente não informa valor nenhum. Chamado pelo
--    frontend (escopo = próprio vendedor) e por cron diário (todos).
-- 6. anonymize_data_subject: cobre email_logs, email_tracking_events,
--    email_bulk_drafts e conversation_analyses (transcript/decision_makers);
--    casa o titular por telefone canônico em clients e account_contacts;
--    tenta REFRESH de mv_client_ltv (agendamento segue em
--    refresh_materialized_views()).
-- 7. canonical_phone_key: remove o DDI '55' antes do sufixo de 11 dígitos —
--    fixo com DDI (12 dígitos) gerava chave divergente do mesmo número sem
--    DDI (10 dígitos), e os matches de consentimento/opt-out/anonimização
--    falhavam.

-- ---------------------------------------------------------------------------
-- 1. XP arbitrário: posse só no servidor.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.award_salesperson_xp(
    p_salesperson_id UUID,
    p_xp_amount INTEGER,
    p_description TEXT,
    p_source_type TEXT,
    p_source_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_old_xp INTEGER;
    v_new_xp INTEGER;
    v_old_level INTEGER;
    v_new_level INTEGER;
    v_xp_step INTEGER := 1000;
    v_result JSONB;
BEGIN
    -- Amount arbitrário não pode vir do cliente: só service_role (edge
    -- functions/cron). auth.role() é NULL em SQL direto (migrations/admin),
    -- que segue autorizado.
    IF auth.role() IS NOT NULL AND auth.role() <> 'service_role' THEN
        RAISE EXCEPTION 'forbidden: award_salesperson_xp é interno (service_role)';
    END IF;

    INSERT INTO public.salesperson_xp (salesperson_id, total_xp, current_level, updated_at)
    VALUES (p_salesperson_id, p_xp_amount, 1, now())
    ON CONFLICT (salesperson_id) DO UPDATE
    SET total_xp = salesperson_xp.total_xp + EXCLUDED.total_xp,
        updated_at = now()
    RETURNING total_xp, current_level INTO v_new_xp, v_old_level;

    v_new_level := floor(v_new_xp / v_xp_step) + 1;

    IF v_new_level > v_old_level THEN
        UPDATE public.salesperson_xp
        SET current_level = v_new_level
        WHERE salesperson_id = p_salesperson_id;
    END IF;

    INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
    VALUES (p_salesperson_id, p_xp_amount, p_source_type, p_source_id::text, p_description);

    SELECT jsonb_build_object(
        'leveled_up', v_new_level > v_old_level,
        'new_level', v_new_level,
        'total_xp', v_new_xp
    ) INTO v_result;

    RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.award_salesperson_xp(uuid, integer, text, text, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.award_salesperson_xp(uuid, integer, text, text, uuid)
  TO service_role;

-- ---------------------------------------------------------------------------
-- 2. XP de venda derivado no servidor: o cliente informa apenas o sale_id.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.award_sale_xp(p_sale_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale record;
  v_per_1000 numeric;
  v_xp integer;
  v_old_xp integer;
  v_new_xp integer;
  v_thresholds jsonb;
  v_prev_level integer;
  v_new_level integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticação obrigatória' USING ERRCODE = '28000';
  END IF;

  SELECT id, salesperson_id, amount, status, client_name
    INTO v_sale
    FROM public.sales
   WHERE id = p_sale_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venda não encontrada' USING ERRCODE = 'P0002';
  END IF;

  -- Status ganho canônico: WON/COUNTED = ('completed','won','closed').
  IF v_sale.status IS NULL
     OR NOT (v_sale.status = ANY (ARRAY['completed','won','closed'])) THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'sale_not_won');
  END IF;

  IF v_sale.salesperson_id IS NULL THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'no_salesperson');
  END IF;

  v_per_1000 := COALESCE(
    (SELECT (value ->> 'SALE_PER_1000')::numeric
       FROM public.app_config WHERE key = 'xp.rewards'),
    10
  );
  v_xp := (floor(v_sale.amount / 1000) * v_per_1000)::int;
  IF v_xp <= 0 THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'no_xp', 'xp_awarded', 0);
  END IF;

  -- Idempotência: N clientes recebem o broadcast e chamam juntos — o lock
  -- por sale_id serializa e o check em xp_history credita uma única vez.
  PERFORM pg_advisory_xact_lock(hashtext('award_sale_xp:' || p_sale_id::text));

  IF EXISTS (
    SELECT 1 FROM public.xp_history
     WHERE source_type = 'sale' AND source_id = p_sale_id::text
  ) THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'already_awarded', 'xp_awarded', 0);
  END IF;

  SELECT total_xp INTO v_old_xp
    FROM public.salesperson_xp
   WHERE salesperson_id = v_sale.salesperson_id;
  v_old_xp := COALESCE(v_old_xp, 0);
  v_new_xp := v_old_xp + v_xp;

  INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
  VALUES (
    v_sale.salesperson_id, v_xp, 'sale', p_sale_id::text,
    'Venda de R$ ' || to_char(v_sale.amount, 'FM999G999G990D00')
      || CASE WHEN v_sale.client_name IS NOT NULL
              THEN ' — ' || v_sale.client_name ELSE '' END
  );

  -- Nível pelos thresholds vivos do app_config (mesma regra do frontend:
  -- nível = quantidade de thresholds <= total_xp).
  SELECT value INTO v_thresholds
    FROM public.app_config WHERE key = 'xp.level_thresholds';
  v_thresholds := COALESCE(v_thresholds,
    '[0,100,250,500,850,1300,1900,2700,3700,5000,6500,8500,11000,14000,18000,23000,30000,40000,55000,75000]'::jsonb);

  SELECT count(*) INTO v_new_level
    FROM jsonb_array_elements_text(v_thresholds) AS t(v)
   WHERE v::numeric <= v_new_xp;
  v_new_level := GREATEST(v_new_level, 1);
  SELECT count(*) INTO v_prev_level
    FROM jsonb_array_elements_text(v_thresholds) AS t(v)
   WHERE v::numeric <= v_old_xp;
  v_prev_level := GREATEST(v_prev_level, 1);

  UPDATE public.salesperson_xp
     SET current_level = GREATEST(current_level, v_new_level),
         updated_at = now()
   WHERE salesperson_id = v_sale.salesperson_id;

  RETURN jsonb_build_object(
    'awarded', true,
    'xp_awarded', v_xp,
    'leveled_up', v_new_level > v_prev_level,
    'new_level', v_new_level,
    'previous_level', v_prev_level,
    'total_xp', v_new_xp
  );
END;
$$;

REVOKE ALL ON FUNCTION public.award_sale_xp(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_sale_xp(uuid) TO authenticated, service_role;

COMMENT ON FUNCTION public.award_sale_xp(uuid) IS
  'Credita XP de venda com amount derivado do banco (nunca do cliente). Idempotente por sale_id.';

-- ---------------------------------------------------------------------------
-- 3. add_salesperson_xp: auto-crédito ilimitado — só service_role/private.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regprocedure('public.add_salesperson_xp(uuid,integer,text)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.add_salesperson_xp(uuid, integer, text) FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.add_salesperson_xp(uuid, integer, text) TO service_role';
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Placar de corrida: RPCs só no servidor + guarda de coluna em race_cars.
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.increment_race_car_wins(uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_race_car_overtakes(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_race_car_wins(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_race_car_overtakes(uuid) TO service_role;

-- update_own_car/insert_own_car não restringem coluna: sem esta guarda, um
-- UPDATE direto do cliente fabricava total_wins/overtakes/races. auth.role()
-- é NULL em SQL direto (migrations/admin) — só bloqueia chamadas PostgREST.
CREATE OR REPLACE FUNCTION public.race_cars_guard_counters()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.role() IS NOT NULL AND auth.role() <> 'service_role' THEN
    IF TG_OP = 'INSERT' THEN
      IF COALESCE(NEW.total_wins, 0) <> 0
         OR COALESCE(NEW.total_overtakes, 0) <> 0
         OR COALESCE(NEW.total_races, 0) <> 0 THEN
        RAISE EXCEPTION 'Contadores de corrida são gerenciados pelo servidor'
          USING ERRCODE = '42501';
      END IF;
    ELSIF NEW.total_wins IS DISTINCT FROM OLD.total_wins
       OR NEW.total_overtakes IS DISTINCT FROM OLD.total_overtakes
       OR NEW.total_races IS DISTINCT FROM OLD.total_races THEN
      RAISE EXCEPTION 'Contadores de corrida são gerenciados pelo servidor'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_race_cars_guard_counters ON public.race_cars;
CREATE TRIGGER trg_race_cars_guard_counters
  BEFORE INSERT OR UPDATE ON public.race_cars
  FOR EACH ROW EXECUTE FUNCTION public.race_cars_guard_counters();

-- ---------------------------------------------------------------------------
-- 5. Progresso de desafios: recomputado do banco, nunca informado pelo
--    cliente. challenge_type → fonte real:
--      sales              → sales (status WON canônico) na janela
--      proposals          → quotes criadas na janela
--      follow_up          → follow_up_audit_logs do usuário na janela
--      calls/emails/meetings/demos/linkedin/whatsapp → activities do tipo
--      any/activity/outros → qualquer activity na janela
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.compute_challenge_progress_value(
  p_salesperson_id uuid,
  p_challenge_type text,
  p_start date,
  p_end date
) RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_types activity_type[];
  v_val integer;
BEGIN
  IF p_challenge_type = 'sales' THEN
    -- WON canônico: ('completed','won','closed')
    SELECT count(*) INTO v_val
      FROM public.sales s
     WHERE s.salesperson_id = p_salesperson_id
       AND s.status = ANY (ARRAY['completed','won','closed'])
       AND s.created_at::date BETWEEN p_start AND p_end;
  ELSIF p_challenge_type = 'proposals' THEN
    SELECT count(*) INTO v_val
      FROM public.quotes q
     WHERE q.created_by = p_salesperson_id
       AND q.created_at::date BETWEEN p_start AND p_end;
  ELSIF p_challenge_type = 'follow_up' THEN
    SELECT count(*) INTO v_val
      FROM public.follow_up_audit_logs f
     WHERE f.user_id = (
             SELECT sp.auth_user_id FROM public.salespeople sp
              WHERE sp.id = p_salesperson_id
           )
       AND f.created_at::date BETWEEN p_start AND p_end;
  ELSE
    v_types := CASE p_challenge_type
      WHEN 'calls' THEN ARRAY['call'::activity_type]
      WHEN 'emails' THEN ARRAY['email'::activity_type]
      WHEN 'meetings' THEN ARRAY['meeting'::activity_type]
      WHEN 'demos' THEN ARRAY['meeting'::activity_type]
      WHEN 'linkedin' THEN ARRAY['linkedin'::activity_type]
      WHEN 'whatsapp' THEN ARRAY['whatsapp'::activity_type]
      ELSE NULL -- 'any'/'activity'/desconhecidos: qualquer tipo
    END;
    SELECT count(*) INTO v_val
      FROM public.activities a
     WHERE a.salesperson_id = p_salesperson_id
       AND a.created_at::date BETWEEN p_start AND p_end
       AND (v_types IS NULL OR a.activity_type = ANY (v_types));
  END IF;
  RETURN COALESCE(v_val, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.compute_challenge_progress_value(uuid, text, date, date)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.compute_challenge_progress_value(uuid, text, date, date)
  TO service_role;

CREATE OR REPLACE FUNCTION public.sync_challenge_progress(
  p_salesperson_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_scope uuid[];
  v_sp uuid;
  v_challenge record;
  v_val integer;
  v_done boolean;
  v_upserts integer := 0;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.role() <> 'service_role' THEN
    -- Cliente: só o próprio vendedor (admin/manager pode apontar outro).
    v_sp := public.get_current_salesperson_id();
    IF v_sp IS NULL THEN
      RAISE EXCEPTION 'Perfil comercial não encontrado' USING ERRCODE = 'P0001';
    END IF;
    IF p_salesperson_id IS NOT NULL
       AND p_salesperson_id <> v_sp
       AND NOT public.is_admin_or_manager(auth.uid()) THEN
      RAISE EXCEPTION 'forbidden: só o próprio progresso pode ser sincronizado';
    END IF;
    v_scope := ARRAY[COALESCE(p_salesperson_id, v_sp)];
  END IF;
  -- service_role / cron (auth.uid() NULL): p_salesperson_id NULL → todos.

  FOR v_sp IN
    SELECT id FROM public.salespeople
     WHERE v_scope IS NULL OR id = ANY (v_scope)
  LOOP
    -- Semanais: desafios ativos cuja janela cobre hoje.
    FOR v_challenge IN
      SELECT id, challenge_type, target_value, start_date, end_date
        FROM public.weekly_challenges
       WHERE is_active
         AND CURRENT_DATE BETWEEN start_date AND end_date
    LOOP
      v_val := public.compute_challenge_progress_value(
        v_sp, v_challenge.challenge_type, v_challenge.start_date, v_challenge.end_date);
      v_done := v_val >= v_challenge.target_value;

      INSERT INTO public.challenge_progress
        (challenge_id, salesperson_id, current_value, completed_at)
      VALUES (v_challenge.id, v_sp, v_val, CASE WHEN v_done THEN now() ELSE NULL END)
      ON CONFLICT (challenge_id, salesperson_id) DO UPDATE
        SET current_value = EXCLUDED.current_value,
            completed_at = COALESCE(
              challenge_progress.completed_at, EXCLUDED.completed_at),
            updated_at = now();

      v_upserts := v_upserts + 1;
    END LOOP;

    -- Diários: desafios ativos do dia.
    FOR v_challenge IN
      SELECT id, challenge_type, target_value, challenge_date
        FROM public.daily_challenges
       WHERE is_active
         AND challenge_date = CURRENT_DATE
    LOOP
      v_val := public.compute_challenge_progress_value(
        v_sp, v_challenge.challenge_type, v_challenge.challenge_date, v_challenge.challenge_date);
      v_done := v_val >= v_challenge.target_value;

      INSERT INTO public.daily_challenge_progress
        (challenge_id, salesperson_id, current_value, completed_at)
      VALUES (v_challenge.id, v_sp, v_val, CASE WHEN v_done THEN now() ELSE NULL END)
      ON CONFLICT (challenge_id, salesperson_id) DO UPDATE
        SET current_value = EXCLUDED.current_value,
            completed_at = COALESCE(
              daily_challenge_progress.completed_at, EXCLUDED.completed_at),
            updated_at = now();

      v_upserts := v_upserts + 1;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('synced', v_upserts);
END;
$$;

REVOKE ALL ON FUNCTION public.sync_challenge_progress(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_challenge_progress(uuid) TO authenticated, service_role;

COMMENT ON FUNCTION public.sync_challenge_progress(uuid) IS
  'Recomputa o progresso de desafios semanais/diários a partir das tabelas reais. Cliente sincroniza só o próprio; service_role/cron, todos.';

-- Recompute diário para todos os vendedores (após a rotação dos desafios).
DO $$
BEGIN
  PERFORM cron.unschedule('challenge-progress-sync')
  WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'challenge-progress-sync'
  );
  PERFORM cron.schedule(
    'challenge-progress-sync',
    '15 3 * * *',
    'SELECT public.sync_challenge_progress()'
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 6. canonical_phone_key: DDI '55' não pode vazar para o sufixo nacional.
--    Fixo com DDI (55 + DDD + 8 dígitos = 12 dígitos) gerava '5' + número,
--    divergindo do mesmo número sem DDI (10 dígitos).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.canonical_phone_key(p_phone text)
RETURNS text
LANGUAGE sql
IMMUTABLE
STRICT
SET search_path = public
AS $$
  SELECT right(
    CASE
      -- com DDI 55 e número nacional completo (10-11 dígitos após o DDI):
      -- remove o DDI para convergir com o mesmo número gravado sem DDI
      WHEN left(d.digits, 2) = '55' AND length(d.digits) - 2 BETWEEN 10 AND 11
        THEN substr(d.digits, 3)
      ELSE d.digits
    END, 11)
  FROM (SELECT regexp_replace(p_phone, '\D', '', 'g') AS digits) d;
$$;

REVOKE ALL ON FUNCTION public.canonical_phone_key(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.canonical_phone_key(text) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 7. anonymize_data_subject: mesmo corpo de 20261018190000 com:
--    a) match por telefone canônico em clients (v_name, v_client_ids e o
--       UPDATE) e account_contacts — antes o titular só por telefone não
--       era localizado;
--    b) cobertura de email_logs.recipient_email,
--       email_tracking_events.recipient_email, email_bulk_drafts
--       (recipient_email + recipient_name, incluindo match por client_id) e
--       conversation_analyses (transcript + decision_makers);
--    c) refresh best-effort de mv_client_ltv ao final.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.anonymize_data_subject(
  p_subject_email text DEFAULT NULL,
  p_subject_id uuid DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_ip text DEFAULT NULL,
  p_request_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
  v_name text;
  v_client_ids uuid[];
  v_counts jsonb := '{}'::jsonb;
  v_n bigint;
BEGIN
  IF auth.role() <> 'service_role'
     AND NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden: somente admin/manager ou service_role podem anonimizar titulares';
  END IF;

  IF p_subject_email IS NULL AND p_subject_id IS NULL AND p_phone IS NULL AND p_ip IS NULL THEN
    RAISE EXCEPTION 'pelo menos um identificador do titular é obrigatório (email, subject_id, phone ou ip)';
  END IF;

  v_token := left(md5(
    coalesce(lower(p_subject_email), '') || '|' ||
    coalesce(p_subject_id::text, '') || '|' ||
    coalesce(p_phone, '')
  ), 16);
  v_name := 'Titular anonimizado ' || v_token;

  -- Captura o nome atual do titular (quando houver) para limpar colunas
  -- que só guardam o nome — usado SOMENTE dentro das vendas do próprio
  -- titular (v_client_ids), nunca como match global (homônimos).
  BEGIN
    SELECT name INTO v_name
    FROM public.clients
    WHERE (p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email))
       OR (p_subject_id IS NOT NULL AND id = p_subject_id)
       OR (p_phone IS NOT NULL AND phone IS NOT NULL
           AND public.canonical_phone_key(phone) = public.canonical_phone_key(p_phone))
    LIMIT 1;
    v_name := COALESCE(v_name, 'Titular anonimizado ' || v_token);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_name := 'Titular anonimizado ' || v_token;
  END;

  -- Ids dos clientes do titular: escopo id-based para as colunas que só
  -- guardam nome (activities.contact_name, buying_committee.contact_name).
  BEGIN
    SELECT array_agg(id) INTO v_client_ids
    FROM public.clients
    WHERE (p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email))
       OR (p_subject_id IS NOT NULL AND id = p_subject_id)
       OR (p_phone IS NOT NULL AND phone IS NOT NULL
           AND public.canonical_phone_key(phone) = public.canonical_phone_key(p_phone));
    v_client_ids := COALESCE(v_client_ids, '{}'::uuid[]);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_client_ids := '{}'::uuid[];
  END;

  -- ---- pessoas/contatos ----

  BEGIN
    UPDATE public.clients
       SET name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid',
           phone = NULL,
           updated_at = now()
     WHERE (p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email))
        OR (p_subject_id IS NOT NULL AND id = p_subject_id)
        OR (p_phone IS NOT NULL AND phone IS NOT NULL
            AND public.canonical_phone_key(phone) = public.canonical_phone_key(p_phone));
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('clients', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('clients', 0);
  END;

  BEGIN
    UPDATE public.account_contacts
       SET name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid',
           phone = NULL,
           linkedin_url = NULL,
           notes = NULL
     WHERE (p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email))
        OR (p_phone IS NOT NULL AND phone IS NOT NULL
            AND public.canonical_phone_key(phone) = public.canonical_phone_key(p_phone));
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('account_contacts', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('account_contacts', 0);
  END;

  BEGIN
    UPDATE public.person_intelligence
       SET full_name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid',
           current_title = NULL,
           previous_titles = '[]'::jsonb,
           linkedin_url = NULL,
           updated_at = now()
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('person_intelligence', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('person_intelligence', 0);
  END;

  BEGIN
    UPDATE public.deal_stakeholders
       SET name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid',
           phone = NULL,
           linkedin_url = NULL,
           notes = NULL
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('deal_stakeholders', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('deal_stakeholders', 0);
  END;

  BEGIN
    UPDATE public.buying_committee_members
       SET contact_name = 'Titular anonimizado ' || v_token,
           contact_email = 'anon-' || v_token || '@anon.invalid',
           notes = NULL
     WHERE p_subject_email IS NOT NULL AND lower(contact_email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('buying_committee_members', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('buying_committee_members', 0);
  END;

  -- buying_committee só tem contact_name: antes casava por nome global e
  -- destruía dados de homônimos. Agora limita às vendas do titular
  -- (client_id resolvido por e-mail/subject_id).
  BEGIN
    UPDATE public.buying_committee
       SET contact_name = 'Titular anonimizado ' || v_token,
           notes = NULL
     WHERE contact_name = v_name
       AND sale_id IN (
         SELECT s.id FROM public.sales s WHERE s.client_id = ANY(v_client_ids)
       );
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('buying_committee', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('buying_committee', 0);
  END;

  BEGIN
    UPDATE public.document_signers
       SET name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid'
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('document_signers', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('document_signers', 0);
  END;

  BEGIN
    UPDATE public.csat_ces_surveys
       SET contact_email = 'anon-' || v_token || '@anon.invalid'
     WHERE p_subject_email IS NOT NULL AND lower(contact_email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('csat_ces_surveys', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('csat_ces_surveys', 0);
  END;

  -- Logs e filas de e-mail: recipient_email era PII preservada.
  BEGIN
    UPDATE public.email_logs
       SET recipient_email = 'anon-' || v_token || '@anon.invalid'
     WHERE p_subject_email IS NOT NULL AND lower(recipient_email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('email_logs', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('email_logs', 0);
  END;

  BEGIN
    UPDATE public.email_tracking_events
       SET recipient_email = 'anon-' || v_token || '@anon.invalid'
     WHERE p_subject_email IS NOT NULL AND lower(recipient_email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('email_tracking_events', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('email_tracking_events', 0);
  END;

  -- Rascunhos de envio em massa: além do e-mail, casa por client_id do
  -- titular (cobra o titular identificado só por telefone).
  BEGIN
    UPDATE public.email_bulk_drafts
       SET recipient_email = 'anon-' || v_token || '@anon.invalid',
           recipient_name = 'Titular anonimizado ' || v_token,
           updated_at = now()
     WHERE (p_subject_email IS NOT NULL AND lower(recipient_email) = lower(p_subject_email))
        OR client_id = ANY (v_client_ids);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('email_bulk_drafts', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('email_bulk_drafts', 0);
  END;

  -- Transcrições/análises de conversa dos clientes do titular: transcript é
  -- NOT NULL, então recebe marcador; decision_makers guarda nomes de pessoas.
  BEGIN
    UPDATE public.conversation_analyses
       SET transcript = 'Transcrição anonimizada',
           decision_makers = '{}'::text[]
     WHERE client_id = ANY (v_client_ids);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('conversation_analyses', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('conversation_analyses', 0);
  END;

  -- channel_interactions: casa por e-mail ou telefone canônico do titular
  -- em contact_info — o OR por contact_name global removia dados de
  -- homônimos que nunca foram o titular.
  BEGIN
    UPDATE public.channel_interactions
       SET contact_name = 'Titular anonimizado ' || v_token,
           contact_info = 'anon-' || v_token || '@anon.invalid'
     WHERE (p_subject_email IS NOT NULL AND lower(contact_info) = lower(p_subject_email))
        OR (p_phone IS NOT NULL
            AND (contact_info = p_phone
                 OR public.canonical_phone_key(contact_info) = public.canonical_phone_key(p_phone)));
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('channel_interactions', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('channel_interactions', 0);
  END;

  -- activities só tem contact_name: mesmo critério do buying_committee —
  -- nome dentro das vendas do titular, nunca match global por nome.
  BEGIN
    UPDATE public.activities
       SET contact_name = 'Titular anonimizado ' || v_token
     WHERE contact_name = v_name
       AND sale_id IN (
         SELECT s.id FROM public.sales s WHERE s.client_id = ANY(v_client_ids)
       );
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('activities', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('activities', 0);
  END;

  BEGIN
    UPDATE public.suppliers
       SET contact_name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid',
           phone = NULL,
           cnpj = NULL,
           address = NULL,
           updated_at = now()
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('suppliers', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('suppliers', 0);
  END;

  BEGIN
    UPDATE public.salespeople
       SET name = 'Titular anonimizado ' || v_token,
           email = 'anon-' || v_token || '@anon.invalid',
           avatar_url = NULL,
           updated_at = now()
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('salespeople', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('salespeople', 0);
  END;

  -- Tombstone de supressão: email_opt_outs NÃO é anonimizado. A lista de
  -- opt-out é a base legal para nunca mais contatar o titular — apagar o
  -- e-mail aqui faria um titular reimportado voltar a receber mensagens.
  BEGIN
    SELECT count(*) INTO v_n
    FROM public.email_opt_outs
    WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    v_counts := v_counts || jsonb_build_object('email_opt_outs_preserved', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('email_opt_outs_preserved', 0);
  END;

  BEGIN
    UPDATE public.notification_preferences
       SET email = 'anon-' || v_token || '@anon.invalid'
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('notification_preferences', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('notification_preferences', 0);
  END;

  -- ---- telefone (SMS/MFA/chamadas/mensagens) ----

  BEGIN
    UPDATE public.sms_verification_codes
       SET phone_number = 'anon-' || v_token
     WHERE p_phone IS NOT NULL AND phone_number = p_phone;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('sms_verification_codes', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('sms_verification_codes', 0);
  END;

  BEGIN
    UPDATE public.user_mfa_settings
       SET phone_number = NULL
     WHERE p_phone IS NOT NULL AND phone_number = p_phone;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('user_mfa_settings', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('user_mfa_settings', 0);
  END;

  BEGIN
    UPDATE public.twilio_call_sessions
       SET from_number = CASE WHEN from_number = p_phone THEN 'anon-' || v_token ELSE from_number END,
           to_number   = CASE WHEN to_number   = p_phone THEN 'anon-' || v_token ELSE to_number   END
     WHERE p_phone IS NOT NULL AND (from_number = p_phone OR to_number = p_phone);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('twilio_call_sessions', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('twilio_call_sessions', 0);
  END;

  BEGIN
    UPDATE public.outbound_messages
       SET to_number = 'anon-' || v_token
     WHERE p_phone IS NOT NULL AND to_number = p_phone;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('outbound_messages', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('outbound_messages', 0);
  END;

  BEGIN
    UPDATE public.integration_logs
       SET recipient = 'anon-' || v_token || '@anon.invalid'
     WHERE p_subject_email IS NOT NULL AND lower(recipient) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('integration_logs', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('integration_logs', 0);
  END;

  -- ---- website_visitor_logs (IP + empresa desanonimizada) ----

  BEGIN
    UPDATE public.website_visitor_logs
       SET ip_address = NULL,
           company_name = NULL,
           domain = NULL,
           referrer = NULL,
           legal_basis = 'anonymized',
           retention_expires_at = now()
     WHERE (p_ip IS NOT NULL AND ip_address::text = p_ip)
        OR consent_record_id IN (
             SELECT c.id FROM public.consent_records c
             WHERE c.subject_id = p_subject_id
                OR (p_subject_email IS NOT NULL AND lower(c.subject_email) = lower(p_subject_email))
           );
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('website_visitor_logs', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('website_visitor_logs', 0);
  END;

  -- ---- logs de segurança/sessão com IP e user-agent do titular ----

  BEGIN
    UPDATE public.audit_log
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('audit_log', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('audit_log', 0);
  END;

  BEGIN
    UPDATE public.audit_logs
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL
       AND (changed_by = p_subject_id OR actor_id = p_subject_id);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('audit_logs', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('audit_logs', 0);
  END;

  BEGIN
    UPDATE public.login_attempts
       SET email = 'anon-' || v_token || '@anon.invalid',
           ip_address = NULL,
           user_agent = NULL
     WHERE p_subject_email IS NOT NULL AND lower(email) = lower(p_subject_email);
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('login_attempts', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('login_attempts', 0);
  END;

  BEGIN
    UPDATE public.session_activity
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('session_activity', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('session_activity', 0);
  END;

  BEGIN
    UPDATE public.active_sessions
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('active_sessions', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('active_sessions', 0);
  END;

  BEGIN
    UPDATE public.known_devices
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('known_devices', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('known_devices', 0);
  END;

  BEGIN
    UPDATE public.security_events
       SET ip_address = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('security_events', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('security_events', 0);
  END;

  BEGIN
    UPDATE public.login_alerts
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('login_alerts', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('login_alerts', 0);
  END;

  BEGIN
    UPDATE public.mfa_verification_attempts
       SET ip_address = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('mfa_verification_attempts', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('mfa_verification_attempts', 0);
  END;

  BEGIN
    UPDATE public.password_reset_requests
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('password_reset_requests', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('password_reset_requests', 0);
  END;

  BEGIN
    UPDATE public.reauthentication_requests
       SET ip_address = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('reauthentication_requests', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('reauthentication_requests', 0);
  END;

  BEGIN
    UPDATE public.user_2fa_log
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('user_2fa_log', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('user_2fa_log', 0);
  END;

  BEGIN
    UPDATE public.access_denied_logs
       SET ip_address = NULL, user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('access_denied_logs', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('access_denied_logs', 0);
  END;

  BEGIN
    UPDATE public.error_logs
       SET user_agent = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('error_logs', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('error_logs', 0);
  END;

  BEGIN
    UPDATE public.web_vitals_samples
       SET user_agent = NULL, session_id = NULL
     WHERE p_subject_id IS NOT NULL AND user_id = p_subject_id;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('web_vitals_samples', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('web_vitals_samples', 0);
  END;

  -- Revoga consentimentos ativos do titular (registro da eliminação)
  BEGIN
    UPDATE public.consent_records
       SET revoked_at = now(), updated_at = now()
     WHERE revoked_at IS NULL
       AND (subject_id = p_subject_id
            OR (p_subject_email IS NOT NULL AND lower(subject_email) = lower(p_subject_email)));
    GET DIAGNOSTICS v_n = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('consent_records_revoked', v_n);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_counts := v_counts || jsonb_build_object('consent_records_revoked', 0);
  END;

  -- mv_client_ltv carrega clients.name — sem refresh o nome antigo fica
  -- servido até a agenda de refresh_materialized_views() rodar. REFRESH
  -- sem CONCURRENTLY é permitido em função; falhas não abortam a
  -- anonimização (a agenda cobre o reprocessamento).
  BEGIN
    REFRESH MATERIALIZED VIEW public.mv_client_ltv;
    v_counts := v_counts || jsonb_build_object('mv_client_ltv_refreshed', true);
  EXCEPTION WHEN OTHERS THEN
    v_counts := v_counts || jsonb_build_object('mv_client_ltv_refreshed', false);
  END;

  -- Se a chamada veio de uma solicitação de titular, marca-a como concluída.
  IF p_request_id IS NOT NULL THEN
    UPDATE public.data_subject_requests
       SET status = 'completed',
           processed_by = auth.uid(),
           processed_at = now(),
           result = v_counts,
           updated_at = now()
     WHERE id = p_request_id;
  END IF;

  RETURN v_counts;
END;
$$;


REVOKE ALL ON FUNCTION public.anonymize_data_subject(text, uuid, text, text, uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.anonymize_data_subject(text, uuid, text, text, uuid)
  TO authenticated, service_role;
