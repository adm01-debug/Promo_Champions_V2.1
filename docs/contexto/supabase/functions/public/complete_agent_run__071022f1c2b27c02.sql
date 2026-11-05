CREATE OR REPLACE FUNCTION public.complete_agent_run(_run_id uuid, _result jsonb, _status text DEFAULT 'completed'::text, _error text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.ai_agent_runs
  SET result = _result,
      status = _status,
      error_message = _error,
      completed_at = now(),
      updated_at = now()
  WHERE id = _run_id;
END;
$function$
