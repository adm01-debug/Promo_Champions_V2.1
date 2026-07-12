
CREATE OR REPLACE FUNCTION public.purge_telemetry_retention()
RETURNS TABLE(table_name text, deleted_rows bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wv bigint := 0;
  v_qt bigint := 0;
  v_pa bigint := 0;
BEGIN
  -- Web Vitals: manter 30 dias (dashboard usa últimos 7d)
  DELETE FROM public.web_vitals_samples WHERE created_at < now() - interval '30 days';
  GET DIAGNOSTICS v_wv = ROW_COUNT;

  -- Query telemetry externa: manter 60 dias
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='query_telemetry') THEN
    DELETE FROM public.query_telemetry WHERE created_at < now() - interval '60 days';
    GET DIAGNOSTICS v_qt = ROW_COUNT;
  END IF;

  -- Page analytics: manter 90 dias
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='page_analytics') THEN
    DELETE FROM public.page_analytics WHERE created_at < now() - interval '90 days';
    GET DIAGNOSTICS v_pa = ROW_COUNT;
  END IF;

  RETURN QUERY VALUES
    ('web_vitals_samples', v_wv),
    ('query_telemetry', v_qt),
    ('page_analytics', v_pa);
END;
$$;

REVOKE ALL ON FUNCTION public.purge_telemetry_retention() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_telemetry_retention() TO service_role;

-- Remove job antigo se existir e reagenda
DO $$
BEGIN
  PERFORM cron.unschedule('purge-telemetry-retention-daily')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-telemetry-retention-daily');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'purge-telemetry-retention-daily',
  '30 3 * * *',
  $$SELECT public.purge_telemetry_retention();$$
);
