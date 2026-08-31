-- Hardening canônico P0: fecha exposições anônimas sem remover dados ou objetos.
--
-- Princípios:
--   * views internas obedecem ao RLS das tabelas-base (security_invoker);
--   * fluxos pré-login recebem apenas respostas agregadas e limitadas;
--   * RPCs mutáveis internas ficam exclusivas do service_role;
--   * helpers administrativos validam a identidade real de auth.uid().

-- ---------------------------------------------------------------------------
-- 1. Views internas: impedir bypass do RLS pelo owner da view.
-- ---------------------------------------------------------------------------
ALTER VIEW public.activities_active SET (security_invoker = true);
ALTER VIEW public.clients_active SET (security_invoker = true);
ALTER VIEW public.tasks_active SET (security_invoker = true);
ALTER VIEW public.v_active_activities SET (security_invoker = true);
ALTER VIEW public.v_active_clients SET (security_invoker = true);
ALTER VIEW public.v_active_products SET (security_invoker = true);
ALTER VIEW public.v_active_suppliers SET (security_invoker = true);
ALTER VIEW public.v_active_teams SET (security_invoker = true);
ALTER VIEW public.v_deleted_clients SET (security_invoker = true);

REVOKE ALL ON public.activities_active FROM PUBLIC, anon;
REVOKE ALL ON public.clients_active FROM PUBLIC, anon;
REVOKE ALL ON public.tasks_active FROM PUBLIC, anon;
REVOKE ALL ON public.v_active_activities FROM PUBLIC, anon;
REVOKE ALL ON public.v_active_clients FROM PUBLIC, anon;
REVOKE ALL ON public.v_active_products FROM PUBLIC, anon;
REVOKE ALL ON public.v_active_suppliers FROM PUBLIC, anon;
REVOKE ALL ON public.v_active_teams FROM PUBLIC, anon;
REVOKE ALL ON public.v_deleted_clients FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.activities_active TO authenticated, service_role;
GRANT SELECT ON public.clients_active TO authenticated, service_role;
GRANT SELECT ON public.tasks_active TO authenticated, service_role;
GRANT SELECT ON public.v_active_activities TO authenticated, service_role;
GRANT SELECT ON public.v_active_clients TO authenticated, service_role;
GRANT SELECT ON public.v_active_products TO authenticated, service_role;
GRANT SELECT ON public.v_active_suppliers TO authenticated, service_role;
GRANT SELECT ON public.v_active_teams TO authenticated, service_role;
GRANT SELECT ON public.v_deleted_clients TO service_role;

-- Materialized views não suportam security_invoker. A experiência pública usa
-- race_spectator_view; o ranking competitivo completo exige autenticação.
REVOKE ALL ON public.mv_competitive_ranking FROM PUBLIC, anon;
GRANT SELECT ON public.mv_competitive_ranking TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. Remover policies placeholder que tornavam o RLS equivalente a acesso
--    público. As policies de ownership/RBAC existentes continuam vigentes.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view active activities" ON public.activities;
DROP POLICY IF EXISTS "Users can view active clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view active products" ON public.products;
DROP POLICY IF EXISTS "Users can view active suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Users can view active teams" ON public.teams;

-- Configurações de negócio são consumidas somente dentro de ProtectedRoute ou
-- por service_role. Mantemos a semântica de leitura, restringindo a role SQL.
DROP POLICY IF EXISTS "Public read for alert templates" ON public.cadence_alert_templates;
CREATE POLICY "Authenticated read for alert templates"
  ON public.cadence_alert_templates FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Everyone can view funnel rules" ON public.cadence_funnel_rules;
CREATE POLICY "Authenticated users can view funnel rules"
  ON public.cadence_funnel_rules FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Public read for outcome rules" ON public.cadence_outcome_rules;
CREATE POLICY "Authenticated read for outcome rules"
  ON public.cadence_outcome_rules FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view versions" ON public.entity_versions;
CREATE POLICY "Authenticated users can view versions"
  ON public.entity_versions FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "cs_ep_select" ON public.expansion_playbooks;
CREATE POLICY "Authenticated users can view expansion playbooks"
  ON public.expansion_playbooks FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can read follow_up_settings" ON public.follow_up_settings;
CREATE POLICY "Authenticated users can read follow_up_settings"
  ON public.follow_up_settings FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view active templates" ON public.follow_up_templates;
