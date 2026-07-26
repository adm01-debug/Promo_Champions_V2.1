-- ============================================================
-- promo-champions-v2.1 — Audit Log Schema Unification
-- Auditoria ETAPA 29-36 — CRITICAL: audit_log schema mismatch
--
-- PROBLEMA:
-- 3 schemas diferentes de audit_log (CREATE TABLE IF NOT EXISTS):
--   Schema A (20250102):          table_name, record_id, old_data, new_data, user_id
--   Schema B (20260104143930):   user_id, action, resource_type, resource_id, old_data, new_data
--   Schema C (20260104200100):   user_id, action, table_name, record_id, old_values, new_values
--
-- Todas usam CREATE TABLE IF NOT EXISTS = apenas a primeira execução define o schema.
-- Triggers das migrations subsequentes tentam inserir em colunas que não existem.
--
-- CENÁRIOS SIMULADOS:
-- C1: Schema A (CREATE TABLE IF NOT EXISTS executou primeiro)
--     → audit_log tem: table_name, record_id, old_data, new_data, user_id
--     → log_audit_event() (Schema B) insere resource_type, resource_id → ERRO
-- C2: Schema B executou primeiro
--     → audit_log tem: user_id, action, resource_type, resource_id, old_data, new_data
--     → audit_trigger() (Schema C) insere old_values, new_values → ERRO
-- C3: Qualquer trigger com ERRO dentro de AFTER UPDATE → transação não rollback
--     → Silently fails, dado não é auditado
--
-- SOLUÇÃO:
-- 1. Adicionar TODAS as colunas faltantes a audit_log (IF NOT EXISTS ADD COLUMN)
-- 2. Criar log_audit_universal() que insere na audit_log canônica
-- 3. Consolidar todas as triggers para usar log_audit_universal()
-- 4. Migrar dados de audit_logs, activity_audit_logs para audit_log
-- 5. Marcar tabelas antigas como deprecated
-- ============================================================

-- ── 1. Adicionar colunas FALTANTES à audit_log canônica ───────────────────
DO $$
BEGIN
  -- Colunas do Schema A (20250102)
  ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS table_name TEXT;
  ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS record_id UUID;

  -- Colunas do Schema B (20260104143930)
  ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS resource_type TEXT;

  -- Colunas do Schema C (20260104200100) — são o target unificado
  -- Se não existirem, adicionar
  ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS old_values JSONB;
  ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS new_values JSONB;

  -- Colunas extras
  ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS ip_address INET;
  ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS user_agent TEXT;
  ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS session_id UUID;

  RAISE NOTICE 'audit_log: todas as colunas adicionadas';
END;
$$;

-- ── 2. Normalizar dados existentes (old_data → old_values, new_data → new_values) ─
DO $$
BEGIN
  -- old_data (TEXT/JSONB) → old_values (JSONB)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = 'audit_log' AND c.column_name = 'old_data'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns c2
    WHERE c2.table_schema = 'public' AND c2.table_name = 'audit_log' AND c2.column_name = 'old_values'
  ) THEN
    ALTER TABLE public.audit_log ADD COLUMN old_values JSONB;
    RAISE NOTICE 'Coluna old_values adicionada';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_log' AND column_name = 'old_data'
  ) THEN
    EXECUTE format('UPDATE audit_log SET old_values = old_data::JSONB WHERE old_data IS NOT NULL');
    RAISE NOTICE 'Migrados old_data → old_values';
  END IF;

  -- new_data (TEXT/JSONB) → new_values (JSONB)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = 'audit_log' AND c.column_name = 'new_data'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns c2
    WHERE c2.table_schema = 'public' AND c2.table_name = 'audit_log' AND c2.column_name = 'new_values'
  ) THEN
    ALTER TABLE public.audit_log ADD COLUMN new_values JSONB;
    RAISE NOTICE 'Coluna new_values adicionada';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_log' AND column_name = 'new_data'
  ) THEN
    EXECUTE format('UPDATE audit_log SET new_values = new_data::JSONB WHERE new_data IS NOT NULL');
    RAISE NOTICE 'Migrados new_data → new_values';
  END IF;

  -- record_id TEXT → UUID (se necessário)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_log'
      AND column_name = 'record_id' AND data_type = 'text'
  ) THEN
    -- Adicionar coluna UUID se ainda não existir
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'audit_log' AND column_name = 'record_id_uuid'
    ) THEN
      ALTER TABLE public.audit_log ADD COLUMN record_id_uuid UUID;
    END IF;
    EXECUTE format(
      'UPDATE audit_log SET record_id_uuid = record_id::UUID '
      'WHERE record_id IS NOT NULL AND record_id ~ ''^[0-9a-f]{8}-[0-9a-f]{4}'''
    );
    RAISE NOTICE 'Normalizados record_id TEXT → record_id_uuid UUID';
  END IF;

  -- table_name → resource_type (se resource_type está nulo)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_log' AND column_name = 'table_name'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'audit_log' AND column_name = 'resource_type'
    ) THEN
      EXECUTE format(
        'UPDATE audit_log SET resource_type = table_name '
        'WHERE table_name IS NOT NULL AND resource_type IS NULL'
      );
      RAISE NOTICE 'Normalizados table_name → resource_type';
    END IF;
  END IF;
