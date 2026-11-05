CREATE OR REPLACE FUNCTION public.fn_cleanup_webhook_dedupe()
 RETURNS TABLE(deleted_count bigint, oldest_kept timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_deleted bigint;
  v_oldest timestamptz;
  v_started timestamptz := clock_timestamp();
BEGIN
  WITH deleted AS (
    DELETE FROM public.webhook_inbound_dedupe
    WHERE received_at < (now() - INTERVAL '90 days')
    RETURNING id
  )
  SELECT count(*) INTO v_deleted FROM deleted;

  SELECT min(received_at) INTO v_oldest FROM public.webhook_inbound_dedupe;

  -- Auditoria interna: sempre registra a execução (mesmo com 0 linhas)
  INSERT INTO public.maintenance_log (
    job_name, started_at, completed_at, rows_affected, status, metadata
  ) VALUES (
    'fn_cleanup_webhook_dedupe',
    v_started,
    clock_timestamp(),
    v_deleted,
    'completed',
    jsonb_build_object(
      'oldest_kept', v_oldest,
      'invoked_by', session_user,
      'current_user', current_user,
      'cutoff', (now() - INTERVAL '90 days')
    )
  );

  RETURN QUERY SELECT v_deleted, v_oldest;
END;
$function$
