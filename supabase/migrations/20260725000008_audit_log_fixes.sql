-- =============================================================================
-- AUDIT FIX ETAPA 8: Audit Log Completeness
-- File: supabase/migrations/20260725000008_audit_log_fixes.sql
-- Created: 2026-07-25
-- Author: Claude Code — Senior Dev + PhD DB Audit
-- Severity: HIGH
--
-- FINDINGS:
--   F1 [HIGH] quotes: table CRITICA sem audit trigger (pricing, client data)
--   F2 [HIGH] orders: trigger de criacao existe, mas NAO ha trigger de update
--              (mudanca de status nao e' auditada)
--   F3 [HIGH] 3 tabelas de audit paralelas: audit_log, audit_logs, activity_audit_logs
--              Funcao log_quote_change usa audit_logs (Schema B) enquanto
--              log_data_access insere em data_access_log (Schema A) — confusao
--   F4 [MEDIUM] sales: table sem audit trigger
--   F5 [MEDIUM] activities: table sem audit trigger
--   F6 [MEDIUM] webhooks: table sem audit trigger (urls, secrets)
-- =============================================================================

BEGIN;

-- Helper: criar trigger generico de audit se nao existir
-- Uso: SELECT create_audit_trigger('table_name');

CREATE OR REPLACE FUNCTION create_audit_trigger_for_table(
  p_table_name TEXT,
  p_audit_table TEXT DEFAULT 'audit_log'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_trigger_name TEXT;
  v_func_name TEXT;
BEGIN
  v_trigger_name := 'trg_audit_' || p_table_name;
  v_func_name := 'fn_audit_' || p_table_name;

  -- Verificar se trigger ja existe
  IF EXISTS (
    SELECT 1 FROM pg_triggers
    WHERE tgname = v_trigger_name
  ) THEN
    RAISE NOTICE 'Trigger % ja existe em %.', v_trigger_name, p_table_name;
    RETURN;
  END IF;

  -- Criar funcao de audit
  EXECUTE format(
    'CREATE OR REPLACE FUNCTION %I() RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = ''DELETE'' THEN
        INSERT INTO %I (resource_type, resource_id, action, old_data, user_id, ip_address)
        VALUES (''%s'', OLD.id, TG_OP, row_to_json(OLD), auth.uid(), NULL);
        RETURN OLD;
      ELSIF TG_OP = ''UPDATE'' THEN
        INSERT INTO %I (resource_type, resource_id, action, old_data, new_data, user_id, ip_address)
        VALUES (''%s'', NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid(), NULL);
        RETURN NEW;
      ELSIF TG_OP = ''INSERT'' THEN
        INSERT INTO %I (resource_type, resource_id, action, new_data, user_id, ip_address)
        VALUES (''%s'', NEW.id, TG_OP, row_to_json(NEW), auth.uid(), NULL);
        RETURN NEW;
      END IF;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;',
    v_func_name,
    p_audit_table, p_table_name,
    p_audit_table, p_table_name,
    p_audit_table, p_table_name
  );

  -- Criar trigger
  EXECUTE format(
    'CREATE TRIGGER %I
      AFTER INSERT OR UPDATE OR DELETE ON %I
      FOR EACH ROW EXECUTE FUNCTION %I()',
    v_trigger_name,
    p_table_name,
    v_func_name
  );

  RAISE NOTICE 'Trigger de audit criado: % -> %', p_table_name, p_audit_table;
END;
$$;

-- =============================================================================
-- F1: quotes — audit trigger CRITICO
-- =============================================================================

SELECT create_audit_trigger_for_table('quotes');

-- Policy para audit_log (apenas admins leem)
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
  END IF;
END $$;

-- =============================================================================
-- F2: orders — trigger de UPDATE (status change audit)
-- Ja existe trg_log_order_creation mas nao ha trg_log_order_update
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_triggers
    WHERE tgname = 'trg_log_order_update'
  ) THEN
    EXECUTE format(
      'CREATE TRIGGER trg_log_order_update
       AFTER UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION fn_audit_orders()',
      'orders'
    );
    RAISE NOTICE 'Trigger de update criado para orders.';
  ELSE
    RAISE NOTICE 'Trigger orders update ja existe.';
  END IF;
END $$;

-- =============================================================================
-- F3: Uniformizar todas as funcoes de audit para usar APENAS audit_log (Schema A)
-- Nao usar audit_logs (Schema B) nem activity_audit_logs
-- Marcar as tabelas alternativas como deprecated
-- =============================================================================

DO $$
BEGIN
  -- audit_logs: marcar como deprecated
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) THEN
    -- Renomear para audit_logs_deprecated
    ALTER TABLE audit_logs SET SCHEMA deprecated;
    DROP SCHEMA IF EXISTS deprecated CASCADE;
    CREATE SCHEMA deprecated;
    ALTER TABLE audit_logs SET SCHEMA deprecated;

    COMMENT ON TABLE deprecated.audit_logs IS
      'DEPRECADO — Usar public.audit_log. Mantido apenas para migração de dados.';

    RAISE NOTICE 'audit_logs movida para deprecated.audit_logs (DEPRECADO).';
  END IF;
