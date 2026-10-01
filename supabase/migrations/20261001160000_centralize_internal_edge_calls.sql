-- Centraliza os endpoints internos de broadcast de venda e campaign-health
-- (auditoria 2026-10): remove URL/JWT hardcoded que apontavam para projetos
-- errados (saejqkojleeaxzrslzfg e rapjswienfhkobhlamxb — o projeto oficial é
-- resolvido em runtime via public._internal_secrets, mesmo padrão de
-- 20260910153000), e registra falhas em public.edge_call_failures em vez de
-- engolir o erro com EXCEPTION WHEN OTHERS.
--
-- Pré-requisito: as chaves 'functions_base_url', 'anon_key' e
-- 'coaching_cron_secret' devem existir em public._internal_secrets —
-- functions_base_url = https://usyxfpqlsspldubptrdl.supabase.co/functions/v1.

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 1. Tabela de falhas de chamadas internas a edge functions.
--    Visível só para admin; escrita feita por funções SECURITY DEFINER.
CREATE TABLE IF NOT EXISTS public.edge_call_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  target_function text,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.edge_call_failures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view edge call failures" ON public.edge_call_failures;
CREATE POLICY "Admins can view edge call failures"
  ON public.edge_call_failures FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_edge_call_failures_created_at
  ON public.edge_call_failures(created_at DESC);

REVOKE ALL ON public.edge_call_failures FROM anon;
GRANT SELECT ON public.edge_call_failures TO authenticated;

-- 2. Broadcast de venda concluída: chama broadcast-sale-notification do
--    projeto correto lendo a configuração interna, e não marca
--    broadcast_sent_at quando o enqueue falha (erro fica registrado).
CREATE OR REPLACE FUNCTION public.broadcast_sale_completed()
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
  IF NEW.status IS DISTINCT FROM 'completed' THEN
    RETURN NEW;
  END IF;

  -- Evita rebroadcast da mesma venda concluída.
  IF NEW.broadcast_sent_at IS NOT NULL AND TG_OP = 'UPDATE' AND OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  IF NEW.salesperson_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- A edge function lê os dados da venda no banco; o corpo carrega só o id.
  v_payload := jsonb_build_object('sale_id', NEW.id);

  SELECT
    max(s.value) FILTER (WHERE s.key = 'functions_base_url'),
    max(s.value) FILTER (WHERE s.key = 'anon_key'),
    max(s.value) FILTER (WHERE s.key = 'coaching_cron_secret')
  INTO v_base_url, v_anon_key, v_cron_secret
  FROM public._internal_secrets AS s;

  IF v_base_url IS NULL OR v_anon_key IS NULL OR v_cron_secret IS NULL THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('broadcast_sale_completed', 'broadcast-sale-notification',
            jsonb_build_object('sale_id', NEW.id), 'internal_edge_secrets_missing');
    RETURN NEW;
  END IF;
  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('broadcast_sale_completed', 'broadcast-sale-notification',
            jsonb_build_object('sale_id', NEW.id), 'internal_edge_base_url_must_be_https');
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := rtrim(v_base_url, '/') || '/broadcast-sale-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key,
      'X-Cron-Secret', v_cron_secret
    ),
    body := v_payload
  );

  -- Marca como enviada somente quando o enqueue foi aceito pelo pg_net.
  UPDATE public.sales
  SET broadcast_sent_at = now(), updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca quebrar a inserção da venda, mas deixar a falha visível.
  BEGIN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('broadcast_sale_completed', 'broadcast-sale-notification',
            jsonb_build_object('sale_id', NEW.id), SQLERRM);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RAISE WARNING 'broadcast_sale_completed failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.broadcast_sale_completed() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_broadcast_sale_completed ON public.sales;
CREATE TRIGGER trg_broadcast_sale_completed
AFTER INSERT OR UPDATE OF status, deal_status ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.broadcast_sale_completed();

-- 3. campaign-health-alert: mantém o padrão de _internal_secrets introduzido
--    em 20260831130003 e adiciona o mesmo registro de falha observável.
CREATE OR REPLACE FUNCTION public.trigger_campaign_health_alert()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  v_base_url text;
  v_anon_key text;
  v_cron_secret text;
BEGIN
  SELECT
    max(s.value) FILTER (WHERE s.key = 'functions_base_url'),
    max(s.value) FILTER (WHERE s.key = 'anon_key'),
    max(s.value) FILTER (WHERE s.key = 'coaching_cron_secret')
  INTO v_base_url, v_anon_key, v_cron_secret
  FROM public._internal_secrets AS s;

  IF v_base_url IS NULL OR v_anon_key IS NULL OR v_cron_secret IS NULL THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('trigger_campaign_health_alert', 'campaign-health-alert',
            '{}'::jsonb, 'internal_edge_secrets_missing');
    RETURN;
  END IF;
  IF v_base_url !~ '^https://[^[:space:]]+$' THEN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('trigger_campaign_health_alert', 'campaign-health-alert',
            '{}'::jsonb, 'internal_edge_base_url_must_be_https');
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := rtrim(v_base_url, '/') || '/campaign-health-alert',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_anon_key,
      'Authorization', 'Bearer ' || v_anon_key,
      'X-Cron-Secret', v_cron_secret
    ),
    body := jsonb_build_object('scheduled_at', now())
  );
EXCEPTION WHEN OTHERS THEN
  BEGIN
    INSERT INTO public.edge_call_failures (function_name, target_function, context, error_message)
    VALUES ('trigger_campaign_health_alert', 'campaign-health-alert',
            '{}'::jsonb, SQLERRM);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RAISE WARNING 'trigger_campaign_health_alert failed: %', SQLERRM;
END;
$$;

REVOKE ALL ON FUNCTION public.trigger_campaign_health_alert()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_campaign_health_alert()
  TO service_role;
