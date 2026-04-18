CREATE TABLE public.coaching_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 30 CHECK (duration_min > 0 AND duration_min <= 240),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'canceled')),
  focus_skills TEXT[] NOT NULL DEFAULT '{}',
  agenda JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  outcome_rating INTEGER CHECK (outcome_rating BETWEEN 1 AND 5),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coaching_sessions_salesperson ON public.coaching_sessions(salesperson_id, scheduled_at DESC);
CREATE INDEX idx_coaching_sessions_coach ON public.coaching_sessions(coach_id, scheduled_at DESC);
CREATE INDEX idx_coaching_sessions_status ON public.coaching_sessions(status) WHERE status = 'scheduled';

ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers manage all coaching sessions"
ON public.coaching_sessions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Coaches manage their own sessions"
ON public.coaching_sessions FOR ALL TO authenticated
USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Salespeople view their own sessions"
ON public.coaching_sessions FOR SELECT TO authenticated
USING (salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()));

CREATE TRIGGER update_coaching_sessions_updated_at
BEFORE UPDATE ON public.coaching_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();