-- Pacote de auditoria 2026-10 — SLO burn-rate (RUNBOOK-LINKS).
--
-- Cria `public.fn_check_slo_burn_rate()`: lê a taxa de falha das entregas
-- operacionais (winloss_webhook_deliveries + email_logs) nas janelas de 1h e
-- 24h e, quando acima do threshold registrado em public.app_config, insere um
-- security_events com severity='critical' — lido pelos fluxos de alerta e pela
-- escalação externa (ver docs/runbooks/alertas-operacionais.md).
--
-- Thresholds (app_config):
--   slo.burn_rate_1h   (default 0.20) — taxa máx. de falha na janela de 1h
--   slo.burn_rate_24h  (default 0.10) — taxa máx. de falha na janela de 24h
--   slo.min_samples    (default 20)   — mínimo de eventos p/ o cálculo valer
--
-- Seguro de aplicar antes ou depois da migration de app_config do pacote de
-- estados: CREATE TABLE IF NOT EXISTS + INSERT ON CONFLICT DO NOTHING.

-- 1) app_config (mesmo shape da migration do pacote de estados — idempotente)
CREATE TABLE IF NOT EXISTS public.app_config (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  description text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.app_config IS
  'Configuração de aplicação org-wide (SLA, XP, SLO burn-rate, etc). Chave estável, valor JSONB.';

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'app_config'
      AND policyname = 'authenticated read app_config'
  ) THEN
    CREATE POLICY "authenticated read app_config"
      ON public.app_config FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'app_config'
      AND policyname = 'admin manager write app_config'
  ) THEN
    CREATE POLICY "admin manager write app_config"
      ON public.app_config FOR ALL TO authenticated
      USING (public.is_admin_or_manager(auth.uid()))
      WITH CHECK (public.is_admin_or_manager(auth.uid()));
  END IF;
END;
$$;

INSERT INTO public.app_config (key, value, description) VALUES
  ('slo.burn_rate_1h',  '0.20', 'Taxa de falha máxima de entregas operacionais na janela de 1h (fn_check_slo_burn_rate)'),
  ('slo.burn_rate_24h', '0.10', 'Taxa de falha máxima de entregas operacionais na janela de 24h (fn_check_slo_burn_rate)'),
  ('slo.min_samples',   '20',   'Mínimo de eventos na janela para o cálculo de burn-rate valer')
ON CONFLICT (key) DO NOTHING;

