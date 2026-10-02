-- Pacote auditoria DB/integridade — [AUDIT] Consolidação do audit canônico
--
-- Havia ~4 definições concorrentes de audit (superseded por esta migration):
--   - 20250102_audit_log.sql            → public.audit_log + trigger log_audit()
--   - 20260104143930_audit_trail.sql    → public.audit_log + trigger log_audit_event()
--   - 20260104200100_audit_trail_complete.sql → public.audit_log + audit_trigger()
--   - 20260105000002_audit_trail.sql    → public.audit_log + audit_trigger_func()
--   - 20251228_add_soft_delete.sql      → triggers audit_soft_delete_* (log_soft_delete)
--
-- A definição canônica fica em public.audit_logs (criada em
-- 20260416181124_7ac5204a — é a tabela já lida pelo frontend/admin e alvo do RPC
-- log_audit_event), estendida com as colunas canônicas exigidas:
--   actor_id, action, table_name, record_id, old_data, new_data,
--   request_id, created_at  (+ colunas já existentes: actor_email, entity_type,
--   entity_id, changes, ip_address, user_agent, metadata).
--
-- Esta migration:
--   1) Garante as colunas canônicas em public.audit_logs (idempotente).
--   2) Migra os dados de public.audit_log (singular, superseded) para
--      public.audit_logs e marca objetos antigos como superseded (COMMENT).
--   3) Remove triggers de audit duplicados/quebrados das tabelas de negócio
--      (audit_* antigos escreviam em audit_log colunas inexistentes — falhavam
--      no soft delete) e attacha trigger UPDATE/DELETE canônico.
--   4) Recria log_audit_event (mesma assinatura) escrevendo na tabela canônica
--      com sanitização de colunas sensíveis (whitelist inversa: redação).
--
-- Idempotente: IF NOT EXISTS, guards to_regclass/pg_trigger, INSERT ... WHERE NOT EXISTS.

-- ============================================================================
-- 1) COLUNAS CANÔNICAS EM public.audit_logs
-- ============================================================================

ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS table_name TEXT,
  ADD COLUMN IF NOT EXISTS record_id TEXT,
  ADD COLUMN IF NOT EXISTS old_data JSONB,
  ADD COLUMN IF NOT EXISTS new_data JSONB,
  ADD COLUMN IF NOT EXISTS request_id TEXT;

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name
  ON public.audit_logs (table_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id
  ON public.audit_logs (record_id);

-- ============================================================================
-- 2) MIGRAÇÃO DEFENSIVA DE public.audit_log (superseded)
-- ============================================================================
-- Copia apenas linhas ainda não presentes (dedupe por id). A tabela antiga é
-- mantida (read-only histórico) e marcada como superseded — não é dropped para
-- não perder auditoria histórica nem quebrar consumidores desconhecidos.

-- As definições concorrentes de audit_log usam colunas distintas
-- (user_id×actor_id, table_name×resource_type, record_id×resource_id,
-- old_data/new_data×old_values/new_values). O SELECT é montado dinamicamente
-- conforme as colunas realmente presentes — seguro em qualquer ambiente.
DO $$
DECLARE
  cols TEXT[];
  sel_actor TEXT;
  sel_action TEXT;
  sel_table TEXT;
  sel_record TEXT;
  sel_old TEXT;
  sel_new TEXT;
BEGIN
  IF to_regclass('public.audit_log') IS NULL THEN
    RETURN;
  END IF;

  SELECT array_agg(column_name) INTO cols
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'audit_log';
  cols := COALESCE(cols, ARRAY[]::TEXT[]);

  sel_actor := CASE
    WHEN 'user_id' = ANY (cols) THEN 'l.user_id'
    WHEN 'actor_id' = ANY (cols) THEN 'l.actor_id'
    ELSE 'NULL' END;
  sel_action := CASE
    WHEN 'action' = ANY (cols) THEN 'l.action'
    ELSE '''MIGRATED''' END;
  sel_table := CASE
    WHEN 'table_name' = ANY (cols) THEN 'l.table_name'
    WHEN 'resource_type' = ANY (cols) THEN 'l.resource_type'
    ELSE '''audit_log''' END;
  sel_record := CASE
    WHEN 'record_id' = ANY (cols) THEN 'l.record_id::text'
    WHEN 'resource_id' = ANY (cols) THEN 'l.resource_id::text'
    ELSE 'NULL' END;
  sel_old := CASE
    WHEN 'old_data' = ANY (cols) THEN 'l.old_data'
    WHEN 'old_values' = ANY (cols) THEN 'l.old_values'
    ELSE 'NULL' END;
  sel_new := CASE
    WHEN 'new_data' = ANY (cols) THEN 'l.new_data'
    WHEN 'new_values' = ANY (cols) THEN 'l.new_values'
    ELSE 'NULL' END;

  EXECUTE format(
    'INSERT INTO public.audit_logs (
       id, actor_id, action, entity_type, entity_id,
       table_name, record_id, old_data, new_data, created_at
     )
     SELECT
       l.id, %s, %s, COALESCE(%s::text, ''audit_log''), %s,
       COALESCE(%s::text, ''audit_log''), %s, %s, %s,
       COALESCE(l.created_at, now())
     FROM public.audit_log l
     WHERE NOT EXISTS (
       SELECT 1 FROM public.audit_logs a WHERE a.id = l.id
     )',
    sel_actor, sel_action, sel_table, sel_record, sel_table, sel_record,
    sel_old, sel_new
  );

  EXECUTE 'COMMENT ON TABLE public.audit_log IS ''superseded por public.audit_logs (20261001193100_audit_log_canonical). Mantida só para leitura histórica.''';