CREATE POLICY "Authenticated users can view active templates"
  ON public.follow_up_templates FOR SELECT TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Users can view their own XP" ON public.salesperson_xp;
CREATE POLICY "Authenticated users can view XP"
  ON public.salesperson_xp FOR SELECT TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- 3. Logs operacionais: o antigo ALL/USING(true) permitia DELETE por anon.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Deny writes to non-service on maintenance_log"
  ON public.maintenance_log;

REVOKE ALL ON public.maintenance_log FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.maintenance_log FROM authenticated;
GRANT SELECT ON public.maintenance_log TO authenticated;
GRANT ALL ON public.maintenance_log TO service_role;

-- A policy administrativa de SELECT já existente é preservada.

-- ---------------------------------------------------------------------------
-- 4. Tentativas de login: substituir SELECT/INSERT anônimo cru por RPCs
--    agregadas, validadas e com contenção de abuso.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "anon can insert login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "anon can read own login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Admins can view login_attempts" ON public.login_attempts;

CREATE POLICY "Admins can view login_attempts"
  ON public.login_attempts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

REVOKE ALL ON public.login_attempts FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.login_attempts FROM authenticated;
GRANT SELECT ON public.login_attempts TO authenticated;
GRANT ALL ON public.login_attempts TO service_role;

CREATE OR REPLACE FUNCTION public.get_login_lockout_status(p_email text)
RETURNS TABLE (
  attempts integer,
  last_failed_at timestamptz,
  lockout_until timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(COALESCE(p_email, '')));
  v_headers jsonb := COALESCE(
    NULLIF(current_setting('request.headers', true), '')::jsonb,
    '{}'::jsonb
  );
  v_ip text;
  v_last_success timestamptz;
  v_attempts integer := 0;
  v_last_failed timestamptz;
  v_recent integer := 0;
  v_recent_failed timestamptz;
  v_lockout_seconds integer;
BEGIN
  IF length(v_email) < 3
     OR length(v_email) > 320
     OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' THEN
    RAISE EXCEPTION 'email_invalid' USING ERRCODE = '22023';
  END IF;

  v_ip := left(trim(split_part(COALESCE(
    v_headers ->> 'cf-connecting-ip',
    v_headers ->> 'x-forwarded-for',
    v_headers ->> 'x-real-ip',
    ''
  ), ',', 1)), 64);
  IF v_ip = '' THEN
    v_ip := NULL;
  ELSE
    BEGIN
      v_ip := host(v_ip::inet);
    EXCEPTION WHEN invalid_text_representation THEN
      v_ip := NULL;
    END;
  END IF;

  SELECT max(la.created_at)
    INTO v_last_success
    FROM public.login_attempts AS la
   WHERE lower(la.email) = v_email
     AND la.success IS TRUE
     AND (v_ip IS NULL OR la.ip_address = v_ip)
     AND la.created_at >= now() - interval '24 hours';

  SELECT count(*)::integer, max(la.created_at)
    INTO v_attempts, v_last_failed
    FROM public.login_attempts AS la
   WHERE lower(la.email) = v_email
     AND la.success IS FALSE
     AND (v_ip IS NULL OR la.ip_address = v_ip)
     AND la.created_at >= now() - interval '24 hours'
     AND (v_last_success IS NULL OR la.created_at > v_last_success);

  -- Espelha o limitador de escrita. Assim, um ataque distribuído ao mesmo
  -- e-mail (ou muitas contas pela mesma origem) não transforma a exceção de
  -- rate limit em fail-open no cliente: a consulta subsequente retorna lockout.
  SELECT count(*)::integer, max(la.created_at)
    INTO v_recent, v_recent_failed
    FROM public.login_attempts AS la
   WHERE la.success IS FALSE
     AND la.created_at >= now() - interval '1 minute'
     AND (
       lower(la.email) = v_email
       OR (v_ip IS NOT NULL AND la.ip_address = v_ip)
     );

  IF v_recent >= 10 THEN
    v_attempts := GREATEST(v_attempts, v_recent);
    v_last_failed := GREATEST(v_last_failed, v_recent_failed);
  END IF;

  IF v_attempts >= 5 AND v_last_failed IS NOT NULL THEN
    v_lockout_seconds := LEAST(
      3600,
      30 * power(2::numeric, LEAST(10, floor(v_attempts / 5.0)::integer - 1))::integer
    );
  END IF;

  RETURN QUERY
  SELECT v_attempts,
         v_last_failed,
         CASE
           WHEN v_lockout_seconds IS NULL THEN NULL::timestamptz
           ELSE v_last_failed + make_interval(secs => v_lockout_seconds)
         END;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_failed_login_attempt(
  p_email text,
  p_failure_reason text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(COALESCE(p_email, '')));
  v_headers jsonb := COALESCE(
    NULLIF(current_setting('request.headers', true), '')::jsonb,
    '{}'::jsonb
  );
  v_ip text;
  v_recent integer;
