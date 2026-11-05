CREATE OR REPLACE FUNCTION public.enforce_telemetry_retention()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb := '{}'::jsonb;
  v_deleted bigint;
  v_tbl text;
  v_ttl_30 text[] := ARRAY[
    'page_analytics',
    'web_vitals_samples',
    'rate_limit_logs',
    'geo_access_logs',
    'access_denied_logs',
    'login_attempts',
    'email_tracking_events',
    'duplicate_block_logs',
    'integration_logs',
    'inbound_reply_events',
    'activity_audit_logs',
    'webhook_deliveries'
  ];
  v_ttl_90 text[] := ARRAY['error_logs','audit_logs'];
BEGIN
  FOREACH v_tbl IN ARRAY v_ttl_30 LOOP
    BEGIN
      EXECUTE format(
        'DELETE FROM public.%I WHERE created_at < now() - interval ''30 days''',
        v_tbl
      );
      GET DIAGNOSTICS v_deleted = ROW_COUNT;
      v_result := v_result || jsonb_build_object(v_tbl, v_deleted);
    EXCEPTION WHEN undefined_column OR undefined_table THEN
      -- tabela pode não ter created_at ou pode ter sido renomeada; ignora
      v_result := v_result || jsonb_build_object(v_tbl, 'skipped');
    END;
  END LOOP;

  FOREACH v_tbl IN ARRAY v_ttl_90 LOOP
    BEGIN
      EXECUTE format(
        'DELETE FROM public.%I WHERE created_at < now() - interval ''90 days''',
        v_tbl
      );
      GET DIAGNOSTICS v_deleted = ROW_COUNT;
      v_result := v_result || jsonb_build_object(v_tbl, v_deleted);
    EXCEPTION WHEN undefined_column OR undefined_table THEN
      v_result := v_result || jsonb_build_object(v_tbl, 'skipped');
    END;
  END LOOP;

  RETURN v_result;
END;
$function$
