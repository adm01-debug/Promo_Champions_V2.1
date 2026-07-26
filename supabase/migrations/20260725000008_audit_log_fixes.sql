-- =============================================================================
-- AUDIT FIX ETAPA 8: Audit Log Completeness
-- File: supabase/migrations/20260725000008_audit_log_fixes.sql
-- Created: 2026-07-26
-- Author: Claude Code — Senior Dev + PhD DB Audit
-- Severity: HIGH
--
-- FINDINGS (from ETAPA 8 agent):
--   G1 [CRITICAL] orders trigger: referencia fn_audit_orders() que nunca e' criada
--                  — usar create_audit_trigger_for_table() em vez de DO block inline
--   G2 [HIGH] Ordem de operacoes: colunas do audit_log eram criadas DEPOIS dos
--              triggers — corrigido para ANTES
--   G3 [HIGH] ETL para activity_audit_logs historico: nao existia
--   G4 [MEDIUM] cleanup_old_audit_logs: pg_cron registration faltava
--
-- Decisao de schema:
--   audit_log columns: resource_type, resource_id, action, old_data, new_data,
--                     user_id, ip_address (resource_type=table_name, resource_id=record_id)
--   Todas as audit tables anteriores (audit_logs plural, activity_audit_logs) ->
--   movidas para deprecated schema
-- =============================================================================

BEGIN;

-- FASE 1: Garantir que audit_log TEM as colunas corretas ANTES de criar triggers
-- (CRITICAL: G2 — colunas devem existir antes das funcoes dinamicas)
DO $$
DECLARE
  col_record RECORD;
  has_resource_type BOOLEAN := false;
  has_resource_id BOOLEAN := false;
  has_action BOOLEAN := false;
  has_old_data BOOLEAN := false;
  has_new_data BOOLEAN := false;
  has_user_id BOOLEAN := false;
  has_ip_address BOOLEAN := false;
  has_created_at BOOLEAN := false;
BEGIN
  -- Verificar se a tabela audit_log existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_log'
  ) THEN
    -- Criar a tabela completa se nao existir
    CREATE TABLE IF NOT EXISTS public.audit_log (
      id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
      resource_type TEXT      NOT NULL,         -- nome da tabela (quotes, orders, etc.)
      resource_id   UUID,                       -- PK do registro alterado
      action        TEXT      NOT NULL,         -- INSERT / UPDATE / DELETE
      old_data      JSONB,                      -- estado anterior (UPDATE/DELETE)
      new_data      JSONB,                      -- estado novo (INSERT/UPDATE)
      user_id       UUID      REFERENCES auth.users(id),
      ip_address    TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    RAISE NOTICE 'audit_log table created.';
  ELSE
    -- Tabela existe: adicionar colunas que faltam
    FOR col_record IN
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'audit_log'
    LOOP
      IF col_record.column_name = 'resource_type'  THEN has_resource_type  := true; END IF;
      IF col_record.column_name = 'resource_id'    THEN has_resource_id    := true; END IF;
      IF col_record.column_name = 'action'         THEN has_action         := true; END IF;
      IF col_record.column_name = 'old_data'      THEN has_old_data       := true; END IF;
      IF col_record.column_name = 'new_data'       THEN has_new_data       := true; END IF;
      IF col_record.column_name = 'user_id'        THEN has_user_id        := true; END IF;
      IF col_record.column_name = 'ip_address'     THEN has_ip_address     := true; END IF;
      IF col_record.column_name = 'created_at'     THEN has_created_at     := true; END IF;
    END LOOP;

    -- Adicionar colunas que faltam (safe: IF NOT EXISTS via flags)
    IF NOT has_resource_type  THEN ALTER TABLE audit_log ADD COLUMN resource_type TEXT;      RAISE NOTICE 'audit_log: added resource_type';  END IF;
    IF NOT has_resource_id    THEN ALTER TABLE audit_log ADD COLUMN resource_id UUID;       RAISE NOTICE 'audit_log: added resource_id';    END IF;
    IF NOT has_action         THEN ALTER TABLE audit_log ADD COLUMN action TEXT;            RAISE NOTICE 'audit_log: added action';         END IF;
    IF NOT has_old_data       THEN ALTER TABLE audit_log ADD COLUMN old_data JSONB;          RAISE NOTICE 'audit_log: added old_data';       END IF;
    IF NOT has_new_data       THEN ALTER TABLE audit_log ADD COLUMN new_data JSONB;          RAISE NOTICE 'audit_log: added new_data';       END IF;
    IF NOT has_user_id        THEN ALTER TABLE audit_log ADD COLUMN user_id UUID REFERENCES auth.users(id); RAISE NOTICE 'audit_log: added user_id';  END IF;
    IF NOT has_ip_address     THEN ALTER TABLE audit_log ADD COLUMN ip_address TEXT;       RAISE NOTICE 'audit_log: added ip_address';     END IF;
    IF NOT has_created_at     THEN ALTER TABLE audit_log ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(); RAISE NOTICE 'audit_log: added created_at'; END IF;
  END IF;
END $$;

-- FASE 2: Marcar audit_logs (plural) e activity_audit_logs como deprecated ANTES dos triggers
DO $$
BEGIN
  -- audit_logs plural -> deprecated.audit_logs
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) THEN
    CREATE SCHEMA IF NOT EXISTS deprecated;
    ALTER TABLE audit_logs SET SCHEMA deprecated;
    COMMENT ON TABLE deprecated.audit_logs IS
      'DEPRECADO — Usar public.audit_log. Mantido apenas para migracao de dados.';
    RAISE NOTICE 'audit_logs movida para deprecated.audit_logs (DEPRECADO).';
  END IF;