BEGIN
  IF length(v_email) < 3
     OR length(v_email) > 320
     OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' THEN
    RAISE EXCEPTION 'email_invalid' USING ERRCODE = '22023';
  END IF;

  v_ip := left(trim(split_part(COALESCE(
    v_headers ->> 'cf-connecting-ip',
    v_headers ->> 'x-forwarded-for',
    v_headers ->> 'x-real-ip',
    ''
  ), ',', 1)), 64);
  IF v_ip = '' THEN
    v_ip := NULL;
  ELSE
    BEGIN
      v_ip := host(v_ip::inet);
    EXCEPTION WHEN invalid_text_representation THEN
      v_ip := NULL;
    END;
  END IF;

  SELECT count(*)::integer
    INTO v_recent
    FROM public.login_attempts AS la
   WHERE la.created_at >= now() - interval '1 minute'
     AND (
       lower(la.email) = v_email
       OR (v_ip IS NOT NULL AND la.ip_address = v_ip)
     );

  IF v_recent >= 10 THEN
    RAISE EXCEPTION 'rate_limit_exceeded' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.login_attempts (
    email, ip_address, user_agent, success, failure_reason, created_at
  ) VALUES (
    v_email,
    v_ip,
    left(NULLIF(p_user_agent, ''), 500),
    false,
    left(NULLIF(p_failure_reason, ''), 200),
    now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.record_successful_login_attempt(
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(COALESCE(auth.jwt() ->> 'email', '')));
  v_headers jsonb := COALESCE(
    NULLIF(current_setting('request.headers', true), '')::jsonb,
    '{}'::jsonb
  );
  v_ip text;
BEGIN
  IF auth.uid() IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;

  v_ip := left(trim(split_part(COALESCE(
    v_headers ->> 'cf-connecting-ip',
    v_headers ->> 'x-forwarded-for',
    v_headers ->> 'x-real-ip',
    ''
  ), ',', 1)), 64);
  IF v_ip = '' THEN
    v_ip := NULL;
  ELSE
    BEGIN
      v_ip := host(v_ip::inet);
    EXCEPTION WHEN invalid_text_representation THEN
      v_ip := NULL;
    END;
  END IF;

  INSERT INTO public.login_attempts (
    email, ip_address, user_agent, success, failure_reason, created_at
  ) VALUES (
    v_email,
    v_ip,
    left(NULLIF(p_user_agent, ''), 500),
    true,
    NULL,
    now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_login_lockout_status(text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_failed_login_attempt(text, text, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_successful_login_attempt(text)
  FROM PUBLIC, anon, authenticated;

-- Exceções pré-login deliberadas: não expõem linhas e possuem validação/rate limit.
GRANT EXECUTE ON FUNCTION public.get_login_lockout_status(text)
  TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_failed_login_attempt(text, text, text)
  TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_successful_login_attempt(text)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.get_login_lockout_status(text) IS
  'Resumo pré-login por par e-mail/IP, com contenção agregada de 1 minuto: somente contagem e timestamps; não expõe linhas.';
COMMENT ON FUNCTION public.record_failed_login_attempt(text, text, text) IS
  'Registro pré-login validado, com IP derivado do gateway e limite por minuto.';
COMMENT ON FUNCTION public.record_successful_login_attempt(text) IS
  'Registra sucesso exclusivamente para o e-mail do JWT autenticado.';

-- ---------------------------------------------------------------------------
-- 5. RPCs administrativas e internas.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_2fa_failed_attempts(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_failed_count integer;
BEGIN
  IF auth.role() <> 'service_role'
     AND (
       auth.uid() IS NULL
       OR (
         p_user_id IS DISTINCT FROM auth.uid()
         AND NOT public.is_admin_or_manager(auth.uid())
       )
     ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT count(*)::integer
    INTO v_failed_count
    FROM public.user_2fa_log AS l
   WHERE l.user_id = p_user_id
     AND l.success IS FALSE
     AND l.created_at > now() - interval '15 minutes';

  RETURN v_failed_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_severity text,
  p_description text,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  IF auth.uid() IS NULL AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_severity NOT IN ('low', 'medium', 'high', 'critical') THEN
    RAISE EXCEPTION 'severity_invalid' USING ERRCODE = '22023';
  END IF;
  IF length(trim(COALESCE(p_event_type, ''))) NOT BETWEEN 1 AND 100
     OR length(trim(COALESCE(p_description, ''))) NOT BETWEEN 1 AND 4000 THEN
    RAISE EXCEPTION 'event_payload_invalid' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.security_events (
    user_id, event_type, severity, description, metadata
  ) VALUES (
    auth.uid(),
    left(trim(p_event_type), 100),
    p_severity,
    left(trim(p_description), 4000),
    p_metadata
  ) RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- Helpers genéricos de soft delete: preservam assinaturas legadas, mas deixam
-- de confiar em UUIDs fornecidos pelo cliente e restringem a tabela permitida.
CREATE OR REPLACE FUNCTION public.soft_delete_record(
  p_table_name text,
  p_record_id uuid,
  p_user_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sql text;
  v_actor uuid := auth.uid();
  v_affected integer;
BEGIN
  IF auth.role() <> 'service_role'
     AND (v_actor IS NULL OR NOT public.is_admin_or_manager(v_actor)) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF auth.role() <> 'service_role' AND p_user_id IS DISTINCT FROM v_actor THEN
    RAISE EXCEPTION 'actor_mismatch' USING ERRCODE = '42501';
  END IF;
  IF p_table_name NOT IN ('clients', 'activities', 'products', 'suppliers', 'teams') THEN
    RAISE EXCEPTION 'unsupported_soft_delete_table' USING ERRCODE = '22023';
  END IF;

  v_sql := format(
    'UPDATE public.%I SET deleted_at = now(), deleted_by = $1, delete_reason = $2 WHERE id = $3 AND deleted_at IS NULL',
    p_table_name
  );
  EXECUTE v_sql USING COALESCE(v_actor, p_user_id), left(p_reason, 500), p_record_id;
  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN v_affected = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_deleted_record(
  p_table_name text,
  p_record_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sql text;
  v_affected integer;
BEGIN
  IF auth.role() <> 'service_role'
     AND (auth.uid() IS NULL OR NOT public.is_admin_or_manager(auth.uid())) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF auth.role() <> 'service_role' AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'actor_mismatch' USING ERRCODE = '42501';
  END IF;
  IF p_table_name NOT IN ('clients', 'activities', 'products', 'suppliers', 'teams') THEN
    RAISE EXCEPTION 'unsupported_soft_delete_table' USING ERRCODE = '22023';
  END IF;

  v_sql := format(
    'UPDATE public.%I SET deleted_at = NULL, deleted_by = NULL, delete_reason = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
    p_table_name
  );
  EXECUTE v_sql USING p_record_id;
  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN v_affected = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_deleted_records(
  p_table_name text,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  deleted_at timestamptz,
  deleted_by_email text,
  delete_reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sql text;
BEGIN
  IF auth.role() <> 'service_role'
     AND (auth.uid() IS NULL OR NOT public.is_admin_or_manager(auth.uid())) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF p_table_name NOT IN ('clients', 'activities', 'products', 'suppliers', 'teams') THEN
    RAISE EXCEPTION 'unsupported_soft_delete_table' USING ERRCODE = '22023';
  END IF;
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 200 THEN
    RAISE EXCEPTION 'limit_out_of_range' USING ERRCODE = '22023';
  END IF;

  v_sql := format(
    'SELECT t.id, t.deleted_at, u.email::text, t.delete_reason FROM public.%I AS t LEFT JOIN auth.users AS u ON u.id = t.deleted_by WHERE t.deleted_at IS NOT NULL ORDER BY t.deleted_at DESC LIMIT $1',
    p_table_name
  );
  RETURN QUERY EXECUTE v_sql USING p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.hard_delete_record(
  p_table_name text,
  p_record_id uuid,
  p_admin_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sql text;
  v_affected integer;
BEGIN
  IF auth.role() <> 'service_role'
     AND (
       auth.uid() IS NULL
       OR p_admin_user_id IS DISTINCT FROM auth.uid()
       OR NOT public.has_role(auth.uid(), 'admin'::public.app_role)
     ) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF p_table_name NOT IN ('clients', 'activities', 'products', 'suppliers', 'teams') THEN
    RAISE EXCEPTION 'unsupported_hard_delete_table' USING ERRCODE = '22023';
  END IF;

  v_sql := format(
    'DELETE FROM public.%I WHERE id = $1 AND deleted_at IS NOT NULL',
    p_table_name
  );
  EXECUTE v_sql USING p_record_id;
  GET DIAGNOSTICS v_affected = ROW_COUNT;
  RETURN v_affected = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_record(table_name text, record_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role'
     AND (auth.uid() IS NULL OR NOT public.is_admin_or_manager(auth.uid())) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF table_name NOT IN ('clients', 'activities', 'products', 'suppliers', 'teams') THEN
    RAISE EXCEPTION 'unsupported_soft_delete_table' USING ERRCODE = '22023';
  END IF;

  EXECUTE format(
    'UPDATE public.%I SET deleted_at = NULL, deleted_by = NULL, delete_reason = NULL WHERE id = $1 AND deleted_at IS NOT NULL',
    table_name
  ) USING record_id;
END;
$$;

-- ACL mínimo para funções de usuário.
REVOKE ALL ON FUNCTION public.check_2fa_failed_attempts(uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_security_event(text, text, text, jsonb)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.soft_delete_record(text, uuid, uuid, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.restore_deleted_record(text, uuid, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_deleted_records(text, integer)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.hard_delete_record(text, uuid, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.restore_record(text, uuid)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.check_2fa_failed_attempts(uuid)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, text, text, jsonb)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.soft_delete_record(text, uuid, uuid, text)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.restore_deleted_record(text, uuid, uuid)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_deleted_records(text, integer)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.hard_delete_record(text, uuid, uuid)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.restore_record(text, uuid)
  TO authenticated, service_role;

-- Mutadores internos: nunca devem ser chamados pelo navegador.
REVOKE ALL ON FUNCTION public.claim_pending_cadence_tasks(date, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_pending_cadence_tasks(date, integer)
  TO service_role;

REVOKE ALL ON FUNCTION public.cleanup_expired_narrative_cache()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_narrative_cache()
  TO service_role;

REVOKE ALL ON FUNCTION public.fn_test_simulate_stalled_check(bigint, text, text, timestamptz)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_test_cleanup_cron_alerts(bigint)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_test_backdate_cron_alert(bigint, numeric)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_test_mark_cron_failure(bigint, text, timestamptz, text, text, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_test_simulate_stalled_check(bigint, text, text, timestamptz)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_test_cleanup_cron_alerts(bigint)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_test_backdate_cron_alert(bigint, numeric)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_test_mark_cron_failure(bigint, text, timestamptz, text, text, integer)
  TO service_role;

-- Mutadores de gamificação auditados possuem guards internos, mas não fazem
-- parte de nenhum fluxo pré-autenticação.
REVOKE ALL ON FUNCTION public.add_league_weekly_xp(uuid, integer)
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.increment_combo(uuid)
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.increment_goal_progress(uuid, integer)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_league_weekly_xp(uuid, integer)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_combo(uuid)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_goal_progress(uuid, integer)
  TO authenticated, service_role;

-- O histórico canônico moveu add_salesperson_xp para private, enquanto o
-- catálogo vivo ainda mantém uma cópia pública. Trate ambas sem tornar o
-- replay dependente do drift atual.
DO $$
BEGIN
  IF to_regprocedure('public.add_salesperson_xp(uuid,integer,text)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.add_salesperson_xp(uuid, integer, text) FROM PUBLIC, anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.add_salesperson_xp(uuid, integer, text) TO authenticated, service_role';
  END IF;

  IF to_regprocedure('private.add_salesperson_xp(uuid,integer,text)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION private.add_salesperson_xp(uuid, integer, text) FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION private.add_salesperson_xp(uuid, integer, text) TO service_role';
  END IF;
END;
$$;