END $$;

-- Objetos de function antigos marcados como superseded (não removidos porque
-- podem existir definições com assinaturas distintas em ambientes divergentes).
DO $$
BEGIN
  IF to_regprocedure('public.log_audit()') IS NOT NULL THEN
    EXECUTE 'COMMENT ON FUNCTION public.log_audit() IS ''superseded por public.audit_log_row_change() (20261001193100)''';
  END IF;
  IF to_regprocedure('public.audit_trigger()') IS NOT NULL THEN
    EXECUTE 'COMMENT ON FUNCTION public.audit_trigger() IS ''superseded por public.audit_log_row_change() (20261001193100)''';
  END IF;
  IF to_regprocedure('public.audit_trigger_func()') IS NOT NULL THEN
    EXECUTE 'COMMENT ON FUNCTION public.audit_trigger_func() IS ''superseded por public.audit_log_row_change() (20261001193100)''';
  END IF;
  IF to_regprocedure('public.log_audit_event()') IS NOT NULL THEN
    EXECUTE 'COMMENT ON FUNCTION public.log_audit_event() IS ''superseded por public.audit_log_row_change() (20261001193100)''';
  END IF;
  IF to_regprocedure('public.log_soft_delete()') IS NOT NULL THEN
    EXECUTE 'COMMENT ON FUNCTION public.log_soft_delete() IS ''superseded por public.audit_log_row_change() (20261001193100)''';
  END IF;
END $$;

-- ============================================================================
-- 3) SANITIZAÇÃO DE COLUNAS SENSÍVEIS (whitelist inversa — redação)
-- ============================================================================
-- Remove/redige chaves sensíveis (senhas, tokens, segredos, cartões) dos
-- payloads old_data/new_data/changes, inclusive um nível dentro de objetos
-- aninhados. Lista explícita + sufixos *_token / *_secret / *password*.

CREATE OR REPLACE FUNCTION public.audit_scrub(p_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  sensitive_exact TEXT[] := ARRAY[
    'password', 'password_hash', 'hashed_password', 'passphrase',
    'token', 'access_token', 'refresh_token', 'id_token',
    'api_key', 'apikey', 'secret', 'client_secret',
    'mfa_secret', 'totp_secret', 'otp', 'otp_code',
    'authorization', 'cookie', 'session_id', 'session',
    'private_key', 'service_role_key', 'anon_key', 'jwt',
    'credit_card', 'card_number', 'cvv', 'cpf'
  ];
  k TEXT;
  v JSONB;
  result JSONB := '{}'::jsonb;
BEGIN
  IF p_data IS NULL OR jsonb_typeof(p_data) <> 'object' THEN
    RETURN p_data;
  END IF;

  FOR k, v IN SELECT key, value FROM jsonb_each(p_data) LOOP
    IF lower(k) = ANY (sensitive_exact)
       OR lower(k) LIKE '%\_token' ESCAPE '\'
       OR lower(k) LIKE '%\_secret' ESCAPE '\'
       OR lower(k) LIKE '%password%' THEN
      result := result || jsonb_build_object(k, '[REDACTED]');
    ELSIF jsonb_typeof(v) = 'object' THEN
      result := result || jsonb_build_object(k, public.audit_scrub(v));
    ELSE
      result := result || jsonb_build_object(k, v);
    END IF;
  END LOOP;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.audit_scrub(JSONB) IS
  'Redige colunas sensíveis (senha/token/segredo/cartão) de payloads de auditoria.';

-- ============================================================================
-- 4) TRIGGER CANÔNICO UPDATE/DELETE → public.audit_logs
-- ============================================================================

