CREATE OR REPLACE FUNCTION public.fn_admin_list_dead_letter_ingest_jobs(_limit integer DEFAULT 100)
 RETURNS TABLE(id uuid, idempotency_key text, salesperson_id uuid, attempts integer, last_error text, locked_by text, created_at timestamp with time zone, updated_at timestamp with time zone, next_attempt_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() <> 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'access_denied' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT j.id, j.idempotency_key, j.salesperson_id, j.attempts,
         j.last_error, j.locked_by, j.created_at, j.updated_at, j.next_attempt_at
  FROM public.call_recording_ingest_jobs j
  WHERE j.status = 'dead_letter'
  ORDER BY j.updated_at DESC
  LIMIT GREATEST(1, LEAST(_limit, 500));
END;
$function$
