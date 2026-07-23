
CREATE TABLE public.commission_bonuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  bonus_type TEXT NOT NULL CHECK (bonus_type IN ('first_sale','milestone','ranking','streak','other')),
  trigger_condition JSONB NOT NULL DEFAULT '{}'::jsonb,
  bonus_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (bonus_amount >= 0),
  bonus_kind TEXT NOT NULL DEFAULT 'fixed' CHECK (bonus_kind IN ('fixed','percentage')),
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.commission_bonuses TO authenticated;
GRANT ALL ON public.commission_bonuses TO service_role;

ALTER TABLE public.commission_bonuses ENABLE ROW LEVEL SECURITY;

-- Admins/Managers CRUD total
CREATE POLICY "Admins and managers manage commission_bonuses"
  ON public.commission_bonuses
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Vendedores veem apenas prêmios ativos aplicáveis
CREATE POLICY "Salespeople view applicable active bonuses"
  ON public.commission_bonuses
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND (
      salesperson_id IS NULL
      OR salesperson_id IN (
        SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE INDEX idx_commission_bonuses_salesperson ON public.commission_bonuses(salesperson_id) WHERE salesperson_id IS NOT NULL;
CREATE INDEX idx_commission_bonuses_active ON public.commission_bonuses(is_active, priority DESC) WHERE is_active = true;

CREATE TRIGGER update_commission_bonuses_updated_at
  BEFORE UPDATE ON public.commission_bonuses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
