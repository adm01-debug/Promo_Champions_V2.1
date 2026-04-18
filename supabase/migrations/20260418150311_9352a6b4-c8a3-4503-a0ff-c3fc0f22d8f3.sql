-- Enums
CREATE TYPE public.task_difficulty AS ENUM ('easy', 'medium', 'hard', 'epic');
CREATE TYPE public.task_assignment_status AS ENUM ('pending', 'in_progress', 'submitted', 'approved', 'rejected');

-- Catalog
CREATE TABLE public.task_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty public.task_difficulty NOT NULL DEFAULT 'medium',
  xp_reward INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assignments
CREATE TABLE public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id UUID NOT NULL REFERENCES public.task_catalog(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL,
  assigned_by UUID NOT NULL,
  due_date DATE,
  status public.task_assignment_status NOT NULL DEFAULT 'pending',
  submission_note TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  xp_granted INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_assignments_assigned_to ON public.task_assignments(assigned_to);
CREATE INDEX idx_task_assignments_status ON public.task_assignments(status);
CREATE INDEX idx_task_assignments_catalog ON public.task_assignments(catalog_id);

-- XP Adjustments (audit log)
CREATE TABLE public.xp_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  related_assignment_id UUID REFERENCES public.task_assignments(id) ON DELETE SET NULL,
  adjusted_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_adjustments_user ON public.xp_adjustments(user_id);
CREATE INDEX idx_xp_adjustments_created ON public.xp_adjustments(created_at DESC);

-- Updated_at triggers
CREATE TRIGGER trg_task_catalog_updated
BEFORE UPDATE ON public.task_catalog
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_task_assignments_updated
BEFORE UPDATE ON public.task_assignments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.task_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_adjustments ENABLE ROW LEVEL SECURITY;

-- task_catalog policies
CREATE POLICY "Anyone authenticated can view catalog"
ON public.task_catalog FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can insert catalog"
ON public.task_catalog FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update catalog"
ON public.task_catalog FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete catalog"
ON public.task_catalog FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- task_assignments policies
CREATE POLICY "Users view own or admin views all assignments"
ON public.task_assignments FOR SELECT TO authenticated
USING (assigned_to = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can insert assignments"
ON public.task_assignments FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin updates any, user updates own progress"
ON public.task_assignments FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR (assigned_to = auth.uid() AND status IN ('pending', 'in_progress', 'submitted'))
);

CREATE POLICY "Admin can delete assignments"
ON public.task_assignments FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- xp_adjustments policies
CREATE POLICY "Admin can view xp adjustments"
ON public.xp_adjustments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admin can insert xp adjustments"
ON public.xp_adjustments FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RPC: grant_task_xp (SECURITY DEFINER) - approves a task and logs XP
CREATE OR REPLACE FUNCTION public.grant_task_xp(
  _assignment_id UUID,
  _xp_amount INTEGER,
  _reason TEXT DEFAULT 'Task approved'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _adjustment_id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can grant XP';
  END IF;

  SELECT assigned_to INTO _user_id
  FROM public.task_assignments
  WHERE id = _assignment_id;

  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Assignment not found';
  END IF;

  UPDATE public.task_assignments
  SET status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      xp_granted = _xp_amount
  WHERE id = _assignment_id;

  INSERT INTO public.xp_adjustments(user_id, amount, reason, source, related_assignment_id, adjusted_by)
  VALUES (_user_id, _xp_amount, _reason, 'task_approval', _assignment_id, auth.uid())
  RETURNING id INTO _adjustment_id;

  RETURN _adjustment_id;
END;
$$;

-- RPC: manual_xp_adjustment (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.manual_xp_adjustment(
  _user_id UUID,
  _amount INTEGER,
  _reason TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _adjustment_id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can adjust XP';
  END IF;

  IF _reason IS NULL OR length(trim(_reason)) < 3 THEN
    RAISE EXCEPTION 'Reason is required (min 3 chars)';
  END IF;

  INSERT INTO public.xp_adjustments(user_id, amount, reason, source, adjusted_by)
  VALUES (_user_id, _amount, _reason, 'manual', auth.uid())
  RETURNING id INTO _adjustment_id;

  RETURN _adjustment_id;
END;
$$;