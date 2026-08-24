
-- Squads
CREATE TABLE public.squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.squad_members (
  squad_id UUID NOT NULL REFERENCES public.squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (squad_id, user_id)
);

CREATE INDEX idx_squad_members_user ON public.squad_members(user_id);

ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Squads viewable by authenticated"
  ON public.squads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Squads admin manage"
  ON public.squads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Squad members viewable by authenticated"
  ON public.squad_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Squad members admin manage"
  ON public.squad_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_squads_updated_at
  BEFORE UPDATE ON public.squads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Extend task_assignments
ALTER TABLE public.task_assignments
  ADD COLUMN IF NOT EXISTS squad_id UUID REFERENCES public.squads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS recurrence_rule TEXT,
  ADD COLUMN IF NOT EXISTS parent_recurrence_id UUID;

CREATE INDEX IF NOT EXISTS idx_task_assignments_squad ON public.task_assignments(squad_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_parent_recurrence ON public.task_assignments(parent_recurrence_id);

-- RPC: Assign task to entire squad
CREATE OR REPLACE FUNCTION public.assign_task_to_squad(
  _catalog_id UUID,
  _squad_id UUID,
  _due_date DATE DEFAULT NULL,
  _recurrence TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count INTEGER := 0;
  _parent_id UUID := gen_random_uuid();
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can assign tasks to squads';
  END IF;

  INSERT INTO public.task_assignments (catalog_id, assigned_to, assigned_by, due_date, squad_id, recurrence_rule, parent_recurrence_id)
  SELECT _catalog_id, sm.user_id, auth.uid(), _due_date, _squad_id, _recurrence,
         CASE WHEN _recurrence IS NOT NULL THEN _parent_id ELSE NULL END
  FROM public.squad_members sm
  WHERE sm.squad_id = _squad_id;

  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

-- RPC: Bulk approve assignments with per-id XP overrides (jsonb {assignment_id: xp})
CREATE OR REPLACE FUNCTION public.bulk_approve_assignments(
  _ids UUID[],
  _xp_overrides JSONB DEFAULT '{}'::jsonb
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id UUID;
  _xp INTEGER;
  _processed INTEGER := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can bulk approve';
  END IF;

  FOREACH _id IN ARRAY _ids LOOP
    SELECT COALESCE(
      NULLIF(_xp_overrides->>(_id::text), '')::INTEGER,
      (SELECT tc.xp_reward FROM public.task_assignments ta JOIN public.task_catalog tc ON tc.id = ta.catalog_id WHERE ta.id = _id)
    ) INTO _xp;

    PERFORM public.grant_task_xp(_id, _xp, 'Aprovação em lote');
    _processed := _processed + 1;
  END LOOP;

  RETURN _processed;
END;
$$;
