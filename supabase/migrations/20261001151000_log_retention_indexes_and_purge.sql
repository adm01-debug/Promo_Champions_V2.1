-- Retenção de logs: índices compostos + política de purge versionada
-- Pacote de auditoria BANCO DE DADOS/INTEGRIDADE.
--
-- 1. Índices compostos (discriminador + timestamp) nas tabelas de log de alto
--    volume — audit_logs canônica usa entity_type/actor_id/created_at — índices
--    alinhados ao schema real em produção.
-- 2. public.data_retention_policies: política de retenção versionada por tabela
--    (janelas definidas em docs/DATA_RETENTION.md).
-- 3. public.fn_apply_data_retention(): purge em lotes de 10k por política,
--    tolerante a tabela/coluna ausente; website_visitor_logs respeita
--    consent_record_id (só purga sem consentimento ativo).
-- 4. Job pg_cron diário 'data-retention-purge-daily' às 03:45 UTC
--    (escalonado após 'cleanup-stale-logs-daily' das 03:15 do ADR-007).
--
-- Idempotente: CREATE INDEX IF NOT EXISTS, INSERT ... ON CONFLICT DO NOTHING,
-- unschedule+schedule do job. Pode ser reexecutada sem efeito colateral.

-- ============================================================
-- 1. Índices compostos nas tabelas de log
-- ============================================================

