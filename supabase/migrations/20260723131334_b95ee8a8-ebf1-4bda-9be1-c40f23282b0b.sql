
CREATE TABLE public.commission_bonus_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bonus_id UUID NOT NULL REFERENCES public.commission_bonuses(id) ON DELETE CASCADE,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  period_month DATE NOT NULL,
  computed_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  bonus_kind TEXT NOT NULL CHECK (bonus_kind IN ('fixed','percentage')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bonus_id, salesperson_id, period_month)
);

CREATE INDEX idx_cba_salesperson_period ON public.commission_bonus_awards(salesperson_id, period_month DESC);
CREATE INDEX idx_cba_status_pending ON public.commission_bonus_awards(status) WHERE status = 'pending';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.commission_bonus_awards TO authenticated;
GRANT ALL ON public.commission_bonus_awards TO service_role;

ALTER TABLE public.commission_bonus_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salespeople view own awards"
ON public.commission_bonus_awards FOR SELECT TO authenticated
USING (
  salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins insert awards"
ON public.commission_bonus_awards FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins update awards"
ON public.commission_bonus_awards FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins delete awards"
ON public.commission_bonus_awards FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_commission_bonus_awards_updated_at
BEFORE UPDATE ON public.commission_bonus_awards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
