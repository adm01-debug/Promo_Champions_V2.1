-- Tabela de coaching actions
CREATE TABLE public.coaching_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  tip TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'discovery',
  severity TEXT NOT NULL DEFAULT 'info',
  timestamp_sec INTEGER,
  quote TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  manager_note TEXT,
  accepted_at TIMESTAMPTZ,
  created_by_ai BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT coaching_actions_category_chk CHECK (category IN ('opening','discovery','objection','closing','talk_ratio','pace','empathy','other')),
  CONSTRAINT coaching_actions_severity_chk CHECK (severity IN ('info','warning','critical')),
  CONSTRAINT coaching_actions_status_chk CHECK (status IN ('pending','accepted','dismissed','practiced'))
);

CREATE INDEX idx_coaching_actions_sp_status ON public.coaching_actions (salesperson_id, status, created_at DESC);
CREATE INDEX idx_coaching_actions_recording ON public.coaching_actions (recording_id);

ALTER TABLE public.coaching_actions ENABLE ROW LEVEL SECURITY;

-- Vendedor vê o próprio
CREATE POLICY "Salesperson views own coaching"
ON public.coaching_actions FOR SELECT
USING (
  salesperson_id = public.get_current_salesperson_id()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

-- Vendedor atualiza status do próprio (não pode editar manager_note)
CREATE POLICY "Salesperson updates own coaching status"
ON public.coaching_actions FOR UPDATE
USING (
  salesperson_id = public.get_current_salesperson_id()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

-- Insert: somente admin/manager ou serviço (edge function via service role)
CREATE POLICY "Admin or manager insert coaching"
ON public.coaching_actions FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

-- Delete: admin/manager
CREATE POLICY "Admin or manager delete coaching"
ON public.coaching_actions FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

-- Trigger updated_at
CREATE TRIGGER trg_coaching_actions_updated_at
BEFORE UPDATE ON public.coaching_actions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC de progresso
CREATE OR REPLACE FUNCTION public.coaching_progress_by_salesperson(_salesperson_id UUID, _days INTEGER DEFAULT 30)
RETURNS TABLE (
  category TEXT,
  severity TEXT,
  status TEXT,
  count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT category, severity, status, COUNT(*)::bigint
  FROM public.coaching_actions
  WHERE salesperson_id = _salesperson_id
    AND created_at >= now() - (_days || ' days')::interval
  GROUP BY category, severity, status
$$;