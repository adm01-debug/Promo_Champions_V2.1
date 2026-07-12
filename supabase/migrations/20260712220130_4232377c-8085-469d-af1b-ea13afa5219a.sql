
CREATE OR REPLACE FUNCTION public.purge_old_telemetry(_retention_days integer DEFAULT 90)
RETURNS TABLE(table_name text, rows_deleted bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  targets jsonb := '[
    {"t":"web_vitals_samples",       "c":"created_at"},
    {"t":"access_denied_logs",       "c":"created_at"},
    {"t":"page_analytics",           "c":"created_at"},
    {"t":"geo_access_logs",          "c":"created_at"},
    {"t":"rate_limit_logs",          "c":"created_at"},
    {"t":"integration_logs",         "c":"timestamp"},
    {"t":"login_attempts",           "c":"created_at"},
    {"t":"mfa_verification_attempts","c":"created_at"},
    {"t":"bitrix24_sync_logs",       "c":"created_at"},
    {"t":"email_tracking_events",    "c":"created_at"},
    {"t":"duplicate_block_logs",     "c":"created_at"},
    {"t":"quote_sync_inbound_log",   "c":"created_at"},
    {"t":"webhook_inbound_dedupe",   "c":"created_at"},
    {"t":"query_telemetry",          "c":"created_at"},
    {"t":"error_logs",               "c":"created_at"}
  ]'::jsonb;
  rec jsonb;
  n bigint;
  total bigint := 0;
  per_table jsonb := '{}'::jsonb;
  cutoff timestamptz := now() - make_interval(days => _retention_days);
BEGIN
  IF _retention_days < 7 THEN
    RAISE EXCEPTION 'refusing to purge with retention < 7 days (got %)', _retention_days;
  END IF;

  FOR rec IN SELECT * FROM jsonb_array_elements(targets) LOOP
    EXECUTE format(
      'WITH d AS (DELETE FROM public.%I WHERE %I < $1 RETURNING 1) SELECT count(*) FROM d',
      rec->>'t', rec->>'c'
    ) INTO n USING cutoff;
    table_name := rec->>'t';
    rows_deleted := n;
    total := total + n;
    per_table := per_table || jsonb_build_object(rec->>'t', n);
    RETURN NEXT;
  END LOOP;

  INSERT INTO public.maintenance_log(job_name, status, completed_at, rows_affected, metadata)
  VALUES ('purge_old_telemetry', 'completed', now(), total,
          jsonb_build_object('retention_days', _retention_days,
                             'cutoff', cutoff,
                             'per_table', per_table));
END;
$$;

REVOKE ALL ON FUNCTION public.purge_old_telemetry(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_old_telemetry(integer) TO service_role;