END $$;

DO $$
BEGIN
  -- activity_audit_logs -> deprecated.activity_audit_logs
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'activity_audit_logs'
  ) THEN
    CREATE SCHEMA IF NOT EXISTS deprecated;
    ALTER TABLE activity_audit_logs SET SCHEMA deprecated;
    COMMENT ON TABLE deprecated.activity_audit_logs IS
      'DEPRECADO — Usar public.audit_log. Dados historicos mantidos para ETL opcional.';
    RAISE NOTICE 'activity_audit_logs movida para deprecated.activity_audit_logs (DEPRECADO).';
  END IF;
END $$;

-- FASE 3: Helper — criar trigger generico de audit (agora que colunas existem)
-- FIX G1: CRITICAL — fn_audit_orders() nunca era criada; usar helper generico
CREATE OR REPLACE FUNCTION create_audit_trigger_for_table(
  p_table_name TEXT,
  p_audit_table TEXT DEFAULT 'audit_log'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_trigger_name TEXT := 'trg_audit_' || p_table_name;
  v_func_name    TEXT := 'fn_audit_' || p_table_name;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_triggers WHERE tgname = v_trigger_name) THEN
    RAISE NOTICE 'Trigger % ja existe.', v_trigger_name;
    RETURN;
  END IF;

  -- resource_type = nome da tabela fonte; resource_id = OLD/NEW.id (UUID)
  EXECUTE format(
    'CREATE OR REPLACE FUNCTION %I() RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = ''DELETE'' THEN
        INSERT INTO %I (resource_type, resource_id, action, old_data, user_id, ip_address)
        VALUES (''%s'', OLD.id, TG_OP, row_to_json(OLD)::jsonb, auth.uid()::uuid, NULL);
        RETURN OLD;
      ELSIF TG_OP = ''UPDATE'' THEN
        INSERT INTO %I (resource_type, resource_id, action, old_data, new_data, user_id, ip_address)
        VALUES (''%s'', NEW.id, TG_OP, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, auth.uid()::uuid, NULL);
        RETURN NEW;
      ELSIF TG_OP = ''INSERT'' THEN
        INSERT INTO %I (resource_type, resource_id, action, new_data, user_id, ip_address)
        VALUES (''%s'', NEW.id, TG_OP, row_to_json(NEW)::jsonb, auth.uid()::uuid, NULL);
        RETURN NEW;
      END IF;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;',
    v_func_name,
    p_audit_table,
    p_table_name,
    p_audit_table,
    p_table_name,
    p_audit_table,
    p_table_name
  );

  EXECUTE format(
    'CREATE TRIGGER %I
      AFTER INSERT OR UPDATE OR DELETE ON %I
      FOR EACH ROW EXECUTE FUNCTION %I()',
    v_trigger_name, p_table_name, v_func_name
  );

  RAISE NOTICE 'Trigger de audit criado: %', v_trigger_name;