CREATE OR REPLACE FUNCTION public.audit_log_row_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID;
  v_email TEXT;
  v_req TEXT;
  v_old JSONB;
  v_new JSONB;
  v_id TEXT;
BEGIN
  v_actor := auth.uid();

  IF v_actor IS NOT NULL THEN
    SELECT email INTO v_email FROM auth.users WHERE id = v_actor;
  END IF;

  -- X-Request-Id propagado pelo PostgREST/edge functions (quando presente)
  BEGIN
    v_req := current_setting('request.headers', true)::jsonb ->> 'x-request-id';
  EXCEPTION WHEN OTHERS THEN
    v_req := NULL;
  END;

  v_old := CASE WHEN TG_OP IN ('UPDATE', 'DELETE')
                THEN public.audit_scrub(to_jsonb(OLD)) END;
  v_new := CASE WHEN TG_OP IN ('INSERT', 'UPDATE')
                THEN public.audit_scrub(to_jsonb(NEW)) END;

  IF TG_OP = 'DELETE' THEN
    v_id := to_jsonb(OLD) ->> 'id';
  ELSE
    v_id := to_jsonb(NEW) ->> 'id';
  END IF;

  INSERT INTO public.audit_logs (
    actor_id, actor_email, action,
    entity_type, entity_id,
    table_name, record_id,
    old_data, new_data, changes,
    request_id, metadata
  ) VALUES (
    v_actor, v_email, TG_OP,
    TG_TABLE_NAME, v_id,
    TG_TABLE_NAME, v_id,
    v_old, v_new,
    jsonb_build_object('old', v_old, 'new', v_new),
    v_req, '{}'::jsonb
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.audit_log_row_change() IS
  'Trigger canônico de auditoria: grava UPDATE/DELETE em public.audit_logs com sanitização.';

-- ============================================================================
-- 5) ATTACH DO TRIGGER NAS TABELAS DE NEGÓCIO
-- ============================================================================
-- Remove antes todos os triggers "audit_*" legados (escreviam na tabela
-- superseded e/ou em colunas inexistentes como changes/reason — quebravam
-- o soft delete) e cria um único trigger canônico UPDATE/DELETE.

DO $$
DECLARE
  t TEXT;
  trg RECORD;
  audit_tables TEXT[] := ARRAY[
    'clients', 'deals', 'sales', 'quotes', 'orders',
    'commissions', 'prices', 'payouts', 'user_roles', 'client_portfolio'
  ];
BEGIN
  FOREACH t IN ARRAY audit_tables LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'Tabela % inexistente — trigger de audit ignorado', t;
      CONTINUE;
    END IF;

    FOR trg IN
      SELECT tgname
        FROM pg_trigger
       WHERE tgrelid = format('public.%I', t)::regclass
         AND NOT tgisinternal
         AND tgname LIKE 'audit\_%' ESCAPE '\'
    LOOP
      EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', trg.tgname, t);
    END LOOP;

    EXECUTE format('DROP TRIGGER IF EXISTS audit_business_changes ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER audit_business_changes AFTER UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_log_row_change()',
      t
    );
  END LOOP;
END $$;

-- ============================================================================
-- 6) RPC log_audit_event RECRIADO NA TABELA CANÔNICA
-- ============================================================================
-- Mesma assinatura (compatível com os callers existentes), agora gravando
-- request_id e sanitizando changes. entity_type/entity_id continuam
-- preenchidos para compat com o admin, e table_name/record_id recebem os
-- mesmos valores (campos canônicos).

CREATE OR REPLACE FUNCTION public.log_audit_event(
  _action TEXT,
  _entity_type TEXT,
  _entity_id TEXT DEFAULT NULL,
  _changes JSONB DEFAULT '{}'::jsonb,
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id UUID;
  _email TEXT;
  _req TEXT;
BEGIN
  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();

  BEGIN
    _req := current_setting('request.headers', true)::jsonb ->> 'x-request-id';
  EXCEPTION WHEN OTHERS THEN
    _req := NULL;
  END;

  INSERT INTO public.audit_logs (
    actor_id, actor_email, action,
    entity_type, entity_id,
    table_name, record_id,
    changes, request_id, metadata
  ) VALUES (
    auth.uid(), _email, _action,
    _entity_type, _entity_id,
    _entity_type, _entity_id,
    public.audit_scrub(_changes), _req, _metadata
  )
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

-- Grants alinhados ao hardening anterior (20260515122056): nunca anônimo/público.
REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, jsonb) FROM public;
REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, jsonb) TO service_role;

COMMENT ON FUNCTION public.log_audit_event(text, text, text, jsonb, jsonb) IS
  'RPC canônico de auditoria — grava em public.audit_logs com sanitização de colunas sensíveis.';