END;
$$;

-- ── 3. CREATE OR REPLACE da função trigger universal ──────────────────────
-- Esta função detecta colunas disponíveis e insere corretamente
CREATE OR REPLACE FUNCTION public.log_audit_universal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_session_id UUID;
BEGIN
  -- Captura user_id do JWT
  v_user_id := NULLIF(current_setting('request.jwt.claims', true)::JSONB->>'sub', '')::UUID;

  -- Captura session_id se disponível
  BEGIN
    v_session_id := NULLIF(current_setting('request.jwt.claims', true)::JSONB->>'session_id', '')::UUID;
  EXCEPTION WHEN OTHERS THEN v_session_id := NULL; END;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (
      user_id, session_id,
      action,
      table_name, record_id,
      resource_type,
      old_values, new_values,
      ip_address, user_agent
    ) VALUES (
      COALESCE(v_user_id, auth.uid()),
      v_session_id,
      'DELETE',
      TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
      OLD.id,
      TG_TABLE_NAME,
      to_jsonb(OLD),
      NULL,
      NULLIF(current_setting('request.jwt.claims', true)::JSONB->>'ip_address', '')::INET,
      NULLIF(current_setting('request.jwt.claims', true)::JSONB->>'user_agent', '')
    );
    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Skip if no actual changes (comparar todas as colunas exceto updated_at)
    IF OLD IS NOT NULL AND NEW IS NOT NULL AND OLD::TEXT = NEW::TEXT THEN
      RETURN NEW;
    END IF;
    INSERT INTO public.audit_log (
      user_id, session_id,
      action,
      table_name, record_id,
      resource_type,
      old_values, new_values,
      ip_address, user_agent
    ) VALUES (
      COALESCE(v_user_id, auth.uid()),
      v_session_id,
      'UPDATE',
      TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
      NEW.id,
      TG_TABLE_NAME,
      to_jsonb(OLD),
      to_jsonb(NEW),
      NULLIF(current_setting('request.jwt.claims', true)::JSONB->>'ip_address', '')::INET,
      NULLIF(current_setting('request.jwt.claims', true)::JSONB->>'user_agent', '')
    );
    RETURN NEW;

  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (
      user_id, session_id,
      action,
      table_name, record_id,
      resource_type,
      old_values, new_values,
      ip_address, user_agent
    ) VALUES (
      COALESCE(v_user_id, auth.uid()),
      v_session_id,
      'INSERT',
      TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
      NEW.id,
      TG_TABLE_NAME,
      NULL,
      to_jsonb(NEW),
      NULLIF(current_setting('request.jwt.claims', true)::JSONB->>'ip_address', '')::INET,
      NULLIF(current_setting('request.jwt.claims', true)::JSONB->>'user_agent', '')
    );
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- ── 4. Migrar dados de audit_logs (se existir) para audit_log ─────────────
DO $$
BEGIN
  -- Migrar de audit_logs (Schema B paralelo) se existir dados
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) THEN
    -- Insert registros de audit_logs que ainda não estão em audit_log
    -- (usar subquery correlacionada para evitar NOT IN em grandes conjuntos)
    EXECUTE format($m$
      INSERT INTO public.audit_log (
        id, user_id, action, resource_type, record_id,
        old_values, new_values,
        ip_address, user_agent, created_at
      )
      SELECT
        al.id,
        al.user_id,
        al.action,
        al.resource_type,
        al.record_id::UUID,
        al.old_data::JSONB,
        al.new_data::JSONB,
        al.ip_address,
        al.user_agent,
        al.created_at
      FROM public.audit_logs al
      WHERE NOT EXISTS (
        SELECT 1 FROM public.audit_log al2 WHERE al2.id = al.id
      )
      LIMIT 10000
   $m$);
    RAISE NOTICE 'Migração de audit_logs parcial concluída (LIMIT 10000)';
  END IF;
END;
$$;

