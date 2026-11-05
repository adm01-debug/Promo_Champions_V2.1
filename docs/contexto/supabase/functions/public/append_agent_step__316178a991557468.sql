CREATE OR REPLACE FUNCTION public.append_agent_step(_run_id uuid, _tool_name text, _tool_input jsonb, _tool_output jsonb, _status text DEFAULT 'success'::text, _executed_by text DEFAULT 'ai'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_idx integer;
BEGIN
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
