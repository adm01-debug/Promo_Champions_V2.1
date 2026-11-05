CREATE OR REPLACE FUNCTION public.fn_cleanup_stale_logs(_days integer DEFAULT 90)
 RETURNS TABLE(table_name text, deleted_rows bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _cutoff TIMESTAMPTZ := now() - make_interval(days => _days);
  _tbl TEXT;
  _deleted BIGINT;
  _targets TEXT[] := ARRAY[
    'access_denied_logs',
    'geo_access_logs',
    'rate_limit_logs',
    'email_tracking_events',
    'login_attempts',
    'webhook_inbound_log',
    'error_logs',
    'duplicate_block_logs',
    'mfa_verification_attempts',
    'page_analytics'
  ];
BEGIN
  FOREACH _tbl IN ARRAY _targets LOOP
    BEGIN
      EXECUTE format(
        'WITH d AS (DELETE FROM public.%I WHERE created_at < $1 RETURNING 1) SELECT count(*) FROM d',
        _tbl
      ) INTO _deleted USING _cutoff;
      table_name := _tbl;
      deleted_rows := COALESCE(_deleted, 0);
      RETURN NEXT;
    EXCEPTION WHEN undefined_column OR undefined_table THEN
      CONTINUE;
    END;
  END LOOP;
END;
$function$