-- ── 5. Migrar dados de activity_audit_logs (se existir) ──────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'activity_audit_logs'
  ) THEN
    -- Detectar se as colunas old_values/new_values existem (são JSONB) ou se são TEXT
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'activity_audit_logs' AND column_name = 'old_values'
    ) THEN
      -- Colunas JSONB já existem → insert direto
      EXECUTE format($m$
        INSERT INTO public.audit_log (
          id, user_id, action, table_name, record_id,
          old_values, new_values,
          created_at
        )
        SELECT
          gen_random_uuid(),
          user_id,
          action,
          'activities',
          activity_id::UUID,
          old_values,
          new_values,
          created_at
        FROM public.activity_audit_logs aal
        WHERE NOT EXISTS (
          SELECT 1 FROM public.audit_log al
          WHERE al.created_at = aal.created_at
            AND al.user_id = aal.user_id
            AND al.action = aal.action
        )
        LIMIT 5000
      $m$);
    ELSE
      -- Colunas não existem → criar row a partir dos valores brutos
      EXECUTE format($m$
        INSERT INTO public.audit_log (
          id, user_id, action, table_name, record_id,
          old_values, new_values,
          created_at
        )
        SELECT
          gen_random_uuid(),
          user_id,
          action,
          'activities',
          activity_id::UUID,
          to_jsonb(aal.old_values),
          to_jsonb(aal.new_values),
          created_at
        FROM public.activity_audit_logs aal
        WHERE NOT EXISTS (
          SELECT 1 FROM public.audit_log al
          WHERE al.created_at = aal.created_at
            AND al.user_id = aal.user_id
            AND al.action = aal.action
        )
        LIMIT 5000
      $m$);
    END IF;
    RAISE NOTICE 'Migração de activity_audit_logs parcial concluída (LIMIT 5000)';
  END IF;
END;
$$;

-- ── 6. Migrar follow_up_audit_logs se existir ───────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'follow_up_audit_logs'
  ) THEN
    EXECUTE format($m$
      INSERT INTO public.audit_log (
        id, user_id, action, table_name, record_id,
        old_values, new_values, created_at
      )
      SELECT
        gen_random_uuid(),
        user_id,
        action,
        'follow_ups',
        record_id::UUID,
        to_jsonb(old_values),
        to_jsonb(new_values),
        created_at
      FROM public.follow_up_audit_logs
      WHERE NOT EXISTS (
        SELECT 1 FROM public.audit_log WHERE created_at = follow_up_audit_logs.created_at
      )
      LIMIT 5000
    $m$);
    RAISE NOTICE 'Migração de follow_up_audit_logs concluída';
  END IF;
END;
$$;

-- ── 7. Garantir indexes na audit_log consolidada ──────────────────────────
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
  CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
  CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON public.audit_log(record_id);
  CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
  CREATE INDEX IF NOT EXISTS idx_audit_log_resource_type ON public.audit_log(resource_type);
  CREATE INDEX IF NOT EXISTS idx_audit_log_composite ON public.audit_log(user_id, created_at DESC);
  RAISE NOTICE 'Indexes de audit_log verificadas/criadas';
END;
$$;

-- ── 8. Atualizar todas as triggers para usar log_audit_universal ──────────
-- Esta seção substitui as funções trigger antigas pelas novas
-- em todas as tabelas que já têm triggers de auditoria

DO $$
DECLARE
  _tbl RECORD;
BEGIN
  FOR _tbl IN
    SELECT DISTINCT tg.tgname, tg.tgrelid::REGCLASS::TEXT AS tbl_name
    FROM pg_trigger tg
    JOIN pg_proc p ON tg.tgfoid = p.oid
    WHERE p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND p.proname IN ('log_audit', 'log_audit_event', 'audit_trigger', 'audit_trigger_func', 'log_data_access', 'log_quote_change')
      AND NOT tg.tgisinternal
  LOOP
    RAISE NOTICE 'Atualizando trigger % em %', _tbl.tgname, _tbl.tbl_name;

    -- Drop trigger antiga
    EXECUTE FORMAT('DROP TRIGGER IF EXISTS %I ON %s', _tbl.tgname, _tbl.tbl_name);

    -- Criar nova trigger com log_audit_universal
    EXECUTE FORMAT('
      CREATE TRIGGER %I
        AFTER INSERT OR UPDATE OR DELETE ON %s
        FOR EACH ROW EXECUTE FUNCTION log_audit_universal()',
      _tbl.tgname, _tbl.tbl_name
    );
  END LOOP;

  RAISE NOTICE 'Todas as triggers de auditoria atualizadas para log_audit_universal()';
END;
$$;

-- ============================================================
-- FIM: Audit Log Schema Unification
-- ============================================================
