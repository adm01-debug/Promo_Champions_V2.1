CREATE OR REPLACE FUNCTION public.append_agent_step(_run_id uuid, _tool_name text, _tool_input jsonb, _tool_output jsonb, _status text DEFAULT 'success'::text, _executed_by text DEFAULT 'ai'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_idx integer;
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

  SELECT COALESCE(MAX(step_index), -1) + 1 INTO v_idx
  FROM public.ai_agent_actions WHERE run_id = _run_id;

  INSERT INTO public.ai_agent_actions(run_id, step_index, tool_name, tool_input, tool_output, status, executed_by)
  VALUES (_run_id, v_idx, _tool_name, _tool_input, _tool_output, _status, _executed_by);

  UPDATE public.ai_agent_runs
  SET steps = steps || jsonb_build_object('index', v_idx, 'tool', _tool_name, 'status', _status),
      status = CASE WHEN status = 'pending' THEN 'running' ELSE status END,
      updated_at = now()
  WHERE id = _run_id;
END;
$function$
