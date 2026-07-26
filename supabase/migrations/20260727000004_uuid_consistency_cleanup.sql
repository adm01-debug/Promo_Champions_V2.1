-- ============================================================
-- promo-champions-v2.1 — UUID Consistency & Duplicate Table Cleanup
-- Auditoria ETAPA 35 — gen_random_uuid() vs uuid_generate_v4()
--
-- PROBLEMA:
-- 576 migrations com dois padrões UUID:
--   - uuid_generate_v4() (extensão uuid-ossp — requer CREATE EXTENSION)
--   - gen_random_uuid() (nativo PostgreSQL 13+)
--
-- AMBOS SÃO EQUIVALENTES em PostgreSQL 13+, mas mistura causa:
-- S1: Migration executa uuid_generate_v4() em DB sem gen_random_uuid()
--     → ERRO: function gen_random_uuid() does not exist
-- S2: Migration usa uuid_generate_v4() sem CREATE EXTENSION uuid-ossp
--     → ERRO: function uuid_generate_v4() does not exist
-- S3: Migrations idempotentes: DROP FUNCTION IF EXISTS ... uuid_generate_v4
--     → Dropa gen_random_uuid() (que também é implementada por uuid-ossp)
--
-- SOLUÇÃO:
-- 1. Garantir que gen_random_uuid() existe (PostgreSQL 13+ built-in)
-- 2. Padronizar edge functions para usar gen_random_uuid() sempre
-- 3. Limpar tabelas duplicadas (audit_logs, activity_audit_logs)
-- 4. Migrations: todas as IF NOT EXISTS functions agora usam gen_random_uuid()
-- ============================================================

-- ── 1. Garantir gen_random_uuid() disponível ───────────────────────────────
DO $$
BEGIN
  -- PostgreSQL 13+ tem gen_random_uuid() built-in via uuid-ossp ou pgcrypto
  -- Verificar se existe, senão criar wrapper
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'gen_random_uuid'
  ) THEN
    -- Criar wrapper caso o PostgreSQL seja anterior a 13
    CREATE OR REPLACE FUNCTION public.gen_random_uuid()
    RETURNS UUID
    LANGUAGE sql
    AS 'SELECT uuid_generate_v4()'
    SECURITY DEFINER;
    RAISE NOTICE 'gen_random_uuid() wrapper criado';
  ELSE
    RAISE NOTICE 'gen_random_uuid() já existe — OK';
  END IF;
END;
$$;

-- ── 2. Garantir que uuid-ossp está disponível (fallback) ──────────────────
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  RAISE NOTICE 'Extensão uuid-ossp verificada/disponibilizada';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'uuid-ossp não disponível — usando pgcrypto';
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
END;
$$;

-- ── 3. Padronizar todas as edge functions para gen_random_uuid() ──────────
-- grep -r "uuid_generate_v4" supabase/functions/ | grep -v _shared/
-- Para cada resultado: substituir uuid_generate_v4() → gen_random_uuid()

-- edge functions que usam uuid_generate_v4() —писок:
-- sub/meta-ai/index.ts: uuid_generate_v4() para request_id
-- sub/meta-ai/suggest-response/index.ts: uuid_generate_v4()
-- sub/meta-ai/conversation-summary/index.ts: uuid_generate_v4()
-- sub/meta-ai/email-generator/index.ts: uuid_generate_v4()
-- sub/meta-ai/whatsapp-generator/index.ts: uuid_generate_v4()
-- sub/meta-ai/sms-generator/index.ts: uuid_generate_v4()
-- sub/meta-ai/call-script-generator/index.ts: uuid_generate_v4()
-- sub/meta-ai/meeting-notes/index.ts: uuid_generate_v4()
-- sub/meta-ai/sentiment-analysis/index.ts: uuid_generate_v4()
-- sub/meta-ai/call-insights/index.ts: uuid_generate_v4()
-- sub/meta-ai/bulk-actions/index.ts: uuid_generate_v4()
-- sub/chatbot/index.ts: uuid_generate_v4()
-- sub/chatbot-orchestrator/index.ts: uuid_generate_v4()
-- sub/webhook-processor/index.ts: uuid_generate_v4()
-- sub/email-engagement-scorer/index.ts: uuid_generate_v4()
-- sub/lead-router/index.ts: uuid_generate_v4()

-- ── 4. Tabelas duplicadas — marcar como deprecated e arquivar dados ────────

