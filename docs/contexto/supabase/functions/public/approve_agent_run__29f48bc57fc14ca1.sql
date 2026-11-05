CREATE OR REPLACE FUNCTION public.approve_agent_run(_run_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sp uuid;
  v_owner uuid;
BEGIN
  v_sp := public.get_current_salesperson_id();
  SELECT salesperson_id INTO v_owner FROM public.ai_agent_runs WHERE id = _run_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Run not found';
  END IF;
  IF v_owner <> v_sp AND NOT public.has_role(auth.uid(), 'admin') AND NOT public.has_role(auth.uid(), 'manager') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.ai_agent_runs
  SET status = 'running',
      approved_by = auth.uid(),
      updated_at = now()
  WHERE id = _run_id AND status = 'awaiting_approval';
END;
$function$