END;
$$;

-- FASE 4: Criar todos os triggers — CRITICAL tables
SELECT create_audit_trigger_for_table('quotes');        -- F1: pricing, client proposals
SELECT create_audit_trigger_for_table('orders');        -- F2: FIX G1 — usado helper em vez de fn_audit_orders() dangling
SELECT create_audit_trigger_for_table('sales');          -- F4: financial transactions
SELECT create_audit_trigger_for_table('activities');  -- F5: user actions
SELECT create_audit_trigger_for_table('webhooks');      -- F6: external URLs/secrets
SELECT create_audit_trigger_for_table('winloss_webhook_subscriptions'); -- F7

-- FASE 5: RLS policy para audit_log — apenas admins leem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_log'
      AND policyname = 'Admins only read audit_log'
  ) THEN
    CREATE POLICY "Admins only read audit_log"
      ON audit_log FOR SELECT
      TO authenticated
      USING (is_admin_or_manager(auth.uid()));
    RAISE NOTICE 'RLS policy audit_log created.';
  END IF;
END $$;

-- FASE 6: ETL historico — activity_audit_logs -> audit_log
-- G3 FIX: copiar dados de deprecated.activity_audit_logs para audit_log
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'deprecated'
      AND table_name = 'activity_audit_logs'
  ) THEN
    -- Copiar apenas se a tabela destination existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_log') THEN
      -- Mapeamento: activity_audit_logs -> audit_log
      -- activity_audit_logs columns: activity_id, changed_by, action, old_data, new_data, created_at
      INSERT INTO public.audit_log
        (resource_type, resource_id, action, old_data, new_data, user_id, created_at)
      SELECT
        'activities'               AS resource_type,
        activity_id::UUID          AS resource_id,
        action,
        old_data,
        new_data,
        changed_by::UUID           AS user_id,
        created_at
      FROM deprecated.activity_audit_logs a
      WHERE NOT EXISTS (
        SELECT 1 FROM public.audit_log l
        WHERE l.resource_type = 'activities'
          AND l.resource_id = a.activity_id::UUID
          AND l.action = a.action
          AND l.created_at = a.created_at
      );
      RAISE NOTICE 'ETL: activity_audit_logs migradas para audit_log.';
    END IF;
  END IF;
END $$;

-- FASE 7: Cleanup com pg_cron schedule
-- G4 FIX: registrar cleanup_old_audit_logs() no pg_cron (executa diaria as 03h)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  WITH deleted AS (
    DELETE FROM audit_log
    WHERE created_at < NOW() - INTERVAL '1 year'
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM deleted;

  RAISE NOTICE 'cleanup_old_audit_logs: removidas % entradas com mais de 1 ano.', deleted_count;
  RETURN deleted_count;
END;
$$;

-- Registrar no pg_cron (ignora se ja existir)
SELECT cron.schedule(
  'cleanup-audit-logs',
  '0 3 * * *',             -- diaria as 03:00
  'SELECT cleanup_old_audit_logs()'
);

COMMENT ON FUNCTION cleanup_old_audit_logs IS
  'Remove entradas de audit_log com mais de 1 ano. '
  'Registrada no pg_cron: cleanup-audit-logs (0 3 * * *). '
  'Retorna o numero de linhas removidas.';

COMMIT;
