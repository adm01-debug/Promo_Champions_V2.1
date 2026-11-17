-- Reconcilia 8 objetos que EXISTEM em produção mas que nenhum arquivo de
-- migration criava. Foram aplicados por DDL direto (editor/agente) e nunca
-- viraram arquivo, então uma base construída a partir do repo não os teria —
-- e 17 migrations já commitadas referenciam public._internal_secrets.
--
-- Este arquivo é declarativo do estado atual de produção: capturado de
-- pg_get_functiondef / pg_get_triggerdef / information_schema em 2026-11-17
-- (server_time 02:2x+00). Aplicar em produção é no-op; numa base nova,
-- recria os objetos idênticos. Idempotente.
--
-- Causa de "Remote migration versions not found in local migrations
-- directory" NÃO é este arquivo — ver docs/agentes/branches-encerradas-261117.md.

-- ───────────────────────── tabelas ─────────────────────────

-- Segredos internos lidos por triggers SECURITY DEFINER (coaching_cron_secret,
-- functions_base_url, anon_key). RLS nega tudo a anon/authenticated; só
-- service_role alcança, por bypass de RLS.
CREATE TABLE IF NOT EXISTS public._internal_secrets (
  key        text PRIMARY KEY,
  value      text        NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public._internal_secrets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny all access to _internal_secrets" ON public._internal_secrets;
CREATE POLICY "Deny all access to _internal_secrets" ON public._internal_secrets
  AS PERMISSIVE FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

-- Bloqueio geográfico: regiões bloqueadas e log de tentativas.
CREATE TABLE IF NOT EXISTS public.geo_blocked_regions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL UNIQUE,
  country_name text NOT NULL,
  reason       text,
  blocked_by   uuid REFERENCES auth.users(id),
  blocked_at   timestamptz DEFAULT now(),
  is_active    boolean     DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_geo_blocked_regions_blocked_by   ON public.geo_blocked_regions (blocked_by);
CREATE INDEX IF NOT EXISTS idx_geo_blocked_regions_country_code ON public.geo_blocked_regions (country_code);
ALTER TABLE public.geo_blocked_regions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin and managers can read geo_blocked_regions" ON public.geo_blocked_regions;
CREATE POLICY "Admin and managers can read geo_blocked_regions" ON public.geo_blocked_regions
  AS PERMISSIVE FOR SELECT TO authenticated USING (public.is_admin_or_manager(auth.uid()));
DROP POLICY IF EXISTS "Admins can manage geo_blocked_regions" ON public.geo_blocked_regions;
CREATE POLICY "Admins can manage geo_blocked_regions" ON public.geo_blocked_regions
  AS PERMISSIVE FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.geo_access_logs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address     text NOT NULL,
  country_code   text,
  country_name   text,
  city           text,
  region         text,
  blocked        boolean DEFAULT false,
  user_agent     text,
  attempted_path text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_geo_access_logs_country_code ON public.geo_access_logs (country_code);
CREATE INDEX IF NOT EXISTS idx_geo_access_logs_created_at   ON public.geo_access_logs (created_at DESC);
ALTER TABLE public.geo_access_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read geo_access_logs" ON public.geo_access_logs;
CREATE POLICY "Admins can read geo_access_logs" ON public.geo_access_logs
  AS PERMISSIVE FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Captura de DDL para rollback de plano de migração.
CREATE TABLE IF NOT EXISTS public.plan_rollback_ddl (
  id          bigserial PRIMARY KEY,
  etapa       integer NOT NULL,
  object_type text    NOT NULL,
  object_name text    NOT NULL,
  ddl         text,
  captured_at timestamptz DEFAULT now()
);
ALTER TABLE public.plan_rollback_ddl ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Internal admin only - service_role bypasses RLS" ON public.plan_rollback_ddl;
CREATE POLICY "Internal admin only - service_role bypasses RLS" ON public.plan_rollback_ddl
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ───────────────────────── funções ─────────────────────────

CREATE OR REPLACE FUNCTION public.is_country_blocked(check_country_code text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM geo_blocked_regions
    WHERE country_code = UPPER(check_country_code)
    AND is_active = true
  )
$function$;

-- Guarda anti-regressão: evento de cotação fora de ordem não sobrescreve
-- estado mais novo. v3 extrai event_at SEMPRE do raw_payload novo, porque o
-- upsert herda a coluna antiga.
CREATE OR REPLACE FUNCTION public.fn_quotes_inbound_ordering_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _incoming timestamptz;
BEGIN
  _incoming := (NEW.raw_payload->>'event_at')::timestamptz;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.event_at IS NOT NULL AND _incoming IS NOT NULL AND _incoming < OLD.event_at THEN
      NEW.status      := OLD.status;
      NEW.last_event  := OLD.last_event;
      NEW.event_at    := OLD.event_at;
      NEW.raw_payload := OLD.raw_payload;
      RETURN NEW;
    END IF;
  END IF;

  NEW.event_at := COALESCE(_incoming, OLD.event_at);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trg_recording_generate_coaching()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _secret text;
  _base_url text;
  _has_transcript boolean;
BEGIN
  _has_transcript := (
    (TG_OP = 'INSERT' AND NEW.transcript IS NOT NULL AND length(NEW.transcript) > 40)
    OR
    (TG_OP = 'UPDATE' AND NEW.transcript IS NOT NULL AND length(NEW.transcript) > 40
      AND (OLD.transcript IS NULL OR OLD.transcript IS DISTINCT FROM NEW.transcript))
  );
  IF NOT _has_transcript THEN
    RETURN NEW;
  END IF;

  SELECT value INTO _secret   FROM public._internal_secrets WHERE key = 'coaching_cron_secret';
  SELECT value INTO _base_url FROM public._internal_secrets WHERE key = 'functions_base_url';

  IF _secret IS NULL THEN
    RAISE WARNING 'coaching_cron_secret not set — skipping AI coaching dispatch for recording %', NEW.id;
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := _base_url || '/generate-coaching-actions',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', _secret
    ),
    body := jsonb_build_object('recording_id', NEW.id)
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_auto_coaching_on_recording()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_secret text;
  v_anon_key text;
  v_base_url text;
  v_request_id bigint;