DO $$
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_audit_logs_table_changed ON public.audit_logs (entity_type, created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by_changed ON public.audit_logs (actor_id, created_at DESC)';
  END IF;

  IF to_regclass('public.query_telemetry') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_query_telemetry_table_created ON public.query_telemetry (table_name, created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_query_telemetry_user_created ON public.query_telemetry (user_id, created_at DESC)';
  END IF;

  IF to_regclass('public.webhook_inbound_dedupe') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_webhook_dedupe_source_received ON public.webhook_inbound_dedupe (source, received_at DESC)';
  END IF;

  IF to_regclass('public.webhook_inbound_log') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_webhook_inbound_log_source_received ON public.webhook_inbound_log (source, received_at DESC)';
  END IF;

  IF to_regclass('public.website_visitor_logs') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_website_visitor_logs_domain_identified ON public.website_visitor_logs (domain, identified_at DESC)';
  END IF;

  IF to_regclass('public.security_events') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_security_events_user_created ON public.security_events (user_id, created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_security_events_type_created ON public.security_events (event_type, created_at DESC)';
  END IF;

  IF to_regclass('public.session_activity') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_session_activity_user_created ON public.session_activity (user_id, created_at DESC)';
  END IF;

  IF to_regclass('public.error_logs') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_error_logs_user_created ON public.error_logs (user_id, created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_error_logs_created ON public.error_logs (created_at DESC)';
  END IF;

  IF to_regclass('public.web_vitals_samples') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_web_vitals_user_created ON public.web_vitals_samples (user_id, created_at DESC)';
  END IF;

  IF to_regclass('public.login_attempts') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created ON public.login_attempts (email, created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_login_attempts_created ON public.login_attempts (created_at DESC)';
  END IF;

  IF to_regclass('public.integration_logs') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_integration_logs_type_ts ON public.integration_logs (integration_type, "timestamp" DESC)';
  END IF;

  IF to_regclass('public.data_access_log') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_data_access_log_created ON public.data_access_log (created_at DESC)';
  END IF;
END $$;

-- ============================================================
-- 2. Política de retenção versionada
-- ============================================================

CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  table_name text PRIMARY KEY,
  ts_column text NOT NULL DEFAULT 'created_at',
  retention_days integer NOT NULL CHECK (retention_days > 0),
  enabled boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins leem data_retention_policies" ON public.data_retention_policies;
CREATE POLICY "Admins leem data_retention_policies" ON public.data_retention_policies
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

INSERT INTO public.data_retention_policies (table_name, ts_column, retention_days, notes) VALUES
  ('audit_log',                'created_at',    365, 'auditoria: janela jurídica 12m (decisão docs/DATA_RETENTION.md)'),
  ('audit_logs',               'created_at',    365, 'auditoria: janela jurídica 12m'),
  ('data_access_log',          'created_at',    365, 'auditoria de acesso: 12m'),
  ('website_visitor_logs',     'identified_at',  90, 'legítimo interesse LGPD; consent_records prolonga'),
  ('webhook_inbound_dedupe',   'received_at',    30, 'dedupe só precisa da janela de retry'),
  ('webhook_inbound_log',      'received_at',    30, 'log de ingresso operacional'),
  ('query_telemetry',          'created_at',     90, 'telemetria de queries'),
  ('web_vitals_samples',       'created_at',     90, 'telemetria de front-end'),
  ('salesperson_performance_telemetry', 'created_at', 90, 'telemetria de performance'),
  ('error_logs',               'created_at',     90, 'erros de front'),
  ('integration_logs',         'timestamp',      90, 'logs de integração'),
  ('session_activity',         'created_at',     90, 'atividade de sessão'),
  ('login_attempts',           'created_at',    180, 'segurança: janela investigativa maior'),
  ('login_alerts',             'created_at',    180, 'segurança: janela investigativa maior'),
  ('security_events',          'created_at',    365, 'segurança/auditoria: 12m'),
  ('rate_limit_logs',          'created_at',     30, 'rate limiting operacional'),
  ('access_denied_logs',       'created_at',    180, 'segurança: janela investigativa maior')
ON CONFLICT (table_name) DO NOTHING;

-- ============================================================
-- 3. Purge por política (lotes de 10k para não segurar lock)
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_apply_data_retention()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  v_n bigint;
  v_total bigint;
  v_counts jsonb := '{}'::jsonb;
  v_cutoff timestamptz;
  v_batch constant int := 10000;
BEGIN
  FOR r IN
    SELECT p.table_name, p.ts_column, p.retention_days
    FROM public.data_retention_policies p
    WHERE p.enabled
    ORDER BY p.table_name
  LOOP
    v_total := 0;
    v_cutoff := now() - make_interval(days => r.retention_days);

    -- Tabela ou coluna ausente: política pulada sem derrubar o job.
    IF to_regclass('public.' || r.table_name) IS NULL
       OR NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = r.table_name
              AND column_name = r.ts_column) THEN
      v_counts := v_counts || jsonb_build_object(r.table_name, 'skipped:missing');
      CONTINUE;
    END IF;

    -- Qualquer erro numa tabela (coluna id ausente, permissão, drift de schema)
    -- é registrado e não derruba o job das demais.
    BEGIN
      IF r.table_name = 'website_visitor_logs' THEN
        -- Regra LGPD: purga expirados E sem consentimento ativo vinculado.
        LOOP
          EXECUTE format(
            'DELETE FROM public.%I WHERE id IN (
               SELECT w.id FROM public.%I w
               WHERE NOT EXISTS (
                       SELECT 1 FROM public.consent_records c
                       WHERE c.id = w.consent_record_id AND c.revoked_at IS NULL)
                 AND (w.retention_expires_at < now()
                      OR w.consent_record_id IS NOT NULL)
               LIMIT %s)',
            r.table_name, r.table_name, v_batch);
          GET DIAGNOSTICS v_n = ROW_COUNT;
          v_total := v_total + v_n;
          EXIT WHEN v_n = 0;
        END LOOP;
      ELSE
        LOOP
          EXECUTE format(
            'DELETE FROM public.%I WHERE id IN (
               SELECT id FROM public.%I
               WHERE %I < $1
               LIMIT %s)',
            r.table_name, r.table_name, r.ts_column, v_batch)
          USING v_cutoff;
          GET DIAGNOSTICS v_n = ROW_COUNT;
          v_total := v_total + v_n;
          EXIT WHEN v_n = 0;
        END LOOP;
      END IF;

      v_counts := v_counts || jsonb_build_object(r.table_name, v_total);
    EXCEPTION WHEN OTHERS THEN
      v_counts := v_counts || jsonb_build_object(r.table_name, 'error:' || SQLERRM);
    END;
  END LOOP;

  RETURN v_counts;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_apply_data_retention() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_apply_data_retention() TO service_role;

-- ============================================================
-- 4. Job diário de purge (segue o padrão pg_cron do ADR-007)
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('data-retention-purge-daily')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'data-retention-purge-daily');
    PERFORM cron.schedule(
      'data-retention-purge-daily',
      '45 3 * * *',
      'SELECT public.fn_apply_data_retention();'
    );
  END IF;
END $$;
