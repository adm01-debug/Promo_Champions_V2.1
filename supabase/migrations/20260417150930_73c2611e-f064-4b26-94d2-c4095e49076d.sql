-- ============ ai_agent_runs ============
CREATE TABLE IF NOT EXISTS public.ai_agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id uuid NOT NULL,
  agent_type text NOT NULL CHECK (agent_type IN ('qualify_lead','build_proposal','schedule_followup','enrich_client','recover_cold_lead')),
  goal text,
  target_entity_type text CHECK (target_entity_type IN ('lead','client','deal','activity')),
  target_entity_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','awaiting_approval','completed','failed','cancelled')),
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  result jsonb,
  requires_approval boolean NOT NULL DEFAULT true,
  approved_by uuid,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_ai_agent_runs_salesperson ON public.ai_agent_runs(salesperson_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_agent_runs_status ON public.ai_agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_ai_agent_runs_target ON public.ai_agent_runs(target_entity_type, target_entity_id);

ALTER TABLE public.ai_agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salespeople view own agent runs"
  ON public.ai_agent_runs FOR SELECT TO authenticated
  USING (
    salesperson_id = public.get_current_salesperson_id()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "System manages agent runs"
  ON public.ai_agent_runs FOR ALL TO authenticated
  USING (
    salesperson_id = public.get_current_salesperson_id()
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    salesperson_id = public.get_current_salesperson_id()
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE TRIGGER trg_ai_agent_runs_updated_at
  BEFORE UPDATE ON public.ai_agent_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ai_agent_actions ============
CREATE TABLE IF NOT EXISTS public.ai_agent_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.ai_agent_runs(id) ON DELETE CASCADE,
  step_index integer NOT NULL,
  tool_name text NOT NULL,
  tool_input jsonb NOT NULL DEFAULT '{}'::jsonb,
  tool_output jsonb,
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success','error','pending_approval','skipped')),
  executed_by text NOT NULL DEFAULT 'ai' CHECK (executed_by IN ('ai','user','system')),
  executed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_agent_actions_run ON public.ai_agent_actions(run_id, step_index);

ALTER TABLE public.ai_agent_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View actions of accessible runs"
  ON public.ai_agent_actions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_agent_runs r
      WHERE r.id = ai_agent_actions.run_id
        AND (
          r.salesperson_id = public.get_current_salesperson_id()
          OR public.has_role(auth.uid(), 'admin')
          OR public.has_role(auth.uid(), 'manager')
        )
    )
  );

CREATE POLICY "Insert actions of own runs"
  ON public.ai_agent_actions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_agent_runs r
      WHERE r.id = ai_agent_actions.run_id
        AND (
          r.salesperson_id = public.get_current_salesperson_id()
          OR public.has_role(auth.uid(), 'admin')
        )
    )
  );

-- ============ RPCs ============
CREATE OR REPLACE FUNCTION public.create_agent_run(
  _agent_type text,
  _goal text DEFAULT NULL,
  _target_entity_type text DEFAULT NULL,
  _target_entity_id uuid DEFAULT NULL,
  _requires_approval boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sp uuid;
  v_id uuid;
BEGIN
  v_sp := public.get_current_salesperson_id();
  IF v_sp IS NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'No salesperson context';
  END IF;
  INSERT INTO public.ai_agent_runs(salesperson_id, agent_type, goal, target_entity_type, target_entity_id, requires_approval, status)
  VALUES (COALESCE(v_sp, '00000000-0000-0000-0000-000000000000'::uuid), _agent_type, _goal, _target_entity_type, _target_entity_id, _requires_approval, 'pending')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

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
BEGIN
  UPDATE public.ai_agent_runs
  SET result = _result,
      status = _status,
      error_message = _error,
      completed_at = now(),
      updated_at = now()
  WHERE id = _run_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_agent_run(_run_id uuid)
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
  SET status = 'running',
      approved_by = auth.uid(),
      updated_at = now()
  WHERE id = _run_id AND status = 'awaiting_approval';
END;
$$;

-- ============ Realtime ============
ALTER TABLE public.ai_agent_runs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_agent_runs;