BEGIN
  IF NEW.summarized_at IS NULL THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.summarized_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF (NEW.transcript IS NULL OR length(trim(NEW.transcript)) < 40)
     AND (NEW.summary IS NULL OR length(trim(NEW.summary)) < 40) THEN
    RETURN NEW;
  END IF;

  IF NEW.salesperson_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT value INTO v_secret   FROM public._internal_secrets WHERE key = 'coaching_cron_secret';
  SELECT value INTO v_anon_key FROM public._internal_secrets WHERE key = 'anon_key';
  SELECT value INTO v_base_url FROM public._internal_secrets WHERE key = 'functions_base_url';

  IF v_secret IS NULL THEN
    RAISE WARNING 'auto_coaching: coaching_cron_secret ausente';
    RETURN NEW;
  END IF;

  SELECT net.http_post(
    url := v_base_url || '/generate-coaching-actions',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'X-Cron-Secret', v_secret
    ),
    body := jsonb_build_object('recording_id', NEW.id::text),
    timeout_milliseconds := 30000
  ) INTO v_request_id;

  BEGIN
    INSERT INTO public.activity_audit_logs (event_type, entity_type, entity_id, metadata)
    VALUES (
      'auto_coaching_triggered',
      'call_recording',
      NEW.id,
      jsonb_build_object('request_id', v_request_id, 'salesperson_id', NEW.salesperson_id)
    );
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN NEW;
END;
$function$;

-- ───────────────────────── triggers ─────────────────────────

DROP TRIGGER IF EXISTS trg_quotes_inbound_ordering_guard ON public.quotes_inbound;
CREATE TRIGGER trg_quotes_inbound_ordering_guard
  BEFORE INSERT OR UPDATE ON public.quotes_inbound
  FOR EACH ROW EXECUTE FUNCTION public.fn_quotes_inbound_ordering_guard();

DROP TRIGGER IF EXISTS trg_recording_generate_coaching ON public.call_recordings;
CREATE TRIGGER trg_recording_generate_coaching
  AFTER INSERT OR UPDATE OF transcript ON public.call_recordings
  FOR EACH ROW EXECUTE FUNCTION public.trg_recording_generate_coaching();

DROP TRIGGER IF EXISTS trg_auto_coaching_after_summary ON public.call_recordings;
CREATE TRIGGER trg_auto_coaching_after_summary
  AFTER INSERT OR UPDATE OF summarized_at ON public.call_recordings
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auto_coaching_on_recording();
