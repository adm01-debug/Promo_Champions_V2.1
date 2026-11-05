CREATE OR REPLACE FUNCTION public.fn_check_slo_burn_rate()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