-- 2) Função de cálculo: taxa de falha numa janela, por fonte e agregado.
--    Fontes de "entrega operacional": webhooks win/loss (succeeded) e
--    email_logs (status='sent' = sucesso). Demais métricas entram como fontes
--    futuras via o mesmo UNION — manter os guards to_regclass por fonte.
CREATE OR REPLACE FUNCTION public.fn_slo_burn_rate(_window interval)
RETURNS TABLE (source text, total bigint, failed bigint, rate numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Requer as duas tabelas-fonte (existem no schema canônico); o guard
  -- to_regclass em fn_check_slo_burn_rate evita chamá-la sem elas.
  WITH events AS (
    SELECT 'winloss_webhook' AS source, (NOT d.succeeded) AS failed
    FROM public.winloss_webhook_deliveries d
    WHERE d.created_at > now() - _window
    UNION ALL
    SELECT 'email', (e.status <> 'sent') AS failed
    FROM public.email_logs e
    WHERE e.created_at > now() - _window
  )
  SELECT source, count(*)::bigint AS total,
         count(*) FILTER (WHERE failed)::bigint AS failed,
         CASE WHEN count(*) = 0 THEN 0
              ELSE round(count(*) FILTER (WHERE failed)::numeric / count(*), 4)
         END AS rate
  FROM events
  GROUP BY source
  UNION ALL
  SELECT 'all', count(*)::bigint,
         count(*) FILTER (WHERE failed)::bigint,
         CASE WHEN count(*) = 0 THEN 0
              ELSE round(count(*) FILTER (WHERE failed)::numeric / count(*), 4)
         END
  FROM events;
$$;

COMMENT ON FUNCTION public.fn_slo_burn_rate(interval) IS
  'Taxa de falha das entregas operacionais (webhooks winloss + emails) numa janela. SECURITY DEFINER para leitura cross-RLS; só service_role executa.';

-- 3) Check: avalia 1h e 24h contra app_config e emite security_events critical.
CREATE OR REPLACE FUNCTION public.fn_check_slo_burn_rate()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _thr_1h  numeric := COALESCE(
    (SELECT (value #>> '{}')::numeric FROM public.app_config WHERE key = 'slo.burn_rate_1h'), 0.20);
  _thr_24h numeric := COALESCE(
    (SELECT (value #>> '{}')::numeric FROM public.app_config WHERE key = 'slo.burn_rate_24h'), 0.10);
  _min_n   bigint := COALESCE(
    (SELECT (value #>> '{}')::bigint FROM public.app_config WHERE key = 'slo.min_samples'), 20);
  _all_1h  record;
  _all_24h record;
  _alerts  jsonb := '[]'::jsonb;
BEGIN
  -- Guards: sem as tabelas-fonte ou sem app_config, não há como medir — retorna skipped.
  IF to_regclass('public.winloss_webhook_deliveries') IS NULL
     AND to_regclass('public.email_logs') IS NULL THEN
    RETURN jsonb_build_object('skipped', 'no_source_tables');
  END IF;

  SELECT * INTO _all_1h  FROM public.fn_slo_burn_rate(interval '1 hour')  WHERE source = 'all';
  SELECT * INTO _all_24h FROM public.fn_slo_burn_rate(interval '24 hours') WHERE source = 'all';

  IF _all_1h.total >= _min_n AND _all_1h.rate > _thr_1h THEN
    INSERT INTO public.security_events (event_type, severity, description, metadata)
    VALUES (
      'slo_burn_rate', 'critical',
      format('Burn-rate 1h acima do threshold: %s > %s (%s/%s entregas falharam)',
             _all_1h.rate, _thr_1h, _all_1h.failed, _all_1h.total),
      jsonb_build_object(
        'window', '1h', 'rate', _all_1h.rate, 'threshold', _thr_1h,
        'total', _all_1h.total, 'failed', _all_1h.failed,
        'runbook', 'docs/runbooks/alertas-operacionais.md')
    );
    _alerts := _alerts || jsonb_build_object('window', '1h', 'rate', _all_1h.rate, 'threshold', _thr_1h);
  END IF;

  IF _all_24h.total >= _min_n AND _all_24h.rate > _thr_24h THEN
    INSERT INTO public.security_events (event_type, severity, description, metadata)
    VALUES (
      'slo_burn_rate', 'critical',
      format('Burn-rate 24h acima do threshold: %s > %s (%s/%s entregas falharam)',
             _all_24h.rate, _thr_24h, _all_24h.failed, _all_24h.total),
      jsonb_build_object(
        'window', '24h', 'rate', _all_24h.rate, 'threshold', _thr_24h,
        'total', _all_24h.total, 'failed', _all_24h.failed,
        'runbook', 'docs/runbooks/alertas-operacionais.md')
    );
    _alerts := _alerts || jsonb_build_object('window', '24h', 'rate', _all_24h.rate, 'threshold', _thr_24h);
  END IF;

  RETURN jsonb_build_object(
    'burn_rate_1h',  COALESCE(_all_1h.rate, 0),  'total_1h',  COALESCE(_all_1h.total, 0),
    'burn_rate_24h', COALESCE(_all_24h.rate, 0), 'total_24h', COALESCE(_all_24h.total, 0),
    'threshold_1h', _thr_1h, 'threshold_24h', _thr_24h, 'min_samples', _min_n,
    'alerts', _alerts);
END;
$$;

COMMENT ON FUNCTION public.fn_check_slo_burn_rate() IS
  'Avalia burn-rate 1h/24h vs app_config (slo.*) e insere security_events critical quando estoura. Agendar via pg_cron a cada 15min.';

-- Só o backend (service_role / pg_cron) executa — dados de falha são
-- cross-tenant por natureza (saúde da plataforma, não por-usuário).
REVOKE EXECUTE ON FUNCTION public.fn_slo_burn_rate(interval) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_check_slo_burn_rate() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_slo_burn_rate(interval) TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_check_slo_burn_rate() TO service_role;