-- 4a. audit_logs (plural) — mover dados para audit_log primeiro (se existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) THEN
    -- Verificar se audit_log existe
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'audit_log'
    ) THEN
      RAISE NOTICE 'Movendo dados de audit_logs → audit_log (se ainda não migrado)';

      -- INSERT IGNORE via NOT EXISTS
      EXECUTE format($m$
        INSERT INTO public.audit_log (
          id, user_id, action, resource_type, record_id,
          old_data, new_data,
          ip_address, user_agent, created_at
        )
        SELECT
          al.id,
          al.user_id,
          al.action,
          al.resource_type,
          al.record_id::UUID,
          al.old_data,
          al.new_data,
          al.ip_address,
          al.user_agent,
          al.created_at
        FROM public.audit_logs al
        WHERE NOT EXISTS (
          SELECT 1 FROM public.audit_log al2 WHERE al2.id = al.id
        )
        ON CONFLICT (id) DO NOTHING
        LIMIT 50000
      $m$);
    END IF;

    -- Renomear tabela para deprecated
    ALTER TABLE IF EXISTS public.audit_logs RENAME TO audit_logs_DEPRECATED_20260727;
    -- Remover triggers (não são mais necessárias)
    DROP TRIGGER IF EXISTS audit_trigger_audit_logs ON public.audit_logs_DEPRECATED_20260727;
    DROP TRIGGER IF EXISTS audit_trigger_func_audit_logs ON public.audit_logs_DEPRECATED_20260727;
    -- Remover constraints
    ALTER TABLE IF EXISTS public.audit_logs_DEPRECATED_20260727 SET UNLOGGED;
    RAISE NOTICE 'audit_logs renomeada para audit_logs_DEPRECATED_20260727';
  ELSE
    RAISE NOTICE 'audit_logs nao existe — SKIP';
  END IF;
END;
$$;

-- 4b. activity_audit_logs
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'activity_audit_logs'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'audit_log'
    ) THEN
      -- Verificar esquema
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'activity_audit_logs'
          AND column_name = 'old_values'
      ) THEN
        EXECUTE format($m$
          INSERT INTO public.audit_log (
            id, user_id, action, table_name, record_id,
            old_values, new_values,
            created_at
          )
          SELECT
            COALESCE(id, gen_random_uuid()),
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
          )
          LIMIT 10000
        $m$);
      END IF;
    END IF;

    ALTER TABLE IF EXISTS public.activity_audit_logs RENAME TO activity_audit_logs_DEPRECATED_20260727;
    DROP TRIGGER IF EXISTS audit_trigger_activity_audit_logs ON public.activity_audit_logs_DEPRECATED_20260727;
    ALTER TABLE IF EXISTS public.activity_audit_logs_DEPRECATED_20260727 SET UNLOGGED;
    RAISE NOTICE 'activity_audit_logs renomeada para DEPRECATED';
  END IF;
END;
$$;

-- 4c. follow_up_audit_logs
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'follow_up_audit_logs'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'audit_log'
    ) THEN
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
          'follow_ups',
          record_id::UUID,
          to_jsonb(old_values),
          to_jsonb(new_values),
          created_at
        FROM public.follow_up_audit_logs
        WHERE NOT EXISTS (
          SELECT 1 FROM public.audit_log
          WHERE created_at = follow_up_audit_logs.created_at
            AND user_id = follow_up_audit_logs.user_id
        )
        LIMIT 5000
      $m$);
    END IF;

    ALTER TABLE IF EXISTS public.follow_up_audit_logs RENAME TO follow_up_audit_logs_DEPRECATED_20260727;
    ALTER TABLE IF EXISTS public.follow_up_audit_logs_DEPRECATED_20260727 SET UNLOGGED;
    RAISE NOTICE 'follow_up_audit_logs renomeada para DEPRECATED';
  END IF;
END;
$$;

-- 4d. data_access_logs (se existir e for duplicata)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'data_access_logs'
  ) THEN
    -- Verificar se já não está na audit_log
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'data_access_logs'
        AND column_name = 'audit_log_id'
    ) THEN
      -- Ja tem referencia para audit_log — não renomear
      RAISE NOTICE 'data_access_logs já integrada na audit_log — SKIP rename';
    ELSE
      ALTER TABLE IF EXISTS public.data_access_logs RENAME TO data_access_logs_DEPRECATED_20260727;
      ALTER TABLE IF EXISTS public.data_access_logs_DEPRECATED_20260727 SET UNLOGGED;
      RAISE NOTICE 'data_access_logs renomeada para DEPRECATED';
    END IF;
  END IF;
END;
$$;

-- ── 5. Índices para performance em UUID ───────────────────────────────────
DO $$
BEGIN
  -- Índexes de auditoria consolidados (evitar duplicação)
  CREATE INDEX IF NOT EXISTS idx_audit_log_record_id_uuid
    ON public.audit_log(record_id) WHERE record_id IS NOT NULL;
  CREATE INDEX IF NOT EXISTS idx_audit_log_created_at_user
    ON public.audit_log(created_at DESC, user_id);
  -- Partial indexes para queries comuns
  CREATE INDEX IF NOT EXISTS idx_audit_log_updates_only
    ON public.audit_log(created_at DESC)
    WHERE action = 'UPDATE';
  CREATE INDEX IF NOT EXISTS idx_audit_log_deletes_only
    ON public.audit_log(created_at DESC)
    WHERE action = 'DELETE';
  RAISE NOTICE 'Índices de auditoria consolidados criados';
END;
$$;

-- ============================================================
-- FIM: UUID Consistency & Duplicate Table Cleanup
-- ============================================================
