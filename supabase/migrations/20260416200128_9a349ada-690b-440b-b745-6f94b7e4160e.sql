-- ============ AUTOMATION WORKFLOWS ============
CREATE TABLE public.automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('deal_created','stage_changed','activity_logged','scheduled','manual','no_activity_days')),
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  run_count INTEGER NOT NULL DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_automation_workflows_trigger ON public.automation_workflows(trigger_type) WHERE is_active = true;

ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active workflows"
ON public.automation_workflows FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins/managers manage workflows"
ON public.automation_workflows FOR ALL TO authenticated
USING (is_admin_or_manager(auth.uid()))
WITH CHECK (is_admin_or_manager(auth.uid()));

CREATE TRIGGER trg_automation_workflows_updated_at
BEFORE UPDATE ON public.automation_workflows
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUTOMATION RUNS ============
CREATE TABLE public.automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','failed','skipped','partial')),
  trigger_payload JSONB DEFAULT '{}'::jsonb,
  actions_executed JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  duration_ms INTEGER,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_automation_runs_workflow ON public.automation_runs(workflow_id, started_at DESC);
CREATE INDEX idx_automation_runs_status ON public.automation_runs(status, started_at DESC);

ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view runs"
ON public.automation_runs FOR SELECT TO authenticated
USING (true);

CREATE POLICY "System inserts runs"
ON public.automation_runs FOR INSERT TO authenticated
WITH CHECK (true);

-- Toggle helper
CREATE OR REPLACE FUNCTION public.toggle_workflow_active(p_workflow_id UUID, p_active BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE automation_workflows SET is_active = p_active, updated_at = now() WHERE id = p_workflow_id;
  RETURN FOUND;
END;
$$;