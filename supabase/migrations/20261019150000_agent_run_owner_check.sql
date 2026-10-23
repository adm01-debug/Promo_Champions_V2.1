-- Remediação de segurança: append_agent_step e complete_agent_run eram
-- SECURITY DEFINER executáveis por `authenticated` sem verificação de dono —
-- qualquer usuário autenticado podia gravar status/result em run alheia (IDOR).
-- Adiciona o mesmo check de approve_agent_run (dono da run ou admin/manager) e
-- restringe EXECUTE a service_role: os únicos chamadores reais são edge
-- functions (ai-agent-orchestrator via service_role); o frontend só usa
-- approve_agent_run, que mantém seu grant a authenticated.

CREATE OR REPLACE FUNCTION public.append_agent_step(
  _run_id uuid,
  _tool_name text,
  _tool_input jsonb,
  _tool_output jsonb,
  _status text DEFAULT 'success',
  _executed_by text DEFAULT 'ai'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_idx integer;
  v_sp uuid;
  v_owner uuid;
BEGIN
  -- Owner check (mesmo de approve_agent_run): service_role passa porque
  -- auth.uid()/get_current_salesperson_id() retornam NULL — a comparação
  -- com NULL é falsa e a função segue para o insert.
  v_sp := public.get_current_salesperson_id();
  SELECT salesperson_id INTO v_owner FROM public.ai_agent_runs WHERE id = _run_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Run not found';
  END IF;
  IF v_owner <> v_sp AND NOT public.has_role(auth.uid(), 'admin') AND NOT public.has_role(auth.uid(), 'manager') THEN
    RAISE EXCEPTION 'Not authorized';
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
$$;

CREATE OR REPLACE FUNCTION public.complete_agent_run(
  _run_id uuid,
  _result jsonb,
  _status text DEFAULT 'completed',
  _error text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  SET result = _result,
      status = _status,
      error_message = _error,
      completed_at = now(),
      updated_at = now()
  WHERE id = _run_id;
END;
$$;

-- Sem chamador autenticado legítimo no repo (grep src/ + supabase/functions):
-- EXECUTE fica só com service_role. approve_agent_run mantém authenticated.
REVOKE EXECUTE ON FUNCTION public.append_agent_step(uuid, text, jsonb, jsonb, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.complete_agent_run(uuid, jsonb, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.append_agent_step(uuid, text, jsonb, jsonb, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_agent_run(uuid, jsonb, text, text) TO service_role;
