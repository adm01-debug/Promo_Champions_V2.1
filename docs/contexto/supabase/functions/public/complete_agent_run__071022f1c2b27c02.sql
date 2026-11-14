CREATE OR REPLACE FUNCTION public.complete_agent_run(_run_id uuid, _result jsonb, _status text DEFAULT 'completed'::text, _error text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sp uuid;
  v_owner uuid;
BEGIN
  -- Owner check (mesmo padrão de approve_agent_run): service_role bypassa;
  -- autenticado precisa ser dono do run ou admin/manager.
  SELECT salesperson_id INTO v_owner FROM public.ai_agent_runs WHERE id = _run_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Run not found';
  END IF;
  IF auth.role() <> 'service_role' THEN
    v_sp := public.get_current_salesperson_id();
    IF (v_sp IS NULL OR v_owner <> v_sp)
       AND NOT public.has_role(auth.uid(), 'admin')
       AND NOT public.has_role(auth.uid(), 'manager') THEN
      RAISE EXCEPTION 'Not authorized';
    END IF;
  END IF;

  UPDATE public.ai_agent_runs
  SET result = _result,
      status = _status,
      error_message = _error,
      completed_at = now(),
      updated_at = now()
  WHERE id = _run_id;
END;
$function$