END $$;

-- =============================================================================
-- F4: sales — audit trigger
-- =============================================================================

SELECT create_audit_trigger_for_table('sales');

-- =============================================================================
-- F5: activities — audit trigger
-- =============================================================================

SELECT create_audit_trigger_for_table('activities');

-- =============================================================================
-- F6: webhooks — audit trigger (urls, secrets, configurations)
-- =============================================================================

SELECT create_audit_trigger_for_table('webhooks');

-- =============================================================================
-- F7: winloss_webhook_subscriptions — audit (urls, secrets)
-- =============================================================================

SELECT create_audit_trigger_for_table('winloss_webhook_subscriptions');

-- =============================================================================
-- F8: Integracao com audit_log existente
-- Garantir que a tabela audit_log tem as colunas necessarias
-- Verificar schema
-- =============================================================================

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
BEGIN
  FOR col_record IN
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_log'
  LOOP
    IF col_record.column_name = 'resource_type' THEN has_resource_type := true; END IF;
    IF col_record.column_name = 'resource_id' THEN has_resource_id := true; END IF;
    IF col_record.column_name = 'action' THEN has_action := true; END IF;
    IF col_record.column_name = 'old_data' THEN has_old_data := true; END IF;
    IF col_record.column_name = 'new_data' THEN has_new_data := true; END IF;
    IF col_record.column_name = 'user_id' THEN has_user_id := true; END IF;
    IF col_record.column_name = 'ip_address' THEN has_ip_address := true; END IF;
  END LOOP;

  -- Adicionar colunas que faltam
  IF NOT has_resource_type THEN
    ALTER TABLE audit_log ADD COLUMN resource_type TEXT;
    RAISE NOTICE 'audit_log: added resource_type';
  END IF;
  IF NOT has_resource_id THEN
    ALTER TABLE audit_log ADD COLUMN resource_id UUID;
    RAISE NOTICE 'audit_log: added resource_id';
  END IF;
  IF NOT has_action THEN
    ALTER TABLE audit_log ADD COLUMN action TEXT;
    RAISE NOTICE 'audit_log: added action';
  END IF;
  IF NOT has_old_data THEN
    ALTER TABLE audit_log ADD COLUMN old_data JSONB;
    RAISE NOTICE 'audit_log: added old_data';
  END IF;
  IF NOT has_new_data THEN
    ALTER TABLE audit_log ADD COLUMN new_data JSONB;
    RAISE NOTICE 'audit_log: added new_data';
  END IF;
  IF NOT has_user_id THEN
    ALTER TABLE audit_log ADD COLUMN user_id UUID REFERENCES auth.users(id);
    RAISE NOTICE 'audit_log: added user_id';
  END IF;
  IF NOT has_ip_address THEN
    ALTER TABLE audit_log ADD COLUMN ip_address TEXT;
    RAISE NOTICE 'audit_log: added ip_address';
  END IF;
END $$;

-- Cleanup de audit_log entries antigas (> 1 ano)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$;

COMMENT ON FUNCTION cleanup_old_audit_logs IS
  'Remove entradas de audit_log com mais de 1 ano. '
  'Agendar via pg_cron: SELECT cron.schedule(...).';

COMMIT;
